"use client";

import { useState } from "react";

const ROWS = [
  { name: "Aarav Sharma", salary: 95000 },
  { name: "Diya Patel", salary: 88000 },
  { name: "Rohan Mehta", salary: 120000 },
  { name: "Ananya Iyer", salary: 67000 },
  { name: "Vihaan Nair", salary: 72000 },
  { name: "Ishita Rao", salary: 59000 },
  { name: "Kabir Singh", salary: 81000 },
  { name: "Meera Joshi", salary: 76000 },
  { name: "Arjun Reddy", salary: 105000 },
  { name: "Saanvi Gupta", salary: 91000 },
];

// The point of the panel is the LIMIT-without-ORDER-BY trap, so the "no sort"
// state deliberately shows the table in its stored order — which is what the
// database actually hands back, and what makes the wrong three look right.
export function OrderLimitLab() {
  const [sorted, setSorted] = useState(false);
  const [limit, setLimit] = useState(3);

  const rows = sorted ? [...ROWS].sort((a, b) => b.salary - a.salary) : ROWS;
  const shown = rows.slice(0, limit);
  const trueTop = [...ROWS].sort((a, b) => b.salary - a.salary).slice(0, limit).map((r) => r.name);
  const correct = shown.every((r, i) => r.name === trueTop[i]);

  const query = `SELECT name, salary\nFROM employees${sorted ? "\nORDER BY salary DESC" : ""}\nLIMIT ${limit}`;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🔢 ORDER BY + LIMIT — and what LIMIT alone gives you</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Ask for the top earners. Turn <b>ORDER BY</b> off and the query still runs, still returns the number of rows you asked for, and quietly hands you the wrong people.
      </p>

      <div style={{
        padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--panel)",
        fontFamily: "var(--mono)", fontSize: 12.5, whiteSpace: "pre", overflowX: "auto", marginBottom: 12,
      }}>{query}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {shown.map((r, i) => {
          const right = r.name === trueTop[i];
          return (
            <div key={r.name} style={{
              display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8,
              fontFamily: "var(--mono)", fontSize: 13,
              border: `1.5px solid ${right ? "color-mix(in srgb, var(--good) 45%, transparent)" : "color-mix(in srgb, var(--bad) 50%, transparent)"}`,
              background: `color-mix(in srgb, ${right ? "var(--good)" : "var(--bad)"} 11%, transparent)`,
            }}>
              <span>{r.name}</span><span style={{ fontWeight: 700 }}>{r.salary}</span>
            </div>
          );
        })}
      </div>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 12 }}>
        <div className={`cast-res ${correct ? "ok" : "no"}`} style={{ minWidth: 190 }}>
          <div className="lbl">are these the top {limit}?</div>
          <div className="val" style={{ fontSize: 13 }}>{correct ? "yes" : "no — wrong people"}</div>
        </div>
      </div>

      <label style={{ display: "block", fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)", marginTop: 14 }}>
        LIMIT <b>{limit}</b>
        <input type="range" min={1} max={6} step={1} value={limit} onChange={(e) => setLimit(Number(e.target.value))}
               style={{ width: "100%", marginTop: 4, accentColor: "var(--teal)" }} />
      </label>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 10 }}>
        <button className={`btn ${sorted ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                onClick={() => setSorted(true)}>with ORDER BY</button>
        <button className={`btn ${!sorted ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                onClick={() => setSorted(false)}>without</button>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        <b>LIMIT does not mean &quot;the best&quot; — it means &quot;the first&quot;.</b> Without an ORDER BY there is no defined first, so the database returns whatever is cheapest to reach. Here that is insertion order, and Rohan on 120,000 does not even make the list.
      </div></div>
    </div>
  );
}
