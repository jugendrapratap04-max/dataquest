"use client";

import { useState } from "react";

/* Every result was checked against real Python 3.12 (6 & 3 == 2, 6 | 3 == 7,
 * 6 ^ 3 == 5, etc.). Bitwise operators are the one place beginners have no
 * mental picture at all, because the operators hide the thing they act on — the
 * bits. So this lines the two numbers up in binary and computes the result one
 * column at a time, with the rule for the current operator shown beside it. */

type Op = "&" | "|" | "^";

const OPS: Record<Op, { name: string; rule: string; bit: (a: number, b: number) => number }> = {
  "&": { name: "AND", rule: "1 only if BOTH bits are 1", bit: (a, b) => a & b },
  "|": { name: "OR", rule: "1 if EITHER bit is 1", bit: (a, b) => (a | b) },
  "^": { name: "XOR", rule: "1 if the bits DIFFER", bit: (a, b) => a ^ b },
};

const PAIRS: [number, number][] = [
  [6, 3],
  [12, 10],
  [5, 3],
];

const bits = (n: number) => n.toString(2).padStart(8, "0").split("").map(Number);

export function BitwiseLab() {
  const [op, setOp] = useState<Op>("&");
  const [pi, setPi] = useState(0);
  const [a, b] = PAIRS[pi];

  const A = bits(a);
  const B = bits(b);
  const O = OPS[op];
  const R = A.map((x, i) => O.bit(x, B[i]));
  const result = parseInt(R.join(""), 2);

  const Row = ({ label, val, arr, kind }: { label: string; val: number; arr: number[]; kind: string }) => (
    <div className={`bw-row ${kind}`}>
      <span className="bw-label">{label}</span>
      <span className="bw-dec">{val}</span>
      <span className="bw-bits">
        {arr.map((bit, i) => (
          <span key={i} className={`bw-bit ${bit ? "one" : "zero"}`}>{bit}</span>
        ))}
      </span>
    </div>
  );

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔢 Bitwise Lab — operators that work one bit at a time</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        A whole number is really a row of bits. <code>&amp;</code>, <code>|</code> and <code>^</code>{" "}
        line the two numbers up and combine them <b>column by column</b> — watch each bit decide the
        result below it.
      </p>

      <div className="viz-controls" style={{ marginBottom: 8 }}>
        {(Object.keys(OPS) as Op[]).map((o) => (
          <button key={o} className={`ss-preset ${op === o ? "on" : ""}`} onClick={() => setOp(o)}>
            {o} &nbsp;{OPS[o].name}
          </button>
        ))}
      </div>
      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {PAIRS.map(([x, y], i) => (
          <button key={i} className={`ss-preset ${pi === i ? "on" : ""}`} onClick={() => setPi(i)}>{x}, {y}</button>
        ))}
      </div>

      <div className="bw-grid" key={`${op}-${pi}`}>
        <Row label={`a = ${a}`} val={a} arr={A} kind="op" />
        <Row label={`b = ${b}`} val={b} arr={B} kind="op" />
        <div className="bw-opline"><span className="bw-opsym">{op}</span><span className="bw-oprule">{O.rule}</span></div>
        <Row label={`a ${op} b`} val={result} arr={R} kind="res" />
      </div>

      <div className="sf-result" style={{ marginTop: 12 }}>
        <span className="sf-rlabel">in Python</span>
        <span className="sf-rval">{a} {op} {b} = {result}</span>
      </div>
    </div>
  );
}
