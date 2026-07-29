"use client";

import { useState } from "react";

// Probability is counting, and the counting is invisible when it is written as
// a fraction. Drawing all 36 outcomes of two dice and lighting up the ones that
// match makes "6 out of 36" something you can see rather than accept — and the
// third event is there to show that "at least one six" is not 1/6 + 1/6.

type Event = { key: string; label: string; hit: (a: number, b: number) => boolean; note: string };

const EVENTS: Event[] = [
  {
    key: "seven",
    label: "sum is 7",
    hit: (a, b) => a + b === 7,
    note: "Seven has the most ways of happening of any total, which is why it is the most common roll and why games are built around it.",
  },
  {
    key: "double",
    label: "a double",
    hit: (a, b) => a === b,
    note: "Six outcomes out of thirty-six. The same count as a sum of 7, and a completely different shape on the grid.",
  },
  {
    key: "six",
    label: "at least one 6",
    hit: (a, b) => a === 6 || b === 6,
    note: "Eleven, not twelve. The double six sits in both the row and the column, and counting it twice is the single most common mistake in this topic.",
  },
  {
    key: "gt9",
    label: "sum above 9",
    hit: (a, b) => a + b > 9,
    note: "Only six ways out of thirty-six, all crowded into one corner of the grid.",
  },
];

export function ProbabilityLab() {
  const [event, setEvent] = useState<Event>(EVENTS[0]);

  const faces = [1, 2, 3, 4, 5, 6];
  const hits = faces.flatMap((a) => faces.filter((b) => event.hit(a, b))).length;
  const total = 36;
  const pct = Math.round((hits / total) * 1000) / 10;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🎲 Probability Lab — every outcome, counted</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        All 36 ways two dice can land. Pick an event and the ones that match light up.
      </p>

      <div className="viz-controls">
        <div className="ss-stepper">
          <span className="ss-lbl">event</span>
          {EVENTS.map((e) => (
            <button
              key={e.key}
              className={`ss-step${event.key === e.key ? " on" : ""}`}
              onClick={() => setEvent(e)}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(38px, 1fr))", gap: 4, minWidth: 250 }}>
          {faces.flatMap((a) =>
            faces.map((b) => {
              const on = event.hit(a, b);
              return (
                <div
                  key={`${a}-${b}`}
                  style={{
                    textAlign: "center",
                    padding: "7px 0",
                    borderRadius: 6,
                    fontFamily: "var(--mono)",
                    fontSize: 11.5,
                    border: "1px solid var(--line)",
                    background: on ? "color-mix(in srgb, var(--accent) 22%, transparent)" : "var(--panel-2)",
                    color: on ? "var(--ink)" : "var(--ink-faint)",
                    fontWeight: on ? 700 : 400,
                  }}
                >
                  {a},{b}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="viz-code">
        <div>
          favourable <span className="c-kw">=</span> {hits} · total <span className="c-kw">=</span> {total}
        </div>
        <div>
          P <span className="c-kw">=</span> {hits} / {total} <span className="c-kw">=</span>{" "}
          <b>{(hits / total).toFixed(4)}</b> ({pct}%)
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "12px 0 0" }}>{event.note}</p>
    </div>
  );
}
