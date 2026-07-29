"use client";

import { useMemo, useState } from "react";

// The exact distribution of the mean of n dice, by convolution — not a
// simulation. A random demo of the CLT re-rolls on every render and shows a
// slightly different answer each time, which invites the student to wonder
// whether the effect is real or noise. This is the true distribution, so the
// spread it reports agrees with sigma/sqrt(n) to the last decimal and the
// lesson's Python can be checked against it directly.
function meanDistribution(n: number) {
  let dist = [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6];   // sums n..6n, offset n
  for (let i = 1; i < n; i++) {
    const next = new Array(dist.length + 5).fill(0);
    for (let a = 0; a < dist.length; a++)
      for (let f = 0; f < 6; f++) next[a + f] += dist[a] / 6;
    dist = next;
  }
  // index a  ->  sum = n + a  ->  mean = (n + a) / n
  return dist.map((p, a) => ({ mean: (n + a) / n, p }));
}

const W = 340, H = 116, PAD = 14, FLOOR = H - 20;
const POP_SIGMA = Math.sqrt(35 / 12);   // a fair die: 1.7078...

export function SamplingLab() {
  const [n, setN] = useState(1);

  const { pts, se, peak } = useMemo(() => {
    const pts = meanDistribution(n);
    const mu = pts.reduce((s, d) => s + d.mean * d.p, 0);
    const varc = pts.reduce((s, d) => s + (d.mean - mu) ** 2 * d.p, 0);
    return { pts, se: Math.sqrt(varc), peak: Math.max(...pts.map((d) => d.p)) };
  }, [n]);

  const x = (m: number) => PAD + ((m - 1) / 5) * (W - 2 * PAD);
  const bw = Math.max(1.5, (W - 2 * PAD) / (5 * n + 1) * 0.8);

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🎯 Sampling Lab — where the bell curve comes from</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Roll <b>n</b> dice and take the <b>average</b>. This is every possible result and how likely each one is. One die is perfectly flat — no shape at all. Drag n upward and watch a bell appear out of nothing.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
        {pts.map((d, i) => {
          const h = (d.p / peak) * (FLOOR - 14);
          return <rect key={i} x={x(d.mean) - bw / 2} y={FLOOR - h} width={bw} height={Math.max(0, h)} rx="1"
                       fill="var(--teal)" fillOpacity={0.35 + 0.55 * (d.p / peak)} />;
        })}
        <line x1={x(3.5)} y1="8" x2={x(3.5)} y2={FLOOR} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1={PAD} y1={FLOOR} x2={W - PAD} y2={FLOOR} stroke="var(--line)" />
        {[1, 2, 3, 4, 5, 6].map((t) => (
          <text key={t} x={x(t)} y={FLOOR + 12} textAnchor="middle" fontSize="8.5" fill="var(--ink-faint)" fontFamily="var(--mono)">{t}</text>
        ))}
      </svg>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
        <div className="cast-res ok" style={{ minWidth: 92 }}><div className="lbl">mean</div><div className="val">3.5</div></div>
        <div className="cast-res" style={{ minWidth: 108 }}><div className="lbl">spread of means</div><div className="val">{se.toFixed(4)}</div></div>
        <div className="cast-res" style={{ minWidth: 108 }}><div className="lbl">σ / √n</div><div className="val">{(POP_SIGMA / Math.sqrt(n)).toFixed(4)}</div></div>
      </div>

      <label style={{ display: "block", fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)", marginTop: 14 }}>
        dice per sample (n): <b>{n}</b>
        <input type="range" min={1} max={8} step={1} value={n} onChange={(e) => setN(Number(e.target.value))}
               style={{ width: "100%", marginTop: 4, accentColor: "var(--teal)" }} />
      </label>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        Two things happen at once, and only one of them is the Central Limit Theorem. The <b>shape</b> turns into a bell even though a single die is flat — that is the CLT. The <b>spread</b> shrinks by exactly <code>σ/√n</code>, which is why the two right-hand boxes always agree. The centre never moves off 3.5.
      </div></div>
    </div>
  );
}
