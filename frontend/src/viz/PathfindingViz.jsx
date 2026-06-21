import React, { useMemo, useState, useRef } from "react";
import { useStepPlayer } from "../hooks/useStepPlayer";
import PlayerBar from "../components/PlayerBar";

const ROWS = 13, COLS = 24;

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
function randomMaze() {
  const g = emptyGrid();
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (Math.random() < 0.26) g[r][c] = 1;
  return g;
}

// Dijkstra (no heuristic) or A* (Manhattan) on a uniform-cost grid with walls.
function search(grid, start, goal, useH) {
  const key = (r, c) => r * COLS + c;
  const h = (r, c) => Math.abs(r - goal[0]) + Math.abs(c - goal[1]);
  const dist = {}, prev = {}, order = [], seen = new Set();
  dist[key(...start)] = 0;
  const pq = [[useH ? h(...start) : 0, 0, start[0], start[1]]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [, g, r, c] = pq.shift();
    const k = key(r, c);
    if (seen.has(k)) continue;
    seen.add(k); order.push([r, c]);
    if (r === goal[0] && c === goal[1]) break;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS || grid[nr][nc]) continue;
      const nk = key(nr, nc);
      if (seen.has(nk)) continue;
      const ng = g + 1;
      if (ng < (dist[nk] ?? Infinity)) { dist[nk] = ng; prev[nk] = k; pq.push([ng + (useH ? h(nr, nc) : 0), ng, nr, nc]); }
    }
  }
  const goalK = key(...goal), path = [];
  if (seen.has(goalK)) {
    let cur = goalK;
    while (cur !== undefined) { path.push([Math.floor(cur / COLS), cur % COLS]); if (cur === key(...start)) break; cur = prev[cur]; }
    path.reverse();
  }
  return { order, path };
}

export default function PathfindingViz({ defaultAlgo = "dijkstra" }) {
  const [algo, setAlgo] = useState(defaultAlgo);
  const [grid, setGrid] = useState(randomMaze);
  const [start, setStart] = useState([6, 2]);
  const [goal, setGoal] = useState([6, 21]);
  const [mode, setMode] = useState("wall");
  const painting = useRef(false);

  const { order, path } = useMemo(
    () => search(grid, start, goal, algo === "astar"),
    [grid, start, goal, algo]
  );

  const frames = useMemo(() => {
    const fr = [];
    order.forEach((cell, i) => fr.push({ v: i + 1, p: 0, cur: cell, note: `explore (${cell[0]}, ${cell[1]})` }));
    if (path.length) {
      path.forEach((cell, i) =>
        fr.push({ v: order.length, p: i + 1, cur: cell, note: i === path.length - 1 ? `shortest path found · ${path.length - 1} steps · ${order.length} cells explored` : "tracing path" }));
    } else {
      fr.push({ v: order.length, p: 0, note: "goal unreachable" });
    }
    return fr.length ? fr : [{ v: 0, p: 0, note: "—" }];
  }, [order, path]);

  const player = useStepPlayer(frames);
  const fr = player.frame || { v: 0, p: 0 };

  const visited = useMemo(() => new Set(order.slice(0, fr.v).map(([r, c]) => r * COLS + c)), [order, fr.v]);
  const pathSet = useMemo(() => new Set(path.slice(0, fr.p).map(([r, c]) => r * COLS + c)), [path, fr.p]);

  const apply = (r, c) => {
    if (mode === "wall") {
      if ((r === start[0] && c === start[1]) || (r === goal[0] && c === goal[1])) return;
      setGrid((g) => g.map((row, ri) => ri === r ? row.map((v, ci) => ci === c ? (painting.current ? 1 : (v ? 0 : 1)) : v) : row));
    } else if (mode === "start" && !grid[r][c]) setStart([r, c]);
    else if (mode === "goal" && !grid[r][c]) setGoal([r, c]);
  };

  return (
    <div className="viz">
      <div className="viz-controls">
        <div className="seg">
          <button className={algo === "dijkstra" ? "on" : ""} onClick={() => setAlgo("dijkstra")}>Dijkstra</button>
          <button className={algo === "astar" ? "on" : ""} onClick={() => setAlgo("astar")}>A*</button>
        </div>
        <div className="seg">
          {["wall", "start", "goal"].map((m) => (
            <button key={m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>{m}</button>
          ))}
        </div>
        <button className="ghost-btn" onClick={() => setGrid(randomMaze())}>🎲 Maze</button>
        <button className="ghost-btn" onClick={() => setGrid(emptyGrid())}>Clear</button>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        onMouseLeave={() => (painting.current = false)}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const k = r * COLS + c;
            const isStart = r === start[0] && c === start[1];
            const isGoal = r === goal[0] && c === goal[1];
            const cls = isStart ? "start" : isGoal ? "goal" : cell ? "wall"
              : pathSet.has(k) ? "path"
              : fr.cur && fr.cur[0] === r && fr.cur[1] === c ? "current"
              : visited.has(k) ? "visited" : "";
            return (
              <div
                key={k}
                className={`cell ${cls}`}
                onMouseDown={() => { painting.current = true; apply(r, c); }}
                onMouseUp={() => (painting.current = false)}
                onMouseEnter={() => { if (painting.current && mode === "wall") apply(r, c); }}
              >
                {isStart ? "▶" : isGoal ? "◎" : ""}
              </div>
            );
          })
        )}
      </div>

      <PlayerBar player={player} caption={fr.note || ""} />
    </div>
  );
}
