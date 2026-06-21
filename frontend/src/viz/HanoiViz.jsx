import React, { useMemo, useState } from "react";
import { useStepPlayer } from "../hooks/useStepPlayer";
import PlayerBar from "../components/PlayerBar";

const COLORS = ["#7c5cff", "#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#fb7185", "#60a5fa"];
const PEGS = ["A", "B", "C"];

function moves(n) {
  const m = [];
  const solve = (k, s, a, d) => { if (k === 0) return; solve(k - 1, s, d, a); m.push([s, d]); solve(k - 1, a, s, d); };
  solve(n, "A", "B", "C");
  return m;
}

function buildFrames(n) {
  const mv = moves(n);
  const pegs = { A: [], B: [], C: [] };
  for (let i = n; i >= 1; i--) pegs.A.push(i);
  const clone = (p) => ({ A: [...p.A], B: [...p.B], C: [...p.C] });
  const f = [{ pegs: clone(pegs), note: `start · ${mv.length} optimal moves` }];
  mv.forEach(([s, d], idx) => {
    const disk = pegs[s].pop(); pegs[d].push(disk);
    f.push({ pegs: clone(pegs), moving: disk, note: `move disk ${disk}: ${s} → ${d}  (${idx + 1}/${mv.length})` });
  });
  return f;
}

export default function HanoiViz() {
  const [n, setN] = useState(4);
  const frames = useMemo(() => buildFrames(n), [n]);
  const player = useStepPlayer(frames);
  const fr = player.frame || { pegs: { A: [], B: [], C: [] } };

  return (
    <div className="viz">
      <div className="viz-controls">
        <label className="ctl-range">Disks
          <input type="range" min="1" max="7" value={n} onChange={(e) => setN(+e.target.value)} /> {n}
        </label>
        <span className="pill-info">{2 ** n - 1} moves</span>
      </div>

      <div className="hanoi">
        {PEGS.map((peg) => (
          <div key={peg} className="peg">
            <div className="peg-disks">
              {fr.pegs[peg].map((size) => (
                <div
                  key={size}
                  className={`disk ${fr.moving === size ? "moving" : ""}`}
                  style={{ width: `${20 + (size / n) * 80}%`, background: COLORS[(size - 1) % COLORS.length] }}
                >
                  {size}
                </div>
              ))}
            </div>
            <div className="peg-rod" />
            <div className="peg-base" />
            <span className="peg-label">{peg}</span>
          </div>
        ))}
      </div>

      <PlayerBar player={player} caption={fr.note || ""} />
    </div>
  );
}
