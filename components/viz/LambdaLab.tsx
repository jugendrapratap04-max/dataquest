"use client";

import { useState } from "react";

/* Every number below was produced by running the operation in real Python 3.12.
 *
 * The confusion this targets: beginners think map, filter and sorted(key=…) are
 * three spellings of the same thing because they all take "a lambda". They are
 * not. The lambda does the SAME job in each — one value in, one value out — but
 * the function wrapped around it decides what you get back:
 *   map    → every element replaced by the lambda's result   (same count)
 *   filter → element kept only where the lambda is True       (fewer)
 *   sorted → reordered by the lambda's result, results hidden (same elements)
 * So the middle row — what the lambda computes per element — is drawn for all
 * three, because that is the part that is identical and the part beginners miss. */

const INPUT = [5, 2, 8, 1, 4];

type Op = {
  call: string;
  lam: string;
  per: (n: number) => number | boolean;   // what the lambda returns for one element
  kind: "map" | "filter" | "sorted";
  result: number[];
  note: string;
};

const OPS: Op[] = [
  {
    call: "map",
    lam: "lambda x: x * x",
    per: (x) => x * x,
    kind: "map",
    result: [25, 4, 64, 1, 16],
    note: "map replaces every element with the lambda's result. Five in, five out — the values change, the count does not.",
  },
  {
    call: "filter",
    lam: "lambda x: x % 2 == 0",
    per: (x) => x % 2 === 0,
    kind: "filter",
    result: [2, 8, 4],
    note: "filter keeps an element only where the lambda is True. The values are unchanged; the count shrinks.",
  },
  {
    call: "sorted",
    lam: "key=lambda x: -x",
    per: (x) => -x,
    kind: "sorted",
    result: [8, 5, 4, 2, 1],
    note: "sorted computes a key for each element, then orders by it. Sorting ascending by -x lands you in descending order — and the keys never appear in the output.",
  },
];

export function LambdaLab() {
  const [pick, setPick] = useState(0);
  const op = OPS[pick];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">λ Lambda Lab — the same one-liner, three different jobs</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        <code>nums = [5, 2, 8, 1, 4]</code>. Each button wraps a lambda in a different function. Watch
        the <b>middle row</b> — the lambda does the same kind of work every time; the wrapper decides
        what comes out.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {OPS.map((o, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>
            {o.call}(…)
          </button>
        ))}
      </div>

      <div className="lam-call">
        {op.kind === "sorted"
          ? <>sorted(nums, <b>{op.lam}</b>)</>
          : <>{op.call}(<b>{op.lam}</b>, nums)</>}
      </div>

      <div className="lam-flow">
        <div className="lam-lab">nums</div>
        <div className="lam-row">
          {INPUT.map((n, i) => <span key={i} className="lam-cell in">{n}</span>)}
        </div>

        <div className="lam-lab">lambda gives</div>
        <div className="lam-row" key={`m${pick}`}>
          {INPUT.map((n, i) => {
            const v = op.per(n);
            const isBool = typeof v === "boolean";
            return (
              <span key={i} className={`lam-cell mid ${isBool ? (v ? "keep" : "drop") : ""}`}>
                {isBool ? (v ? "True" : "False") : v}
              </span>
            );
          })}
        </div>

        <div className="lam-lab">
          {op.kind === "map" ? "map →" : op.kind === "filter" ? "filter →" : "sorted →"}
        </div>
        <div className="lam-row out" key={`o${pick}`}>
          {op.result.map((n, i) => <span key={i} className="lam-cell res">{n}</span>)}
          <span className="lam-count">
            {op.result.length === INPUT.length ? `${op.result.length} elements` : `${INPUT.length} → ${op.result.length}`}
          </span>
        </div>
      </div>

      <div className="imp-note" style={{ marginTop: 12 }}>{op.note}</div>
    </div>
  );
}
