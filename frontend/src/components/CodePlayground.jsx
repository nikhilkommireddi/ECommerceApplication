import React, { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import { api } from "../api";

// The "code here, run it, see test results + hints" panel for an algorithm.
export default function CodePlayground({ algo, onSolved }) {
  const [code, setCode] = useState(algo.progress?.code || algo.starter);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [showHints, setShowHints] = useState(false);

  // reset editor when switching algorithm
  useEffect(() => {
    setCode(algo.progress?.code || algo.starter);
    setResult(null);
    setShowHints(false);
  }, [algo.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const r = await api.run(algo.id, code);
      setResult(r);
      if (r.solved) onSolved?.(algo.id);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setRunning(false);
    }
  };

  const reset = () => { setCode(algo.starter); setResult(null); };

  const results = result?.results || [];
  const passed = result?.passed ?? 0;
  const total = result?.total ?? algo.tests;

  return (
    <div className="play">
      <div className="play-editor">
        <div className="play-toolbar">
          <span className="fn-sig">def {algo.fn_name}(…)</span>
          <div className="play-toolbar-actions">
            <button className="ghost-btn" onClick={() => setShowHints((s) => !s)}>
              💡 Hints {showHints ? "▲" : "▼"}
            </button>
            <button className="ghost-btn" onClick={reset}>↺ Reset code</button>
            <button className="run-btn" onClick={run} disabled={running}>
              {running ? "Running…" : "▶ Run tests"}
            </button>
          </div>
        </div>

        {showHints && (
          <ul className="hints">
            {algo.hints.map((h, i) => (
              <li key={i}><span>{i + 1}</span>{h}</li>
            ))}
          </ul>
        )}

        <CodeEditor value={code} onChange={setCode} />
      </div>

      <div className="play-results">
        {!result && <p className="results-idle">Write your solution and hit <b>Run tests</b>. Edge cases are marked <span className="edge-pill">edge</span>.</p>}

        {result?.compile_error && (
          <pre className="err-box">{result.compile_error}</pre>
        )}
        {result?.timeout && <div className="err-box">⏱ {result.error}</div>}
        {result?.error && !result.compile_error && !result.timeout && (
          <div className="err-box">{result.error}</div>
        )}

        {results.length > 0 && (
          <>
            <div className={`score ${passed === total ? "all" : ""}`}>
              <strong>{passed}/{total}</strong> tests passing
              {passed === total && <span className="solved-badge">✓ Solved</span>}
            </div>

            <ul className="cases">
              {results.map((r) => (
                <li key={r.name} className={r.passed ? "ok" : "bad"}>
                  <span className="case-ic">{r.passed ? "✓" : "✕"}</span>
                  <span className="case-name">
                    {r.name}
                    {r.edge && <span className="edge-pill">edge</span>}
                  </span>
                  {!r.passed && (
                    <span className="case-detail">
                      {r.error ? r.error : `got ${r.got} — ${r.detail}`}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {result.hint && passed !== total && (
              <div className="hint-box">💡 {result.hint}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
