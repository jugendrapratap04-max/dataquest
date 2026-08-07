"use client";

import { useState } from "react";

/* The deployment bug that raises no error, made visible.
 *
 * deploy-model's debug task is a model that returns roughly the same answer for
 * every input because the scaler was fitted separately and never saved. Read as
 * prose it sounds like a filing mistake. The reason it destroys the predictions
 * is arithmetic, and arithmetic can be shown: the model learned its
 * coefficients against numbers sitting around 0, give or take 1 — and without
 * the scaler it is handed 250.
 *
 * NOTHING HERE IS HARDCODED. The mean and the standard deviation are computed
 * from TRAINING at render time, so the numbers cannot drift out of step with
 * the data they claim to describe. StandardScaler uses the population standard
 * deviation (ddof = 0), which is what `sd` below computes — the same definition
 * the lesson's practice problems are graded against. */

const TRAINING = [1, 2, 3, 100, 200, 300];
const QUERIES = [2, 50, 150, 250, 300];

const mean = TRAINING.reduce((a, b) => a + b, 0) / TRAINING.length;
const sd = Math.sqrt(TRAINING.reduce((a, b) => a + (b - mean) ** 2, 0) / TRAINING.length);

export function ScalerLeftBehind() {
  const [saved, setSaved] = useState(true);
  const [q, setQ] = useState(250);

  const scaled = (q - mean) / sd;
  const seen = saved ? scaled : q;
  /** How far outside the trained range the model is being pushed. */
  const offBy = Math.abs(q / (scaled === 0 ? 1 : scaled));

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">⚖️ The scaler that was left behind</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        The model was trained on <b>scaled</b> lead times. Take the scaler out of what you saved, and
        look at the number it is handed instead.
      </p>

      <div className="viz-controls">
        <div className="ss-stepper">
          <span className="ss-lbl">saved</span>
          <button className={`ss-step${saved ? " on" : ""}`} onClick={() => setSaved(true)}>
            Pipeline
          </button>
          <button className={`ss-step${!saved ? " on" : ""}`} onClick={() => setSaved(false)}>
            model only
          </button>
        </div>
      </div>

      <div className="viz-controls">
        <div className="ss-stepper">
          <span className="ss-lbl">lead time</span>
          {QUERIES.map((v) => (
            <button key={v} className={`ss-step${q === v ? " on" : ""}`} onClick={() => setQ(v)}>
              {v}d
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 8px" }}>
        the scaler learned mean <b>{mean.toFixed(1)}</b> and std <b>{sd.toFixed(1)}</b> from the training data
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "var(--panel-2)",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>the model receives</span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 22,
            fontWeight: 700,
            color: saved ? "var(--accent)" : "var(--bad, #DB3B3B)",
          }}
        >
          {saved ? scaled.toFixed(2) : q}
        </span>
        <span style={{ fontSize: 12.5, color: "var(--ink-faint)", marginLeft: "auto" }}>
          trained range ≈ −1.7 … +1.7
        </span>
      </div>

      <div
        style={{
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "var(--panel)",
          fontSize: 13,
        }}
      >
        {saved ? (
          <>
            <b>In range.</b> The scaler travelled with the model, so {q} became {scaled.toFixed(2)} —
            the kind of number the coefficients were actually fitted for.
          </>
        ) : (
          <>
            <b>{Math.round(offBy)}× outside the trained range.</b> The coefficients were learned for
            values near zero and are being applied to {q}. Every prediction is pushed to the same
            extreme, which is why the deployed app returns roughly the same answer whatever you type —{" "}
            <b>and why nothing raises an exception.</b> The model is working perfectly. It is being
            fed the wrong units.
          </>
        )}
      </div>

      <div className="viz-code" style={{ marginTop: 12 }}>
        <div style={{ color: saved ? "var(--ink-soft)" : "var(--bad, #DB3B3B)" }}>
          {saved
            ? "joblib.dump(pipe, \"model.joblib\")        # scaler + model, one object"
            : "joblib.dump(model, \"model.joblib\")       # the scaler stayed in the notebook"}
        </div>
      </div>
    </div>
  );
}
