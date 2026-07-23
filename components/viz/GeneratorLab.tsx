"use client";

import { useState } from "react";

/* squares(4) → [1, 4, 9, 16], verified in real Python 3.12. Generators confuse
 * beginners on two points a static example can't show: values are produced ONE
 * AT A TIME, only when asked (lazy) — nothing is computed up front — and once
 * you have pulled them all, the generator is EMPTY; asking again yields nothing.
 * So this pulls values with a next() button and then shows the exhausted state. */

const VALUES = [1, 4, 9, 16];   // squares(1..4)
const IS = [1, 2, 3, 4];

// step 0 = created, not started. steps 1..4 = yielded value. step 5 = StopIteration.
const LAST = VALUES.length + 1;

export function GeneratorLab() {
  const [step, setStep] = useState(0);

  const produced = Math.min(step, VALUES.length);   // how many yielded so far
  const exhausted = step >= LAST;
  const justIdx = step >= 1 && step <= VALUES.length ? step - 1 : -1;

  const caption =
    step === 0 ? "squares(4) created — paused, nothing computed yet"
    : step <= VALUES.length ? `yield ${VALUES[step - 1]}   (i = ${IS[step - 1]}, then paused again)`
    : "the for-loop ends → StopIteration. The generator is now used up.";

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔁 Generator Lab — one value at a time, then empty</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        A generator does not build the list — it hands you the <b>next</b> value each time you ask, then
        pauses. Press <code>next()</code> and watch it produce lazily.
      </p>

      <div className="gl-fn">
        {"def squares(n):"}<br />
        {"    for i in range(1, n + 1):"}<br />
        {"        yield i * i        # pause here, hand back i*i"}
      </div>

      <div className="gl-caption">{caption}</div>

      <div className="gl-slots">
        {VALUES.map((v, i) => {
          const state = i < produced ? (i === justIdx ? "just" : "done") : "pending";
          return (
            <span key={i} className={`gl-slot ${state}`}>
              {i < produced ? v : "·"}
            </span>
          );
        })}
        {exhausted && <span className="gl-empty">← nothing left</span>}
      </div>

      <div className="viz-controls" style={{ marginTop: 12, marginBottom: 0 }}>
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} disabled={exhausted}
                onClick={() => setStep((s) => Math.min(s + 1, LAST))}>
          {step === 0 ? "next() ▶" : step >= VALUES.length ? "next() → StopIteration" : "next() ▶"}
        </button>
        {step > 0 && (
          <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => setStep(0)}>
            Reset (new generator)
          </button>
        )}
      </div>

      {exhausted && (
        <div className="note warn" style={{ marginTop: 12 }}>
          <span className="i">⚠️</span>
          <div>
            This is the trap: a generator runs <b>once</b>. Calling <code>list(g)</code> a second time
            gives <code>[]</code> — it is already consumed. If you need the values twice, store them in a
            list, or build a fresh generator.
          </div>
        </div>
      )}
    </div>
  );
}
