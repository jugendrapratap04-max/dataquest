"use client";

import { useState } from "react";

/* Anscombe's quartet, 1973 — four datasets whose summary statistics are the same
 * to two decimal places and whose shapes have nothing in common.
 *
 * It is the argument for this entire subject, and it only works if the student
 * gets to experience the trick rather than being told about it. So the panel
 * starts with the charts HIDDEN: four columns of identical numbers, and a
 * question about which one is different. Then you reveal them.
 *
 * The numbers here are not decorative — they are computed from the points below,
 * by the same formulas the code blocks in this lesson run in Python, so the
 * table and the lesson's claimed output cannot drift apart. */

const X_COMMON = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];

type Set = { name: string; x: number[]; y: number[]; reveal: string };

const SETS: Set[] = [
  {
    name: "I",
    x: X_COMMON,
    y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],
    reveal: "An honest linear relationship with ordinary scatter. This is the only one where the summary tells the truth.",
  },
  {
    name: "II",
    x: X_COMMON,
    y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.1, 6.13, 3.1, 9.13, 7.26, 4.74],
    reveal: "A clean curve. There is a perfect relationship here — it just isn't a straight one, and a straight-line summary cannot say so.",
  },
  {
    name: "III",
    x: X_COMMON,
    y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],
    reveal: "Ten points on an exact straight line, plus one that isn't. That single point is what tilts the fitted line away from the other ten.",
  },
  {
    name: "IV",
    x: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8],
    y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.5, 5.56, 7.91, 6.89],
    reveal: "Every x is 8 except one. There is no relationship at all — a single far-away point invented the correlation by itself.",
  },
];

const mean = (v: number[]) => v.reduce((s, n) => s + n, 0) / v.length;

function sd(v: number[]) {
  const m = mean(v);
  return Math.sqrt(v.reduce((s, n) => s + (n - m) ** 2, 0) / (v.length - 1));
}

function corr(x: number[], y: number[]) {
  const mx = mean(x);
  const my = mean(y);
  const cov = x.reduce((s, n, i) => s + (n - mx) * (y[i] - my), 0);
  const dx = Math.sqrt(x.reduce((s, n) => s + (n - mx) ** 2, 0));
  const dy = Math.sqrt(y.reduce((s, n) => s + (n - my) ** 2, 0));
  return cov / (dx * dy);
}

// One shared frame for all four, because comparing shapes only means something
// when the axes are the same. Data space is x 2..20, y 2..14.
const W = 150;
const H = 108;
const PAD = 14;
const sx = (x: number) => PAD + ((x - 2) / 18) * (W - PAD - 6);
const sy = (y: number) => H - PAD - ((y - 2) / 12) * (H - PAD - 6);

