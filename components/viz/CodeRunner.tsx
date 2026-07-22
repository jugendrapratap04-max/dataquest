"use client";

import { useState } from "react";

/* The first thing a beginner needs is not syntax — it is a picture of what the
 * machine does with their typing. Research calls this a "notional machine": a
 * simple, correct mental model of how code executes.
 *
 * So this steps through a real program one line at a time and shows the two
 * things a beginner cannot see: which line is running right now, and what the
 * computer is remembering while it runs. Everything here is hand-traced, not
 * executed — it only has to be true, and it is checked against real Python. */

type Step = {
  /** 1-based line about to run; 0 = nothing has run yet. */
  line: number;
  vars: Record<string, string>;
  output: string[];
  say: string;
};

const CODE = [
  'name = "Aarav"',
  "marks = 82",
  "bonus = 5",
  "total = marks + bonus",
  'print(name, "scored", total)',
];

// Each entry is the state AFTER that line has run.
const STEPS: Step[] = [
  { line: 0, vars: {}, output: [], say: "Nothing has happened yet. Python is about to read line 1." },
  { line: 1, vars: { name: '"Aarav"' }, output: [], say: "Line 1 stored the text Aarav under the name `name`. Nothing is printed — storing is silent." },
  { line: 2, vars: { name: '"Aarav"', marks: "82" }, output: [], say: "Line 2 stored the number 82 under `marks`. Still silent." },
  { line: 3, vars: { name: '"Aarav"', marks: "82", bonus: "5" }, output: [], say: "Line 3 stored 5 under `bonus`. Python has remembered three things now." },
  { line: 4, vars: { name: '"Aarav"', marks: "82", bonus: "5", total: "87" }, output: [], say: "Line 4 is the interesting one: Python works out 82 + 5 first, and only then stores 87 under `total`." },
  { line: 5, vars: { name: '"Aarav"', marks: "82", bonus: "5", total: "87" }, output: ["Aarav scored 87"], say: "Line 5 finally shows something. print() is the only line here that puts anything on your screen." },
];

export function CodeRunner() {
  const [i, setI] = useState(0);
  const s = STEPS[i];
  const prev = STEPS[i - 1];
  const done = i === STEPS.length - 1;

  // Only the thing that actually changed on this step gets animated. Motion that
  // decorates rather than explains splits a beginner's attention — the point of
  // the movement is to answer "what did my click just do?", nothing else.
  const changed = Object.keys(s.vars).find((k) => !prev || prev.vars[k] !== s.vars[k]);
  const newOutput = s.output.length > (prev?.output.length ?? 0);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">▶ Code Runner — watch Python read your program</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Python reads your file <b>top to bottom, one line at a time</b>. Press <b>Step</b> and watch
        which line is running, what the computer is remembering, and when anything actually appears
        on screen.
      </p>

      <div className="cr">
        <div className="cr-code">
          {CODE.map((line, n) => (
            <div key={n} className={`cr-line ${s.line === n + 1 ? "on" : ""} ${s.line > n + 1 ? "past" : ""}`}>
              <span className="cr-n">{n + 1}</span>
              <span className="cr-src">{line}</span>
              {s.line === n + 1 && <span className="cr-arrow">← running</span>}
            </div>
          ))}
        </div>

        <div className="cr-side">
          <div className="cr-panel">
            <div className="cr-cap">What Python remembers</div>
            {Object.keys(s.vars).length === 0
              ? <div className="cr-empty">nothing yet</div>
              : Object.entries(s.vars).map(([k, v]) => (
                  // Keyed on the step as well as the name, so React remounts the
                  // row and the highlight replays every time this value changes.
                  <div className={`cr-var ${k === changed ? "just" : ""}`} key={`${k}-${k === changed ? i : "s"}`}>
                    <span className="cr-k">{k}</span><span className="cr-eq">=</span><span className="cr-v">{v}</span>
                  </div>
                ))}
          </div>
          <div className="cr-panel">
            <div className="cr-cap">What you see on screen</div>
            {s.output.length === 0
              ? <div className="cr-empty">nothing yet</div>
              : s.output.map((o, n) => (
                  <div className={`cr-out ${newOutput && n === s.output.length - 1 ? "just" : ""}`} key={`${n}-${i}`}>{o}</div>
                ))}
          </div>
        </div>
      </div>

      <div className="cr-say">{s.say}</div>

      <div className="viz-controls" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} disabled={done} onClick={() => setI((n) => Math.min(n + 1, STEPS.length - 1))}>
          {done ? "Finished" : i === 0 ? "Step ▶" : "Step ▶"}
        </button>
        <button className="btn btn-ghost" style={{ padding: "8px 14px" }} disabled={i === 0} onClick={() => setI(0)}>Start again</button>
        <span className="cr-count">{i}/{STEPS.length - 1}</span>
      </div>
    </div>
  );
}
