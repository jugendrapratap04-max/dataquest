"use client";

import { useState } from "react";

// The same six rows the lesson's code uses, so the panel and the printed
// output can be checked against each other rather than being two unrelated
// examples of the same idea.
const ROWS = [
  { city: "Delhi", sales: 100, year: 2023 },
  { city: "Mumbai", sales: 200, year: 2023 },
  { city: "Delhi", sales: 50, year: 2024 },
  { city: "Delhi", sales: 175, year: 2024 },
  { city: "Chennai", sales: 90, year: 2023 },
  { city: "Mumbai", sales: 140, year: 2024 },
];

const CITIES = ["Any", "Delhi", "Mumbai"] as const;
type City = (typeof CITIES)[number];

export function FilterLab() {
  const [threshold, setThreshold] = useState(100);
  const [city, setCity] = useState<City>("Delhi");
  const [joiner, setJoiner] = useState<"and" | "or">("and");

  const salesHit = (r: (typeof ROWS)[number]) => r.sales > threshold;
  const cityHit = (r: (typeof ROWS)[number]) => city === "Any" || r.city === city;
  const keep = (r: (typeof ROWS)[number]) =>
    city === "Any" ? salesHit(r) : joiner === "and" ? salesHit(r) && cityHit(r) : salesHit(r) || cityHit(r);

  const kept = ROWS.filter(keep);
  const total = kept.reduce((n, r) => n + r.sales, 0);

  const code =
    city === "Any"
      ? `df[df["sales"] > ${threshold}]`
      : `df[(df["city"] == "${city}") ${joiner === "and" ? "&" : "|"} (df["sales"] > ${threshold})]`;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🔎 Filter Lab — the mask, and what & does to it</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        The <b>keep?</b> column is the boolean mask. Every filter you write in pandas builds one of these first, and then keeps the rows where it says True.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: "var(--ink-faint)", textAlign: "left" }}>
              {["city", "sales", "year", "keep?"].map((h) => (
                <th key={h} style={{ padding: "6px 10px", borderBottom: "1px solid var(--line)", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => {
              const on = keep(r);
              return (
                <tr key={i} style={{
                  background: on ? "color-mix(in srgb, var(--teal) 13%, transparent)" : "transparent",
                  color: on ? "var(--ink)" : "var(--ink-faint)",
                }}>
                  <td style={{ padding: "6px 10px" }}>{r.city}</td>
                  <td style={{ padding: "6px 10px" }}>{r.sales}</td>
                  <td style={{ padding: "6px 10px" }}>{r.year}</td>
                  <td style={{ padding: "6px 10px", fontWeight: 700, color: on ? "var(--teal)" : "var(--ink-faint)" }}>
                    {on ? "True" : "False"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: 14, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)",
        background: "var(--panel)", fontFamily: "var(--mono)", fontSize: 12.5, overflowX: "auto", whiteSpace: "nowrap",
      }}>{code}</div>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
        <div className={`cast-res ${kept.length ? "ok" : "no"}`} style={{ minWidth: 104 }}>
          <div className="lbl">rows kept</div><div className="val">{kept.length} of {ROWS.length}</div>
        </div>
        <div className="cast-res" style={{ minWidth: 104 }}><div className="lbl">sales total</div><div className="val">{total}</div></div>
      </div>

      <label style={{ display: "block", fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)", marginTop: 14 }}>
        sales &gt; <b>{threshold}</b>
        <input type="range" min={0} max={200} step={5} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
               style={{ width: "100%", marginTop: 4, accentColor: "var(--teal)" }} />
      </label>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
        {CITIES.map((c) => (
          <button key={c} className={`btn ${city === c ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                  onClick={() => setCity(c)}>{c === "Any" ? "no city filter" : c}</button>
        ))}
      </div>

      {city !== "Any" && (
        <div className="viz-controls" style={{ justifyContent: "center", marginTop: 8 }}>
          <button className={`btn ${joiner === "and" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                  onClick={() => setJoiner("and")}>&amp; (both)</button>
          <button className={`btn ${joiner === "or" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                  onClick={() => setJoiner("or")}>| (either)</button>
        </div>
      )}

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        Switch between <b>&amp;</b> and <b>|</b> without touching anything else. Same two conditions, and the total swings from 175 to 665 — because <code>|</code> keeps every Delhi row <i>and</i> every big sale, which is a much larger question than the one you probably meant.
      </div></div>
    </div>
  );
}
