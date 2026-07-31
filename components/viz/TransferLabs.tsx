"use client";

import { useState } from "react";

/* Two panels for "Data transfer instructions".
 *
 * This is the largest group in the instruction set and the least interesting one
 * to read about, because every instruction does the same thing to a different
 * pair of places. What makes it worth a lesson is the shape of the table — which
 * sources reach which destinations, and which combinations simply do not exist.
 *
 *   TransferMapLab  every data transfer instruction as source -> destination,
 *                   with the gaps visible. "There is no memory-to-memory move"
 *                   is a sentence; a table with a hole in it is an argument.
 *   PairMoveLab     the four 16-bit moves — XCHG, SPHL, PCHL and XTHL. XTHL is
 *                   the one nobody predicts correctly, so it gets a before and
 *                   after with the stack drawn.
 *
 * Every value shown was produced by lib/asm8085.ts; XTHL swapping HL with the
 * top of the stack is the lesson's own xthl.asm. */

const hex4 = (v: number) => (v & 0xffff).toString(16).toUpperCase().padStart(4, "0");

/* ------------------------------------------- 1 · the transfer map --- */

type Row = {
  id: string;
  instr: string;
  from: string;
  to: string;
  bytes: number;
  t: number;
  note: string;
};

const ROWS: Row[] = [
  { id: "mov", instr: "MOV B, A", from: "a register", to: "a register", bytes: 1, t: 4, note: "The cheapest instruction on the chip. Both operands are register codes inside the opcode, so nothing leaves the processor at all." },
  { id: "movm", instr: "MOV A, M", from: "memory, via HL", to: "a register", bytes: 1, t: 7, note: "Still one byte, because M is the eighth register code. The extra three T-states are the trip out to memory." },
  { id: "movtom", instr: "MOV M, A", from: "a register", to: "memory, via HL", bytes: 1, t: 7, note: "The same instruction in the other direction. Note there is no MOV M, M — that combination is HLT." },
  { id: "mvi", instr: "MVI A, 42H", from: "the instruction itself", to: "a register", bytes: 2, t: 7, note: "Immediate addressing. The value is the second byte of the instruction, so it can never change while the program runs." },
  { id: "lxi", instr: "LXI H, 2050H", from: "the instruction itself", to: "a register pair", bytes: 3, t: 10, note: "The 16-bit immediate load, and the only way to get an address into a pair in one instruction. Low byte first in the machine code." },
  { id: "lda", instr: "LDA 2050H", from: "a named address", to: "the accumulator", bytes: 3, t: 13, note: "Direct addressing, accumulator only. There is no LDA into B — one more consequence of the accumulator being the register everything passes through." },
  { id: "sta", instr: "STA 2060H", from: "the accumulator", to: "a named address", bytes: 3, t: 13, note: "The writing half of the same pair. Also accumulator only." },
  { id: "lhld", instr: "LHLD 2050H", from: "two named addresses", to: "HL", bytes: 3, t: 16, note: "Loads L from the address and H from the one after it — the 16-bit direct load, and it always lands in HL." },
  { id: "shld", instr: "SHLD 2060H", from: "HL", to: "two named addresses", bytes: 3, t: 16, note: "Stores L then H, so a 16-bit value written by SHLD reads back correctly with LHLD. Low byte first, as everywhere else." },
  { id: "ldax", instr: "LDAX D", from: "memory, via BC or DE", to: "the accumulator", bytes: 1, t: 7, note: "Register indirect through the other two pairs. Accumulator only, and no arithmetic version — that is HL's privilege." },
  { id: "stax", instr: "STAX B", from: "the accumulator", to: "memory, via BC or DE", bytes: 1, t: 7, note: "The writing version. Between LDAX D and STAX B a program can copy memory to memory with two live pointers and no HL at all." },
  { id: "xchg", instr: "XCHG", from: "HL and DE", to: "DE and HL", bytes: 1, t: 4, note: "The only instruction that moves two pairs at once, and it is one byte. Doing it by hand with MOV needs a spare register and six instructions." },
  { id: "in", instr: "IN 80H", from: "an input port", to: "the accumulator", bytes: 2, t: 10, note: "The port number is one byte, so there are 256 of them. This is also a write to the accumulator, which surprises people." },
  { id: "out", instr: "OUT 80H", from: "the accumulator", to: "an output port", bytes: 2, t: 10, note: "The same trip with IO/M high and WR active. Neither IN nor OUT touches a flag." },
];

