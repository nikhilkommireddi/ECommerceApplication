"""
runner.py — executes a learner's code against a challenge's tests.

Invoked as a subprocess (so the parent can enforce a wall-clock timeout):

    echo '<json>' | python runner.py

Input  (stdin, JSON):  {"code": "...", "fn_name": "sort", "tests": [...]}
Output (stdout, JSON): {"results": [{name, passed, expected, got, error, edge}], ...}

Each test is validated by its `check` type, because several algorithms can't be
graded by plain equality (Hanoi move lists, TSP tours, training loss, ...).
"""

import json
import sys
import traceback


def _short(v, limit=200):
    try:
        s = json.dumps(v)
    except (TypeError, ValueError):
        s = repr(v)
    return s if len(s) <= limit else s[:limit] + "…"


def check(check_type, args, expected, got):
    """Return (passed: bool, detail: str)."""
    if check_type == "exact":
        return got == expected, f"expected {expected}"

    if check_type == "sorted":
        want = sorted(args[0])
        return list(got) == want, "result must be ascending with the same elements"

    if check_type == "hanoi":
        n = args[0]
        if not isinstance(got, list):
            return False, "return a list of (from, to) moves"
        pegs = {"A": list(range(n, 0, -1)), "B": [], "C": []}
        for mv in got:
            if not (isinstance(mv, (list, tuple)) and len(mv) == 2):
                return False, "each move must be a (from, to) pair"
            s, d = mv
            if s not in pegs or d not in pegs:
                return False, "pegs must be 'A', 'B' or 'C'"
            if not pegs[s]:
                return False, f"moved from empty peg {s}"
            disk = pegs[s].pop()
            if pegs[d] and pegs[d][-1] < disk:
                return False, "can't place a larger disk on a smaller one"
            pegs[d].append(disk)
        if pegs["C"] != list(range(n, 0, -1)):
            return False, "all disks must end stacked on peg C"
        need = (2 ** n) - 1
        if len(got) != need:
            return False, f"optimal solution has {need} moves, got {len(got)}"
        return True, ""

    if check_type == "tour":
        points = args[0]
        n = len(points)
        try:
            order = list(got)
        except TypeError:
            return False, "return a list of city indices"
        if sorted(order) != list(range(n)):
            return False, "tour must visit each city exactly once"
        if n > 0 and order[0] != 0:
            return False, "tour must start at city 0"
        return True, ""

    if check_type == "xor":
        try:
            return float(got) < 0.05, "final loss should drop below 0.05"
        except (TypeError, ValueError):
            return False, "return the final loss as a number"

    if check_type == "xor_loose":
        try:
            return float(got) < 0.2, "loss should improve well below the 0.25 random baseline"
        except (TypeError, ValueError):
            return False, "return the final loss as a number"

    return False, f"unknown check '{check_type}'"


def main():
    payload = json.loads(sys.stdin.read())
    code = payload["code"]
    fn_name = payload["fn_name"]
    tests = payload["tests"]

    ns = {}
    try:
        exec(compile(code, "<submission>", "exec"), ns)
    except Exception:
        print(json.dumps({"compile_error": traceback.format_exc(limit=2)}))
        return

    fn = ns.get(fn_name)
    if not callable(fn):
        print(json.dumps({"compile_error": f"Define a function named `{fn_name}`."}))
        return

    results = []
    for t in tests:
        entry = {"name": t["name"], "edge": bool(t.get("edge")), "passed": False,
                 "error": None, "got": None, "detail": ""}
        try:
            got = fn(*[_clone(a) for a in t["args"]])
            passed, detail = check(t.get("check", "exact"), t["args"], t.get("expected"), got)
            entry["passed"] = passed
            entry["detail"] = detail
            entry["got"] = _short(_jsonable(got))
        except Exception as e:
            entry["error"] = f"{type(e).__name__}: {e}"
        results.append(entry)

    total = len(results)
    passed = sum(1 for r in results if r["passed"])
    print(json.dumps({"results": results, "passed": passed, "total": total}))


def _clone(v):
    """Deep-ish copy so a mutating solution can't corrupt later tests."""
    try:
        return json.loads(json.dumps(v))
    except (TypeError, ValueError):
        return v


def _jsonable(v):
    try:
        json.dumps(v)
        return v
    except (TypeError, ValueError):
        return repr(v)


if __name__ == "__main__":
    main()
