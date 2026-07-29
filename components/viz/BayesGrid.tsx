"use client";

import { useMemo, useState } from "react";

// Natural frequencies rather than probabilities, which is the whole point.
// "1% prevalence, 99% sensitivity" is nearly impossible to reason about; "99
// sick people test positive and so do 495 healthy ones" is not. The research
// this rests on (Gigerenzer) found doctors who got the probability version
// wrong answered correctly once the same facts were given as counts.
const POP = 10000;
const W = 340, BAR_H = 26, PAD = 12;

export function BayesGrid() {
  const [prevPct, setPrevPct] = useState(1);      // % of the population who are ill
  const [specPct, setSpecPct] = useState(95);     // % of healthy people correctly cleared
  const SENS = 0.99;                              // sensitivity held fixed; the slider that surprises people is prevalence

  const s = useMemo(() => {
    const prev = prevPct / 100, spec = specPct / 100;
    const sick = POP * prev;
    const well = POP - sick;
    const tp = Math.round(sick * SENS);
    const fn = Math.round(sick - sick * SENS);
    const fp = Math.round(well * (1 - spec));
    const tn = Math.round(well - well * (1 - spec));
    const positives = tp + fp;
    return { sick: Math.round(sick), well: Math.round(well), tp, fn, fp, tn, positives, ppv: positives ? (tp / positives) * 100 : 0 };
  }, [prevPct, specPct]);

  const inner = W - 2 * PAD;
  const sickW = Math.max(s.sick > 0 ? 1.5 : 0, (s.sick / POP) * inner);
  const tpW = s.positives ? Math.max(1.5, (s.tp / s.positives) * inner) : 0;

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🧪 Bayes — what a positive test actually means</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Ten thousand people are tested. The test catches <b>99%</b> of those who are ill. Move the sliders and read the bottom bar — of everyone who tests <b>positive</b>, how many are actually ill?
      </p>

      <svg viewBox={`0 0 ${W} 128`} width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
        <text x={PAD} y="12" fontSize="9.5" fill="var(--ink-faint)" fontFamily="var(--mono)">all 10,000 people tested</text>
        <rect x={PAD} y="18" width={inner} height={BAR_H} rx="3" fill="color-mix(in srgb, var(--teal) 18%, transparent)" stroke="var(--line)" />
        <rect x={PAD} y="18" width={sickW} height={BAR_H} rx="3" fill="var(--bad)" fillOpacity="0.8" />
        <text x={PAD + 6} y="35" fontSize="9.5" fill="var(--ink-soft)" fontFamily="var(--mono)">{s.sick} ill</text>
        <text x={W - PAD - 6} y="35" textAnchor="end" fontSize="9.5" fill="var(--ink-soft)" fontFamily="var(--mono)">{s.well} healthy</text>

        <text x={PAD} y="66" fontSize="9.5" fill="var(--ink-faint)" fontFamily="var(--mono)">
          of the {s.positives} who tested POSITIVE
        </text>
        <rect x={PAD} y="72" width={inner} height={BAR_H} rx="3" fill="color-mix(in srgb, var(--accent) 22%, transparent)" stroke="var(--line)" />
        <rect x={PAD} y="72" width={tpW} height={BAR_H} rx="3" fill="var(--bad)" fillOpacity="0.85" />
        <text x={PAD + 6} y="89" fontSize="9.5" fill="var(--ink-soft)" fontFamily="var(--mono)">{s.tp} truly ill</text>
        <text x={W - PAD - 6} y="89" textAnchor="end" fontSize="9.5" fill="var(--ink-soft)" fontFamily="var(--mono)">{s.fp} false alarms</text>

        <text x={W / 2} y="118" textAnchor="middle" fontSize="10" fill="var(--ink-faint)" fontFamily="var(--mono)">
          {s.fn} ill people were missed by the test
        </text>
      </svg>

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
        <div className={`cast-res ${s.ppv < 50 ? "no" : "ok"}`} style={{ minWidth: 150 }}>
          <div className="lbl">P(ill | positive)</div><div className="val">{s.ppv.toFixed(1)}%</div>
        </div>
        <div className="cast-res" style={{ minWidth: 96 }}><div className="lbl">true positives</div><div className="val">{s.tp}</div></div>
        <div className="cast-res" style={{ minWidth: 96 }}><div className="lbl">false positives</div><div className="val">{s.fp}</div></div>
      </div>

      <div className="viz-controls" style={{ flexDirection: "column", gap: 10, marginTop: 14 }}>
        <label style={{ fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)" }}>
          how common the illness is: <b>{prevPct}%</b>
          <input type="range" min={0.1} max={50} step={0.1} value={prevPct} onChange={(e) => setPrevPct(Number(e.target.value))}
                 style={{ width: "100%", marginTop: 4, accentColor: "var(--bad)" }} />
        </label>
        <label style={{ fontSize: 11.5, color: "var(--ink-soft)", fontFamily: "var(--mono)" }}>
          how well it clears healthy people (specificity): <b>{specPct}%</b>
          <input type="range" min={80} max={100} step={0.5} value={specPct} onChange={(e) => setSpecPct(Number(e.target.value))}
                 style={{ width: "100%", marginTop: 4, accentColor: "var(--teal)" }} />
        </label>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        At <b>1%</b> prevalence and <b>95%</b> specificity, a 99%-accurate test still leaves you with 99 real cases against 495 false alarms — so a positive result means about a <b>1 in 6</b> chance of being ill. Nothing is wrong with the test. The rarer the illness, the more of its positives are healthy people.
      </div></div>
    </div>
  );
}
