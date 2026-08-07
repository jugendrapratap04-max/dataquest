"use client";

import { useState } from "react";

/* The one test the KPI lesson is built on, made pressable.
 *
 * "If this number moved by a fifth, what would we do?" is easy to nod at and
 * hard to apply, because every number on this list looks reportable. So the
 * component does not ask the reader to classify anything — it applies the test
 * for them and shows the consequence, which is the part that actually lands:
 * for half of these there is no sentence to put in the "we would" box, and the
 * empty box is the argument.
 *
 * Each statistic carries the ratio that replaces it, because "stop reporting
 * page views" is useless advice without the thing to report instead. */

type Metric = {
  name: string;
  value: string;
  moved: string;
  /** What the team would actually do. `null` is the whole point. */
  action: string | null;
  /** For a statistic: the ratio that has a decision attached. */
  instead?: string;
};

const METRICS: Metric[] = [
  {
    name: "Page views",
    value: "2.4M",
    moved: "2.9M",
    action: null,
    instead: "Of the people who arrived, what share did the thing we wanted?",
  },
  {
    name: "Total signups",
    value: "18,400",
    moved: "22,100",
    action: null,
    instead: "What share of signups reach activation?",
  },
  {
    name: "Followers",
    value: "12,300",
    moved: "14,800",
    action: null,
    instead: "How many of them ever open the product?",
  },
  {
    name: "Conversion rate",
    value: "2.0%",
    moved: "2.4%",
    action: "Find which source improved, and move spend towards it.",
  },
  {
    name: "Churn",
    value: "6.1%",
    moved: "7.3%",
    action: "Interview the people who left, this week, before the trail is cold.",
  },
  {
    name: "Activation",
    value: "31%",
    moved: "37%",
    action: "Work out what changed in onboarding and do more of it.",
  },
];

export function KpiTest() {
  const [i, setI] = useState(3);
  const m = METRICS[i];
  const isKpi = m.action !== null;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🎯 KPI or statistic?</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Pick a number. The test is the same every time: <b>if it moved by a fifth, what would we do?</b>
      </p>

      <div className="viz-controls">
        <div className="ss-stepper">
          <span className="ss-lbl">metric</span>
          {METRICS.map((x, n) => (
            <button
              key={x.name}
              className={`ss-step${i === n ? " on" : ""}`}
              onClick={() => setI(n)}
            >
              {x.name}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "var(--panel-2)",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{m.name}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 19, fontWeight: 700 }}>{m.value}</span>
        <span style={{ color: "var(--ink-faint)", fontSize: 13 }}>→</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 19, fontWeight: 700, color: "var(--accent)" }}>
          {m.moved}
        </span>
      </div>

      <div
        style={{
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "var(--panel)",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 11.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
          so we would
        </div>
        {isKpi ? (
          <div style={{ fontSize: 13.5 }}>{m.action}</div>
        ) : (
          <div style={{ fontSize: 13.5, color: "var(--ink-faint)", fontStyle: "italic" }}>
            …know about it. Nothing changes on Monday.
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".04em",
            color: "#fff",
            background: isKpi ? "var(--good, #2E9E5B)" : "var(--ink-faint)",
            padding: "3px 10px",
            borderRadius: 20,
          }}
        >
          {isKpi ? "KPI" : "STATISTIC"}
        </span>
        {!isKpi && m.instead && (
          <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
            Report this instead: <b>{m.instead}</b>
          </span>
        )}
        {isKpi && (
          <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
            A decision hangs on it — that is the whole difference.
          </span>
        )}
      </div>
    </div>
  );
}
