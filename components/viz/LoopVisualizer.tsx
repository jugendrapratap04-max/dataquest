"use client";

import { useEffect, useRef, useState } from "react";

const DATA = [2, 4, 6, 8, 10];

export function LoopVisualizer() {
  const [step, setStep] = useState(-1); // -1 = not started, DATA.length = done
  const [auto, setAuto] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = step < 0 ? 0 : DATA.slice(0, step + 1).reduce((s, x) => s + x, 0);
  const done = step >= DATA.length - 1;

  // Whether the auto-run is actually advancing. Derived, not stored: the effect
  // used to call setAuto(false) when the loop finished, and a setState made
  // synchronously inside an effect schedules another render immediately — a
  // cascade React has to run twice for no benefit. Reading "am I running?" off
  // the state we already have needs no second render at all.
  const running = auto && !done;

  useEffect(() => {
    if (!running) return;
    timer.current = setTimeout(() => setStep((s) => s + 1), 750);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [running, step]);

  const reset = () => { setAuto(false); setStep(-1); };

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🔁 Loop Visualizer — watch every pass</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        A loop runs once for every item in the list. Press &quot;Step&quot; below and watch the <b>current item</b> highlight while the <b>total</b> grows.
      </p>

      <div className="mem-grid" style={{ marginBottom: 14 }}>
        {DATA.map((n, i) => (
          <div key={i} className="mem-box" style={{ minWidth: 62, cursor: "default", borderColor: i === step ? "var(--accent)" : "var(--line)", boxShadow: i === step ? "0 0 0 3px color-mix(in srgb,var(--accent) 20%,transparent)" : "none", opacity: i <= step || step < 0 ? 1 : 0.5 }}>
            <div className="lbl">i={i}</div>
            <div className="val" style={{ padding: "12px 0" }}>{n}</div>
          </div>
        ))}
      </div>

      <div className="cast-flow" style={{ marginBottom: 14 }}>
        <div className="cast-res ok" style={{ minWidth: 120 }}><div className="lbl">total</div><div className="val">{total}</div></div>
        {step >= 0 && !done && <span className="cast-arrow">+ {DATA[step + 1] ?? ""} next</span>}
        {done && <span className="cast-arrow" style={{ color: "var(--good)" }}>✓ loop finished!</span>}
      </div>

      <div className="viz-controls">
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} onClick={() => setStep((s) => Math.min(s + 1, DATA.length - 1))} disabled={done}>Step →</button>
        <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => setAuto((a) => !a)} disabled={done}>{running ? "Pause" : "Auto-run"}</button>
        <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={reset}>Reset</button>
      </div>

      <div className="viz-code" style={{ marginTop: 14 }}>
        <div>total <span className="c-kw">=</span> <span className="c-num">0</span></div>
        <div><span className="c-kw">for</span> n <span className="c-kw">in</span> [<span className="c-num">2</span>, <span className="c-num">4</span>, <span className="c-num">6</span>, <span className="c-num">8</span>, <span className="c-num">10</span>]:</div>
        <div style={{ paddingLeft: 20, background: step >= 0 && !done ? "rgba(245,165,36,.12)" : "transparent", borderRadius: 4 }}>total <span className="c-kw">+=</span> n  <span className="c-com"># {step >= 0 ? `n=${DATA[step]}, total=${total}` : "not started yet"}</span></div>
      </div>
    </div>
  );
}
