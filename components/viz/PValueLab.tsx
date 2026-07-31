"use client";

import { useMemo, useState } from "react";

// Normal CDF, Abramowitz & Stegun — the same approximation BellCurve uses, so
// the two panels never disagree about the same z.
function cdf(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

const W = 340, H = 122, PAD = 12, FLOOR = H - 22;
const px = (x: number) => PAD + ((x + 4) / 8) * (W - 2 * PAD);
const py = (y: number) => FLOOR - y * (FLOOR - 14);

export function PValueLab() {
  const [z, setZ] = useState(2.0);

  const { curve, leftTail, rightTail, p } = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 160; i++) {
      const x = -4 + (8 * i) / 160;
      pts.push([x, Math.exp((-x * x) / 2)]);
    }
    const path = (sel: [number, number][]) =>
      sel.length > 1
        ? `M${px(sel[0][0]).toFixed(1)},${FLOOR} ` +
          sel.map(([x, y]) => `L${px(x).toFixed(1)},${py(y).toFixed(1)}`).join(" ") +
          ` L${px(sel[sel.length - 1][0]).toFixed(1)},${FLOOR} Z`
        : "";
    return {
      curve: pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${px(x).toFixed(1)},${py(y).toFixed(1)}`).join(" "),
      leftTail: path(pts.filter(([x]) => x <= -z)),
      rightTail: path(pts.filter(([x]) => x >= z)),
      p: 2 * (1 - cdf(Math.abs(z))),
    };
  }, [z]);

  const significant = p < 0.05;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">📉 p-value Lab — how surprising is this result?</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        The curve is what results look like <b>when nothing is going on</b>. Slide your observed result away from the centre and the shaded tails are the p-value: how often chance alone would produce something at least this extreme.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
        <path d={leftTail} fill="var(--bad)" fillOpacity="0.55" />
        <path d={rightTail} fill="var(--bad)" fillOpacity="0.55" />
        <path d={curve} fill="none" stroke="var(--teal)" strokeWidth="2.5" />
        <line x1={px(z)} y1="10" x2={px(z)} y2={FLOOR} stroke="var(--accent)" strokeWidth="2" />
        <line x1={px(-z)} y1="10" x2={px(-z)} y2={FLOOR} stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 3" />
        <line x1={PAD} y1={FLOOR} x2={W - PAD} y2={FLOOR} stroke="var(--line)" />
        {[-3, -2, -1, 0, 1, 2, 3].map((t) => (
          <text key={t} x={px(t)} y={FLOOR + 13} textAnchor="middle" fontSize="8.5" fill="var(--ink-faint)" fontFamily="var(--mono)">{t}</text>
        ))}
      </svg>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
        <div className="cast-res" style={{ minWidth: 92 }}><div className="lbl">z</div><div className="val">{z.toFixed(2)}</div></div>
        <div className={`cast-res ${significant ? "ok" : "no"}`} style={{ minWidth: 118 }}>
          <div className="lbl">p-value</div><div className="val">{p < 0.0001 ? "<0.0001" : p.toFixed(4)}</div>
        </div>
        <div className={`cast-res ${significant ? "ok" : "no"}`} style={{ minWidth: 150 }}>
          <div className="lbl">at the 0.05 line</div>
          <div className="val" style={{ fontSize: 13 }}>{significant ? "reject the null" : "not enough"}</div>
        </div>
      </div>

      <label style={{ display: "block", fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)", marginTop: 14 }}>
        observed result, in standard deviations from the null: <b>{z.toFixed(2)}</b>
        <input type="range" min={0} max={4} step={0.01} value={z} onChange={(e) => setZ(Number(e.target.value))}
               style={{ width: "100%", marginTop: 4, accentColor: "var(--accent)" }} />
      </label>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        <b>1.96 is where p crosses 0.05</b> — the famous threshold is nothing more than that point on this curve. Note the shading is on <i>both</i>{" "}sides: a two-tailed test asks &quot;this extreme in either direction&quot;. Halving it to chase significance is a one-tailed test, and it has to be chosen before you see the data, not after.
      </div></div>
    </div>
  );
}
