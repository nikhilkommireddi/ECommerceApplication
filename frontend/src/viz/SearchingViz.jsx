import React, { useMemo, useState } from "react";
import { useStepPlayer } from "../hooks/useStepPlayer";
import PlayerBar from "../components/PlayerBar";

function sortedArr(n) {
  const s = new Set();
  while (s.size < n) s.add(Math.floor(Math.random() * 99) + 1);
  return [...s].sort((a, b) => a - b);
}

function binaryFrames(a, target) {
  const f = []; let lo = 0, hi = a.length - 1, found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    f.push({ lo, hi, mid, note: `check index ${mid} (=${a[mid]}) vs ${target}` });
    if (a[mid] === target) { found = mid; f.push({ lo, hi, mid, found: mid, note: `found ${target} at ${mid} ✓` }); break; }
    if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  if (found === -1) f.push({ lo: -1, hi: -1, mid: -1, note: `${target} not present → -1` });
  return f;
}
function linearFrames(a, target) {
  const f = [];
  for (let i = 0; i < a.length; i++) {
    f.push({ cursor: i, note: `check index ${i} (=${a[i]})` });
    if (a[i] === target) { f.push({ cursor: i, found: i, note: `found at ${i} ✓` }); return f; }
  }
  f.push({ cursor: -1, note: `not present → -1` });
  return f;
}

export default function SearchingViz() {
  const [mode, setMode] = useState("binary");
  const [arr, setArr] = useState(() => sortedArr(15));
  const [target, setTarget] = useState(() => 0);

  // default target = a value in the array (so it's findable)
  const tgt = target || arr[Math.floor(arr.length / 2)];
  const frames = useMemo(
    () => (mode === "binary" ? binaryFrames(arr, tgt) : linearFrames(arr, tgt)),
    [arr, tgt, mode]
  );
  const player = useStepPlayer(frames);
  const fr = player.frame || {};

  const regen = () => { const a = sortedArr(15); setArr(a); setTarget(a[Math.floor(Math.random() * a.length)]); };

  return (
    <div className="viz">
      <div className="viz-controls">
        <div className="seg">
          <button className={mode === "binary" ? "on" : ""} onClick={() => setMode("binary")}>binary</button>
          <button className={mode === "linear" ? "on" : ""} onClick={() => setMode("linear")}>linear</button>
        </div>
        <label className="ctl-range">Target
          <select value={tgt} onChange={(e) => setTarget(+e.target.value)}>
            {arr.map((v) => <option key={v} value={v}>{v}</option>)}
            <option value={-7}>missing (−7)</option>
          </select>
        </label>
        <button className="ghost-btn" onClick={regen}>🎲 New array</button>
      </div>

      <div className="search-row">
        {arr.map((v, i) => {
          const inWindow = mode === "binary" && fr.lo >= 0 && i >= fr.lo && i <= fr.hi;
          const cls = fr.found === i ? "found"
            : (fr.mid === i || fr.cursor === i) ? "active"
            : inWindow ? "window" : "dim";
          return (
            <div key={i} className={`scell ${cls}`}>
              <b>{v}</b><small>{i}</small>
            </div>
          );
        })}
      </div>

      <PlayerBar player={player} caption={fr.note || ""} />
    </div>
  );
}
