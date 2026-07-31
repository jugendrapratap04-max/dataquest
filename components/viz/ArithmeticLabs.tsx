"use client";

import { useState } from "react";

/* Two panels for "Arithmetic and the flags".
 *
 *   SubBorrowLab  why the carry flag means BORROW after a subtraction. The 8085
 *                 has no subtractor — it adds the two's complement and inverts
 *                 the carry out. Every worked example here was checked against
 *                 lib/asm8085.ts: 3CH - 4AH gives F2H with CY = 1, and
 *                 4AH - 3CH gives 0EH with CY = 0.
 *   SignedLab     the same byte read two ways. The processor has no idea which
 *                 you meant, which is why the flag you test depends on a
 *                 decision made in your head rather than in the machine.
 *
 * Both exist because these are the two things students get wrong about 8085
 * arithmetic long after they can add two numbers correctly. */

const hex2 = (v: number) => (v & 0xff).toString(16).toUpperCase().padStart(2, "0");
const bin8 = (v: number) => (v & 0xff).toString(2).padStart(8, "0");

/* --------------------------------------- 1 · subtraction is addition --- */

const PAIRS: [number, number][] = [
  [0x3c, 0x4a],
  [0x4a, 0x3c],
  [0x05, 0x05],
  [0x00, 0x01],
];

export function SubBorrowLab() {
  const [i, setI] = useState(0);
  const [a, b] = PAIRS[i];
  const comp = (~b + 1) & 0xff;
  const raw = a + comp;
  const carryOut = raw > 0xff ? 1 : 0;
  const result = raw & 0xff;
  const borrow = carryOut ? 0 : 1;

  const rows: [string, string, string][] = [
    ["the accumulator", hex2(a), bin8(a)],
    ["what is subtracted", hex2(b), bin8(b)],
    ["its two's complement", hex2(comp), bin8(comp)],
    ["added together", hex2(result), bin8(result)],
  ];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">➖ There is no subtractor — watch it add instead</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        The ALU only adds. A subtraction is the <b>two&apos;s complement</b> of the second operand,
        added to the first — and the carry that falls out means the opposite of what you would expect.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {PAIRS.map(([x, y], ix) => (
          <button
            key={ix}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 11px", fontSize: 11.5, fontFamily: "var(--mono)" }}
            onClick={() => setI(ix)}
          >
            {hex2(x)}H − {hex2(y)}H
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12 }}>
        {rows.map(([label, hex, bin], k) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 2px", borderTop: k ? "1px solid var(--line)" : "none" }}>
            <span style={{ flex: "0 0 150px", fontSize: 10.5, color: "var(--ink-faint)" }}>{label}</span>
            <span style={{ flex: "0 0 40px", fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: k === 3 ? "var(--accent-2)" : "var(--ink)" }}>{hex}H</span>
            <span style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-faint)", letterSpacing: ".08em" }}>{bin}</span>
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 130px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--panel)", padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>CARRY OUT OF THE ADD</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{carryOut}</div>
          </div>
          <div style={{ flex: "1 1 130px", border: `2px solid ${borrow ? "var(--bad)" : "var(--good)"}`, borderRadius: 9, background: "var(--panel)", padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: borrow ? "var(--bad)" : "var(--good)" }}>CY FLAG AFTER SUB</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{borrow}</div>
          </div>
        </div>
      </div>

      <div className={`note ${borrow ? "warn" : "key"}`} style={{ marginTop: 12 }}>
        <span className="i">{borrow ? "⚠️" : "📌"}</span>
        <div>
          {borrow ? (
            <>
              <b>{hex2(a)}H is smaller than {hex2(b)}H, so the subtraction borrowed.</b> The addition
              produced no carry out, and the processor <b>inverts</b> it before storing — so{" "}
              <code>CY = 1</code> after a <code>SUB</code> means the accumulator was the smaller one.
              The answer {hex2(result)}H is what the negative result looks like wrapped into a byte.
            </>
          ) : (
            <>
              <b>No borrow.</b> The addition carried out of the top bit, the processor inverted it,
              and <code>CY</code> came out 0 — which after a subtraction means the accumulator was
              greater than or equal to what was taken from it. That inversion is why{" "}
              <code>JC</code> after a <code>CMP</code> means &ldquo;jump if A was smaller&rdquo;.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          This is also why <code>SBB</code> exists. When a multi-byte subtraction borrows out of one
          byte, that borrow has to be taken off the next one up — and <code>SBB</code> is the
          instruction that subtracts the carry flag along with its operand, exactly as{" "}
          <code>ADC</code> adds it.
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------- 2 · signed or not --- */

const BYTES = [0x7f, 0x80, 0xf2, 0x00, 0xff];

export function SignedLab() {
  const [i, setI] = useState(0);
  const v = BYTES[i];
  const signed = v > 0x7f ? v - 0x100 : v;
  const negative = v > 0x7f;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">± The same byte, two readings</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        A byte is eight switches. Whether it means 0 to 255 or −128 to +127 is a decision{" "}
        <b>your program makes</b> — the processor stores the same bits either way.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {BYTES.map((b, ix) => (
          <button
            key={b}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 11px", fontSize: 11.5, fontFamily: "var(--mono)" }}
            onClick={() => setI(ix)}
          >
            {hex2(b)}H
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 14 }}>
        <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, letterSpacing: ".1em", color: "var(--ink)" }}>
          {bin8(v)}
        </div>
        <div style={{ textAlign: "center", fontSize: 10.5, color: "var(--ink-faint)", marginTop: 2, marginBottom: 12 }}>
          the top bit is {negative ? "on" : "off"}, so the sign flag would read {negative ? 1 : 0}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 140px", border: "1px solid var(--teal)", borderRadius: 9, background: "var(--panel)", padding: "9px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--teal)" }}>AS UNSIGNED</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 21, fontWeight: 700, color: "var(--ink)" }}>{v}</div>
            <div style={{ fontSize: 10, color: "var(--ink-faint)" }}>compare with the carry flag</div>
          </div>
          <div style={{ flex: "1 1 140px", border: "1px solid var(--accent)", borderRadius: 9, background: "var(--panel)", padding: "9px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--accent-2)" }}>AS SIGNED</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 21, fontWeight: 700, color: "var(--ink)" }}>{signed}</div>
            <div style={{ fontSize: 10, color: "var(--ink-faint)" }}>compare with the sign flag</div>
          </div>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          {v === 0x7f ? (
            <>
              <b>7FH is the largest positive signed byte.</b> Add one and it becomes 80H, which reads
              as −128 — the sign flag comes on and the carry flag does not. An unsigned program sees
              127 becoming 128 and nothing has gone wrong at all. Same bits, two verdicts.
            </>
          ) : v === 0xff ? (
            <>
              <b>FFH is 255 or −1</b>, and both are correct. This is why a loop counting down to zero
              works the same either way, and why a comparison against FFH needs you to have decided
              which one you meant.
            </>
          ) : (
            <>
              The bits do not change. Reading {hex2(v)}H as <b>{v}</b> or as <b>{signed}</b> is a
              decision your program makes, and the processor will not object to either — it has no
              idea which you intended.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          The practical rule: after a <code>CMP</code>, use <b>JC and JNC</b> if the values are
          unsigned, and <b>JM and JP</b> if they are signed. Testing the wrong flag is a bug that
          works perfectly for small numbers and fails the moment a value passes 7FH.
        </div>
      </div>
    </div>
  );
}
