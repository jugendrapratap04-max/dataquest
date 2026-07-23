"use client";

import { useState } from "react";

/* Outputs verified against real Python 3.12's match statement (structural
 * pattern matching, PEP 634). The point of this viz is the thing that makes
 * match more than a switch: cases are tried top-to-bottom, the FIRST match
 * wins, and a pattern can pull pieces out of the value (capture) — so order
 * matters and a broad case placed too high hides the ones below it. */

type Input = { label: string; value: [number, number] | string };

const INPUTS: Input[] = [
  { label: "[0, 0]", value: [0, 0] },
  { label: "[0, 5]", value: [0, 5] },
  { label: "[7, 0]", value: [7, 0] },
  { label: "[3, 3]", value: [3, 3] },
  { label: "[3, 4]", value: [3, 4] },
  { label: '"hi"', value: "hi" },
];

const CASES = [
  "case [0, 0]:",
  "case [0, y]:",
  "case [x, 0]:",
  "case [x, y] if x == y:",
  "case [x, y]:",
  "case _:",
];

// Mirror Python's evaluation for these exact cases, returning the winning index,
// the result string, and any names the pattern bound.
function evaluate(v: Input["value"]): { idx: number; out: string; binds: string } {
  const pair = Array.isArray(v);
  const [x, y] = pair ? (v as [number, number]) : [NaN, NaN];
  if (pair && x === 0 && y === 0) return { idx: 0, out: "origin", binds: "" };
  if (pair && x === 0) return { idx: 1, out: `y-axis, y=${y}`, binds: `y = ${y}` };
  if (pair && y === 0) return { idx: 2, out: `x-axis, x=${x}`, binds: `x = ${x}` };
  if (pair && x === y) return { idx: 3, out: `diagonal at ${x}`, binds: `x = ${x}, y = ${y}` };
  if (pair) return { idx: 4, out: `point (${x}, ${y})`, binds: `x = ${x}, y = ${y}` };
  return { idx: 5, out: "not a pair", binds: "" };
}

export function MatchLab() {
  const [pick, setPick] = useState(1);
  const v = INPUTS[pick].value;
  const { idx, out, binds } = evaluate(v);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🎯 Match Lab — the first pattern that fits wins</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Pick a value for <code>point</code>. Python tries the cases <b>top to bottom</b> and stops at the
        first that matches — the ones below never run. Patterns can also <b>capture</b> pieces into names.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {INPUTS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x.label}</button>
        ))}
      </div>

      <div className="ml-match">match point:</div>
      <div className="ml-cases" key={pick}>
        {CASES.map((c, i) => {
          const state = i < idx ? "skip" : i === idx ? "hit" : "unreached";
          return (
            <div key={i} className={`ml-case ${state}`}>
              <span className="ml-mark">{i < idx ? "✕" : i === idx ? "✓" : "·"}</span>
              <span className="ml-code">{c}</span>
              <span className="ml-tag">
                {i < idx ? "no match" : i === idx ? "matches — stop here" : "never reached"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="ml-out">
        <div className="ml-out-row">
          <span className="sf-rlabel">returns</span>
          <span className="sf-rval">{JSON.stringify(out)}</span>
        </div>
        {binds && (
          <div className="ml-binds">the pattern captured <code>{binds}</code></div>
        )}
      </div>
    </div>
  );
}
