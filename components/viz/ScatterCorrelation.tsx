"use client";

import { useState } from "react";

type Mode = "positive" | "negative" | "none";
// Every r here was computed from the points beside it with Python's
// statistics.correlation, not estimated. The panel used to claim +0.96, -0.97
// and "~0.0" against true values of 0.9754, -0.9815 and -0.0352 — small gaps,
// but a student reading r off this panel and then computing it in the lesson
// would have found two different numbers for the same seven points.
//
// The third one is left at its real -0.04 rather than rounded to a tidy zero,
// because "no relationship" almost never lands exactly on zero in real data,
// and pretending otherwise sets up the wrong expectation.
const SETS: Record<Mode, { pts: [number, number][]; r: string; label: string }> = {
  positive: { pts: [[1,2],[2,3],[3,3],[4,5],[5,5],[6,7],[7,8]], r: "+0.98", label: "as one rises, so does the other" },
  negative: { pts: [[1,8],[2,7],[3,7],[4,5],[5,4],[6,2],[7,1]], r: "−0.98", label: "as one rises, the other falls" },
  none: { pts: [[1,4],[2,8],[3,2],[4,6],[5,3],[6,7],[7,4]], r: "−0.04", label: "no pattern — and note that this is not exactly zero" },
};
const W = 300, H = 160;

export function ScatterCorrelation() {
  const [mode, setMode] = useState<Mode>("positive");
  const s = SETS[mode];
  const px = (x: number) => 30 + ((x - 1) / 6) * (W - 45);
  const py = (y: number) => H - 25 - ((y - 1) / 7) * (H - 45);
  const rColor = mode === "positive" ? "var(--good)" : mode === "negative" ? "var(--bad)" : "var(--ink-faint)";

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">📈 Correlation — how two things move together</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Correlation describes how two variables relate: <b>+1</b> (rise together), <b>−1</b> (opposite), <b>0</b> (no relationship). Press a button below and watch the pattern.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 400, display: "block", margin: "0 auto" }}>
        <line x1="30" y1={H - 25} x2={W - 12} y2={H - 25} stroke="var(--line)" />
        <line x1="30" y1="12" x2="30" y2={H - 25} stroke="var(--line)" />
        {s.pts.map(([x, y], i) => <circle key={i} cx={px(x)} cy={py(y)} r="5" fill={rColor} opacity="0.85" />)}
      </svg>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 8 }}>
        <div className="cast-res" style={{ minWidth: 120, borderColor: `color-mix(in srgb, ${rColor} 45%, transparent)` }}>
          <div className="lbl">correlation (r)</div><div className="val" style={{ color: rColor }}>{s.r}</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "var(--ink-soft)", textAlign: "center", margin: "8px 0 14px" }}>{s.label}</p>

      <div className="viz-controls" style={{ justifyContent: "center" }}>
        <button className={`btn ${mode === "positive" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "8px 14px" }} onClick={() => setMode("positive")}>Positive</button>
        <button className={`btn ${mode === "negative" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "8px 14px" }} onClick={() => setMode("negative")}>Negative</button>
        <button className={`btn ${mode === "none" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "8px 14px" }} onClick={() => setMode("none")}>No correlation</button>
      </div>
      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div><b>Remember:</b> correlation is not causation. Ice-cream sales and drowning cases both rise in summer — neither one causes the other.</div></div>
    </div>
  );
}
