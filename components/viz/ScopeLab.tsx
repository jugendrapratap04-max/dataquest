"use client";

import { useState } from "react";

/* Every outcome below was produced in real Python 3.12, including the
 * UnboundLocalError.
 *
 * The one idea this has to land: Python decides whether a name is local by
 * scanning the whole function for an ASSIGNMENT, before running a line. So the
 * same `print(count)` reads a global in one function and throws in another —
 * the difference is a `count = …` somewhere below it. The nested boxes show
 * where the name is looked up; the "trap" scenario shows the read landing in a
 * Local box that exists but has no value yet. */

type Layer = "Local" | "Global" | "Built-in";

type Scenario = {
  label: string;
  code: string;
  lands: Layer | "error";
  has: Record<string, string | null>;   // what `count` is in each layer, null = absent
  result: string;
  note: string;
};

const SCENARIOS: Scenario[] = [
  {
    label: "read a global",
    code: "count = 100\n\ndef show():\n    print(count)\n\nshow()",
    lands: "Global",
    has: { Local: null, Global: "100", "Built-in": "—" },
    result: "100",
    note: "No assignment to count inside show(), so count is not local. Python looks outward, finds it in Global, and prints 100.",
  },
  {
    label: "assign inside → local",
    code: "count = 100\n\ndef show():\n    count = 5\n    print(count)\n\nshow()\nprint(count)",
    lands: "Local",
    has: { Local: "5", Global: "100", "Built-in": "—" },
    result: "5, then 100",
    note: "Assigning count = 5 makes count LOCAL to show(). It prints 5, and the global count is completely untouched — still 100 outside.",
  },
  {
    label: "global keyword",
    code: "count = 100\n\ndef bump():\n    global count\n    count += 10\n\nbump()\nprint(count)",
    lands: "Global",
    has: { Local: null, Global: "110", "Built-in": "—" },
    result: "110",
    note: "`global count` tells Python not to make a local — so count += 10 reaches OUT and rebinds the global. Now the change survives the call.",
  },
  {
    label: "the trap 💥",
    code: "count = 100\n\ndef broken():\n    print(count)\n    count += 1\n\nbroken()",
    lands: "error",
    has: { Local: "unbound", Global: "100", "Built-in": "—" },
    result: "UnboundLocalError",
    note: "count += 1 lower down makes count local for the WHOLE function — so print(count) reads the local, which has no value yet. A global with the same name does not save you.",
  },
];

const LAYERS: Layer[] = ["Built-in", "Global", "Local"];

export function ScopeLab() {
  const [pick, setPick] = useState(0);
  const s = SCENARIOS[pick];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔭 Scope Lab — where Python looks for a name</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Python searches <b>Local → Global → Built-in</b> and stops at the first box that has the name.
        But an <b>assignment</b> anywhere in a function makes that name local for the whole function —
        which is the trap.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {SCENARIOS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x.label}</button>
        ))}
      </div>

      <div className="sc-grid">
        <pre className="sc-code">{s.code}</pre>

        <div className="sc-boxes">
          {LAYERS.map((layer) => {
            const val = s.has[layer];
            const isTarget = s.lands === layer;
            const isErr = s.lands === "error" && layer === "Local";
            return (
              <div key={layer} className={`sc-box ${isTarget ? "found" : ""} ${isErr ? "err" : ""} ${val === null ? "absent" : ""}`}>
                <span className="sc-layer">{layer}</span>
                <span className="sc-val">
                  {val === null ? "count not here" : val === "unbound" ? "count = ⛔ no value yet" : `count = ${val}`}
                </span>
                {isTarget && <span className="sc-flag">✓ found here</span>}
                {isErr && <span className="sc-flag err">💥 exists, but unbound</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`sc-result ${s.lands === "error" ? "err" : ""}`}>
        <span className="sc-rlabel">prints</span>
        <span className="sc-rval">{s.result}</span>
      </div>

      <div className="imp-note" style={{ marginTop: 12 }}>{s.note}</div>
    </div>
  );
}
