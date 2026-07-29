"use client";

import { useState } from "react";

// Git confuses beginners because three different places are all called "my
// code". Step a single file through the commands and watch which box it sits
// in — the mental model is the whole battle, and the commands follow from it.

type Step = {
  cmd: string;
  at: 0 | 1 | 2 | 3;
  note: string;
};

const AREAS = ["Working directory", "Staging area", "Local repository", "Remote (GitHub)"];

const STEPS: Step[] = [
  { cmd: "you edit report.py", at: 0, note: "The change exists only on your disk. Git can see it, but is not looking after it yet." },
  { cmd: "git add report.py", at: 1, note: "Staged. You have chosen this change for the next commit — and you could stage only some of your changes." },
  { cmd: "git commit -m \"Add report\"", at: 2, note: "Saved into your local history, with a message. This is the point you can always come back to." },
  { cmd: "git push", at: 3, note: "Now it is on GitHub too. Until this moment, a failed hard drive loses everything." },
];

export function GitFlow() {
  const [i, setI] = useState(0);
  const step = STEPS[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🌿 Git Flow</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        One file, four commands. Step through and watch where it actually lives after each one.
      </p>

      <div className="viz-controls">
        <div className="ss-stepper">
          <span className="ss-lbl">step</span>
          {STEPS.map((s, n) => (
            <button key={s.cmd} className={`ss-step${i === n ? " on" : ""}`} onClick={() => setI(n)}>
              {n + 1}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {AREAS.map((a, n) => {
          const here = step.at === n;
          const passed = step.at > n;
          return (
            <div
              key={a}
              style={{
                flex: "1 1 130px",
                minWidth: 0,
                padding: "12px 10px",
                borderRadius: 10,
                textAlign: "center",
                border: here ? "2px solid var(--accent)" : "1px solid var(--line)",
                background: here ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--panel-2)",
                opacity: here || passed ? 1 : 0.45,
              }}
            >
              <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 6 }}>{a}</div>
              <div style={{ fontSize: 18 }}>{here ? "📄" : passed ? "✓" : "·"}</div>
            </div>
          );
        })}
      </div>

      <div className="viz-code" style={{ marginBottom: 10 }}>
        <span className="c-kw">$</span> {step.cmd}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{step.note}</div>
    </div>
  );
}
