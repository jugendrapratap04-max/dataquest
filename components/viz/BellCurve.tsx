"use client";

import { useMemo, useState } from "react";

// erf approximation (Abramowitz & Stegun) -> normal CDF
function normalCdf(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  p = z > 0 ? 1 - p : p;
  return p;
}

const W = 320, H = 120;

export function BellCurve() {
  const [z, setZ] = useState(0);

  const { curve, area } = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 100; i++) {
      const x = -3.5 + (7 * i) / 100;
      const y = Math.exp((-x * x) / 2);
      pts.push([x, y]);
    }
    const px = (x: number) => ((x + 3.5) / 7) * W;
    const py = (y: number) => H - 8 - y * (H - 20);
    const curve = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${px(x).toFixed(1)},${py(y).toFixed(1)}`).join(" ");
    const areaPts = pts.filter(([x]) => x <= z);
    const area = areaPts.length > 1
      ? `M${px(areaPts[0][0]).toFixed(1)},${H - 8} ` + areaPts.map(([x, y]) => `L${px(x).toFixed(1)},${py(y).toFixed(1)}`).join(" ") + ` L${px(z).toFixed(1)},${H - 8} Z`
      : "";
    return { curve, area, px, py };
  }, [z]);

  const pct = (normalCdf(z) * 100).toFixed(1);

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🔔 Normal Distribution — bell curve</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        A great deal of real data falls into this bell shape — most of it in the middle, little at the edges. Move the <b>z-score</b> slider and see what percentage of the data sits to its left.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 420, display: "block", margin: "0 auto" }}>
        <line x1={W / 2} y1="8" x2={W / 2} y2={H - 8} stroke="var(--line)" strokeDasharray="3 3" />
        <path d={area} fill="color-mix(in srgb, var(--accent) 30%, transparent)" />
        <path d={curve} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        <line x1={((z + 3.5) / 7) * W} y1="8" x2={((z + 3.5) / 7) * W} y2={H - 8} stroke="var(--teal)" strokeWidth="2" />
      </svg>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 10 }}>
        <div className="cast-res ok" style={{ minWidth: 130 }}><div className="lbl">data to the left</div><div className="val">{pct}%</div></div>
        <div className="cast-res" style={{ minWidth: 90 }}><div className="lbl">z-score</div><div className="val">{z.toFixed(1)}</div></div>
      </div>

      <input type="range" min={-3} max={3} step={0.1} value={z} onChange={(e) => setZ(Number(e.target.value))} style={{ width: "100%", marginTop: 14, accentColor: "var(--teal)" }} />
      <p style={{ fontSize: 11.5, color: "var(--ink-faint)", margin: "8px 0 0", textAlign: "center" }}>z = 0 has half the data (50%) to its left · z = 2 covers ~97.7% (top performers!)</p>
    </div>
  );
}