function MiniPlot({ set, dim }: { set: Set; dim: boolean }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Scatter plot of set ${set.name}`}
         style={{ opacity: dim ? 0.35 : 1 }}>
      {/* axes */}
      <line x1={PAD} y1={H - PAD} x2={W - 4} y2={H - PAD} stroke="var(--line)" strokeWidth="1" />
      <line x1={PAD} y1={4} x2={PAD} y2={H - PAD} stroke="var(--line)" strokeWidth="1" />
      {/* The fitted line y = 3 + 0.5x — the SAME line for all four sets, which is
          the part that makes the point. */}
      <line x1={sx(2)} y1={sy(4)} x2={sx(20)} y2={sy(13)} stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="4 3" />
      {set.x.map((x, i) => (
        <circle key={i} cx={sx(x)} cy={sy(set.y[i])} r="3.1" fill="var(--teal)" stroke="var(--panel)" strokeWidth="0.8" />
      ))}
      <text x={W - 6} y={H - 4} textAnchor="end" fontSize="7" fill="var(--ink-faint)" fontFamily="var(--mono)">x</text>
      <text x={4} y={10} fontSize="7" fill="var(--ink-faint)" fontFamily="var(--mono)">y</text>
    </svg>
  );
}

export function AnscombeLab() {
  const [shown, setShown] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const stats = SETS.map((s) => ({
    name: s.name,
    n: s.x.length,
    meanX: mean(s.x).toFixed(2),
    meanY: mean(s.y).toFixed(2),
    sdY: sd(s.y).toFixed(2),
    r: corr(s.x, s.y).toFixed(2),
  }));

  const current = SETS.find((s) => s.name === picked);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔬 Anscombe&apos;s quartet — four datasets, one summary</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Four datasets of eleven points each. Read the table first, while the charts are still
        hidden, and decide which one is the odd one out. Then press the button.
      </p>

      <div style={{ overflowX: "auto", marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: "var(--teal)", textAlign: "left" }}>
              <th style={{ padding: "6px 10px", borderBottom: "1px solid var(--line)" }}>set</th>
              <th style={{ padding: "6px 10px", borderBottom: "1px solid var(--line)" }}>n</th>
              <th style={{ padding: "6px 10px", borderBottom: "1px solid var(--line)" }}>mean x</th>
              <th style={{ padding: "6px 10px", borderBottom: "1px solid var(--line)" }}>mean y</th>
              <th style={{ padding: "6px 10px", borderBottom: "1px solid var(--line)" }}>sd y</th>
              <th style={{ padding: "6px 10px", borderBottom: "1px solid var(--line)" }}>corr</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.name}>
                <td style={{ padding: "6px 10px", color: "var(--ink)", fontWeight: 700 }}>{s.name}</td>
                <td style={{ padding: "6px 10px", color: "var(--ink-soft)" }}>{s.n}</td>
                <td style={{ padding: "6px 10px", color: "var(--ink-soft)" }}>{s.meanX}</td>
                <td style={{ padding: "6px 10px", color: "var(--ink-soft)" }}>{s.meanY}</td>
                <td style={{ padding: "6px 10px", color: "var(--ink-soft)" }}>{s.sdY}</td>
                <td style={{ padding: "6px 10px", color: "var(--ink-soft)" }}>{s.r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center" }}>
        <button className={`btn ${shown ? "btn-ghost" : "btn-primary"}`} onClick={() => { setShown((s) => !s); setPicked(null); }}>
          {shown ? "Hide the charts again" : "Now show me the charts"}
        </button>
      </div>

      {!shown ? (
        <p style={{ fontSize: 12.5, color: "var(--ink-faint)", textAlign: "center", padding: "18px 0 4px" }}>
          Six columns of numbers, four rows, and nothing to choose between them. That is exactly the
          position a summary table puts you in.
        </p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {SETS.map((s) => (
              <button
                key={s.name}
                onClick={() => setPicked(picked === s.name ? null : s.name)}
                aria-pressed={picked === s.name}
                style={{
                  border: `1px solid ${picked === s.name ? "var(--teal)" : "var(--line)"}`,
                  background: "var(--panel-2)", borderRadius: 10, padding: "6px 4px 2px", cursor: "pointer",
                }}
              >
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", textAlign: "left", padding: "0 6px 2px" }}>
                  set {s.name}
                </div>
                <MiniPlot set={s} dim={picked !== null && picked !== s.name} />
              </button>
            ))}
          </div>

          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "12px 0 0" }}>
            The dashed line is the <b>same fitted line in all four panels</b> — it has to be, because
            the numbers that produce it are the same. Tap a panel to read what it is hiding.
          </p>

          {current && (
            <div className="note key" style={{ marginTop: 12 }}>
              <span className="i">📌</span>
              <div><b>Set {current.name}.</b> {current.reveal}</div>
            </div>
          )}
        </>
      )}

      <div className="note tip" style={{ marginTop: 14 }}>
        <span className="i">💡</span>
        <div>
          Francis Anscombe built these in 1973 to make one argument: a statistic is a
          <b> compression</b>, and every compression throws something away. The charts cost you ten
          seconds and would have caught all three problems.
        </div>
      </div>
    </div>
  );
}
