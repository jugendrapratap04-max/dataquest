"use client";

import { useState } from "react";

/* Every value below was produced by running the code in real Python 3.12 and
 * pasted in — nothing here is a guess about how floats behave.
 *
 * Two things this has to land: a decimal sum that is *visibly* not what you
 * expected, and the fact that `==` therefore says False on arithmetic that looks
 * obviously correct. The drift column is the one that matters for data work —
 * add a price ten times and the total is already wrong in the last digit. */

type Pair = { a: string; b: string; shown: string; expected: string; equal: boolean };

const PAIRS: Pair[] = [
  { a: "0.1", b: "0.2", shown: "0.30000000000000004", expected: "0.3", equal: false },
  { a: "0.1", b: "0.7", shown: "0.7999999999999999", expected: "0.8", equal: false },
  { a: "1.1", b: "2.2", shown: "3.3000000000000003", expected: "3.3", equal: false },
  { a: "0.3", b: "0.6", shown: "0.8999999999999999", expected: "0.9", equal: false },
  { a: "0.5", b: "0.25", shown: "0.75", expected: "0.75", equal: true },
];

// total = 0.0, then += 0.1 ten times.
const DRIFT = [
  "0.1", "0.2", "0.30000000000000004", "0.4", "0.5",
  "0.6", "0.7", "0.7999999999999999", "0.8999999999999999", "0.9999999999999999",
];

export function FloatLab() {
  const [pick, setPick] = useState(0);
  const [steps, setSteps] = useState(0);

  const p = PAIRS[pick];
  const drifted = DRIFT.slice(0, steps);
  const last = drifted[drifted.length - 1];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔬 Float Lab — why 0.1 + 0.2 is not 0.3</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Pick a sum and look at what Python actually stores. This is not a bug and not a Python
        quirk — every language using binary floats does it.
      </p>

      <div className="viz-controls" style={{ marginBottom: 12 }}>
        {PAIRS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>
            {x.a} + {x.b}
          </button>
        ))}
      </div>

      <div className="fl-grid">
        <div className="fl-cell">
          <div className="fl-cap">You expect</div>
          <div className="fl-val" key={`e${pick}`}>{p.expected}</div>
        </div>
        <div className="fl-cell">
          <div className="fl-cap">Python stores</div>
          <div className={`fl-val ${p.equal ? "same" : "off"}`} key={`s${pick}`}>{p.shown}</div>
        </div>
        <div className="fl-cell">
          <div className="fl-cap">so <span className="mono">a + b == {p.expected}</span> is</div>
          <div className={`fl-val ${p.equal ? "same" : "off"}`} key={`q${pick}`}>{p.equal ? "True" : "False"}</div>
        </div>
      </div>

      {!p.equal && (
        <div className="note warn" style={{ marginTop: 12 }}>
          <span className="i">⚠️</span>
          <div>
            The sum is correct to about fifteen digits and wrong at the sixteenth — which is enough to
            make <code>==</code> say False. Compare with <code>round(x, 2) == {p.expected}</code> or
            {" "}<code>math.isclose(x, {p.expected})</code> instead.
          </div>
        </div>
      )}
      {p.equal && (
        <div className="note tip" style={{ marginTop: 12 }}>
          <span className="i">💡</span>
          <div>
            This one is exact — 0.5 and 0.25 are halves and quarters, which binary represents perfectly.
            The trouble is only with decimals that binary cannot finish writing, like 0.1.
          </div>
        </div>
      )}

      <div className="fl-drift">
        <div className="fl-cap" style={{ marginBottom: 8 }}>
          And this is the one that costs money: <span className="mono">total += 0.1</span>, ten times
        </div>
        <div className="fl-steps">
          {drifted.length === 0 && <span className="fl-empty">press Add 0.1</span>}
          {drifted.map((v, i) => (
            <span key={i} className={`fl-step ${v.length > 5 ? "off" : ""} ${i === drifted.length - 1 ? "just" : ""}`}>{v}</span>
          ))}
        </div>
        <div className="viz-controls" style={{ marginTop: 10 }}>
          <button className="btn btn-primary" style={{ padding: "8px 14px" }}
                  disabled={steps >= DRIFT.length}
                  onClick={() => setSteps((s) => Math.min(s + 1, DRIFT.length))}>
            {steps >= DRIFT.length ? "Ten times done" : "Add 0.1 ▶"}
          </button>
          {steps > 0 && <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => setSteps(0)}>Reset</button>}
          {steps === DRIFT.length && (
            <span className="fl-verdict">total == 1.0 → <b>False</b>. It is {last}.</span>
          )}
        </div>
      </div>
    </div>
  );
}
