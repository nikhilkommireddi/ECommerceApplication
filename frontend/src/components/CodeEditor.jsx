import React, { useMemo, useRef } from "react";

// Dependency-free code editor: a styled textarea with a line-number gutter and
// Tab-to-indent support. Good enough for short algorithm functions.
export default function CodeEditor({ value, onChange }) {
  const taRef = useRef(null);
  const gutterRef = useRef(null);

  const lineCount = useMemo(() => (value.match(/\n/g)?.length || 0) + 1, [value]);

  const onKeyDown = (e) => {
    const ta = taRef.current;
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: en } = ta;
      const next = value.slice(0, s) + "    " + value.slice(en);
      onChange(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 4; });
    }
    if (e.key === "Enter") {
      // keep the previous line's indentation
      const s = ta.selectionStart;
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const indent = (value.slice(lineStart, s).match(/^[ \t]*/) || [""])[0];
      if (indent) {
        e.preventDefault();
        const next = value.slice(0, s) + "\n" + indent + value.slice(ta.selectionEnd);
        onChange(next);
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 1 + indent.length; });
      }
    }
  };

  const syncScroll = () => {
    if (gutterRef.current && taRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  return (
    <div className="editor">
      <div className="editor-gutter" ref={gutterRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={taRef}
        className="editor-area"
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={syncScroll}
      />
    </div>
  );
}
