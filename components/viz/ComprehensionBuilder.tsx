"use client";

import { useState } from "react";

const NUMS = [1, 2, 3, 4, 5, 6];

const EXPRS: { id: string; label: string; fn: (x: number) => number }[] = [
  { id: "x", label: "x", fn: (x) => x },
  { id: "x*x", label: "x * x", fn: (x) => x * x },
  { id: "x*2", label: "x * 2", fn: (x) => x * 2 },
  { id: "x+10", label: "x + 10", fn: (x) => x + 10 },
];

const FILTERS: { id: string; label: string; code: string; fn: (x: number) => boolean }[] = [
  { id: "none", label: "sabhi", code: "", fn: () => true },
  { id: "even", label: "if x % 2 == 0", code: "if x % 2 == 0", fn: (x) => x % 2 === 0 },
  { id: "gt3", label: "if x > 3", code: "if x > 3", fn: (x) => x > 3 },
];

export function ComprehensionBuilder() {
  const [expr, setExpr] = useState(EXPRS[1]); // x*x
  const [filt, setFilt] = useState(FILTERS[1]); // even

  const kept = NUMS.filter(filt.fn);
  const out = kept.map(expr.fn);
  const code = `[${expr.label.replace(/ /g, "")} for x in nums${filt.code ? " " + filt.code : ""}]`;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">⚙️ Comprehension Builder</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        <code>nums = [1, 2, 3, 4, 5, 6]</code>. Neeche <b>filter (if)</b> aur <b>transform (expr)</b> chuno — har number ka safar dekho: pehle filter, phir transform.
      </p>

      <div className="viz-controls">
        <div className="ss-stepper"><span className="ss-lbl">expr</span>
          {EXPRS.map((e) => <button key={e.id} className={`ss-step${expr.id === e.id ? " on" : ""}`} onClick={() => setExpr(e)}>{e.label}</button>)}
        </div>
        <div className="ss-stepper"><span className="ss-lbl">filter</span>
          {FILTERS.map((f) => <button key={f.id} className={`ss-step${filt.id === f.id ? " on" : ""}`} onClick={() => setFilt(f)}>{f.label}</button>)}
        </div>
      </div>

      <div className="cb-flow">
        {NUMS.map((n) => {
          const pass = filt.fn(n);
          return (
            <div key={n} className={`cb-row${pass ? "" : " drop"}`}>
              <span className="cb-in">{n}</span>
              <span className="cb-arr">{pass ? "→" : "✕"}</span>
              <span className="cb-mid">{pass ? "rakha" : "hataya"}</span>
              {pass && <><span className="cb-arr">→</span><span className="cb-out">{expr.fn(n)}</span></>}
            </div>
          );
        })}
      </div>

      <div className="viz-code">
        <div><span className="c-kw">{code}</span></div>
        <div style={{ marginTop: 4 }}><span className="c-kw">→</span> <span className="c-num">[{out.join(", ")}]</span></div>
      </div>
    </div>
  );
}