export function TransferMapLab() {
  const [i, setI] = useState(0);
  const r = ROWS[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🚚 Every way to move a byte</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Fourteen instructions, one job. Read the <b>from</b> and <b>to</b> columns and the group stops
        being a list to memorise — and the gaps in it start to mean something.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 260, overflowY: "auto" }}>
        {ROWS.map((x, ix) => (
          <button
            key={x.id}
            onClick={() => setI(ix)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", cursor: "pointer",
              padding: "5px 9px", borderRadius: 7, textAlign: "left",
              background: ix === i ? "var(--accent-soft)" : "transparent",
              border: `1px solid ${ix === i ? "var(--accent)" : "var(--line)"}`,
              color: "var(--ink)",
            }}
          >
            <span style={{ flex: "0 0 92px", fontFamily: "var(--mono)", fontSize: 11.5, fontWeight: 700 }}>{x.instr}</span>
            <span style={{ flex: 1, fontSize: 10.5, color: "var(--ink-faint)" }}>{x.from}</span>
            <span style={{ flex: "0 0 14px", color: "var(--accent-2)", fontSize: 11 }}>→</span>
            <span style={{ flex: 1, fontSize: 10.5, color: "var(--ink-faint)" }}>{x.to}</span>
            <span style={{ flex: "0 0 58px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 10 }}>
              {x.bytes}B · {x.t}T
            </span>
          </button>
        ))}
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>{r.instr}.</b> {r.note}</div>
      </div>

      <div className="note warn" style={{ marginTop: 10 }}>
        <span className="i">⚠️</span>
        <div>
          <b>Not one of these touches a flag.</b> That is the single most useful fact about the whole
          group: a data transfer can sit between a compare and the conditional jump that reads it,
          and the verdict survives. Every other group would destroy it.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------ 2 · the 16-bit moves --- */

type Move = {
  id: string;
  instr: string;
  before: { hl: number; de: number; sp: number; top: number };
  after: { hl: number; de: number; sp: number; top: number };
  what: string;
};

const START = { hl: 0xabcd, de: 0x2c5a, sp: 0x23fe, top: 0x1234 };

const MOVES: Move[] = [
  {
    id: "xchg", instr: "XCHG",
    before: START, after: { hl: 0x2c5a, de: 0xabcd, sp: 0x23fe, top: 0x1234 },
    what: "Swaps HL and DE, both halves at once, in one byte and four T-states. The stack is not involved. This is how a program keeps two addresses and works on either one.",
  },
  {
    id: "sphl", instr: "SPHL",
    before: START, after: { hl: 0xabcd, de: 0x2c5a, sp: 0xabcd, top: 0x1234 },
    what: "Copies HL into the stack pointer. A copy, not a swap — HL is unchanged. This is how a program moves its stack somewhere else, usually once, at the very start.",
  },
  {
    id: "xthl", instr: "XTHL",
    before: START, after: { hl: 0x1234, de: 0x2c5a, sp: 0x23fe, top: 0xabcd },
    what: "Exchanges HL with the two bytes on top of the stack. The stack pointer does not move — nothing is pushed or popped, the two values simply trade places. This is the one nobody predicts correctly.",
  },
  {
    id: "pchl", instr: "PCHL",
    before: START, after: { hl: 0xabcd, de: 0x2c5a, sp: 0x23fe, top: 0x1234 },
    what: "Copies HL into the program counter, which means the next instruction executed is at ABCDH. It is a jump whose destination was computed rather than written — the only way to reach a calculated address on this processor.",
  },
];

export function PairMoveLab() {
  const [i, setI] = useState(0);
  const [after, setAfter] = useState(false);
  const m = MOVES[i];
  const s = after ? m.after : m.before;

  const cells: [string, string, boolean][] = [
    ["HL", hex4(s.hl), after && m.after.hl !== m.before.hl],
    ["DE", hex4(s.de), after && m.after.de !== m.before.de],
    ["SP", hex4(s.sp), after && m.after.sp !== m.before.sp],
    ["top of stack", hex4(s.top), after && m.after.top !== m.before.top],
  ];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔁 The four moves that shift a whole pair</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Four one-byte instructions move sixteen bits at a time. Pick one, then press <b>run it</b> —
        and watch which boxes change and which do not.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {MOVES.map((x, ix) => (
          <button
            key={x.id}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 13px", fontSize: 12, fontFamily: "var(--mono)" }}
            onClick={() => { setI(ix); setAfter(false); }}
          >
            {x.instr}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {cells.map(([label, value, changed]) => (
            <div
              key={label}
              style={{
                flex: "1 1 110px", borderRadius: 9, padding: "9px 10px", textAlign: "center",
                background: changed ? "var(--good-soft)" : "var(--panel)",
                border: `${changed ? 2 : 1}px solid ${changed ? "var(--good)" : "var(--line)"}`,
              }}
            >
              <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--ink-faint)" }}>
                {label.toUpperCase()}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{value}H</div>
            </div>
          ))}
        </div>

        <div className="viz-controls" style={{ justifyContent: "center", marginTop: 12 }}>
          <button
            className={`btn ${after ? "btn-ghost" : "btn-primary"}`}
            style={{ padding: "6px 14px", fontSize: 12 }}
            onClick={() => setAfter((v) => !v)}
          >
            {after ? "back to before" : `run ${m.instr}`}
          </button>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>{m.instr}.</b> {m.what}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          <b>Watch the stack pointer during XTHL.</b> It does not move — that is what makes XTHL an
          exchange rather than a pop followed by a push. Two of these four write somewhere a program
          cannot otherwise reach: <code>SPHL</code> into the stack pointer and <code>PCHL</code> into
          the program counter.
        </div>
      </div>
    </div>
  );
}
