import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { VIZ } from "./viz";
import CodePlayground from "./components/CodePlayground";

const CATEGORY_ORDER = [
  "Foundations", "Graphs & Pathfinding", "Backtracking",
  "Recursion", "Optimization", "Neural Networks",
];

export default function App() {
  const [algos, setAlgos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("visualize");
  const [solved, setSolved] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .algorithms()
      .then((list) => {
        setAlgos(list);
        setSelected((s) => s || list[0]?.id);
        const sv = {};
        list.forEach((a) => { if (a.progress?.solved) sv[a.id] = true; });
        setSolved(sv);
      })
      .catch((e) => setError(e.message));
  }, []);

  const current = useMemo(() => algos.find((a) => a.id === selected), [algos, selected]);

  const grouped = useMemo(() => {
    const m = {};
    algos.forEach((a) => { (m[a.category] = m[a.category] || []).push(a); });
    return CATEGORY_ORDER.filter((c) => m[c]).map((c) => [c, m[c]]);
  }, [algos]);

  const solvedCount = Object.keys(solved).length;

  return (
    <div className="app">
      {/* sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-mark">∿</span>
          <div>
            <strong>Algoscope</strong>
            <small>see it · code it · run it</small>
          </div>
        </div>

        <div className="progress-pill">
          <div className="progress-bar"><span style={{ width: `${algos.length ? (solvedCount / algos.length) * 100 : 0}%` }} /></div>
          <small>{solvedCount}/{algos.length} solved</small>
        </div>

        <nav className="nav">
          {grouped.map(([cat, items]) => (
            <div key={cat} className="nav-group">
              <h4>{cat}</h4>
              {items.map((a) => (
                <button
                  key={a.id}
                  className={`nav-item ${selected === a.id ? "active" : ""}`}
                  onClick={() => { setSelected(a.id); }}
                >
                  <span className="nav-name">{a.name}</span>
                  <span className="nav-meta">
                    {solved[a.id] && <span className="solved-dot">✓</span>}
                    <span className={`diff ${a.difficulty.toLowerCase()}`}>{a.difficulty}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="side-foot">React · Flask · SQLite</div>
      </aside>

      {/* main */}
      <main className="main">
        {error && <div className="banner err">{error}</div>}
        {!current ? (
          <div className="loading">Loading algorithms…</div>
        ) : (
          <>
            <header className="algo-head">
              <div className="algo-title">
                <h1>{current.name}</h1>
                <span className={`diff ${current.difficulty.toLowerCase()}`}>{current.difficulty}</span>
                {solved[current.id] && <span className="solved-chip">✓ Solved</span>}
              </div>
              <p className="algo-blurb">{current.blurb}</p>
              <div className="tabs">
                <button className={tab === "visualize" ? "on" : ""} onClick={() => setTab("visualize")}>
                  ◉ Visualize
                </button>
                <button className={tab === "code" ? "on" : ""} onClick={() => setTab("code")}>
                  {"</>"} Code &amp; test
                </button>
              </div>
            </header>

            <section className="stage">
              {tab === "visualize" ? (
                <div className="viz-host" key={current.id}>
                  {VIZ[current.id] ? VIZ[current.id]() : <p>No visualizer.</p>}
                </div>
              ) : (
                <CodePlayground
                  algo={current}
                  onSolved={(id) => setSolved((s) => ({ ...s, [id]: true }))}
                />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
