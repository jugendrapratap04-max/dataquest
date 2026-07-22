"use client";

import { useState } from "react";

/* The misconception this exists to kill: beginners read if/elif/else as three
 * separate questions, all asked. Python asks them in order and STOPS at the
 * first true one — so a lower elif can be true and still never run.
 *
 * Move the marks and watch each condition get checked, skipped, or run. The
 * "skipped" state is the whole lesson: it is not false, it was never asked. */

const BRANCHES = [
  { key: "if", label: "if marks >= 80:", test: (m: number) => m >= 80, body: 'print("Distinction")', out: "Distinction" },
  { key: "elif", label: "elif marks >= 40:", test: (m: number) => m >= 40, body: 'print("Pass")', out: "Pass" },
  { key: "else", label: "else:", test: () => true, body: 'print("Try again")', out: "Try again" },
];

const PRESETS = [92, 65, 40, 22];

export function ConditionFlow() {
  const [marks, setMarks] = useState(65);

  // Walk the branches exactly the way Python does: in order, stopping at the
  // first true one. Everything after it is never even looked at.
  let ran = -1;
  const state = BRANCHES.map((b, i) => {
    if (ran >= 0) return "skipped" as const;
    const pass = b.test(marks);
    if (pass) { ran = i; return "ran" as const; }
    return "false" as const;
  });

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔀 Condition Flow — watch Python choose</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Python checks these <b>in order</b> and stops at the first one that is true. Move the marks
        and watch what happens to the lines below the winner — they are not false, they are
        <b> never asked</b>.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        <span className="mono" style={{ fontSize: 13 }}>marks =</span>
        <input
          type="range" min={0} max={100} value={marks}
          onChange={(e) => setMarks(Number(e.target.value))}
          aria-label="marks"
          style={{ flex: 1, minWidth: 130, accentColor: "var(--accent)" }}
        />
        <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-2)", minWidth: 32 }}>{marks}</span>
        {PRESETS.map((p) => (
          <button key={p} className="ss-preset" onClick={() => setMarks(p)}>{p}</button>
        ))}
      </div>

      <div className="cf">
        {BRANCHES.map((b, i) => (
          <div key={b.key} className={`cf-branch ${state[i]}`}>
            <div className="cf-head">
              <span className="cf-code">{b.label}</span>
              <span className="cf-verdict" key={`${b.key}-${state[i]}-${marks >= 80 || marks >= 40 ? "x" : "y"}`}>
                {state[i] === "ran" ? "✓ this one runs"
                  : state[i] === "false" ? (b.key === "if" ? `${marks} >= 80 is False` : `${marks} >= 40 is False`)
                  : "never checked"}
              </span>
            </div>
            <div className="cf-body">{b.body}</div>
          </div>
        ))}
      </div>

      <div className="cf-out">
        <span className="cf-out-cap">Output</span>
        <span className="cf-out-val" key={ran}>{BRANCHES[ran]?.out}</span>
      </div>

      <div className="note tip" style={{ marginTop: 12 }}>
        <span className="i">💡</span>
        <div>
          Set marks to <b>92</b>. <code>marks &gt;= 40</code> is perfectly true — and it still never
          runs, because Python already found its answer on the line above. That is why order matters
          in an <code>if/elif</code> chain, and why putting the loosest condition first is a classic bug.
        </div>
      </div>
    </div>
  );
}
