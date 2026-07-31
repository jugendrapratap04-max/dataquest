"use client";

import { useState } from "react";

/* Three panels for "Logical, compare and rotate".
 *
 *   MaskLab     AND clears, OR sets, XOR flips. Every student can recite that
 *               and far fewer can pick the mask, so the panel is built around
 *               choosing the mask and watching the columns rather than around
 *               the truth tables.
 *   RotateLab   the four rotates, and the only thing that matters about them:
 *               two are circular and two go through the carry. With the carry
 *               clear, RLC on 81H gives 03H and RAL gives 02H — one bit of
 *               difference that is a whole class of bug.
 *   CompareLab  CMP leaves the accumulator alone and answers three questions
 *               with two flags. Which jump follows is the examined part.
 *
 * Every value here was checked against lib/asm8085.ts. */

const hex2 = (v: number) => (v & 0xff).toString(16).toUpperCase().padStart(2, "0");
const bin8 = (v: number) => (v & 0xff).toString(2).padStart(8, "0");

/* ------------------------------------------------------- 1 · masks --- */

type MaskOp = "AND" | "OR" | "XOR";

const MASK_OPS: Record<MaskOp, { instr: string; rule: string; apply: (a: number, m: number) => number; why: string }> = {
  AND: {
    instr: "ANI", rule: "1 only if BOTH are 1", apply: (a, m) => a & m,
    why: "AND is how you CLEAR bits. A zero in the mask forces that column to zero; a one lets the original through untouched. So a mask of 0FH keeps the low digit and throws the high one away.",
  },
  OR: {
    instr: "ORI", rule: "1 if EITHER is 1", apply: (a, m) => a | m,
    why: "OR is how you SET bits. A one in the mask forces that column on; a zero leaves the original alone. So a mask of F0H turns the whole high digit on whatever it was.",
  },
  XOR: {
    instr: "XRI", rule: "1 if they DIFFER", apply: (a, m) => a ^ m,
    why: "XOR is how you FLIP bits. A one in the mask inverts that column; a zero leaves it. A mask of FFH flips everything, which is what CMA does in one byte — and XRA A with itself is the standard way to clear the accumulator.",
  },
};

const MASKS = [0x0f, 0xf0, 0xff, 0x80, 0x01];

