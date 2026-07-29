"use client";

import { useMemo, useState } from "react";

type Kind = "uniform" | "binomial" | "poisson" | "normal";

// Written out rather than imported, so the panel and the lesson's Python are
// visibly the same arithmetic: math.comb(n,k) * p**k * (1-p)**(n-k) and
// lam**k * exp(-lam) / k!.
function choose(n: number, k: number): number {
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return r;
}
const factorial = (k: number) => { let r = 1; for (let i = 2; i <= k; i++) r *= i; return r; };

const W = 340, H = 118, PAD = 14, FLOOR = H - 20;

export function DistributionLab() {
  const [kind, setKind] = useState<Kind>("binomial");
  const [param, setParam] = useState(50);   // meaning depends on the distribution

  const { bars, labels, caption, paramLabel, mean } = useMemo(() => {
    if (kind === "uniform") {
      const n = 6;
      return {
        bars: Array.from({ length: n }, () => 1 / n),
        labels: Array.from({ length: n }, (_, i) => String(i + 1)),
        caption: "Every outcome equally likely — one die, one card, one random pick.",
        paramLabel: null as string | null,
        mean: 3.5,
      };
    }
    if (kind === "binomial") {
      const n = 10, p = param / 100;
      return {
        bars: Array.from({ length: n + 1 }, (_, k) => choose(n, k) * p ** k * (1 - p) ** (n - k)),
        labels: Array.from({ length: n + 1 }, (_, k) => String(k)),
        caption: `10 independent tries, each succeeding with probability ${p.toFixed(2)}. The bars are the chance of exactly k successes.`,
        paramLabel: `chance of success on one try: ${p.toFixed(2)}`,
        mean: n * p,
      };
    }
    if (kind === "poisson") {
      const lam = param / 10;
      const K = 15;
      return {
        bars: Array.from({ length: K }, (_, k) => (lam ** k * Math.exp(-lam)) / factorial(k)),
        labels: Array.from({ length: K }, (_, k) => (k % 2 === 0 ? String(k) : "")),
        caption: `Counting how many times something happens in a fixed window, when it averages ${lam.toFixed(1)} per window.`,
        paramLabel: `average events per window: ${lam.toFixed(1)}`,
        mean: lam,
      };
    }
    const sigma = param / 10;
    const K = 41;
    return {
      bars: Array.from({ length: K }, (_, i) => {
        const x = -4 + (8 * i) / (K - 1);
        return Math.exp(-(x * x) / (2 * sigma * sigma));
      }),
      labels: Array.from({ length: K }, (_, i) => (i === 0 ? "-4" : i === (K - 1) / 2 ? "0" : i === K - 1 ? "+4" : "")),
      caption: `Continuous and symmetric. Widening the spread flattens the peak — the area underneath always stays at 1.`,
      paramLabel: `spread (standard deviation): ${sigma.toFixed(1)}`,
      mean: 0,
    };
  }, [kind, param]);

  const peak = Math.max(...bars);
  const bw = (W - 2 * PAD) / bars.length;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🎲 Distribution Lab — four shapes, four questions</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        A distribution is not a formula to memorise — it is the answer to a particular kind of question. Switch between them and watch which shape belongs to which question.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
        {bars.map((v, i) => {
          const h = peak > 0 ? (v / peak) * (FLOOR - 12) : 0;
          return (
            <rect key={i} x={PAD + i * bw + bw * 0.12} y={FLOOR - h} width={bw * 0.76} height={Math.max(0, h)}
                  rx={bw > 8 ? 2 : 1} fill="var(--teal)" fillOpacity={0.35 + 0.55 * (peak > 0 ? v / peak : 0)} />
          );
        })}
        <line x1={PAD} y1={FLOOR} x2={W - PAD} y2={FLOOR} stroke="var(--line)" />
        {labels.map((l, i) => l ? (
          <text key={i} x={PAD + i * bw + bw / 2} y={FLOOR + 12} textAnchor="middle" fontSize="8.5"
                fill="var(--ink-faint)" fontFamily="var(--mono)">{l}</text>
        ) : null)}
      </svg>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 10 }}>
        <div className="cast-res ok" style={{ minWidth: 120 }}>
          <div className="lbl">mean</div><div className="val">{mean.toFixed(1)}</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "var(--ink-soft)", textAlign: "center", margin: "8px 0 12px" }}>{caption}</p>

      <div className="viz-controls" style={{ justifyContent: "center", flexWrap: "wrap" }}>
        {(["uniform", "binomial", "poisson", "normal"] as Kind[]).map((k) => (
          <button key={k} className={`btn ${kind === k ? "btn-primary" : "btn-ghost"}`} style={{ padding: "8px 14px" }}
                  onClick={() => { setKind(k); setParam(k === "poisson" ? 30 : k === "normal" ? 10 : 50); }}>
            {k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      {paramLabel && (
        <label style={{ display: "block", fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)", marginTop: 14 }}>
          {paramLabel}
          <input type="range" min={kind === "binomial" ? 5 : 5} max={kind === "binomial" ? 95 : kind === "poisson" ? 80 : 25}
                 step={kind === "binomial" ? 1 : 1} value={param} onChange={(e) => setParam(Number(e.target.value))}
                 style={{ width: "100%", marginTop: 4, accentColor: "var(--teal)" }} />
        </label>
      )}
    </div>
  );
}
