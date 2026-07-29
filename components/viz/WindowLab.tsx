"use client";

import { useState } from "react";

const ROWS = [
  { name: "Rohan Mehta", dept: 1, salary: 120000 },
  { name: "Arjun Reddy", dept: 1, salary: 105000 },
  { name: "Aarav Sharma", dept: 1, salary: 95000 },
  { name: "Diya Patel", dept: 1, salary: 88000 },
  { name: "Saanvi Gupta", dept: 2, salary: 91000 },
  { name: "Vihaan Nair", dept: 2, salary: 72000 },
  { name: "Kabir Singh", dept: 3, salary: 81000 },
];

// GROUP BY collapses; a window function does not. Showing the two side by side
// is the only way the difference lands — the aggregate is the same number, and
// what changed is how many rows survive to carry it.
export function WindowLab() {
  const [mode, setMode] = useState<"group" | "window">("window");

  const deptMax: Record<number, number> = {};
  for (const r of ROWS) deptMax[r.dept] = Math.max(deptMax[r.dept] ?? 0, r.salary);

  const groupRows = Object.entries(deptMax).map(([d, top]) => ({ dept: Number(d), top }));

  const code = mode === "group"
    ? `SELECT dept_id, MAX(salary) AS top\nFROM employees\nGROUP BY dept_id`
    : `SELECT name, dept_id, salary,\n  MAX(salary) OVER (PARTITION BY dept_id) AS top\nFROM employees`;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🪟 GROUP BY collapses · a window does not</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Both compute the top salary per department. Only one of them still knows who earns it.
      </p>

      <div style={{
        padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--panel)",
        fontFamily: "var(--mono)", fontSize: 12.5, whiteSpace: "pre", overflowX: "auto", marginBottom: 12,
      }}>{code}</div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: "var(--ink-faint)", textAlign: "left" }}>
              {(mode === "group" ? ["dept_id", "top"] : ["name", "dept_id", "salary", "top"]).map((h) => (
                <th key={h} style={{ padding: "5px 10px", borderBottom: "1px solid var(--line)", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mode === "group"
              ? groupRows.map((r) => (
                  <tr key={r.dept}>
                    <td style={{ padding: "5px 10px" }}>{r.dept}</td>
                    <td style={{ padding: "5px 10px", fontWeight: 700 }}>{r.top}</td>
                  </tr>
                ))
              : ROWS.map((r) => (
                  <tr key={r.name} style={{ background: r.salary === deptMax[r.dept] ? "color-mix(in srgb, var(--teal) 12%, transparent)" : "transparent" }}>
                    <td style={{ padding: "5px 10px" }}>{r.name}</td>
                    <td style={{ padding: "5px 10px" }}>{r.dept}</td>
                    <td style={{ padding: "5px 10px" }}>{r.salary}</td>
                    <td style={{ padding: "5px 10px", fontWeight: 700, color: "var(--teal)" }}>{deptMax[r.dept]}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 12 }}>
        <div className="cast-res" style={{ minWidth: 100 }}><div className="lbl">rows in</div><div className="val">{ROWS.length}</div></div>
        <div className={`cast-res ${mode === "window" ? "ok" : "no"}`} style={{ minWidth: 100 }}>
          <div className="lbl">rows out</div><div className="val">{mode === "group" ? groupRows.length : ROWS.length}</div>
        </div>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 14 }}>
        <button className={`btn ${mode === "group" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                onClick={() => setMode("group")}>GROUP BY</button>
        <button className={`btn ${mode === "window" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                onClick={() => setMode("window")}>OVER (PARTITION BY)</button>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        The <b>top</b> column holds the same numbers in both. What changes is the row count: <b>GROUP BY</b> gives one row per department and throws the names away, while <b>OVER</b> attaches the group&apos;s answer to every original row and keeps them all. That is the entire idea, and it is why a window function can answer &quot;who earns the most in their department&quot; when a GROUP BY cannot.
      </div></div>
    </div>
  );
}
