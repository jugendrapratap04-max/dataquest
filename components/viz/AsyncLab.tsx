"use client";

import { useState } from "react";

/* A teaching model of the event loop. The idea threads-vs-async trips people on:
 * async is ONE thread that switches between coroutines at each `await`. A
 * coroutine runs until it hits an await, then hands control back to the loop,
 * which starts the next one — so both can be WAITING at the same time even
 * though only one ever RUNS at a time. That cooperative hand-off is what this
 * steps through with two coroutines fetched via asyncio.gather. */

type St = "queued" | "running" | "awaiting" | "done";

type Step = { a: St; b: St; active: "A" | "B" | "loop" | null; caption: string };

const STEPS: Step[] = [
  { a: "queued", b: "queued", active: "loop", caption: "asyncio.gather starts both coroutines on the one event loop" },
  { a: "running", b: "queued", active: "A", caption: "the loop runs fetch(A) — it executes until its first await" },
  { a: "awaiting", b: "queued", active: "loop", caption: "fetch(A) hits `await` and PAUSES, handing control back to the loop" },
  { a: "awaiting", b: "running", active: "B", caption: "the loop is free, so it runs fetch(B) — now A waits while B runs" },
  { a: "awaiting", b: "awaiting", active: "loop", caption: "fetch(B) also hits `await` and pauses. BOTH are now waiting at once — one thread, two overlapping waits" },
  { a: "done", b: "awaiting", active: "A", caption: "A's wait finishes first, so the loop resumes fetch(A) — it returns its result" },
  { a: "done", b: "done", active: "B", caption: "B's wait finishes, the loop resumes fetch(B), and gather collects [A, B] in order" },
];

const STATUS: Record<St, { label: string; cls: string }> = {
  queued: { label: "queued", cls: "q" },
  running: { label: "▶ running", cls: "run" },
  awaiting: { label: "⏸ awaiting", cls: "wait" },
  done: { label: "✓ done", cls: "done" },
};

function Lane({ name, st, active }: { name: string; st: St; active: boolean }) {
  const s = STATUS[st];
  return (
    <div className={`as-lane ${s.cls} ${active ? "active" : ""}`}>
      <span className="as-coro">fetch(&quot;{name}&quot;)</span>
      <span className={`as-status ${s.cls}`}>{s.label}</span>
      {active && <span className="as-thread">◀ the thread is here</span>}
    </div>
  );
}

export function AsyncLab() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const done = step === STEPS.length - 1;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔀 Async Lab — one thread, switching at every await</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        <code>await asyncio.gather(fetch(&quot;A&quot;), fetch(&quot;B&quot;))</code>. Step through the event loop: a
        coroutine runs until <code>await</code>, then hands control back so the other can run.
      </p>

      <div className="as-caption">
        <span className="as-stepno">step {step + 1}/{STEPS.length}</span>
        {s.caption}
      </div>

      <div className="as-lanes">
        <Lane name="A" st={s.a} active={s.active === "A"} />
        <Lane name="B" st={s.b} active={s.active === "B"} />
      </div>

      {s.active === "loop" && (
        <div className="as-loop">the single thread is in the <b>event loop</b>, deciding who runs next</div>
      )}

      <div className="viz-controls" style={{ marginTop: 12, marginBottom: 0 }}>
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} disabled={done}
                onClick={() => setStep((x) => Math.min(x + 1, STEPS.length - 1))}>
          {done ? "Done" : "Step ▶"}
        </button>
        {step > 0 && <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => setStep(0)}>Reset</button>}
      </div>

      {done && (
        <div className="note tip" style={{ marginTop: 12 }}>
          <span className="i">💡</span>
          <div>
            Notice there was never more than one coroutine <b>running</b> — but at step 5 both were
            <b> waiting</b> together. That overlap of waits, on a single thread, is the whole point of
            async: no threads, no GIL fight, just cooperative hand-offs at each <code>await</code>.
          </div>
        </div>
      )}
    </div>
  );
}
