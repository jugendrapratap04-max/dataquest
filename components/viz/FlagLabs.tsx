"use client";

import { useState } from "react";

/* Three panels for "The flag register, bit by bit".
 *
 * Lesson 4 introduced the flags as five questions the processor answers. This
 * lesson is the version that gets examined, and it needs three things a
 * paragraph cannot give:
 *
 *   FlagLab         the flags are a BYTE, with fixed bits in the gaps. "What is
 *                   the PSW after this operation" is a standard question and it
 *                   is unanswerable without seeing the layout.
 *   FlagEffectsLab  which instruction touches which flag. This is pure lookup,
 *                   and a table you can press beats a table you must read —
 *                   especially since the whole value is in the exceptions.
 *   DaaLab          why AC exists at all. It is the one flag with no use until
 *                   BCD arithmetic turns up, and DAA is where it earns its place.
 *
 * Every number here matches lib/asm8085.ts, which is where the flag rules
 * actually live: AC is a carry out of bit 3, sub sets AC as NOT-borrow, ANA
 * always sets AC and clears CY, XRA and ORA clear both. The PSW byte 16H for
 * 3CH + 3CH was taken from a real PUSH PSW in the lesson's own code block. */

const hex2 = (v: number) => (v & 0xff).toString(16).toUpperCase().padStart(2, "0");
const parityEven = (v: number) => {
  let n = 0;
  for (let i = 0; i < 8; i++) if ((v >> i) & 1) n++;
  return n % 2 === 0;
};

/* ------------------------------------------------- 1 · the flag byte --- */

type OpId = "ADD" | "SUB" | "ANA" | "XRA";

const PAIRS: [number, number][] = [
  [0x3c, 0x3c],
  [0x0f, 0x01],
  [0xf0, 0x3c],
  [0x05, 0x09],
  [0x80, 0x80],
];

/** The same rules lib/asm8085.ts applies, written out once. */
function evaluate(op: OpId, a: number, b: number) {
  let v = 0;
  let cy = false;
  let ac = false;
  if (op === "ADD") {
    const raw = a + b;
    cy = raw > 0xff;
    ac = (a & 0x0f) + (b & 0x0f) > 0x0f;
    v = raw & 0xff;
  } else if (op === "SUB") {
    const raw = a - b;
    cy = raw < 0;
    ac = !((a & 0x0f) - (b & 0x0f) < 0);
    v = raw & 0xff;
  } else if (op === "ANA") {
    v = a & b;
    cy = false;
    ac = true;
  } else {
    v = a ^ b;
    cy = false;
    ac = false;
  }
  return { v, S: (v & 0x80) !== 0, Z: v === 0, AC: ac, P: parityEven(v), CY: cy };
}

/** Bit 7 down to bit 0. Three of them are not flags at all. */
const PSW_BITS = [
  { bit: 7, name: "S", flag: true },
  { bit: 6, name: "Z", flag: true },
  { bit: 5, name: "0", flag: false },
  { bit: 4, name: "AC", flag: true },
  { bit: 3, name: "0", flag: false },
  { bit: 2, name: "P", flag: true },
  { bit: 1, name: "1", flag: false },
  { bit: 0, name: "CY", flag: true },
];

