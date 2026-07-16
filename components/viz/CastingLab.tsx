"use client";

import { useState } from "react";

type Cast = "int" | "float" | "str" | null;

export function CastingLab() {
  const [cast, setCast] = useState<Cast>(null);

  const source = '"85"'; // a string
  const result =
    cast === "int" ? { val: "85", type: "int", plus: "90", ok: true }
    : cast === "float" ? { val: "85.0", type: "float", plus: "90.0", ok: true }
    : cast === "str" ? { val: '"85"', type: "str", plus: "❌ error", ok: false }
    : null;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔄 Casting Lab — type badal ke dekho</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Ek value <span className="kbd">marks = &quot;85&quot;</span> hai — ye <b>string</b> hai. Neeche button dabao aur dekho har cast kya karta hai, aur <span className="kbd">+ 5</span> chalega ya nahi.
      </p>

      <div className="cast-flow">
        <div className="cast-src"><div className="lbl">marks</div><div className="val">{source}</div><span className="type-chip t-str">str</span></div>
        <div className="cast-arrow">{cast ? `→ ${cast}()  →` : "→ ? →"}</div>
        <div className={`cast-res ${result ? (result.ok ? "ok" : "no") : "empty"}`}>
          {result ? (<><div className="val">{result.val}</div><span className={`type-chip t-${result.type}`}>{result.type}</span></>) : <div className="val" style={{ color: "var(--ink-faint)" }}>?</div>}
        </div>
      </div>

      <div className="viz-controls" style={{ marginTop: 16 }}>
        <button className={`btn ${cast === "int" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "8px 14px" }} onClick={() => setCast("int")}>int(marks)</button>
        <button className={`btn ${cast === "float" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "8px 14px" }} onClick={() => setCast("float")}>float(marks)</button>
        <button className={`btn ${cast === "str" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "8px 14px" }} onClick={() => setCast("str")}>str(marks)</button>
      </div>

      {result && (
        <div className="viz-code" style={{ marginTop: 14 }}>
          <div>marks <span className="c-kw">=</span> <span className={`c-${result.type === "str" ? "str" : "fn"}`}>{cast}</span>(<span className="c-str">&quot;85&quot;</span>)</div>
          <div><span className="c-fn">print</span>(marks <span className="c-kw">+</span> <span className="c-num">5</span>) <span className="c-com"># {result.plus}</span></div>
        </div>
      )}
      {result && !result.ok && (
        <div className="note warn" style={{ marginTop: 12 }}><span className="i">⚠️</span><div>String ko number ke saath jodne se <b>TypeError</b> aata hai. Number chahiye to <span className="kbd">int()</span> ya <span className="kbd">float()</span> use karo.</div></div>
      )}
    </div>
  );
}
