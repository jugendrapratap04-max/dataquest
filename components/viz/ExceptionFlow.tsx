"use client";

import { useState } from "react";

type Scn = { id: string; label: string; expr: string; err: string | null; result: string };
const SCN: Scn[] = [
  { id: "ok", label: "10 / 2", expr: "10 / 2", err: null, result: "5.0" },
  { id: "zero", label: "10 / 0", expr: "10 / 0", err: "ZeroDivisionError", result: "—" },
  { id: "type", label: "10 / 'a'", expr: "10 / 'a'", err: "TypeError", result: "—" },
];

export function ExceptionFlow() {
  const [scn, setScn] = useState<Scn>(SCN[0]);
  const errored = scn.err !== null;

  // try always starts; on error -> except runs, else skipped; no error -> else
  // runs, except skipped; finally always runs.
  const rows = [
    { key: "try", label: "try:", note: errored ? "started, then stopped at the error" : "ran all the way", on: true, kind: errored ? "partial" : "run" },
    { key: "except", label: "except:", note: errored ? `caught ${scn.err} — this one ran` : "no error — skipped", on: errored, kind: errored ? "catch" : "skip" },
    { key: "else", label: "else:", note: errored ? "there was an error — skipped" : "all clear — this one ran", on: !errored, kind: errored ? "skip" : "run" },
    { key: "finally", label: "finally:", note: "always runs — cleanup", on: true, kind: "always" },
  ];

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🛟 Exception Flow</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Pick a scenario and watch which of <code>try / except / else / finally</code> runs and which is <b>skipped</b>.
      </p>

      <div className="viz-controls">
        <div className="ss-stepper"><span className="ss-lbl">code</span>
          {SCN.map((s) => <button key={s.id} className={`ss-step${scn.id === s.id ? " on" : ""}`} onClick={() => setScn(s)}>{s.label}</button>)}
        </div>
      </div>

      <div className="ef-flow">
        {rows.map((r) => (
          <div key={r.key} className={`ef-row ef-${r.kind}`}>
            <span className="ef-lbl">{r.label}</span>
            <span className="ef-note">{r.note}</span>
            <span className="ef-badge">{r.on ? (r.kind === "catch" ? "⚠ ran" : r.kind === "always" ? "♾ ran" : "✓ ran") : "⊘ skip"}</span>
          </div>
        ))}
      </div>

      <div className="viz-code" style={{ marginTop: 14 }}>
        <div><span className="c-kw">result =</span> {scn.expr}</div>
        <div style={{ marginTop: 4 }}>
          {errored
            ? <span className="c-com"># this would crash — except caught it, the program lives</span>
            : <><span className="c-kw">→</span> <span className="c-num">{scn.result}</span></>}
        </div>
      </div>
    </div>
  );
}
