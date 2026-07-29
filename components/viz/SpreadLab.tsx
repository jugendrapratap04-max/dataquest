"use client";

import { useState } from "react";

// Variance is taught as a formula and remembered as a formula, which is why
// nobody can say what it means. Shown as four columns — value, distance from the
// mean, that distance squared, and the running total — it stops being notation:
// you can see the far-away point contributing far more than the near ones, which
// is the entire reason the squaring is there.

type Set = { key: string; label: string; nums: number[]; note: string };

const SETS: Set[] = [
  {
    key: "tight",
    label: "tight",
    nums: [4, 5, 5, 6],
    note: "Everything sits near the mean, so every squared distance is small and the variance is tiny.",
  },
  {
    key: "spread",
    label: "spread out",
    nums: [1, 4, 6, 9],
    note: "Same mean, values further out. Nothing about the centre changed; only the spread did.",
  },
  {
    key: "outlier",
    label: "one outlier",
    nums: [4, 5, 5, 26],
    note: "One far value dominates. Its squared distance is larger than all the others put together - which is exactly why variance notices outliers so loudly.",
  },
];

const round2 = (n: number) => Math.round(n * 100) / 100;

export function SpreadLab() {
  const [set, setSet] = useState<Set>(SETS[0]);

  const mean = set.nums.reduce((a, b) => a + b, 0) / set.nums.length;
  const rows = set.nums.map((n) => {
    const diff = n - mean;
    return { n, diff, sq: diff * diff };
  });
  const totalSq = rows.reduce((a, r) => a + r.sq, 0);
  const variance = totalSq / set.nums.length;
  const stdev = Math.sqrt(variance);
  const biggest = Math.max(...rows.map((r) => r.sq));

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📏 Spread Lab — where variance comes from</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Every value&apos;s distance from the mean, squared, then averaged. That average is the
        variance.
      </p>

      <div className="viz-controls">
        <div className="ss-stepper">
          <span className="ss-lbl">data</span>
          {SETS.map((s) => (
            <button
              key={s.key}
              className={`ss-step${set.key === s.key ? " on" : ""}`}
              onClick={() => setSet(s)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 4, marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 11, color: "var(--ink-faint)", padding: "0 10px" }}>
          <span>value</span>
          <span>value - mean</span>
          <span>squared</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: r.sq === biggest && rows.length > 1 ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--panel-2)",
              fontFamily: "var(--mono)",
              fontSize: 12.5,
            }}
          >
            <span>{r.n}</span>
            <span style={{ color: "var(--ink-soft)" }}>{round2(r.diff)}</span>
            <span style={{ fontWeight: 700 }}>{round2(r.sq)}</span>
          </div>
        ))}
      </div>

      <div className="viz-code">
        <div>mean <span className="c-kw">=</span> {round2(mean)}</div>
        <div>total of squares <span className="c-kw">=</span> {round2(totalSq)}</div>
        <div>
          variance <span className="c-kw">=</span> {round2(totalSq)} / {set.nums.length}{" "}
          <span className="c-kw">=</span> <b>{round2(variance)}</b>
        </div>
        <div>
          std dev <span className="c-kw">=</span> sqrt({round2(variance)}){" "}
          <span className="c-kw">=</span> <b>{round2(stdev)}</b>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "12px 0 0" }}>{set.note}</p>
    </div>
  );
}
