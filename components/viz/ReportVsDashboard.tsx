"use client";

import { useState } from "react";

/* The distinction bi-intro is built on, made physical.
 *
 * "A report ends a conversation; a dashboard continues one" is a sentence
 * people agree with and do not feel. So the same numbers are shown twice: in
 * REPORT mode the filters are dead and pressing one tells you what actually
 * happens next — the question goes back to the analyst and waits. In DASHBOARD
 * mode the same press changes the answer in front of you.
 *
 * Nothing about the data changes between the modes. That is the point: the
 * difference was never the numbers, it was who is allowed to ask the next
 * question. */

const REGIONS = ["North", "South", "East", "West"] as const;
const MONTHS = ["Jan", "Feb", "Mar"] as const;

/** sales in thousands — region × month */
const DATA: Record<string, Record<string, number>> = {
  North: { Jan: 420, Feb: 388, Mar: 401 },
  South: { Jan: 310, Feb: 352, Mar: 377 },
  East: { Jan: 268, Feb: 241, Mar: 205 },
  West: { Jan: 395, Feb: 410, Mar: 433 },
};

export function ReportVsDashboard() {
  const [live, setLive] = useState(false);
  const [region, setRegion] = useState<string>("All");
  const [month, setMonth] = useState<string>("All");
  const [blocked, setBlocked] = useState(false);

  const rows = region === "All" ? [...REGIONS] : [region];
  const cols = month === "All" ? [...MONTHS] : [month];
  const total = rows.reduce((s, r) => s + cols.reduce((t, c) => t + DATA[r][c], 0), 0);

  function choose(setter: (v: string) => void, value: string) {
    if (!live) { setBlocked(true); return; }
    setter(value);
  }

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📊 Report or dashboard?</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        The same numbers, both times. Switch the mode and try to answer a question nobody asked you for.
      </p>

      <div className="viz-controls">
        <div className="ss-stepper">
          <span className="ss-lbl">mode</span>
          <button className={`ss-step${!live ? " on" : ""}`} onClick={() => { setLive(false); setBlocked(false); }}>
            Report
          </button>
          <button className={`ss-step${live ? " on" : ""}`} onClick={() => { setLive(true); setBlocked(false); }}>
            Dashboard
          </button>
        </div>
      </div>

      <div className="viz-controls" style={{ opacity: live ? 1 : 0.5 }}>
        <div className="ss-stepper">
          <span className="ss-lbl">region</span>
          {["All", ...REGIONS].map((r) => (
            <button key={r} className={`ss-step${region === r ? " on" : ""}`} onClick={() => choose(setRegion, r)}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="viz-controls" style={{ opacity: live ? 1 : 0.5 }}>
        <div className="ss-stepper">
          <span className="ss-lbl">month</span>
          {["All", ...MONTHS].map((m) => (
            <button key={m} className={`ss-step${month === m ? " on" : ""}`} onClick={() => choose(setMonth, m)}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {blocked && !live && (
        <div
          style={{
            margin: "10px 0",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid var(--line)",
            background: "var(--panel-2)",
            fontSize: 12.5,
          }}
        >
          Nothing happened — this is a <b>report</b>. To see it by region you email the analyst and wait
          until Thursday. That wait is the thing BI exists to remove.
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "var(--panel-2)",
          margin: "10px 0",
        }}
      >
        <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
          Sales · {region === "All" ? "all regions" : region} · {month === "All" ? "Q1" : month}
        </span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700 }}>
          ₹{total.toLocaleString("en-IN")}k
        </span>
      </div>

      <div style={{ display: "grid", gap: 4 }}>
        {rows.map((r) => (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 58, color: "var(--ink-soft)" }}>{r}</span>
            {cols.map((c) => (
              <span
                key={c}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  padding: "3px 8px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  background: "var(--panel)",
                }}
              >
                {c} {DATA[r][c]}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="viz-code" style={{ marginTop: 12 }}>
        <div style={{ color: "var(--ink-soft)" }}>
          # {live
            ? "dashboard — the reader answers their own next question"
            : "report — the next question comes back to you"}
        </div>
      </div>
    </div>
  );
}
