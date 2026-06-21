import React, { useMemo, useState } from "react";
import { useStepPlayer } from "../hooks/useStepPlayer";
import PlayerBar from "../components/PlayerBar";

function countAll(n) {
  const cols = new Set(), d1 = new Set(), d2 = new Set();
  let total = 0;
  const go = (r) => {
    if (r === n) { total++; return; }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
      cols.add(c); d1.add(r - c); d2.add(r + c);
      go(r + 1);
      cols.delete(c); d1.delete(r - c); d2.delete(r + c);
    }
  };
  go(0);
  return total;
}

// Frames that animate backtracking until the FIRST solution.
function firstSolutionFrames(n) {
  const f = [], cols = new Set(), d1 = new Set(), d2 = new Set();
  const queens = [];
  let solved = false;
  const place = (r) => {
    if (solved) return;
    if (r === n) { solved = true; f.push({ queens: [...queens], done: true, note: "solution found ✓" }); return; }
    for (let c = 0; c < n; c++) {
      const safe = !cols.has(c) && !d1.has(r - c) && !d2.has(r + c);
      f.push({ queens: [...queens], try: [r, c], safe, note: `row ${r}, col ${c} — ${safe ? "safe" : "attacked"}` });
      if (!safe) continue;
      cols.add(c); d1.add(r - c); d2.add(r + c); queens[r] = c;
      f.push({ queens: [...queens], placed: [r, c], note: `place queen (${r}, ${c})` });
      place(r + 1);
      if (solved) return;
      cols.delete(c); d1.delete(r - c); d2.delete(r + c); queens.length = r;
      f.push({ queens: [...queens], backtrack: [r, c], note: `backtrack from (${r}, ${c})` });
    }
  };
  place(0);
  if (!f.length) f.push({ queens: [], note: "no solution" });
  return f;
}

export default function NQueensViz() {
  const [n, setN] = useState(6);
  const frames = useMemo(() => firstSolutionFrames(n), [n]);
  const total = useMemo(() => countAll(n), [n]);
  const player = useStepPlayer(frames);
  const fr = player.frame || { queens: [] };

  return (
    <div className="viz">
      <div className="viz-controls">
        <label className="ctl-range">Board N
          <input type="range" min="4" max="9" value={n} onChange={(e) => setN(+e.target.value)} /> {n}×{n}
        </label>
        <span className="pill-info">{total} total solution{total === 1 ? "" : "s"}</span>
      </div>

      <div className="board-wrap">
        <div className="board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, width: `min(${n * 56}px, 92%)` }}>
          {Array.from({ length: n * n }, (_, idx) => {
            const r = Math.floor(idx / n), c = idx % n;
            const hasQ = fr.queens[r] === c;
            const isTry = fr.try && fr.try[0] === r && fr.try[1] === c;
            const cls = ((r + c) % 2 ? "dark" : "light")
              + (hasQ ? " queen" : "")
              + (isTry ? (fr.safe ? " try-ok" : " try-bad") : "")
              + (fr.placed && fr.placed[0] === r && fr.placed[1] === c ? " placed" : "")
              + (fr.backtrack && fr.backtrack[0] === r && fr.backtrack[1] === c ? " backtrack" : "");
            return <div key={idx} className={`sq ${cls}`}>{hasQ ? "♛" : ""}</div>;
          })}
        </div>
      </div>

      <PlayerBar player={player} caption={fr.note || ""} />
    </div>
  );
}
