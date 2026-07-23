"use client";

import { useState } from "react";

/* factorial values verified in real Python 3.12 (factorial(4) == 24). Recursion
 * is the one topic where a picture does most of the work: the reason it is hard
 * is that the calls PILE UP unfinished — each waiting on the one below — and
 * only when the base case returns do the answers flow back up. So this steps
 * through factorial(4) as a real call stack: frames push down to the base case,
 * then pop back up multiplying as they go. */

const N = 4;

type Frame = { n: number; state: "waiting" | "base" | "returned"; value?: number };

// The full sequence of stack snapshots, one per Step click.
function buildSteps(): { stack: Frame[]; caption: string }[] {
  const steps: { stack: Frame[]; caption: string }[] = [];
  const stack: Frame[] = [];

  // push phase
  for (let n = N; n >= 1; n--) {
    if (n === 1) {
      stack.push({ n, state: "base", value: 1 });
      steps.push({ stack: stack.map((f) => ({ ...f })), caption: "factorial(1) hits the base case → returns 1" });
    } else {
      stack.push({ n, state: "waiting" });
      steps.push({ stack: stack.map((f) => ({ ...f })), caption: `factorial(${n}) can't finish yet — it needs factorial(${n - 1})` });
    }
  }

  // pop phase: from n=2 upward, each multiplies n by the child's value
  let child = 1;
  for (let n = 2; n <= N; n++) {
    const result = n * child;
    const idx = stack.findIndex((f) => f.n === n);
    stack[idx] = { n, state: "returned", value: result };
    // drop the frame below it (already returned) from the drawing
    const shown = stack.filter((f) => f.n >= n);
    steps.push({ stack: shown.map((f) => ({ ...f })), caption: `factorial(${n}) = ${n} × ${child} = ${result}` });
    child = result;
  }

  return steps;
}

const STEPS = buildSteps();

export function RecursionLab() {
  const [step, setStep] = useState(0);
  const { stack, caption } = STEPS[step];
  const done = step === STEPS.length - 1;
  const phase = step < N ? "going down" : "coming back up";

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🌀 Recursion Lab — the call stack for factorial(4)</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        <code>factorial(n)</code> calls <code>factorial(n-1)</code> until it reaches the base case at 1.
        Step through it: the calls stack up unfinished, then <b>unwind</b> — multiplying — once the base
        returns.
      </p>

      <div className="rl-fn">
        {"def factorial(n):"}<br />
        {"    if n <= 1: return 1        # base case"}<br />
        {"    return n * factorial(n - 1)"}
      </div>

      <div className="rl-phase">
        <span className={`rl-badge ${step < N ? "down" : "up"}`}>{phase}</span>
        <span className="rl-caption">{caption}</span>
      </div>

      <div className="rl-stack">
        {stack.slice().reverse().map((f) => (
          <div key={f.n} className={`rl-frame ${f.state}`}>
            <span className="rl-call">factorial({f.n})</span>
            <span className="rl-status">
              {f.state === "waiting" && <>waiting for factorial({f.n - 1})…</>}
              {f.state === "base" && <>base case → returns <b>1</b></>}
              {f.state === "returned" && <>returned <b>{f.value}</b></>}
            </span>
          </div>
        ))}
      </div>

      {done && (
        <div className="sf-result" style={{ marginTop: 12 }}>
          <span className="sf-rlabel">final answer</span>
          <span className="sf-rval">factorial(4) = 24</span>
        </div>
      )}

      <div className="viz-controls" style={{ marginTop: 12, marginBottom: 0 }}>
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} disabled={done}
                onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}>
          {done ? "Done" : step < N - 1 ? "Call deeper ▼" : step < N ? "Hit base case ▼" : "Return up ▲"}
        </button>
        {step > 0 && <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => setStep(0)}>Reset</button>}
      </div>
    </div>
  );
}
