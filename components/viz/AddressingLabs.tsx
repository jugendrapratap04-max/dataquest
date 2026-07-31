"use client";

import { useState } from "react";

/* Two panels for "Addressing modes".
 *
 * The five modes are usually taught as five definitions to recite, and the
 * definitions are the least useful part — a student can recite "register
 * indirect" and still write MOV A, H when they meant MOV A, M.
 *
 *   AddressingLab  the same job done five ways, so the modes are compared
 *                  rather than listed. The byte counts and T-states are the
 *                  simulator's, which is what makes the comparison honest:
 *                  immediate is 7 T-states and register indirect through a
 *                  fresh LXI is 17, and that gap is the point.
 *   IndirectLab    why indirect exists at all. A direct address is baked into
 *                  the instruction and can never move; a pointer can, so the
 *                  same one-byte instruction reads a different byte each pass.
 *                  That is the whole reason loops over memory are possible.
 *
 * The third panel on the lesson is `pair-lab`, reused from lesson 9. */

const hex2 = (v: number) => (v & 0xff).toString(16).toUpperCase().padStart(2, "0");
const hex4 = (v: number) => (v & 0xffff).toString(16).toUpperCase().padStart(4, "0");

/* -------------------------------------- 1 · the same job, five ways --- */

type Mode = {
  id: string;
  name: string;
  code: string;
  bytes: string;
  t: number;
  where: string;
  what: string;
};

const MODES: Mode[] = [
  {
    id: "imm", name: "Immediate", code: "MVI A, 5AH", bytes: "3E 5A", t: 7,
    where: "inside the instruction itself",
    what: "The value travels with the opcode, in the byte right after it. Nothing is fetched from anywhere else, which is why it is the cheapest way to get a known constant into a register — and why the value can never change while the program runs.",
  },
  {
    id: "reg", name: "Register", code: "MOV A, B", bytes: "78", t: 4,
    where: "in another register, named inside the opcode",
    what: "Both operands are registers, so both fit in the opcode's three-bit fields and the whole instruction is one byte. No bus trip at all after the fetch, which makes this the fastest mode there is.",
  },
  {
    id: "direct", name: "Direct", code: "LDA 2050H", bytes: "3A 50 20", t: 13,
    where: "at an address written into the instruction",
    what: "The address is carried in the instruction, low byte first. Three bytes and four machine cycles, because the processor has to read the address out of its own code before it can go and fetch the data.",
  },
  {
    id: "indirect", name: "Register indirect", code: "MOV A, M", bytes: "7E", t: 7,
    where: "at the address currently in HL",
    what: "One byte, because M is just the eighth register code. The address is not in the instruction, it is in HL — so the same instruction reaches a different byte whenever HL changes, which is what makes a loop over memory possible.",
  },
  {
    id: "implied", name: "Implied", code: "CMA", bytes: "2F", t: 4,
    where: "nowhere — the operand is the accumulator, always",
    what: "The instruction names no operand at all because there is only one it could mean. CMA, RLC, RRC, STC, CMC and DAA are all like this: the accumulator or a flag is implied by the opcode itself.",
  },
];

