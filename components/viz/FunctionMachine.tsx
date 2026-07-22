"use client";

import { useState } from "react";

/* print vs return is the misconception that survives longest.
 *
 * Both functions below look like they "give you the name back". One puts it on
 * the screen; the other hands a value to whatever called it. Call each and watch
 * the two panels: the printer fills the screen and hands back None, so
 * `x = greet(...)` quietly leaves x empty — and the student's next line fails
 * somewhere else entirely.
 *
 * Showing both outcomes at once is the point: in a terminal they look identical. */

type Fn = {
  key: string;
  label: string;
  src: string[];
  /** What lands on the screen when it is called. */
  screen: (n: string) => string | null;
  /** What the call itself evaluates to. */
  gives: (n: string) => string;
  note: string;
};

const FNS: Fn[] = [
  {
    key: "print",
    label: "prints",
    src: ["def greet(name):", '    print("Hello, " + name)'],
    screen: (n) => `Hello, ${n}`,
    gives: () => "None",
    note: "It printed, so the screen looks right — but the call handed back None. Anything you store from it is empty.",
  },
  {
    key: "return",
    label: "returns",
    src: ["def greet(name):", '    return "Hello, " + name'],
    screen: () => null,
    gives: (n) => `"Hello, ${n}"`,
    note: "Nothing reached the screen. The value went back to whoever called it — which is what lets you store it, add to it, or pass it on.",
  },
];

export function FunctionMachine() {
  const [which, setWhich] = useState(0);
  const [name, setName] = useState("Aarav");
  const [calls, setCalls] = useState(0);

  const fn = FNS[which];
  const called = calls > 0;
  const arg = name.trim() || "Aarav";

  const pick = (i: number) => { setWhich(i); setCalls(0); };

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">⚙️ Function Machine — printing is not returning</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        These two functions look like they do the same thing. Call each one and watch
        <b> both</b> panels — what reaches the screen, and what the call actually hands back.
      </p>

      <div className="viz-controls" style={{ marginBottom: 12 }}>
        {FNS.map((f, i) => (
          <button key={f.key} className={`btn ${which === i ? "btn-primary" : "btn-ghost"}`}
                  style={{ padding: "8px 14px" }} onClick={() => pick(i)}>
            the one that {f.label}
          </button>
        ))}
      </div>

      <div className="fm-code">
        {fn.src.map((line, i) => <div key={i}>{line}</div>)}
      </div>

      <div className="viz-controls" style={{ margin: "12px 0" }}>
        <span className="mono" style={{ fontSize: 12.5 }}>x = greet(</span>
        <input className="viz-input" style={{ width: 110 }} value={name}
               onChange={(e) => { setName(e.target.value); setCalls(0); }} aria-label="argument" />
        <span className="mono" style={{ fontSize: 12.5 }}>)</span>
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} onClick={() => setCalls((c) => c + 1)}>Call it ▶</button>
        {called && <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => setCalls(0)}>Reset</button>}
      </div>

      <div className="fm-out">
        <div className="fm-panel">
          <div className="fm-cap">On the screen</div>
          {!called ? <div className="fm-empty">not called yet</div>
            : fn.screen(arg) ? <div className="fm-val screen" key={calls}>{fn.screen(arg)}</div>
            : <div className="fm-empty">nothing — it never printed</div>}
        </div>
        <div className="fm-panel">
          <div className="fm-cap">What <span className="mono">x</span> now holds</div>
          {!called ? <div className="fm-empty">not called yet</div>
            : <div className={`fm-val ${fn.gives(arg) === "None" ? "none" : "given"}`} key={calls}>{fn.gives(arg)}</div>}
        </div>
      </div>

      {called && (
        <div className={`note ${fn.key === "print" ? "warn" : "tip"}`} style={{ marginTop: 12 }}>
          <span className="i">{fn.key === "print" ? "⚠️" : "💡"}</span>
          <div>{fn.note}</div>
        </div>
      )}
    </div>
  );
}
