"use client";

import { useState } from "react";

const OPS = ["+", "-", "*", "/", "//", "%", "**"] as const;
type Op = (typeof OPS)[number];

function compute(a: number, b: number, op: Op): string {
  try {
    switch (op) {
      case "+": return String(a + b);
      case "-": return String(a - b);
      case "*": return String(a * b);
      case "/": return b === 0 ? "ZeroDivisionError" : String(a / b);
      case "//": return b === 0 ? "ZeroDivisionError" : String(Math.floor(a / b));
      case "%": return b === 0 ? "ZeroDivisionError" : String(((a % b) + b) % b);
      case "**": return String(Math.pow(a, b));
    }
  } catch { return "error"; }
}

export function OperatorLab() {
  const [a, setA] = useState(17);
  const [b, setB] = useState(5);
  const [op, setOp] = useState<Op>("+");
  const res = compute(a, b, op);

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🧮 Operator Lab — hisaab live dekho</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Do numbers chuno, operator badlo, aur turant result dekho. <span className="kbd">//</span> = poora bhaag, <span className="kbd">%</span> = remainder, <span className="kbd">**</span> = power.
      </p>
      <div className="cast-flow">
        <input className="viz-input" style={{ width: 70 }} type="number" value={a} onChange={(e) => setA(Number(e.target.value))} />
        <select className="viz-input" value={op} onChange={(e) => setOp(e.target.value as Op)}>
          {OPS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <input className="viz-input" style={{ width: 70 }} type="number" value={b} onChange={(e) => setB(Number(e.target.value))} />
        <span className="cast-arrow">=</span>
        <div className={`cast-res ${res.includes("Error") ? "no" : "ok"}`}><div className="val">{res}</div></div>
      </div>
      <div className="viz-code" style={{ marginTop: 14 }}>
        <span className="c-fn">print</span>(<span className="c-num">{a}</span> {op} <span className="c-num">{b}</span>)  <span className="c-com"># {res}</span>
      </div>
    </div>
  );
}