export function MaskLab() {
  const [op, setOp] = useState<MaskOp>("AND");
  const [mi, setMi] = useState(0);
  const a = 0xa5;
  const m = MASKS[mi];
  const o = MASK_OPS[op];
  const r = o.apply(a, m) & 0xff;

  const rows: [string, number, string][] = [
    ["the accumulator", a, "var(--ink)"],
    [`the mask (${o.instr})`, m, "var(--accent-2)"],
    ["the result", r, "var(--good)"],
  ];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🎭 Masking — clear, set or flip, one column at a time</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        The accumulator holds <b>A5H</b>. Pick an operation and a mask, and read the columns
        downwards — every bit of the answer is decided by the two above it and nothing else.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 8, flexWrap: "wrap" }}>
        {(Object.keys(MASK_OPS) as MaskOp[]).map((k) => (
          <button
            key={k}
            className={`btn ${op === k ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 13px", fontSize: 12, fontFamily: "var(--mono)" }}
            onClick={() => setOp(k)}
          >
            {MASK_OPS[k].instr}
          </button>
        ))}
      </div>
      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {MASKS.map((x, ix) => (
          <button
            key={x}
            className={`btn ${ix === mi ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "4px 9px", fontSize: 11, fontFamily: "var(--mono)" }}
            onClick={() => setMi(ix)}
          >
            {hex2(x)}H
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12 }}>
        {rows.map(([label, value, tone], k) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 2px", borderTop: k === 2 ? "2px solid var(--line)" : k ? "1px solid var(--line)" : "none" }}>
            <span style={{ flex: "0 0 120px", fontSize: 10.5, color: "var(--ink-faint)" }}>{label}</span>
            <span style={{ flex: "0 0 40px", fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: tone }}>{hex2(value)}H</span>
            <span style={{ display: "flex", gap: 3 }}>
              {bin8(value).split("").map((b, i) => (
                <span
                  key={i}
                  style={{
                    width: 18, textAlign: "center", borderRadius: 3, fontFamily: "var(--mono)", fontSize: 11.5,
                    background: b === "1" ? (k === 2 ? "var(--good-soft)" : "var(--panel)") : "transparent",
                    border: `1px solid ${b === "1" ? (k === 2 ? "var(--good)" : "var(--line)") : "transparent"}`,
                    color: b === "1" ? "var(--ink)" : "var(--ink-faint)",
                  }}
                >
                  {b}
                </span>
              ))}
            </span>
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 8, fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-faint)" }}>
          rule: {o.rule}
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>{o.why}</div>
      </div>

      <div className="note warn" style={{ marginTop: 10 }}>
        <span className="i">⚠️</span>
        <div>
          <b>The flags these set are not all about the result.</b> <code>ANA</code> and{" "}
          <code>ANI</code> always set AC and clear CY whatever the operands; <code>ORA</code> and{" "}
          <code>XRA</code> clear both. Only S, Z and P describe what actually came out.
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------- 2 · rotates --- */

type Rot = { id: string; instr: string; circular: boolean; what: string };

const ROTS: Rot[] = [
  { id: "rlc", instr: "RLC", circular: true, what: "Rotate left, circular. Bit 7 wraps round to bit 0 and is also copied into the carry. The carry is a spectator — its old value plays no part." },
  { id: "rrc", instr: "RRC", circular: true, what: "Rotate right, circular. Bit 0 wraps round to bit 7 and is copied into the carry. Four of these swap the two hex digits, which is the standard nibble swap." },
  { id: "ral", instr: "RAL", circular: false, what: "Rotate left through the carry. Bit 7 goes into the carry and the OLD carry comes in at bit 0, so the carry is part of the ring — nine bits rotating, not eight." },
  { id: "rar", instr: "RAR", circular: false, what: "Rotate right through the carry. Bit 0 goes into the carry and the old carry comes in at bit 7. This is the one used for multi-byte shifts, because the bit leaving one byte arrives in the next." },
];

function rotate(instr: string, v: number, cy: number): [number, number] {
  const b = v & 0xff;
  if (instr === "RLC") return [((b << 1) | (b >> 7)) & 0xff, (b >> 7) & 1];
  if (instr === "RRC") return [((b >> 1) | (b << 7)) & 0xff, b & 1];
  if (instr === "RAL") return [((b << 1) | cy) & 0xff, (b >> 7) & 1];
  return [((b >> 1) | (cy << 7)) & 0xff, b & 1];
}

export function RotateLab() {
  const [i, setI] = useState(0);
  const [cyIn, setCyIn] = useState(0);
  const r = ROTS[i];
  const start = 0x81;
  const [out, cyOut] = rotate(r.instr, start, cyIn);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔄 Four rotates, and the one difference that matters</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        The accumulator holds <b>81H</b>. Two of these rotate eight bits in a ring; two rotate{" "}
        <b>nine</b>, because the carry joins the ring. Switch the incoming carry and watch which ones
        care.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 8, flexWrap: "wrap" }}>
        {ROTS.map((x, ix) => (
          <button
            key={x.id}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 13px", fontSize: 12, fontFamily: "var(--mono)" }}
            onClick={() => setI(ix)}
          >
            {x.instr}
          </button>
        ))}
      </div>
      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12 }}>
        <button
          className={`btn ${cyIn ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "5px 13px", fontSize: 11.5, fontFamily: "var(--mono)" }}
          onClick={() => setCyIn((c) => (c ? 0 : 1))}
        >
          carry in = {cyIn}
        </button>
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12 }}>
        {([["before", start, cyIn], ["after", out, cyOut]] as const).map(([label, v, c], k) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 2px", borderTop: k ? "2px solid var(--line)" : "none" }}>
            <span style={{ flex: "0 0 46px", fontSize: 10.5, color: "var(--ink-faint)" }}>{label}</span>
            <span style={{ flex: "0 0 38px", fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: k ? "var(--good)" : "var(--ink)" }}>{hex2(v)}H</span>
            <span style={{ display: "flex", gap: 3 }}>
              {bin8(v).split("").map((b, x) => (
                <span key={x} style={{ width: 18, textAlign: "center", fontFamily: "var(--mono)", fontSize: 11.5, color: b === "1" ? "var(--ink)" : "var(--ink-faint)" }}>{b}</span>
              ))}
            </span>
            <span
              style={{
                marginLeft: 6, padding: "3px 8px", borderRadius: 5, fontFamily: "var(--mono)", fontSize: 11,
                background: r.circular ? "var(--panel)" : "var(--accent-soft)",
                border: `1px solid ${r.circular ? "var(--line)" : "var(--accent)"}`,
                color: "var(--ink)",
              }}
            >
              CY {c}
            </span>
          </div>
        ))}
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>{r.instr} — {r.circular ? "eight bits in a ring" : "nine bits in a ring"}.</b> {r.what}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Set <b>carry in = 0</b> and compare <code>RLC</code> with <code>RAL</code>: 03H against
          02H. One bit of difference, and it is the whole distinction — <code>RLC</code> brought bit
          7 round to bit 0, while <code>RAL</code> brought the old carry in instead. All four affect{" "}
          <b>only the carry flag</b>.
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------- 3 · compare --- */

const CMP_CASES: [number, number][] = [
  [0x3c, 0x4a],
  [0x4a, 0x3c],
  [0x3c, 0x3c],
];

export function CompareLab() {
  const [i, setI] = useState(0);
  const [a, b] = CMP_CASES[i];
  const equal = a === b;
  const smaller = a < b;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">⚖️ <code>CMP</code> — three answers from two flags</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        A comparison is a subtraction whose answer is thrown away. The accumulator survives, and two
        flags carry the verdict — which is why <b>three</b> outcomes need <b>two</b> bits.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {CMP_CASES.map(([x, y], ix) => (
          <button
            key={ix}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 11px", fontSize: 11.5, fontFamily: "var(--mono)" }}
            onClick={() => setI(ix)}
          >
            A={hex2(x)}H, B={hex2(y)}H
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 14 }}>
        <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 15, color: "var(--ink)", marginBottom: 10 }}>
          MVI A, {hex2(a)}H &nbsp;·&nbsp; CMP B &nbsp;&nbsp;(B = {hex2(b)}H)
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { k: "A afterwards", v: `${hex2(a)}H`, tone: "var(--teal)", sub: "untouched" },
            { k: "Z", v: equal ? "1" : "0", tone: equal ? "var(--good)" : "var(--line)", sub: equal ? "they are equal" : "not equal" },
            { k: "CY", v: smaller ? "1" : "0", tone: smaller ? "var(--bad)" : "var(--line)", sub: smaller ? "A was smaller" : "A was not smaller" },
          ].map((x) => (
            <div key={x.k} style={{ flex: "1 1 110px", border: `1px solid ${x.tone}`, borderRadius: 9, background: "var(--panel)", padding: "9px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: x.tone }}>{x.k.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 19, fontWeight: 700, color: "var(--ink)" }}>{x.v}</div>
              <div style={{ fontSize: 10, color: "var(--ink-faint)" }}>{x.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 12, fontFamily: "var(--mono)", fontSize: 13, color: "var(--accent-2)" }}>
          the jump that fires: {equal ? "JZ" : smaller ? "JC" : "JNC (and not JZ)"}
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          {equal ? (
            <>
              <b>Equal, so the subtraction gave zero</b> and Z came on. The carry is clear because
              nothing had to be borrowed. <code>JZ</code> is the test for equality, and it is the only
              one of the three outcomes that a single flag identifies on its own.
            </>
          ) : smaller ? (
            <>
              <b>A was the smaller one, so the subtraction borrowed</b> and CY came on. This is the
              direction people reverse: <code>JC</code>{" "}
              after a compare means &ldquo;the accumulator was less than the operand&rdquo;.
            </>
          ) : (
            <>
              <b>A was the larger one.</b> No borrow, so CY is clear, and the result was not zero, so
              Z is clear too. &ldquo;Greater than&rdquo; is the only outcome that needs both flags
              tested — <code>JNC</code> alone would also accept equal.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          <code>CMP</code> leaves the accumulator alone, which is what lets it hold a running leader
          while everything else is compared against it — the largest-byte loop from lesson 15. Use{" "}
          <code>CPI</code> when the value being compared against is a constant.
        </div>
      </div>
    </div>
  );
}