export function AddressingLab() {
  const [i, setI] = useState(0);
  const m = MODES[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🎯 Five ways to say where the operand is</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        An addressing mode is one answer to one question: <b>where is the data?</b> Four of these
        five put 5AH into the accumulator, and they differ only in where it came from.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {MODES.map((x, ix) => (
          <button
            key={x.id}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 11px", fontSize: 11.5 }}
            onClick={() => setI(ix)}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 14 }}>
        <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
          {m.code}
        </div>
        <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-faint)", marginBottom: 12 }}>
          the data is {m.where}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { k: "machine code", v: m.bytes, tone: "var(--accent-2)" },
            { k: "length", v: `${m.bytes.split(" ").length} byte${m.bytes.split(" ").length === 1 ? "" : "s"}`, tone: "var(--teal)" },
            { k: "cost", v: `${m.t} T-states`, tone: "var(--good)" },
          ].map((x) => (
            <div key={x.k} style={{ flex: "1 1 110px", border: `1px solid ${x.tone}`, borderRadius: 9, background: "var(--panel)", padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: x.tone }}>{x.k.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{x.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>{m.name}.</b> {m.what}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Compare <b>Direct</b> and <b>Register indirect</b> — the same byte reached two ways, at
          three bytes against one. Direct is shorter to write and longer to execute, and it can only
          ever reach the one address it was written with. Indirect costs an <code>LXI</code> up front
          and then reaches anywhere.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------- 2 · why indirect exists --- */

const BLOCK = [0x5a, 0x2c, 0x33, 0x91, 0x08];
const BASE = 0x2050;

export function IndirectLab() {
  const [step, setStep] = useState(0);
  const hl = BASE + step;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">➡️ Why indirect exists — one instruction, many bytes</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Press <b>INX H</b> and watch two things that never change: the instruction{" "}
        <code>MOV A, M</code>, and the instruction <code>LDA 2050H</code>. Only one of them follows.
      </p>

      <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
        {BLOCK.map((b, k) => {
          const on = k === step;
          return (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: on ? "var(--teal)" : "var(--ink-faint)" }}>{hex4(BASE + k)}</div>
              <div
                style={{
                  width: 52, padding: "9px 0", borderRadius: 7, marginTop: 2,
                  background: on ? "var(--accent-soft)" : "var(--panel-2)",
                  border: `${on ? 2 : 1}px solid ${on ? "var(--accent)" : "var(--line)"}`,
                  fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, color: "var(--ink)",
                }}
              >
                {hex2(b)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 12 }}>
        <button
          className="btn btn-primary"
          style={{ padding: "6px 14px", fontSize: 12, fontFamily: "var(--mono)" }}
          onClick={() => setStep((s) => (s + 1) % BLOCK.length)}
        >
          INX H
        </button>
        <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setStep(0)}>
          Reset
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 180px", border: "2px solid var(--good)", borderRadius: 9, background: "var(--panel-2)", padding: "10px 12px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>MOV A, M</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-faint)", marginBottom: 6 }}>register indirect — HL = {hex4(hl)}H</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 19, fontWeight: 700, color: "var(--good)" }}>A = {hex2(BLOCK[step])}H</div>
        </div>
        <div style={{ flex: "1 1 180px", border: "2px solid var(--bad)", borderRadius: 9, background: "var(--panel-2)", padding: "10px 12px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>LDA 2050H</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-faint)", marginBottom: 6 }}>direct — the address is in the instruction</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 19, fontWeight: 700, color: "var(--bad)" }}>A = {hex2(BLOCK[0])}H</div>
        </div>
      </div>

      <div className={`note ${step === 0 ? "key" : "warn"}`} style={{ marginTop: 12 }}>
        <span className="i">{step === 0 ? "📌" : "⚠️"}</span>
        <div>
          {step === 0 ? (
            <>
              <b>At the start they agree</b>, which is exactly what makes the difference easy to miss.
              Press <code>INX H</code> once and they stop agreeing, and nothing about either
              instruction changed — only HL did.
            </>
          ) : (
            <>
              <b>The direct load is stuck at 2050H</b> and will be forever, because the address is
              two of its three bytes. The indirect load has moved to {hex4(hl)}H without being
              rewritten. This is why every loop over a block uses <code>M</code>, and why a loop
              built on <code>LDA</code> reads the same byte on every pass — the bug lesson 5 ended on.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          <code>LDAX B</code> and <code>LDAX D</code> are the same idea through the other two pairs,
          and <code>STAX</code> is the writing version. HL gets the shorthand <code>M</code> because
          it is the pair the instruction set was built around — it is the only one that works with
          arithmetic instructions like <code>ADD M</code>.
        </div>
      </div>
    </div>
  );
}
