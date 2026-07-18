"use client";

import { useState } from "react";

const S = "DATASCIENCE";
const N = S.length;

// Mirrors Python's s[start:stop:step] exactly — including None defaults,
// negative indices, and a negative step (reverse). So whatever a student sees
// here is exactly what Python would print.
function sliceIdx(start: number | null, stop: number | null, step: number): number[] {
  const st = step === 0 ? 1 : step;
  let a: number, b: number;
  if (st > 0) {
    a = start == null ? 0 : start < 0 ? Math.max(N + start, 0) : Math.min(start, N);
    b = stop == null ? N : stop < 0 ? Math.max(N + stop, 0) : Math.min(stop, N);
  } else {
    a = start == null ? N - 1 : start < 0 ? Math.max(N + start, -1) : Math.min(start, N - 1);
    b = stop == null ? -1 : stop < 0 ? Math.max(N + stop, -1) : Math.min(stop, N - 1);
  }
  const out: number[] = [];
  if (st > 0) for (let i = a; i < b; i += st) out.push(i);
  else for (let i = a; i > b; i += st) out.push(i);
  return out;
}

function fmt(v: number | null) {
  return v == null ? "" : String(v);
}

export function StringSlicer() {
  const [start, setStart] = useState<number | null>(null);
  const [stop, setStop] = useState<number | null>(4);
  const [step, setStep] = useState(1);

  const idxs = sliceIdx(start, stop, step);
  const inSlice = new Set(idxs);
  const result = idxs.map((i) => S[i]).join("");

  // start/stop cycle: None → 0 → 1 … → N → None. Negative indices stay in the
  // presets so the controls don't overwhelm a beginner.
  const bump = (v: number | null, dir: number): number | null => {
    if (v == null) return dir > 0 ? 0 : N;
    const nv = v + dir;
    if (nv < 0 || nv > N) return null;
    return nv;
  };

  const expr = `s[${fmt(start)}:${fmt(stop)}${step !== 1 ? ":" + step : ""}]`;

  const presets: [string, number | null, number | null, number][] = [
    ["[:4] → DATA", null, 4, 1],
    ["[4:] → SCIENCE", 4, null, 1],
    ["[::-1] → ulta", null, null, -1],
    ["[::2] → ek chhodo", null, null, 2],
    ["[-3:] → aakhri 3", -3, null, 1],
  ];

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">✂️ String Slicer</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        <code>s = &quot;DATASCIENCE&quot;</code> — har letter ka index upar (<span className="kbd">0,1,2…</span>) aur peeche se neeche (<span className="kbd">-1,-2…</span>).
        Neeche <b>start / stop / step</b> badlo ya koi preset dabao — highlight aur result live badlega.
      </p>

      <div className="ss-track">
        {S.split("").map((ch, i) => (
          <div key={i} className={`ss-cell${inSlice.has(i) ? " on" : ""}`}>
            <span className="ss-pos">{i}</span>
            <span className="ss-ch">{ch}</span>
            <span className="ss-neg">{i - N}</span>
          </div>
        ))}
      </div>

      <div className="ss-presets">
        {presets.map(([label, a, b, s]) => (
          <button key={label} className="ss-preset" onClick={() => { setStart(a); setStop(b); setStep(s); }}>{label}</button>
        ))}
      </div>

      <div className="viz-controls">
        {([["start", start, setStart], ["stop", stop, setStop]] as const).map(([name, val, set]) => (
          <div key={name} className="ss-stepper">
            <span className="ss-lbl">{name}</span>
            <button onClick={() => set(bump(val, -1))} aria-label={`${name} kam`}>−</button>
            <span className="ss-val">{val == null ? "None" : val}</span>
            <button onClick={() => set(bump(val, +1))} aria-label={`${name} zyada`}>+</button>
          </div>
        ))}
        <div className="ss-stepper">
          <span className="ss-lbl">step</span>
          {[1, 2, -1].map((s) => (
            <button key={s} className={`ss-step${step === s ? " on" : ""}`} onClick={() => setStep(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="viz-code">
        <div><span className="c-str">&quot;{S}&quot;</span>{expr.replace("s", "")}  <span className="c-kw">→</span>  <span className="c-str">&quot;{result}&quot;</span></div>
        <div style={{ marginTop: 4, color: "var(--ink-faint)" }}><span className="c-com"># {idxs.length === 0 ? "khaali string — is range me kuch nahi" : `index ${idxs.join(", ")}`}</span></div>
      </div>
    </div>
  );
}