export function FlagLab() {
  const [op, setOp] = useState<OpId>("ADD");
  const [i, setI] = useState(0);
  const [a, b] = PAIRS[i];
  const r = evaluate(op, a, b);

  const bitValue = (name: string) => {
    if (name === "0") return 0;
    if (name === "1") return 1;
    return (r as unknown as Record<string, boolean>)[name] ? 1 : 0;
  };
  const psw = PSW_BITS.reduce((acc, x) => acc | (bitValue(x.name) << x.bit), 0);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🚩 The flags are a byte — here is where each one sits</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Pick an operation and a pair of bytes. Five of the eight bits are flags; the other three are
        wired to fixed values and are the reason the flag byte looks odd in hex.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 8, flexWrap: "wrap" }}>
        {(["ADD", "SUB", "ANA", "XRA"] as OpId[]).map((o) => (
          <button
            key={o}
            className={`btn ${op === o ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 12px", fontSize: 11.5, fontFamily: "var(--mono)" }}
            onClick={() => setOp(o)}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {PAIRS.map(([x, y], ix) => (
          <button
            key={ix}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "4px 9px", fontSize: 11, fontFamily: "var(--mono)" }}
            onClick={() => setI(ix)}
          >
            {hex2(x)}H, {hex2(y)}H
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 14 }}>
        <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-soft)", marginBottom: 12 }}>
          A = {hex2(a)}H, operand = {hex2(b)}H &nbsp;→&nbsp; {op} &nbsp;→&nbsp;{" "}
          <b style={{ color: "var(--accent-2)", fontSize: 16 }}>A = {hex2(r.v)}H</b>
        </div>

        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
          {PSW_BITS.map((x) => {
            const on = bitValue(x.name) === 1;
            const tone = !x.flag ? "var(--line)" : on ? "var(--good)" : "var(--line)";
            return (
              <div key={x.bit} style={{ textAlign: "center", opacity: x.flag ? 1 : 0.55 }}>
                <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>bit {x.bit}</div>
                <div
                  style={{
                    width: 40, padding: "7px 0", borderRadius: 7, marginTop: 2,
                    background: on && x.flag ? "var(--good-soft)" : "var(--panel)",
                    border: `${on && x.flag ? 2 : 1}px solid ${tone}`,
                    fontFamily: "var(--mono)", fontSize: 17, fontWeight: 700, color: "var(--ink)",
                  }}
                >
                  {bitValue(x.name)}
                </div>
                <div style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: x.flag ? "var(--ink)" : "var(--ink-faint)", marginTop: 2 }}>
                  {x.flag ? x.name : "—"}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-faint)" }}>which makes the flag byte</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 700, color: "var(--teal)" }}>{hex2(psw)}H</div>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          {op === "ANA" ? (
            <>
              <b><code>ANA</code> is the odd one out.</b> It <i>always</i> sets AC and <i>always</i>{" "}
              clears CY, whatever the operands — the flags are not describing the result here, they
              are describing the instruction. This is a real 8085 quirk and it is examined.
            </>
          ) : op === "XRA" ? (
            <>
              <b><code>XRA</code> and <code>ORA</code> clear both CY and AC</b>, every time. That is
              why <code>XRA A</code> is the standard way to clear the accumulator <i>and</i> the
              carry in one instruction.
            </>
          ) : (
            <>
              <b>AC is a carry out of bit 3</b> — the boundary between the two hex digits — and it is
              the only flag no conditional jump can test. There is no <code>JAC</code>. Its one job is
              telling <code>DAA</code> what to do, which is the third panel on this page.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          The three grey bits never move: <b>bit 5 is always 0, bit 3 is always 0, bit 1 is always
          1</b>. That last one is why a flag byte is always odd-looking in hex, and why a PSW with no
          flags set at all reads <b>02H</b> rather than 00H.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------- 2 · which instruction touches what --- */

type Effect = { id: string; s: boolean; z: boolean; ac: boolean; p: boolean; cy: boolean; note: string };

const EFFECTS: Effect[] = [
  { id: "ADD / ADI / SUB / SUI", s: true, z: true, ac: true, p: true, cy: true, note: "Ordinary arithmetic through the ALU. All five, every time — this is the baseline everything else is an exception to." },
  { id: "INR / DCR", s: true, z: true, ac: true, p: true, cy: false, note: "Four out of five: everything EXCEPT the carry. They are counting instructions, and a loop counter that overwrote the carry would make it impossible to carry a value across the loop." },
  { id: "INX / DCX", s: false, z: false, ac: false, p: false, cy: false, note: "None at all. These are 16-bit and go through the incrementer rather than the ALU — a block with nothing wired to the flag flip-flops. INX H on FFFFH gives 0000H and the zero flag does not move." },
  { id: "DAD", s: false, z: false, ac: false, p: false, cy: true, note: "The carry only. So DAD followed by JZ is testing whatever the previous ALU instruction left behind — a stale answer that looks right whenever it happens to be." },
  { id: "ANA / ANI", s: true, z: true, ac: true, p: true, cy: true, note: "All five, but two of them are not describing the result: AC is always SET and CY is always CLEARED, whatever the operands. A genuine 8085 quirk." },
  { id: "ORA / XRA", s: true, z: true, ac: true, p: true, cy: true, note: "All five, with CY and AC always cleared. This is why XRA A is the idiomatic way to zero the accumulator and the carry together." },
  { id: "CMP / CPI", s: true, z: true, ac: true, p: true, cy: true, note: "All five — it is a subtraction. The difference is that the answer is discarded, so the accumulator survives and only the verdict is kept." },
  { id: "MOV / MVI / LDA / STA", s: false, z: false, ac: false, p: false, cy: false, note: "Data transfer touches nothing. Moving a byte is not arithmetic, so flags set before a MOV are still there after it — which is what makes a MOV safe between a compare and a conditional jump." },
  { id: "CMA", s: false, z: false, ac: false, p: false, cy: false, note: "Complement the accumulator and change no flag at all. Easy to assume it sets the sign flag, since it certainly changes the top bit. It does not." },
  { id: "STC / CMC", s: false, z: false, ac: false, p: false, cy: true, note: "The two instructions whose entire job is the carry flag: set it, or complement it. Nothing else moves." },
  { id: "RLC / RRC / RAL / RAR", s: false, z: false, ac: false, p: false, cy: true, note: "Rotates affect only the carry, which receives the bit that fell off the end. The result can be zero and the zero flag will not notice." },
];

const FLAG_KEYS = ["s", "z", "ac", "p", "cy"] as const;
const FLAG_NAMES = ["S", "Z", "AC", "P", "CY"];

export function FlagEffectsLab() {
  const [i, setI] = useState(0);
  const e = EFFECTS[i];
  const count = FLAG_KEYS.filter((k) => e[k]).length;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🎛️ Which instruction touches which flag</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        The rule is &ldquo;arithmetic sets all five&rdquo; and the marks are in the exceptions. Work
        down the list and watch which lights go out.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {EFFECTS.map((x, ix) => (
          <button
            key={x.id}
            onClick={() => setI(ix)}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", cursor: "pointer",
              padding: "6px 9px", borderRadius: 8, textAlign: "left",
              background: ix === i ? "var(--accent-soft)" : "transparent",
              border: `1px solid ${ix === i ? "var(--accent)" : "var(--line)"}`,
              color: "var(--ink)",
            }}
          >
            <span style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 11.5 }}>{x.id}</span>
            <span style={{ display: "flex", gap: 3 }}>
              {FLAG_KEYS.map((k, fi) => (
                <span
                  key={k}
                  style={{
                    width: 28, textAlign: "center", padding: "2px 0", borderRadius: 5,
                    fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                    background: x[k] ? "var(--good-soft)" : "var(--panel-2)",
                    border: `1px solid ${x[k] ? "var(--good)" : "var(--line)"}`,
                    color: x[k] ? "var(--ink)" : "var(--ink-faint)",
                  }}
                >
                  {FLAG_NAMES[fi]}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          <b>{e.id} — {count} of 5.</b> {e.note}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Three of these are asked about far more than the rest: <b><code>INR</code> and{" "}
          <code>DCR</code> leave the carry alone</b>, <b><code>INX</code> and <code>DCX</code> set
          nothing</b>, and <b><code>DAD</code> sets only the carry</b>. Every one of the three is a
          consequence of which block did the arithmetic, which is lesson 7.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ 3 · why AC exists --- */

type Bcd = { a: number; b: number; add: number; label: string };

const BCD_CASES: Bcd[] = [
  { a: 0x27, b: 0x15, add: 0x06, label: "27 + 15" },
  { a: 0x08, b: 0x09, add: 0x06, label: "08 + 09" },
  { a: 0x38, b: 0x45, add: 0x06, label: "38 + 45" },
  { a: 0x99, b: 0x01, add: 0x66, label: "99 + 01" },
];

export function DaaLab() {
  const [i, setI] = useState(0);
  const c = BCD_CASES[i];
  const raw = (c.a + c.b) & 0xff;
  const rawAc = (c.a & 0x0f) + (c.b & 0x0f) > 0x0f;
  const fixed = (raw + c.add) & 0xff;
  const carried = raw + c.add > 0xff;
  const decimal = (v: number) => `${v >> 4}${v & 0x0f}`;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔟 What AC is actually for — BCD and <code>DAA</code></span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        In <b>BCD</b> each hex digit holds one decimal digit, so 27H means twenty-seven. The ALU does
        not know that. Watch what the raw sum gives, and what <code>DAA</code> has to add to fix it.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {BCD_CASES.map((x, ix) => (
          <button
            key={x.label}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 11px", fontSize: 11.5, fontFamily: "var(--mono)" }}
            onClick={() => setI(ix)}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 14 }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", textAlign: "center" }}>
          {[
            { k: "the raw sum", v: `${hex2(raw)}H`, sub: `AC = ${rawAc ? 1 : 0}`, tone: "var(--bad)" },
            { k: "DAA adds", v: `${hex2(c.add)}H`, sub: c.add === 0x66 ? "both digits" : "the low digit", tone: "var(--ink-faint)" },
            { k: "the answer", v: `${hex2(fixed)}H`, sub: `reads as ${decimal(fixed)}${carried ? " with a carry" : ""}`, tone: "var(--good)" },
          ].map((x) => (
            <div key={x.k} style={{ flex: "1 1 120px", border: `1px solid ${x.tone}`, borderRadius: 9, background: "var(--panel)", padding: "9px 10px" }}>
              <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: x.tone }}>{x.k.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 21, fontWeight: 700 }}>{x.v}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>{x.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 12, fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--ink-soft)" }}>
          in decimal: {decimal(c.a)} + {decimal(c.b)} = {carried ? "1" : ""}{decimal(fixed)}
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          {c.a === 0x08 ? (
            <>
              <b>This is the case AC exists for.</b>{" "}
              08H + 09H is 11H, and nothing about 11H looks wrong — both digits are valid, so
              &ldquo;is a digit above 9&rdquo; would not catch it.
              The only evidence that the low digit overflowed is <b>AC = 1</b>, and that is what tells{" "}
              <code>DAA</code> to add 6 and turn 11H into 17H, which is the right answer.
            </>
          ) : c.a === 0x99 ? (
            <>
              <b>Both digits need fixing.</b> 99H + 01H is 9AH — A is not a decimal digit — so 6 goes
              on the low digit, which then pushes the high digit past 9 too. <code>DAA</code> adds
              66H, the answer wraps to 00H, and the <b>carry flag</b> carries the hundred.
            </>
          ) : (
            <>
              The raw sum is <b>{hex2(raw)}H</b>, and its low digit is above 9 — a hex digit that is
              not a decimal one. <code>DAA</code> adds 6 to it, which carries into the high digit and
              gives <b>{hex2(fixed)}H</b>, reading as {decimal(fixed)}.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          <code>DAA</code> is the only instruction that reads the auxiliary carry, and AC is the only
          flag no conditional jump can test — there is no <code>JAC</code>. The two exist for each
          other, which is why AC looks pointless until BCD turns up and then becomes the whole
          mechanism.
        </div>
      </div>
    </div>
  );
}
