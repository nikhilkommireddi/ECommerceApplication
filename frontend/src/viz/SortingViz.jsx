import React, { useMemo, useState } from "react";
import { useStepPlayer } from "../hooks/useStepPlayer";
import PlayerBar from "../components/PlayerBar";

const ALGOS = ["bubble", "selection", "insertion", "merge", "quick"];

function randArr(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
}

// ---- frame builders: each frame = {a, compare?, swap?, sorted?, pivot?, note} ----
function bubble(arr) {
  const a = [...arr], f = [], n = a.length;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n - 1 - i; j++) {
      f.push({ a: [...a], compare: [j, j + 1], sorted: n - i, note: `compare ${a[j]} & ${a[j + 1]}` });
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; f.push({ a: [...a], swap: [j, j + 1], sorted: n - i, note: "swap" }); }
    }
  f.push({ a: [...a], sorted: 0, note: "sorted ✓" });
  return f;
}
function selection(arr) {
  const a = [...arr], f = [], n = a.length;
  for (let i = 0; i < n; i++) {
    let m = i;
    for (let j = i + 1; j < n; j++) {
      f.push({ a: [...a], compare: [m, j], sorted: i, pivot: m, note: `min so far ${a[m]}` });
      if (a[j] < a[m]) m = j;
    }
    if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; f.push({ a: [...a], swap: [i, m], sorted: i, note: "place minimum" }); }
  }
  f.push({ a: [...a], sorted: 0, note: "sorted ✓" });
  return f;
}
function insertion(arr) {
  const a = [...arr], f = [], n = a.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0 && a[j - 1] > a[j]) {
      f.push({ a: [...a], compare: [j - 1, j], note: `insert ${a[j]}` });
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      f.push({ a: [...a], swap: [j - 1, j], note: "shift" });
      j--;
    }
  }
  f.push({ a: [...a], sorted: 0, note: "sorted ✓" });
  return f;
}
function quick(arr) {
  const a = [...arr], f = [];
  const part = (lo, hi) => {
    const pivot = a[hi]; let i = lo;
    for (let j = lo; j < hi; j++) {
      f.push({ a: [...a], compare: [j, hi], pivot: hi, note: `pivot ${pivot}` });
      if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; f.push({ a: [...a], swap: [i, j], pivot: hi, note: "swap < pivot" }); i++; }
    }
    [a[i], a[hi]] = [a[hi], a[i]]; f.push({ a: [...a], swap: [i, hi], note: "place pivot" });
    return i;
  };
  const qs = (lo, hi) => { if (lo < hi) { const p = part(lo, hi); qs(lo, p - 1); qs(p + 1, hi); } };
  qs(0, a.length - 1);
  f.push({ a: [...a], sorted: 0, note: "sorted ✓" });
  return f;
}
function merge(arr) {
  const a = [...arr], f = [];
  const ms = (lo, hi) => {
    if (hi - lo < 1) return;
    const mid = (lo + hi) >> 1;
    ms(lo, mid); ms(mid + 1, hi);
    const tmp = []; let i = lo, j = mid + 1;
    while (i <= mid && j <= hi) {
      f.push({ a: [...a], compare: [i, j], note: `merge [${lo}..${hi}]` });
      tmp.push(a[i] <= a[j] ? a[i++] : a[j++]);
    }
    while (i <= mid) tmp.push(a[i++]);
    while (j <= hi) tmp.push(a[j++]);
    for (let k = 0; k < tmp.length; k++) { a[lo + k] = tmp[k]; f.push({ a: [...a], swap: [lo + k], note: "write back" }); }
  };
  ms(0, a.length - 1);
  f.push({ a: [...a], sorted: 0, note: "sorted ✓" });
  return f;
}
const BUILD = { bubble, selection, insertion, merge, quick };

export default function SortingViz() {
  const [algo, setAlgo] = useState("bubble");
  const [size, setSize] = useState(14);
  const [seed, setSeed] = useState(() => randArr(14));

  const frames = useMemo(() => BUILD[algo](seed), [algo, seed]);
  const player = useStepPlayer(frames);
  const fr = player.frame || { a: seed };
  const max = Math.max(...(fr.a.length ? fr.a : [1]));

  const shuffle = () => setSeed(randArr(size));
  const resize = (n) => { setSize(n); setSeed(randArr(n)); };

  return (
    <div className="viz">
      <div className="viz-controls">
        <div className="seg">
          {ALGOS.map((x) => (
            <button key={x} className={algo === x ? "on" : ""} onClick={() => setAlgo(x)}>{x}</button>
          ))}
        </div>
        <label className="ctl-range">Size <input type="range" min="6" max="28" value={size} onChange={(e) => resize(+e.target.value)} /> {size}</label>
        <button className="ghost-btn" onClick={shuffle}>🎲 Shuffle</button>
      </div>

      <div className="bars">
        {fr.a.map((v, i) => {
          const cls = fr.swap?.includes(i) ? "swap"
            : fr.compare?.includes(i) ? "compare"
            : fr.pivot === i ? "pivot"
            : fr.sorted !== undefined && i >= fr.sorted ? "sorted" : "";
          return (
            <div key={i} className={`bar ${cls}`} style={{ height: `${(v / max) * 100}%` }}>
              <span>{v}</span>
            </div>
          );
        })}
      </div>

      <PlayerBar player={player} caption={fr.note || ""} />
    </div>
  );
}
