"use client";

import { useState } from "react";

// Same six rows as the lesson's code, so every number this panel reports can be
// checked against the printed output line for line.
const ROWS = [
  { city: "Delhi", sales: 100, year: 2023 },
  { city: "Mumbai", sales: 200, year: 2023 },
  { city: "Delhi", sales: 50, year: 2024 },
  { city: "Delhi", sales: 175, year: 2024 },
  { city: "Chennai", sales: 90, year: 2023 },
  { city: "Mumbai", sales: 140, year: 2024 },
];

const HUE: Record<string, string> = { Delhi: "var(--teal)", Mumbai: "var(--accent)", Chennai: "var(--indigo)" };
type Agg = "sum" | "mean" | "max" | "count";
const AGG_LABEL: Record<Agg, string> = { sum: "sum()", mean: "mean()", max: "max()", count: "size()" };

export function GroupByLab() {
  const [agg, setAgg] = useState<Agg>("sum");

  const keys = [...new Set(ROWS.map((r) => r.city))].sort();
  const result = keys.map((k) => {
    const vals = ROWS.filter((r) => r.city === k).map((r) => r.sales);
    const v =
      agg === "sum" ? vals.reduce((a, b) => a + b, 0)
      : agg === "mean" ? vals.reduce((a, b) => a + b, 0) / vals.length
      : agg === "max" ? Math.max(...vals)
      : vals.length;
    return { k, v, n: vals.length };
  });

  const code =
    agg === "count"
      ? `df.groupby("city").size()`
      : `df.groupby("city")["sales"].${agg}()`;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🧺 GroupBy — split, apply, combine</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Six rows go in and three come out. The colours are the <b>split</b>; the button you press is the <b>apply</b>; the table at the bottom is the <b>combine</b>.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {ROWS.map((r, i) => (
          <div key={i} style={{
            minWidth: 78, padding: "8px 6px", textAlign: "center", borderRadius: 9,
            border: `1.5px solid ${HUE[r.city]}`,
            background: `color-mix(in srgb, ${HUE[r.city]} 12%, transparent)`,
          }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>{r.city}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, marginTop: 2 }}>{r.sales}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--teal)", margin: "12px 0 10px" }}>
        ↓ &nbsp;{code}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {result.map((r) => (
          <div key={r.k} style={{
            minWidth: 96, padding: "9px 8px", textAlign: "center", borderRadius: 9,
            border: `2px solid ${HUE[r.k]}`, background: `color-mix(in srgb, ${HUE[r.k]} 18%, transparent)`,
          }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>{r.k}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, marginTop: 2 }}>
              {agg === "mean" ? r.v.toFixed(2) : r.v}
            </div>
            <div style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 2 }}>from {r.n} row{r.n === 1 ? "" : "s"}</div>
          </div>
        ))}
      </div>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 14 }}>
        <div className="cast-res" style={{ minWidth: 100 }}><div className="lbl">rows in</div><div className="val">{ROWS.length}</div></div>
        <div className="cast-res ok" style={{ minWidth: 100 }}><div className="lbl">rows out</div><div className="val">{result.length}</div></div>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        {(Object.keys(AGG_LABEL) as Agg[]).map((k) => (
          <button key={k} className={`btn ${agg === k ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                  onClick={() => setAgg(k)}>{AGG_LABEL[k]}</button>
        ))}
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        <b>Rows out is the number of distinct groups</b>, never the number of rows you started with. That is the whole shape of a groupby, and it is why the city names come back as the <i>index</i> rather than as a column — <code>reset_index()</code> is what turns them back into one.
      </div></div>
    </div>
  );
}
