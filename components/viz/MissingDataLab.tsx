"use client";

import { useState } from "react";

// The same six students the lesson's code uses, so the numbers this panel
// reports can be checked line for line against the printed output.
const NAMES = ["Aarav", "Diya", "Kabir", "Meera", "Rohan", "Sara"];
const RAW: (number | null)[] = [80, 90, null, 70, null, 60];

type Strategy = "asis" | "drop" | "zero" | "mean" | "ffill";

const LABEL: Record<Strategy, string> = {
  asis: "leave it",
  drop: "dropna()",
  zero: "fillna(0)",
  mean: "fillna(mean)",
  ffill: "ffill()",
};

const NOTE: Record<Strategy, string> = {
  asis: "pandas skips the gaps when it aggregates. The average is honest — but it is the average of four students, not six, and nothing on the page says so.",
  drop: "Two students are gone. Fine here; on a wide table a row is dropped if ANY column is missing, which can quietly delete most of your data.",
  zero: "This is the dangerous one. Zero is a real score, so two students who never sat the exam now count as having failed it — and the average falls by a third.",
  mean: "The average survives, and so does the row count. The cost is invisible: the spread shrinks, because you have added values that are exactly typical.",
  ffill: "Each gap copies the value above it. Sensible for a time series where yesterday's reading is the best guess; nonsense here, where Kabir inherits Diya's mark.",
};

export function MissingDataLab() {
  const [s, setS] = useState<Strategy>("asis");

  const present = RAW.filter((v): v is number => v !== null);
  const trueMean = present.reduce((a, b) => a + b, 0) / present.length;

  const filled: (number | null)[] =
    s === "zero" ? RAW.map((v) => (v === null ? 0 : v))
    : s === "mean" ? RAW.map((v) => (v === null ? trueMean : v))
    : s === "ffill" ? RAW.reduce<(number | null)[]>((acc, v, i) => {
        acc.push(v === null ? (i === 0 ? null : acc[i - 1]) : v);
        return acc;
      }, [])
    : RAW;

  const rows = NAMES.map((n, i) => ({ name: n, v: filled[i], wasNull: RAW[i] === null }))
    .filter((r) => (s === "drop" ? !r.wasNull : true));

  const vals = rows.map((r) => r.v).filter((v): v is number => v !== null);
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🕳️ Missing Data — five choices, four different answers</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Six students, two of whom never sat the exam. Nothing below is a bug and none of these is wrong — but they do not agree, and whichever one you pick is a claim about what the absence <i>meant</i>.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {rows.map((r) => (
          <div key={r.name} style={{
            minWidth: 74, padding: "8px 6px", textAlign: "center", borderRadius: 9,
            border: `1.5px solid ${r.wasNull ? "color-mix(in srgb, var(--bad) 55%, transparent)" : "var(--line)"}`,
            background: r.wasNull ? "color-mix(in srgb, var(--bad) 12%, transparent)" : "var(--panel)",
          }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>{r.name}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, marginTop: 2 }}>
              {r.v === null ? "NaN" : r.v.toFixed(r.v % 1 === 0 ? 0 : 1)}
            </div>
          </div>
        ))}
      </div>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        <div className="cast-res" style={{ minWidth: 100 }}><div className="lbl">rows</div><div className="val">{rows.length}</div></div>
        <div className={`cast-res ${Math.abs(mean - trueMean) < 0.01 ? "ok" : "no"}`} style={{ minWidth: 118 }}>
          <div className="lbl">average score</div><div className="val">{mean.toFixed(2)}</div>
        </div>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        {(Object.keys(LABEL) as Strategy[]).map((k) => (
          <button key={k} className={`btn ${s === k ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 12px" }}
                  onClick={() => setS(k)}>{LABEL[k]}</button>
        ))}
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>{NOTE[s]}</div></div>
    </div>
  );
}
