import React, { useMemo, useState } from "react";
import { useStepPlayer } from "../hooks/useStepPlayer";
import PlayerBar from "../components/PlayerBar";

const sig = (x) => 1 / (1 + Math.exp(-x));
const XOR = { X: [[0, 0], [0, 1], [1, 0], [1, 1]], Y: [0, 1, 1, 0] };

// Train a 2-2-1 net on XOR with plain SGD, snapshotting weights/loss/decision
// surface every `every` epochs to animate learning.
function train(lr, epochs, every) {
  let s = 987654321;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s / 0x7fffffff) * 2 - 1; };
  let W1 = [[rnd(), rnd()], [rnd(), rnd()]], b1 = [rnd(), rnd()], W2 = [rnd(), rnd()], b2 = rnd();

  const G = 14;
  const snapshot = (epoch, loss) => {
    const grid = [];
    for (let gy = 0; gy < G; gy++) {
      const row = [];
      for (let gx = 0; gx < G; gx++) {
        const x0 = gx / (G - 1), x1 = 1 - gy / (G - 1);
        const h0 = sig(x0 * W1[0][0] + x1 * W1[1][0] + b1[0]);
        const h1 = sig(x0 * W1[0][1] + x1 * W1[1][1] + b1[1]);
        row.push(sig(h0 * W2[0] + h1 * W2[1] + b2));
      }
      grid.push(row);
    }
    return { epoch, loss, W1: [W1[0].slice(), W1[1].slice()], b1: b1.slice(), W2: W2.slice(), b2, grid };
  };

  const frames = [snapshot(0, 1)];
  let loss = 1;
  for (let e = 1; e <= epochs; e++) {
    loss = 0;
    for (let p = 0; p < 4; p++) {
      const [x0, x1] = XOR.X[p], y = XOR.Y[p];
      const h0 = sig(x0 * W1[0][0] + x1 * W1[1][0] + b1[0]);
      const h1 = sig(x0 * W1[0][1] + x1 * W1[1][1] + b1[1]);
      const o = sig(h0 * W2[0] + h1 * W2[1] + b2);
      const err = o - y; loss += err * err;
      const dO = err * o * (1 - o);
      const dh0 = dO * W2[0] * h0 * (1 - h0);
      const dh1 = dO * W2[1] * h1 * (1 - h1);
      W2[0] -= lr * dO * h0; W2[1] -= lr * dO * h1; b2 -= lr * dO;
      W1[0][0] -= lr * dh0 * x0; W1[1][0] -= lr * dh0 * x1;
      W1[0][1] -= lr * dh1 * x0; W1[1][1] -= lr * dh1 * x1;
      b1[0] -= lr * dh0; b1[1] -= lr * dh1;
    }
    loss /= 4;
    if (e % every === 0 || e === epochs) frames.push(snapshot(e, loss));
  }
  return frames;
}

const heat = (v) => {
  // 0 → indigo, 0.5 → slate, 1 → cyan
  const a = [124, 92, 255], b = [34, 211, 238];
  const r = Math.round(a[0] + (b[0] - a[0]) * v);
  const g = Math.round(a[1] + (b[1] - a[1]) * v);
  const bl = Math.round(a[2] + (b[2] - a[2]) * v);
  return `rgb(${r},${g},${bl})`;
};
const edge = (w) => (w >= 0 ? "#34d399" : "#fb7185");
const ew = (w) => Math.min(6, 0.6 + Math.abs(w) * 1.4);

export default function BackpropViz() {
  const [lr, setLr] = useState(0.5);
  const [epochs, setEpochs] = useState(4000);
  const frames = useMemo(() => train(lr, epochs, Math.max(1, Math.round(epochs / 90))), [lr, epochs]);
  const player = useStepPlayer(frames, { autoplay: true });
  const fr = player.frame || frames[0];
  const G = fr.grid.length;

  // loss curve geometry
  const losses = frames.map((f) => f.loss);
  const maxL = Math.max(...losses, 0.0001);
  const lossPts = frames
    .map((f, i) => `${(i / (frames.length - 1)) * 100},${40 - (f.loss / maxL) * 38}`)
    .join(" ");

  // node positions for the network diagram
  const nodes = {
    i0: [12, 24], i1: [12, 66],
    h0: [50, 22], h1: [50, 68],
    o: [88, 45],
  };
  const L = (a, b, w) => (
    <line x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
      stroke={edge(w)} strokeWidth={ew(w)} strokeOpacity="0.8" />
  );

  return (
    <div className="viz bp">
      <div className="viz-controls">
        <label className="ctl-range">Learning rate
          <input type="range" min="0.05" max="2" step="0.05" value={lr} onChange={(e) => setLr(+e.target.value)} /> {lr.toFixed(2)}
        </label>
        <label className="ctl-range">Epochs
          <select value={epochs} onChange={(e) => setEpochs(+e.target.value)}>
            {[1000, 2000, 4000, 8000].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <span className={`pill-info ${fr.loss < 0.05 ? "good" : ""}`}>loss {fr.loss.toFixed(4)}</span>
      </div>

      <div className="bp-grid">
        {/* network */}
        <div className="bp-card">
          <h4>Network (2 → 2 → 1)</h4>
          <svg viewBox="0 0 100 90" className="bp-net">
            {L("i0", "h0", fr.W1[0][0])}{L("i0", "h1", fr.W1[0][1])}
            {L("i1", "h0", fr.W1[1][0])}{L("i1", "h1", fr.W1[1][1])}
            {L("h0", "o", fr.W2[0])}{L("h1", "o", fr.W2[1])}
            {Object.entries(nodes).map(([k, [x, y]]) => (
              <g key={k}>
                <circle cx={x} cy={y} r="6" className={`bp-node ${k[0]}`} />
                <text x={x} y={y + 2} className="bp-node-label">{k}</text>
              </g>
            ))}
          </svg>
          <p className="bp-legend"><i style={{ background: "#34d399" }} /> +weight <i style={{ background: "#fb7185" }} /> −weight · thickness = magnitude</p>
        </div>

        {/* decision surface */}
        <div className="bp-card">
          <h4>Decision surface (learns XOR)</h4>
          <div className="bp-heat" style={{ gridTemplateColumns: `repeat(${G}, 1fr)` }}>
            {fr.grid.flatMap((row, y) => row.map((v, x) => (
              <div key={`${x}-${y}`} style={{ background: heat(v) }} />
            )))}
          </div>
          <div className="bp-truth">
            {XOR.X.map(([a, b], i) => (
              <span key={i} className={`tp ${XOR.Y[i] ? "one" : "zero"}`}>
                ({a},{b})→{XOR.Y[i]}
              </span>
            ))}
          </div>
        </div>

        {/* loss curve */}
        <div className="bp-card wide">
          <h4>Training loss · epoch {fr.epoch}</h4>
          <svg viewBox="0 0 100 42" className="bp-loss" preserveAspectRatio="none">
            <polyline points={lossPts} />
            <line className="cursor" x1={(player.index / (frames.length - 1)) * 100} y1="0"
              x2={(player.index / (frames.length - 1)) * 100} y2="42" />
          </svg>
        </div>
      </div>

      <PlayerBar player={player} caption={fr.loss < 0.05 ? "XOR learned ✓ — loss below 0.05" : "gradient descent in progress…"} />
    </div>
  );
}
