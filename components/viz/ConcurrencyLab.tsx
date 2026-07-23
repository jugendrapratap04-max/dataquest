"use client";

import { useState } from "react";

/* This is a teaching model, not a benchmark, and it encodes the real rule: the
 * GIL lets only one thread run Python bytecode at a time. So threads overlap
 * WAITING (I/O — network, disk) but never overlap COMPUTING (CPU work). That is
 * why threads speed up I/O-bound work and do nothing for CPU-bound work, where
 * you need multiprocessing for real parallelism. Three tasks, three units each. */

type Scenario = {
  name: string;
  total: number;             // total time units
  bars: { start: number; len: number; kind: "io" | "cpu" }[];
  verdict: string;
  good: boolean;
};

const T = 3;   // each task takes 3 units
const N = 3;   // three tasks

const SCENARIOS: Scenario[] = [
  {
    name: "Sequential",
    total: N * T,
    bars: [0, 1, 2].map((i) => ({ start: i * T, len: T, kind: "cpu" as const })),
    verdict: "One after another — 3 tasks × 3 units = 9. The baseline.",
    good: false,
  },
  {
    name: "Threads · I/O-bound",
    total: T,
    bars: [0, 1, 2].map(() => ({ start: 0, len: T, kind: "io" as const })),
    verdict: "The tasks spend their time WAITING (network, disk), and threads overlap the waiting — so all three finish in ~3 units. Threads win.",
    good: true,
  },
  {
    name: "Threads · CPU-bound",
    total: N * T,
    bars: [0, 1, 2].map((i) => ({ start: i * T, len: T, kind: "cpu" as const })),
    verdict: "The tasks are COMPUTING, and the GIL lets only one thread run Python at a time — so they cannot overlap. Still 9 units. Threads do NOT help here.",
    good: false,
  },
  {
    name: "Processes · CPU-bound",
    total: T,
    bars: [0, 1, 2].map(() => ({ start: 0, len: T, kind: "cpu" as const })),
    verdict: "Separate processes each have their own interpreter and GIL, so they compute in true parallel across cores — ~3 units. This is how you speed up CPU work.",
    good: true,
  },
];

const SCALE = 9;   // grid columns = max total

export function ConcurrencyLab() {
  const [pick, setPick] = useState(0);
  const s = SCENARIOS[pick];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">⏱️ Concurrency Lab — when overlapping actually helps</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Three tasks, each needing three units of time. The <b>GIL</b> lets only one thread run Python at
        once — so threads overlap <b>waiting</b> but not <b>computing</b>. Watch the finish time.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {SCENARIOS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x.name}</button>
        ))}
      </div>

      <div className="cc-timeline" key={pick}>
        {s.bars.map((b, i) => (
          <div key={i} className="cc-track">
            <span className="cc-tlabel">task {i + 1}</span>
            <div className="cc-lane">
              <div className={`cc-bar ${b.kind}`}
                   style={{ left: `${(b.start / SCALE) * 100}%`, width: `${(b.len / SCALE) * 100}%` }}>
                {b.kind === "io" ? "wait" : "compute"}
              </div>
            </div>
          </div>
        ))}
        <div className="cc-axis">
          {Array.from({ length: SCALE + 1 }, (_, i) => (
            <span key={i} className="cc-tick" style={{ left: `${(i / SCALE) * 100}%` }}>{i}</span>
          ))}
          <div className="cc-finish" style={{ left: `${(s.total / SCALE) * 100}%` }} />
        </div>
      </div>

      <div className={`cc-total ${s.good ? "good" : "bad"}`}>
        <span className="sf-rlabel">finishes at</span>
        <span className="cc-tval">{s.total} units</span>
        {pick > 0 && <span className="cc-vs">vs 9 sequential</span>}
      </div>

      <div className="imp-note" style={{ marginTop: 12 }}>{s.verdict}</div>
    </div>
  );
}
