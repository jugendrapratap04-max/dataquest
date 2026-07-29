"use client";

import { useState } from "react";

// Why a test suite is worth writing, shown rather than argued: swap in three
// implementations of the same function and watch which assertions catch which
// bug. The middle one is the point — it passes the obvious case and fails only
// on the edge, which is exactly the bug a human reviewer waves through.

type Impl = {
  key: string;
  label: string;
  code: string;
  note: string;
  results: boolean[];
};

const CASES = [
  { call: "average([2, 4, 6])", expect: "4.0" },
  { call: "average([5])", expect: "5.0" },
  { call: "average([])", expect: "0.0" },
];

const IMPLS: Impl[] = [
  {
    key: "correct",
    label: "correct",
    code: "def average(nums):\n    if not nums:\n        return 0.0\n    return sum(nums) / len(nums)",
    note: "Handles the empty list, so all three assertions pass.",
    results: [true, true, true],
  },
  {
    key: "edge",
    label: "forgot the empty case",
    code: "def average(nums):\n    return sum(nums) / len(nums)",
    note: "Looks perfectly reasonable and works on real data. The empty list divides by zero — and that is the row that arrives at 2am.",
    results: [true, true, false],
  },
  {
    key: "wrong",
    label: "wrong operator",
    code: "def average(nums):\n    if not nums:\n        return 0.0\n    return sum(nums) // len(nums)",
    note: "Floor division instead of true division. The single-item case still passes, which is why one test is never enough.",
    results: [false, true, true],
  },
];

export function TestLab() {
  const [impl, setImpl] = useState<Impl>(IMPLS[0]);
  const passed = impl.results.filter(Boolean).length;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧪 Test Lab</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Three versions of the same function, one set of tests. Swap the implementation and see
        which assertion notices.
      </p>

      <div className="viz-controls">
        <div className="ss-stepper">
          <span className="ss-lbl">version</span>
          {IMPLS.map((i) => (
            <button
              key={i.key}
              className={`ss-step${impl.key === i.key ? " on" : ""}`}
              onClick={() => setImpl(i)}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      <div className="viz-code" style={{ marginBottom: 12, whiteSpace: "pre" }}>
        {impl.code}
      </div>

      <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        {CASES.map((c, i) => (
          <div
            key={c.call}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: impl.results[i] ? "rgba(31,168,90,.08)" : "rgba(219,59,59,.08)",
            }}
          >
            <span style={{ fontSize: 15 }}>{impl.results[i] ? "✅" : "❌"}</span>
            <code style={{ fontSize: 12.5 }}>
              assert {c.call} == {c.expect}
            </code>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
        <b>{passed}/3 passing.</b> {impl.note}
      </div>
    </div>
  );
}
