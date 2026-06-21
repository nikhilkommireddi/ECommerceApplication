"""
Algoscope — Flask backend.

REST
  GET  /api/health                 service status
  GET  /api/algorithms             challenge catalog (+ any saved code/progress)
  POST /api/run                    {id, code} -> run against tests, return per-case results + hint
  GET  /api/progress               saved progress for every algorithm
  POST /api/reset/<id>             clear saved code for one algorithm

User code runs in a separate process with a wall-clock timeout (local,
educational use). Results, code and best score are saved to SQLite.
"""

from __future__ import annotations

import json
import os
import sqlite3
import subprocess
import sys

from flask import Flask, g, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

import challenges

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "algo.db")
RUNNER = os.path.join(BASE_DIR, "runner.py")
FRONTEND_DIST = os.path.join(BASE_DIR, "..", "frontend", "dist")
RUN_TIMEOUT = 8  # seconds of wall-clock for a submission

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 512 * 1024
CORS(app)


# --------------------------------------------------------------------------- #
# DB
# --------------------------------------------------------------------------- #
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DB_PATH)
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS progress (
            algo_id     TEXT PRIMARY KEY,
            code        TEXT,
            passed      INTEGER DEFAULT 0,
            total       INTEGER DEFAULT 0,
            solved      INTEGER DEFAULT 0,
            updated_at  TEXT
        )
        """
    )
    db.commit()
    db.close()


def _now():
    import datetime
    return datetime.datetime.now().isoformat(timespec="seconds")


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #
@app.route("/api/health")
def api_health():
    return jsonify({"ok": True, "count": len(challenges.CHALLENGES)})


@app.route("/api/algorithms")
def api_algorithms():
    db = get_db()
    saved = {
        r["algo_id"]: dict(r)
        for r in db.execute("SELECT * FROM progress").fetchall()
    }
    out = []
    for c in challenges.catalog():
        p = saved.get(c["id"])
        out.append({**c, "progress": {
            "code": p["code"] if p else None,
            "passed": p["passed"] if p else 0,
            "total": p["total"] if p else c["tests"],
            "solved": bool(p["solved"]) if p else False,
        }})
    return jsonify(out)


@app.route("/api/run", methods=["POST"])
def api_run():
    payload = request.get_json(silent=True) or {}
    algo_id = payload.get("id")
    code = payload.get("code") or ""
    ch = challenges.BY_ID.get(algo_id)
    if ch is None:
        return jsonify({"error": "Unknown algorithm"}), 404

    run_input = json.dumps({"code": code, "fn_name": ch["fn_name"], "tests": ch["tests"]})
    try:
        proc = subprocess.run(
            [sys.executable, RUNNER],
            input=run_input,
            capture_output=True,
            text=True,
            timeout=RUN_TIMEOUT,
        )
    except subprocess.TimeoutExpired:
        return jsonify({
            "timeout": True,
            "error": f"Your code ran longer than {RUN_TIMEOUT}s — likely an infinite "
                     f"loop or a non-terminating recursion.",
        })

    if proc.returncode != 0 and not proc.stdout:
        return jsonify({"error": "Runner crashed", "stderr": proc.stderr[-1500:]})

    try:
        out = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return jsonify({"error": "Could not parse runner output", "stdout": proc.stdout[-1500:]})

    if "compile_error" in out:
        return jsonify({"compile_error": out["compile_error"]})

    # add a contextual hint when something fails
    results = out.get("results", [])
    failed = [r for r in results if not r["passed"]]
    out["hint"] = _hint_for(ch, failed)

    # persist progress
    passed, total = out.get("passed", 0), out.get("total", len(ch["tests"]))
    solved = 1 if passed == total and total > 0 else 0
    db = get_db()
    db.execute(
        """
        INSERT INTO progress (algo_id, code, passed, total, solved, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(algo_id) DO UPDATE SET
            code=excluded.code, passed=excluded.passed, total=excluded.total,
            solved=MAX(progress.solved, excluded.solved), updated_at=excluded.updated_at
        """,
        (algo_id, code, passed, total, solved, _now()),
    )
    db.commit()
    out["solved"] = bool(solved)
    return jsonify(out)


def _hint_for(ch, failed):
    if not failed:
        return "🎉 All tests pass — nicely done!"
    # prioritise an edge case if one failed
    edge = next((r for r in failed if r.get("edge")), None)
    target = edge or failed[0]
    label = "edge case" if target.get("edge") else "case"
    why = target.get("error") or target.get("detail") or ""
    # pick a relevant hint deterministically
    idx = (len(ch["hints"]) - 1) if edge else 0
    tip = ch["hints"][min(idx, len(ch["hints"]) - 1)] if ch["hints"] else ""
    base = f"Failing {label} “{target['name']}”"
    if why:
        base += f": {why}"
    return f"{base}. Hint: {tip}"


@app.route("/api/progress")
def api_progress():
    db = get_db()
    return jsonify({r["algo_id"]: dict(r) for r in db.execute("SELECT * FROM progress").fetchall()})


@app.route("/api/reset/<algo_id>", methods=["POST"])
def api_reset(algo_id):
    db = get_db()
    db.execute("DELETE FROM progress WHERE algo_id = ?", (algo_id,))
    db.commit()
    return jsonify({"ok": True})


# --------------------------------------------------------------------------- #
# Serve the built frontend
# --------------------------------------------------------------------------- #
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    full_path = os.path.join(FRONTEND_DIST, path)
    if path and os.path.exists(full_path) and not os.path.isdir(full_path):
        return send_from_directory(FRONTEND_DIST, path)
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return send_from_directory(FRONTEND_DIST, "index.html")
    return (
        "<h1>Algoscope API</h1>"
        "<p>Frontend isn't built. In <code>frontend/</code> run "
        "<code>npm install &amp;&amp; npm run dev</code>.</p>",
        200,
    )


init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5004"))
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)
