"use client";

import { useState } from "react";

const DEPTS = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Sales" },
  { id: 3, name: "Marketing" },
  { id: 4, name: "HR" },
];
const STAFF: Record<number, number> = { 1: 4, 2: 4, 3: 2 };   // HR has nobody

// HR is the whole lesson: a department that exists and employs nobody. An INNER
// JOIN drops it silently and every remaining row is correct, which is why the
// report passes review.
export function JoinLab() {
  const [kind, setKind] = useState<"inner" | "left">("left");

  const rows = DEPTS.filter((d) => kind === "left" || STAFF[d.id] !== undefined);

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🔗 INNER vs LEFT JOIN — and the row that disappears</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Four departments. Three of them have staff. Ask for &quot;headcount per department&quot; and the join you pick decides whether the fourth one is in the answer at all.
      </p>

      <div style={{
        padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--panel)",
        fontFamily: "var(--mono)", fontSize: 12.5, whiteSpace: "pre", overflowX: "auto", marginBottom: 12,
      }}>{`SELECT d.name, COUNT(e.id) AS staff\nFROM departments d\n${kind === "left" ? "LEFT JOIN" : "JOIN"} employees e ON e.dept_id = d.id\nGROUP BY d.name`}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {DEPTS.map((d) => {
          const has = STAFF[d.id] !== undefined;
          const shown = rows.some((r) => r.id === d.id);
          return (
            <div key={d.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "9px 12px", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 13,
              border: `1.5px solid ${shown ? (has ? "color-mix(in srgb, var(--teal) 45%, transparent)" : "color-mix(in srgb, var(--accent) 55%, transparent)") : "var(--line)"}`,
              background: shown ? `color-mix(in srgb, ${has ? "var(--teal)" : "var(--accent)"} 11%, transparent)` : "transparent",
              opacity: shown ? 1 : 0.35,
              textDecoration: shown ? "none" : "line-through",
            }}>
              <span>{d.name}</span>
              <span style={{ fontWeight: 700 }}>{shown ? (STAFF[d.id] ?? 0) : "dropped"}</span>
            </div>
          );
        })}
      </div>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 12 }}>
        <div className={`cast-res ${kind === "left" ? "ok" : "no"}`} style={{ minWidth: 150 }}>
          <div className="lbl">departments listed</div><div className="val">{rows.length} of {DEPTS.length}</div>
        </div>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 14 }}>
        <button className={`btn ${kind === "inner" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                onClick={() => setKind("inner")}>JOIN (inner)</button>
        <button className={`btn ${kind === "left" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                onClick={() => setKind("left")}>LEFT JOIN</button>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        Switch to <b>inner</b> and HR vanishes. Nothing errors, and the three departments still listed all have the right numbers — which is exactly why a report like this survives review. <b>An INNER JOIN keeps only rows that matched on both sides</b>, so anything with no match is not shown as zero, it is not shown at all.
      </div></div>
    </div>
  );
}
