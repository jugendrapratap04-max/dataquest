"use client";

import { useState } from "react";

// The employees table from the track's shared schema, so the panel and every
// code block in every SQL lesson are looking at the same ten people.
const COLS = ["id", "name", "dept_id", "salary", "hire_date"] as const;
type Col = (typeof COLS)[number];

const ROWS: Record<Col, string | number>[] = [
  { id: 1, name: "Aarav Sharma", dept_id: 1, salary: 95000, hire_date: "2021-03-15" },
  { id: 2, name: "Diya Patel", dept_id: 1, salary: 88000, hire_date: "2022-01-10" },
  { id: 3, name: "Rohan Mehta", dept_id: 1, salary: 120000, hire_date: "2020-07-01" },
  { id: 4, name: "Ananya Iyer", dept_id: 2, salary: 67000, hire_date: "2022-05-20" },
];

export function SelectLab() {
  const [picked, setPicked] = useState<Col[]>(["name", "salary"]);

  const toggle = (c: Col) =>
    setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...COLS].filter((x) => p.includes(x) || x === c)));

  const all = picked.length === COLS.length;
  const shown = picked.length ? picked : [];
  const query = shown.length === 0
    ? "-- pick at least one column"
    : `SELECT ${all ? "*" : shown.join(", ")}\nFROM employees`;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🧾 SELECT — choosing the width of the answer</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Tap the column names. Everything above the table is what changes; the number of <b>rows</b> never does — that is what makes SELECT a decision about width.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
        {COLS.map((c) => (
          <button key={c} className={`btn ${picked.includes(c) ? "btn-primary" : "btn-ghost"}`}
                  style={{ padding: "6px 11px", fontFamily: "var(--mono)", fontSize: 12 }}
                  onClick={() => toggle(c)}>{c}</button>
        ))}
      </div>

      <div style={{
        padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--panel)",
        fontFamily: "var(--mono)", fontSize: 12.5, whiteSpace: "pre", overflowX: "auto", marginBottom: 12,
      }}>{query}</div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: "var(--teal)", textAlign: "left" }}>
              {shown.map((c) => <th key={c} style={{ padding: "6px 10px", borderBottom: "1px solid var(--line)", fontWeight: 700 }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i}>
                {shown.map((c) => <td key={c} style={{ padding: "6px 10px", color: "var(--ink-soft)" }}>{r[c]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p style={{ fontSize: 12.5, color: "var(--ink-faint)", textAlign: "center", padding: "14px 0" }}>Nothing selected — a query has to ask for something.</p>}
      </div>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 14 }}>
        <div className="cast-res" style={{ minWidth: 104 }}><div className="lbl">columns</div><div className="val">{shown.length}</div></div>
        <div className="cast-res ok" style={{ minWidth: 104 }}><div className="lbl">rows</div><div className="val">{shown.length ? ROWS.length : 0}</div></div>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        Turn every column on and the query collapses to <code>SELECT *</code> — same result, shorter to type, and the reason it is a bad habit in saved code: add a column to the table tomorrow and <code>*</code> quietly returns six where your code expected five.
        {" "}(Only the first four of the ten employees are shown here, to keep the panel readable.)
      </div></div>
    </div>
  );
}
