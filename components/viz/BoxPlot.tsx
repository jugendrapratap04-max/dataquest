"use client";

import { useMemo, useState } from "react";

// Quartiles by the same rule Python's statistics.quantiles(data, n=4) uses —
// its default "exclusive" method. Writing an easier rule here (the median of
// each half, say) would have been shorter, and would have made this panel
// disagree with the code in the lesson beside it for the very datasets the
// lesson is about. Verified against CPython across the whole slider range
// before this shipped.
function quartiles(sorted: number[]): [number, number, number] {
  const n = sorted.length;
  const m = n + 1;
  const out: number[] = [];
  for (let i = 1; i <= 3; i++) {
    let j = Math.floor((i * m) / 4);
    let delta = i * m - j * 4;
    if (j < 1) { j = 1; delta = 0; } else if (j >= n) { j = n - 1; delta = 4; }
    out.push((sorted[j - 1] * (4 - delta) + sorted[j] * delta) / 4);
  }
  return [out[0], out[1], out[2]];
}

const BASE = [12, 15, 18, 21, 24, 27, 30, 33, 36];
const W = 340, H = 126, PAD = 12, MAX = 110;
const px = (v: number) => PAD + (Math.max(0, Math.min(MAX, v)) / MAX) * (W - 2 * PAD);
const tidy = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0$/, ""));

export function BoxPlot() {
  const [extreme, setExtreme] = useState(40);

  const s = useMemo(() => {
    const data = [...BASE, extreme].sort((a, b) => a - b);
    const [q1, med, q3] = quartiles(data);
    const iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr;
    const hi = q3 + 1.5 * iqr;
    const outliers = data.filter((v) => v < lo || v > hi);
    const inside = data.filter((v) => v >= lo && v <= hi);
    return { data, q1, med, q3, iqr, lo, hi, outliers, whiskLo: Math.min(...inside), whiskHi: Math.max(...inside) };
  }, [extreme]);

  const boxTop = 20, boxBot = 54, mid = (boxTop + boxBot) / 2;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">📦 Box Plot — quartiles, IQR and the outlier fence</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Nine values stay fixed. The slider moves only the <b>tenth</b>. Watch what happens to the box — and to the dashed fence at <code>Q3 + 1.5 × IQR</code> — as you drag that one value out to 100.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
        {/* whiskers */}
        <line x1={px(s.whiskLo)} y1={mid} x2={px(s.q1)} y2={mid} stroke="var(--ink-faint)" strokeWidth="1.5" />
        <line x1={px(s.q3)} y1={mid} x2={px(s.whiskHi)} y2={mid} stroke="var(--ink-faint)" strokeWidth="1.5" />
        <line x1={px(s.whiskLo)} y1={boxTop + 6} x2={px(s.whiskLo)} y2={boxBot - 6} stroke="var(--ink-faint)" strokeWidth="1.5" />
        <line x1={px(s.whiskHi)} y1={boxTop + 6} x2={px(s.whiskHi)} y2={boxBot - 6} stroke="var(--ink-faint)" strokeWidth="1.5" />

        {/* the box: Q1 to Q3 — the middle half of the data */}
        <rect x={px(s.q1)} y={boxTop} width={Math.max(1, px(s.q3) - px(s.q1))} height={boxBot - boxTop}
              fill="color-mix(in srgb, var(--teal) 22%, transparent)" stroke="var(--teal)" strokeWidth="2" rx="3" />
        <line x1={px(s.med)} y1={boxTop} x2={px(s.med)} y2={boxBot} stroke="var(--accent)" strokeWidth="3" />

        {/* the upper fence */}
        {s.hi <= MAX && (
          <>
            <line x1={px(s.hi)} y1={boxTop - 8} x2={px(s.hi)} y2={boxBot + 22} stroke="var(--bad)" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={px(s.hi)} y={boxTop - 11} textAnchor="middle" fontSize="9" fill="var(--bad)" fontFamily="var(--mono)">fence {tidy(s.hi)}</text>
          </>
        )}

        {/* every value as a dot; outliers called out */}
        {s.data.map((v, i) => {
          const out = v < s.lo || v > s.hi;
          return <circle key={i} cx={px(v)} cy={78} r={out ? 5 : 3.5}
                         fill={out ? "var(--bad)" : "var(--teal)"}
                         stroke={out ? "var(--bad)" : "none"} strokeWidth="1.5" fillOpacity={out ? 1 : 0.75} />;
        })}

        {/* axis */}
        <line x1={PAD} y1={98} x2={W - PAD} y2={98} stroke="var(--line)" strokeWidth="1" />
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line x1={px(t)} y1={98} x2={px(t)} y2={102} stroke="var(--line)" strokeWidth="1" />
            <text x={px(t)} y={113} textAnchor="middle" fontSize="9" fill="var(--ink-faint)" fontFamily="var(--mono)">{t}</text>
          </g>
        ))}
      </svg>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
        <div className="cast-res" style={{ minWidth: 78 }}><div className="lbl">Q1</div><div className="val">{tidy(s.q1)}</div></div>
        <div className="cast-res" style={{ minWidth: 78 }}><div className="lbl">median</div><div className="val">{tidy(s.med)}</div></div>
        <div className="cast-res" style={{ minWidth: 78 }}><div className="lbl">Q3</div><div className="val">{tidy(s.q3)}</div></div>
        <div className="cast-res ok" style={{ minWidth: 78 }}><div className="lbl">IQR</div><div className="val">{tidy(s.iqr)}</div></div>
        <div className={`cast-res ${s.outliers.length ? "no" : ""}`} style={{ minWidth: 96 }}>
          <div className="lbl">outliers</div><div className="val">{s.outliers.length ? s.outliers.join(", ") : "none"}</div>
        </div>
      </div>

      <input type="range" min={20} max={100} step={1} value={extreme} onChange={(e) => setExtreme(Number(e.target.value))}
             style={{ width: "100%", marginTop: 14, accentColor: "var(--teal)" }} />
      <p style={{ fontSize: 11.5, color: "var(--ink-faint)", margin: "8px 0 0", textAlign: "center" }}>
        the tenth value = <b>{extreme}</b> · past 40 the box stops moving entirely, and the value crosses the fence at 58.5
      </p>
    </div>
  );
}
