"use client";

import { useState } from "react";

// The same six city strings as the lesson's code. Two real cities, written six
// ways — which is what a free-text field looks like after a year of use.
const RAW = ["Delhi", "delhi ", "DELHI", "Mumbai", " mumbai", "Delhi"];

export function CleaningLab() {
  const [strip, setStrip] = useState(false);
  const [lower, setLower] = useState(false);

  const out = RAW.map((s) => {
    let v = s;
    if (strip) v = v.trim();
    if (lower) v = v.toLowerCase();
    return v;
  });
  const distinct = [...new Set(out)];

  const code =
    strip && lower ? `df["city"].str.strip().str.lower().nunique()`
    : strip ? `df["city"].str.strip().nunique()`
    : lower ? `df["city"].str.lower().nunique()`
    : `df["city"].nunique()`;

  // Spaces are the whole point here, so they have to be visible. A leading or
  // trailing space is rendered as a shaded block rather than as nothing.
  const Show = ({ s }: { s: string }) => (
    <>
      {s.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} style={{
            display: "inline-block", width: "0.55em", height: "1em", verticalAlign: "text-bottom",
            background: "color-mix(in srgb, var(--bad) 38%, transparent)", borderRadius: 2,
          }} />
        ) : <span key={i}>{ch}</span>
      )}
    </>
  );

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🧽 Cleaning — two cities written six ways</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Every one of these is either Delhi or Mumbai. pandas can only see the characters, so to it they are five different places. The red blocks are spaces.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {out.map((s, i) => (
          <div key={i} style={{
            minWidth: 86, padding: "9px 8px", textAlign: "center", borderRadius: 9,
            border: "1.5px solid var(--line)", background: "var(--panel)",
            fontFamily: "var(--mono)", fontSize: 13,
          }}>
            <Show s={s} />
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--teal)", margin: "14px 0 10px", wordBreak: "break-all" }}>
        {code}
      </div>

      <div className="cast-flow" style={{ justifyContent: "center", flexWrap: "wrap" }}>
        <div className={`cast-res ${distinct.length === 2 ? "ok" : "no"}`} style={{ minWidth: 130 }}>
          <div className="lbl">distinct cities</div><div className="val">{distinct.length}</div>
        </div>
        <div className="cast-res" style={{ minWidth: 170 }}>
          <div className="lbl">pandas sees</div>
          <div className="val" style={{ fontSize: 12.5, lineHeight: 1.5 }}>{distinct.map((d) => `"${d}"`).join(", ")}</div>
        </div>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        <button className={`btn ${strip ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                onClick={() => setStrip(!strip)}>.str.strip()</button>
        <button className={`btn ${lower ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                onClick={() => setLower(!lower)}>.str.lower()</button>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        Neither one alone gets you to 2 — you need both. And until you do, <code>df[df[&quot;city&quot;] == &quot;Delhi&quot;]</code> quietly returns two rows out of four, which is the version of this bug that never announces itself.
      </div></div>
    </div>
  );
}
