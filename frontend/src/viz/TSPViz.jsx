import React, { useMemo, useState } from "react";
import { useStepPlayer } from "../hooks/useStepPlayer";
import PlayerBar from "../components/PlayerBar";

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const tourLen = (pts, o) => o.reduce((s, _, i) => s + dist(pts[o[i]], pts[o[(i + 1) % o.length]]), 0);

function randPoints(n) {
  return Array.from({ length: n }, () => [8 + Math.random() * 84, 8 + Math.random() * 84]);
}

function build(pts) {
  const n = pts.length, f = [];
  if (n <= 1) return [{ order: pts.map((_, i) => i), closed: true, note: "trivial tour" }];
  // nearest-neighbour construction
  let tour = [0]; const un = new Set();
  for (let i = 1; i < n; i++) un.add(i);
  f.push({ order: [...tour], note: "start at city 0", len: 0 });
  while (un.size) {
    const last = tour[tour.length - 1];
    let best = -1, bd = Infinity;
    un.forEach((c) => { const d = dist(pts[last], pts[c]); if (d < bd) { bd = d; best = c; } });
    tour.push(best); un.delete(best);
    f.push({ order: [...tour], note: `nearest unvisited → city ${best}`, len: tourLen(pts, tour) });
  }
  f.push({ order: [...tour], closed: true, note: `nearest-neighbour tour · length ${tourLen(pts, tour).toFixed(1)}`, len: tourLen(pts, tour) });

  // 2-opt refinement
  let best = tour, improved = true, guard = 0;
  while (improved && guard++ < 60) {
    improved = false;
    for (let i = 1; i < n - 1; i++)
      for (let k = i + 1; k < n; k++) {
        const cand = best.slice(0, i).concat(best.slice(i, k + 1).reverse(), best.slice(k + 1));
        if (tourLen(pts, cand) < tourLen(pts, best) - 1e-9) {
          best = cand; improved = true;
          f.push({ order: [...best], closed: true, note: `2-opt swap → length ${tourLen(pts, best).toFixed(1)}`, len: tourLen(pts, best) });
        }
      }
  }
  f.push({ order: [...best], closed: true, note: `optimised tour · length ${tourLen(pts, best).toFixed(1)}`, len: tourLen(pts, best) });
  return f;
}

export default function TSPViz() {
  const [n, setN] = useState(9);
  const [pts, setPts] = useState(() => randPoints(9));
  const frames = useMemo(() => build(pts), [pts]);
  const player = useStepPlayer(frames);
  const fr = player.frame || { order: [] };

  const regen = (m = n) => { setN(m); setPts(randPoints(m)); };
  const order = fr.order || [];
  const poly = order.map((idx) => `${pts[idx][0]},${pts[idx][1]}`).join(" ");
  const closePoly = fr.closed && order.length ? `${poly} ${pts[order[0]][0]},${pts[order[0]][1]}` : poly;

  return (
    <div className="viz">
      <div className="viz-controls">
        <label className="ctl-range">Cities
          <input type="range" min="4" max="12" value={n} onChange={(e) => regen(+e.target.value)} /> {n}
        </label>
        <button className="ghost-btn" onClick={() => regen()}>🎲 New cities</button>
      </div>

      <div className="tsp">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <polyline className={`tsp-route ${fr.closed ? "closed" : ""}`} points={closePoly} />
          {pts.map((p, i) => {
            const visited = order.includes(i);
            const isLast = order[order.length - 1] === i;
            return (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r={isLast ? 2.6 : 2} className={`tsp-pt ${i === 0 ? "home" : visited ? "seen" : ""} ${isLast ? "active" : ""}`} />
                <text x={p[0]} y={p[1] - 3.2} className="tsp-label">{i}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <PlayerBar player={player} caption={fr.note || ""} />
    </div>
  );
}
