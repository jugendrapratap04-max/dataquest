"use client";

import { useState } from "react";

const ROWS = [
  { name: "Aarav Sharma", dept_id: 1, salary: 95000 },
  { name: "Diya Patel", dept_id: 1, salary: 88000 },
  { name: "Rohan Mehta", dept_id: 1, salary: 120000 },
  { name: "Ananya Iyer", dept_id: 2, salary: 67000 },
  { name: "Vihaan Nair", dept_id: 2, salary: 72000 },
  { name: "Ishita Rao", dept_id: 2, salary: 59000 },
  { name: "Kabir Singh", dept_id: 3, salary: 81000 },
  { name: "Meera Joshi", dept_id: 3, salary: 76000 },
  { name: "Arjun Reddy", dept_id: 1, salary: 105000 },
  { name: "Saanvi Gupta", dept_id: 2, salary: 91000 },
];

// The lesson's debug task, made draggable: AND binds tighter than OR, so the
// unbracketed form quietly answers a different question. Both are shown so the
// student can watch the two row sets diverge rather than take it on trust.
export function WhereLab() {
  const [threshold, setThreshold] = useState(90000);
  const [bracketed, setBracketed] = useState(true);

  const keep = (r: (typeof ROWS)[number]) =>
    bracketed
      ? (r.dept_id === 1 || r.dept_id === 2) && r.salary > threshold
      : r.dept_id === 1 || (r.dept_id === 2 && r.salary > threshold);

  const kept = ROWS.filter(keep);
  const clause = bracketed
    ? `WHERE (dept_id = 1 OR dept_id = 2)\n  AND salary > ${threshold}`
    : `WHERE dept_id = 1 OR dept_id = 2\n  AND salary > ${threshold}`;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🔍 WHERE — and the brackets that change the question</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Same three conditions, one pair of brackets. Toggle them and watch which people survive — nothing errors either way, and only one of them is the question you meant.
      </p>

      <div style={{
        padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--panel)",
        fontFamily: "var(--mono)", fontSize: 12.5, whiteSpace: "pre", overflowX: "auto", marginBottom: 12,
      }}>{`SELECT name, dept_id, salary\nFROM employees\n${clause}`}</div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: "var(--ink-faint)", textAlign: "left" }}>
              {["name", "dept_id", "salary", "kept?"].map((h) => (
                <th key={h} style={{ padding: "5px 10px", borderBottom: "1px solid var(--line)", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              const on = keep(r);
              return (
                <tr key={r.name} style={{
                  background: on ? "color-mix(in srgb, var(--teal) 13%, transparent)" : "transparent",
                  color: on ? "var(--ink)" : "var(--ink-faint)",
                }}>
                  <td style={{ padding: "5px 10px" }}>{r.name}</td>
                  <td style={{ padding: "5px 10px" }}>{r.dept_id}</td>
                  <td style={{ padding: "5px 10px" }}>{r.salary}</td>
                  <td style={{ padding: "5px 10px", fontWeight: 700, color: on ? "var(--teal)" : "var(--ink-faint)" }}>{on ? "yes" : "no"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 12 }}>
        <div className={`cast-res ${bracketed ? "ok" : "no"}`} style={{ minWidth: 118 }}>
          <div className="lbl">rows kept</div><div className="val">{kept.length} of {ROWS.length}</div>
        </div>
      </div>

      <label style={{ display: "block", fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)", marginTop: 14 }}>
        salary &gt; <b>{threshold}</b>
        <input type="range" min={50000} max={120000} step={1000} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
               style={{ width: "100%", marginTop: 4, accentColor: "var(--teal)" }} />
      </label>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 10 }}>
        <button className={`btn ${bracketed ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                onClick={() => setBracketed(true)}>with brackets</button>
        <button className={`btn ${!bracketed ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                onClick={() => setBracketed(false)}>without</button>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        Without brackets, <b>AND is evaluated first</b> — so the query reads as <i>&quot;department 1, or else department 2 people earning over the threshold&quot;</i>, and every single person in department 1 comes back regardless of pay. Drag the slider to the far right and watch: the bracketed version empties out, the unbracketed one still returns four.
      </div></div>
    </div>
  );
}
