import React from "react";

// Shared transport controls for every visualizer.
export default function PlayerBar({ player, caption }) {
  const { index, total, playing, speed, setSpeed, toggle, stepF, stepB, reset, setIndex } = player;
  return (
    <div className="player">
      <div className="player-controls">
        <button className="pbtn" onClick={reset} title="Restart">⏮</button>
        <button className="pbtn" onClick={stepB} title="Step back">◀</button>
        <button className="pbtn play" onClick={toggle} title="Play / pause">
          {playing ? "⏸" : "▶"}
        </button>
        <button className="pbtn" onClick={stepF} title="Step forward">▶▶</button>
        <div className="player-speed">
          <span>Speed</span>
          <input
            type="range" min="0.25" max="4" step="0.25"
            value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
          <b>{speed}×</b>
        </div>
      </div>
      <input
        className="player-scrub"
        type="range" min="0" max={Math.max(0, total - 1)} value={index}
        onChange={(e) => setIndex(parseInt(e.target.value, 10))}
      />
      <div className="player-caption">
        <span className="step-count">step {total ? index + 1 : 0} / {total}</span>
        <span className="caption-text">{caption}</span>
      </div>
    </div>
  );
}
