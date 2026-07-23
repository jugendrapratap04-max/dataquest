"use client";

import { useState } from "react";

/* Every value below was produced by running json.loads / json.dumps in real
 * Python 3.12, including the round-trip that turns an int key into a string.
 *
 * Two ideas to land: (1) JSON and Python are NOT the same words — true/false/
 * null on the JSON side become True/False/None on the Python side, and that
 * flip is where copy-paste bugs come from. (2) A round-trip is lossy: JSON keys
 * are always strings, so a dict keyed by ints comes back keyed by strings, and
 * data[1] then raises KeyError. */

type Row = { json: string; py: string; type: string; changed: boolean };

const ROWS: Row[] = [
  { json: "true", py: "True", type: "bool", changed: true },
  { json: "false", py: "False", type: "bool", changed: true },
  { json: "null", py: "None", type: "NoneType", changed: true },
  { json: "42", py: "42", type: "int", changed: false },
  { json: "3.14", py: "3.14", type: "float", changed: false },
  { json: '"hi"', py: "'hi'", type: "str", changed: false },
  { json: "[1, 2]", py: "[1, 2]", type: "list", changed: false },
  { json: '{"a": 1}', py: "{'a': 1}", type: "dict", changed: false },
];

type Mode = "loads" | "dumps" | "trap";

export function JsonBridge() {
  const [mode, setMode] = useState<Mode>("loads");
  const toPy = mode === "loads";

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🌉 JSON Bridge — text on one side, Python on the other</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        <code>loads</code> reads JSON text into Python objects; <code>dumps</code> writes them back out.
        Watch the three rows that <b>change spelling</b> crossing the bridge — that flip is the usual
        copy-paste bug.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        <button className={`ss-preset ${mode === "loads" ? "on" : ""}`} onClick={() => setMode("loads")}>json.loads (text → Python)</button>
        <button className={`ss-preset ${mode === "dumps" ? "on" : ""}`} onClick={() => setMode("dumps")}>json.dumps (Python → text)</button>
        <button className={`ss-preset ${mode === "trap" ? "on" : ""}`} onClick={() => setMode("trap")}>the round-trip trap 💥</button>
      </div>

      {mode !== "trap" ? (
        <>
          <div className="jb-head">
            <span className="jb-col-h">{toPy ? "JSON text" : "Python"}</span>
            <span className="jb-dir">{toPy ? "loads →" : "← dumps"}</span>
            <span className="jb-col-h">{toPy ? "Python" : "JSON text"}</span>
          </div>
          <div className="jb-rows">
            {ROWS.map((r, i) => (
              <div key={i} className={`jb-row ${r.changed ? "flip" : ""}`}>
                <span className="jb-cell json">{toPy ? r.json : r.py}</span>
                <span className="jb-arrow">{toPy ? "→" : "←"}</span>
                <span className="jb-cell py">{toPy ? r.py : r.json}</span>
                <span className="jb-type">{r.changed ? "spelling changes" : r.type}</span>
              </div>
            ))}
          </div>
          <div className="note tip" style={{ marginTop: 12 }}>
            <span className="i">💡</span>
            <div>
              JSON <code>true</code>/<code>false</code>/<code>null</code> are lowercase; Python is{" "}
              <code>True</code>/<code>False</code>/<code>None</code>. Pasting raw JSON into a{" "}
              <code>.py</code> file fails for exactly this reason — and JSON needs <b>double</b> quotes,
              never single.
            </div>
          </div>
        </>
      ) : (
        <div className="jb-trap">
          <div className="jb-step">
            <span className="jb-slabel">you start with</span>
            <code className="jb-code">scores = {"{"}1: 95, 2: 88{"}"}</code>
            <span className="jb-note-in">a dict keyed by <b>ints</b></span>
          </div>
          <div className="jb-down">↓ json.dumps</div>
          <div className="jb-step">
            <span className="jb-slabel">becomes the text</span>
            <code className="jb-code">'{'{'}"1": 95, "2": 88{'}'}'</code>
            <span className="jb-note-in">keys are now <b>strings</b> — JSON has no other kind</span>
          </div>
          <div className="jb-down">↓ json.loads</div>
          <div className="jb-step">
            <span className="jb-slabel">comes back as</span>
            <code className="jb-code">{"{"}'1': 95, '2': 88{"}"}</code>
            <span className="jb-note-in">still string keys</span>
          </div>
          <div className="note warn" style={{ marginTop: 12 }}>
            <span className="i">⚠️</span>
            <div>
              So <code>loaded[1]</code> raises <code>KeyError: 1</code> — the key is <code>"1"</code> now,
              not <code>1</code>. A JSON round-trip is <b>lossy</b>: int keys become strings, and tuples
              come back as lists. Use <code>loaded[str(1)]</code>, or design the data with string keys
              from the start.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
