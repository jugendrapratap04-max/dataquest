"use client";

import { useState } from "react";

/* The five steps of EDA, run on one dataset, with the finding revealed at each
 * one — and, crucially, with the wrong conclusion you would have reached if you
 * had stopped at that step.
 *
 * The lesson can say "do them in this order" and be ignored. This panel makes
 * skipping visible: stop after step 3 and you go to the meeting with "orders
 * grew 80%", which is true and is not the finding. */

type Step = {
  n: string;
  name: string;
  code: string;
  out: string[];
  found: string;
  /** What you would have concluded if you had stopped here. */
  stopped: string;
};

const STEPS: Step[] = [
  {
    n: "1",
    name: "shape",
    code: 'df.shape\ndf.dtypes',
    out: ["(12, 4)", "month: str, channel: str, orders: int64, rating: float64"],
    found: "Twelve rows, four columns — six months times two channels. Small enough that every later number can be checked by hand, which is worth knowing before you trust any of them.",
    stopped: "\"There is data.\" You have not looked at a single value yet.",
  },
  {
    n: "2",
    name: "missing",
    code: 'df.isna().sum()',
    out: ["month 0, channel 0, orders 0", "rating 2"],
    found: "Two of the twelve ratings are missing, both on web. Every average rating from here on is over ten rows, not twelve — and nothing on a chart will say so.",
    stopped: "\"The data is clean.\" It is clean in three columns out of four.",
  },
  {
    n: "3",
    name: "distributions",
    code: 'df["orders"].describe()',
    out: ["min 40, max 118, mean 66.8", "Jan total 100 -> Jun total 180"],
    found: "Orders per row run from 40 to 118, and the monthly total climbs every single month from 100 to 180. That is 80% growth over six months.",
    stopped: "\"Orders grew 80%.\" True, reportable, and it names no cause — so nobody can act on it.",
  },
  {
    n: "4",
    name: "relationships",
    code: 'df.pivot_table(index="channel", columns="month",\n               values="orders", aggfunc="sum")',
    out: ["app  40 -> 118    +195.0%", "web  60 ->  62      +3.3%"],
    found: "The growth is not the business growing. App nearly tripled; web moved by two orders in six months. 78 of the 80 extra orders — 97.5% — came from one channel.",
    stopped: "\"App is growing fast.\" Now it is a finding, but still not a sentence anyone can act on.",
  },
  {
    n: "5",
    name: "the sentence",
    code: '# no code. three lines of English.',
    out: [
      "WHAT   : orders grew 80% from January to June",
      "WHY    : app nearly tripled while web stayed flat",
      "SO WHAT: 97.5% of the growth came from one channel",
    ],
    found: "Three sentences, each with a number, each checkable against the table. The last one is the only line of the five steps that changes what anybody does on Monday.",
    stopped: "Nothing was skipped. This is the deliverable.",
  },
];

export function EdaWalkthroughLab() {
  const [i, setI] = useState(0);
  const s = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧭 The five steps, on one dataset</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Six months of orders, split between the app and the web. Step through in order and watch
        the finding change — and read <b>if you stopped here</b> each time, because stopping early
        is what actually goes wrong.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center" }}>
        <div className="ss-stepper">
          <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} aria-label="previous step">‹</button>
          {STEPS.map((st, ix) => (
            <button
              key={st.n}
              className={`ss-step${ix === i ? " on" : ""}`}
              onClick={() => setI(ix)}
              aria-current={ix === i}
            >
              {st.n} {st.name}
            </button>
          ))}
          <button onClick={() => setI((x) => Math.min(STEPS.length - 1, x + 1))} disabled={last} aria-label="next step">›</button>
        </div>
      </div>

      <div className="viz-code" style={{ whiteSpace: "pre", overflowX: "auto", marginBottom: 10 }}>{s.code}</div>

      <div
        style={{
          border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)",
          padding: "10px 12px", fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--ink-soft)",
        }}
      >
        {s.out.map((line, k) => (
          <div key={k} style={{ padding: "2px 0" }}>{line}</div>
        ))}
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>What you now know.</b> {s.found}</div>
      </div>

      <div className={`note ${last ? "tip" : "warn"}`} style={{ marginTop: 10 }}>
        <span className="i">{last ? "✅" : "⚠️"}</span>
        <div><b>{last ? "Nothing left to skip." : "If you stopped here."}</b> {s.stopped}</div>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}>
        <span className="i">💡</span>
        <div>
          Steps 3 and 4 are the same data and the difference between them is a job. “Orders grew
          80%” is a number to report; “97.5% of the growth is one channel” is a reason
          to move a budget. The step that turns one into the other is always the same: <b>split by
          something</b> and see whether the headline survives.
        </div>
      </div>
    </div>
  );
}
