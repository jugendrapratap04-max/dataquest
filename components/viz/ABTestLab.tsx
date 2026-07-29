"use client";

import { useMemo, useState } from "react";

function cdf(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

const W = 340, H = 76, PAD = 14;

export function ABTestLab() {
  const [n, setN] = useState(1000);
  const [rateA, setRateA] = useState(10);
  const [rateB, setRateB] = useState(12);

  const s = useMemo(() => {
    const xa = Math.round((n * rateA) / 100);
    const xb = Math.round((n * rateB) / 100);
    const pa = xa / n, pb = xb / n;
    const pool = (xa + xb) / (2 * n);
    const se = Math.sqrt(pool * (1 - pool) * (2 / n));
    const z = se > 0 ? (pb - pa) / se : 0;
    const p = 2 * (1 - cdf(Math.abs(z)));
    return { xa, xb, pa, pb, z, p, pp: (pb - pa) * 100, rel: pa > 0 ? ((pb - pa) / pa) * 100 : 0 };
  }, [n, rateA, rateB]);

  const significant = s.p < 0.05;
  const maxRate = Math.max(rateA, rateB, 1);
  const barW = (r: number) => ((W - 2 * PAD - 60) * r) / maxRate;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🧪 A/B Test Lab — is that lift real?</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Set two conversion rates and how many visitors each variant got. The rates alone never answer the question — hold them still and move only the <b>visitors</b> slider to see why.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
        {([["A", rateA, s.xa, "var(--ink-faint)"], ["B", rateB, s.xb, "var(--teal)"]] as const).map(([label, r, x, col], i) => (
          <g key={label}>
            <text x={PAD} y={22 + i * 34} fontSize="11" fill="var(--ink-soft)" fontFamily="var(--mono)">{label}</text>
            <rect x={PAD + 16} y={11 + i * 34} width={Math.max(2, barW(r))} height="18" rx="3" fill={col} fillOpacity="0.75" />
            <text x={PAD + 22 + Math.max(2, barW(r))} y={24 + i * 34} fontSize="9.5" fill="var(--ink-faint)" fontFamily="var(--mono)">
              {r.toFixed(1)}% · {x} of {n}
            </text>
          </g>
        ))}
      </svg>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
        <div className="cast-res" style={{ minWidth: 104 }}><div className="lbl">lift (pts)</div><div className="val">{s.pp >= 0 ? "+" : ""}{s.pp.toFixed(1)}</div></div>
        <div className="cast-res" style={{ minWidth: 104 }}><div className="lbl">lift (relative)</div><div className="val">{s.rel >= 0 ? "+" : ""}{s.rel.toFixed(1)}%</div></div>
        <div className={`cast-res ${significant ? "ok" : "no"}`} style={{ minWidth: 104 }}>
          <div className="lbl">p-value</div><div className="val">{s.p < 0.0001 ? "<0.0001" : s.p.toFixed(4)}</div>
        </div>
        <div className={`cast-res ${significant ? "ok" : "no"}`} style={{ minWidth: 138 }}>
          <div className="lbl">verdict</div><div className="val" style={{ fontSize: 13 }}>{significant ? "ship it" : "keep running"}</div>
        </div>
      </div>

      <div className="viz-controls" style={{ flexDirection: "column", gap: 8, marginTop: 14 }}>
        <label style={{ fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)" }}>
          visitors per variant: <b>{n}</b>
          <input type="range" min={100} max={20000} step={100} value={n} onChange={(e) => setN(Number(e.target.value))}
                 style={{ width: "100%", marginTop: 4, accentColor: "var(--accent)" }} />
        </label>
        <label style={{ fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)" }}>
          A converts at: <b>{rateA.toFixed(1)}%</b>
          <input type="range" min={1} max={30} step={0.5} value={rateA} onChange={(e) => setRateA(Number(e.target.value))}
                 style={{ width: "100%", marginTop: 4, accentColor: "var(--ink-faint)" }} />
        </label>
        <label style={{ fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)" }}>
          B converts at: <b>{rateB.toFixed(1)}%</b>
          <input type="range" min={1} max={30} step={0.5} value={rateB} onChange={(e) => setRateB(Number(e.target.value))}
                 style={{ width: "100%", marginTop: 4, accentColor: "var(--teal)" }} />
        </label>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        Leave the rates at <b>10%</b> and <b>12%</b> and drag visitors alone. At 1,000 each the p-value is 0.15 and there is nothing to report. At 5,000 each the very same rates give 0.0014. The bars never change — only how much evidence stands behind them.
      </div></div>
    </div>
  );
}
