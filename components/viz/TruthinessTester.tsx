"use client";

import { useState } from "react";

type V = { code: string; truthy: boolean; why: string };
const VALUES: V[] = [
  { code: "0", truthy: false, why: "zero — falsy" },
  { code: "0.0", truthy: false, why: "zero float — falsy" },
  { code: '""', truthy: false, why: "khaali string — falsy" },
  { code: "[]", truthy: false, why: "khaali list — falsy (surprise!)" },
  { code: "{}", truthy: false, why: "khaali dict — falsy" },
  { code: "None", truthy: false, why: "None — hamesha falsy" },
  { code: "1", truthy: true, why: "koi bhi non-zero number — truthy" },
  { code: "-5", truthy: true, why: "non-zero (negative bhi) — truthy" },
  { code: '"hi"', truthy: true, why: "non-empty string — truthy" },
  { code: '" "', truthy: true, why: "space bhi ek character hai — truthy!" },
  { code: "[0]", truthy: true, why: "list me kuch hai (chahe 0 ho) — truthy" },
  { code: '{"a": 1}', truthy: true, why: "non-empty dict — truthy" },
];

export function TruthinessTester() {
  const [sel, setSel] = useState<V | null>(null);

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">💡 Truthiness Tester</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        <code>if</code> me har value ya to <b>True jaisi (truthy)</b> hai ya <b>False jaisi (falsy)</b>. Kisi pe click karke <code>bool()</code> dekho — rule yaad ho jaayega.
      </p>

      <div className="tt-grid">
        {VALUES.map((v) => (
          <button
            key={v.code}
            className={`tt-chip ${v.truthy ? "t" : "f"}${sel?.code === v.code ? " sel" : ""}`}
            onClick={() => setSel(sel?.code === v.code ? null : v)}
          >
            <span className="tt-code">{v.code}</span>
            <span className="tt-tag">{v.truthy ? "truthy" : "falsy"}</span>
          </button>
        ))}
      </div>

      <div className="viz-code" style={{ marginTop: 14 }}>
        {sel ? (
          <>
            <div><span className="c-fn">bool</span>({sel.code}) <span className="c-kw">→</span> <span className={sel.truthy ? "c-str" : "c-num"}>{sel.truthy ? "True" : "False"}</span></div>
            <div style={{ marginTop: 4 }}><span className="c-com"># {sel.why}</span></div>
          </>
        ) : (
          <div><span className="c-com"># Falsy = khaali ya zero: 0, 0.0, &quot;&quot;, [], {}, (), None, False. Baaki SAB truthy.</span></div>
        )}
      </div>
    </div>
  );
}
