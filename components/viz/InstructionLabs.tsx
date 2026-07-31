"use client";

import { useState } from "react";
import { assemble, disassemble, hex2, hex4 } from "@/lib/asm8085";

/* Two panels for "The instruction set, classified".
 *
 * The instruction set is 246 instructions and no student memorises them. What
 * makes it learnable is that it falls into five groups and three lengths, and
 * both of those are things you can be shown rather than told.
 *
 *   InstrGroupLab   the five groups, with what each one does to the flags —
 *                   which is the part that actually changes how you write code.
 *   HandAssembleLab the exam task: a source listing turned into addresses and
 *                   hex bytes. Built by calling the real assembler, so the
 *                   listing cannot drift from what the 8085 Lab would run.
 *
 * The third panel on the lesson is `instruction-bytes-lab`, reused from lesson 3
 * — same idea at ground level, now with a reason to care. */

/* ---------------------------------------------- 1 · the five groups --- */

type Group = {
  id: string;
  name: string;
  count: string;
  flags: string;
  flagTone: string;
  examples: string[];
  what: string;
};

const GROUPS: Group[] = [
  {
    id: "transfer", name: "Data transfer", count: "the largest group by far", flags: "none, ever", flagTone: "var(--good)",
    examples: ["MOV B, A", "MVI A, 42H", "LXI H, 2050H", "LDA 2050H", "STA 2060H", "XCHG", "IN 80H", "OUT 80H"],
    what: "Moving a byte from one place to another — register to register, memory to register, or in and out of a port. Nothing is computed, so nothing is judged, so no flag moves. That is what makes a MOV safe between a compare and the jump that reads it.",
  },
  {
    id: "arith", name: "Arithmetic", count: "add, subtract, increment, decrement", flags: "all five (with exceptions)", flagTone: "var(--bad)",
    examples: ["ADD B", "ADI 10H", "SUB C", "INR A", "DCR C", "INX H", "DAD B", "DAA"],
    what: "The group that goes through the ALU, so the group that writes the flags. The exceptions are the ones lesson 10 drilled: INR and DCR skip the carry, INX and DCX set nothing at all, and DAD sets only the carry.",
  },
  {
    id: "logic", name: "Logical", count: "AND, OR, XOR, compare, rotate", flags: "all five, some forced", flagTone: "var(--bad)",
    examples: ["ANA B", "ANI 0FH", "ORA C", "XRA A", "CMP B", "CPI 09H", "RLC", "CMA"],
    what: "Bit-by-bit operations and comparisons. Two quirks worth carrying: ANA always sets AC and clears CY whatever the operands, and the rotates affect only the carry. CMA changes the accumulator and no flag at all.",
  },
  {
    id: "branch", name: "Branching", count: "jumps, calls, returns", flags: "none — they read them", flagTone: "var(--good)",
    examples: ["JMP 2100H", "JZ DONE", "JNC LOOP", "CALL SUB", "RET", "RZ", "PCHL"],
    what: "The only group that changes the program counter deliberately. They read the flags rather than writing them, which is why the instruction immediately before a conditional jump matters so much.",
  },
  {
    id: "control", name: "Machine control", count: "the smallest group", flags: "none", flagTone: "var(--good)",
    examples: ["HLT", "NOP", "EI", "DI", "SIM", "RIM"],
    what: "Instructions about the processor itself rather than about data. HLT stops it, NOP does nothing for four T-states, and EI and DI turn interrupts on and off. Chapter 6 is where SIM and RIM stop looking strange.",
  },
];

export function InstrGroupLab() {
  const [i, setI] = useState(0);
  const g = GROUPS[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🗃️ The five groups, and what each does to the flags</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Every 8085 instruction is in exactly one of these five. Click through them and watch the{" "}
        <b>flags</b> column — that is the difference that changes how you write code, not the names.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {GROUPS.map((x, ix) => (
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

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ flex: "1 1 150px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--panel)", padding: "8px 10px" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--ink-faint)" }}>SIZE OF THE GROUP</div>
            <div style={{ fontSize: 12, color: "var(--ink)" }}>{g.count}</div>
          </div>
          <div style={{ flex: "1 1 150px", border: `1px solid ${g.flagTone}`, borderRadius: 9, background: "var(--panel)", padding: "8px 10px" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: g.flagTone }}>FLAGS AFFECTED</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{g.flags}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {g.examples.map((e) => (
            <span
              key={e}
              style={{
                padding: "4px 9px", borderRadius: 6, fontFamily: "var(--mono)", fontSize: 11,
                background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink-soft)",
              }}
            >
              {e}
            </span>
          ))}
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>{g.name}.</b> {g.what}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Two of the five write flags and three do not, and that split is worth more than the
          classification itself. <b>Data transfer, branching and machine control leave the flags
          alone</b>, so anything from those groups can sit between a compare and the jump that
          reads it.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------- 2 · hand-assembly --- */

const PROGRAMS = [
  {
    label: "add a byte from memory",
    src: "        MVI A, 25H\n        MOV B, A\n        LXI H, 2050H\n        ADD M\n        STA 2060H\n        HLT\n",
  },
  {
    label: "a countdown loop",
    src: "        MVI C, 05H\nLOOP:   DCR C\n        JNZ LOOP\n        HLT\n",
  },
  {
    label: "send a byte to a port",
    src: "        LDA 2050H\n        ANI 0FH\n        OUT 40H\n        HLT\n",
  },
];

/** Module level: a component built during render remounts its subtree every time
 *  (react-hooks/static-components is an error in this project). */
function Cell({ text, tone }: { text: string; tone: string }) {
  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: tone, whiteSpace: "pre" }}>{text}</span>
  );
}

function listingOf(src: string) {
  const a = assemble(src);
  const addrs = [...a.code.keys()].sort((x, y) => x - y);
  const bytes = addrs.map((k) => a.code.get(k) ?? 0);
  const origin = addrs.length ? addrs[0] : 0x2000;
  const rows: { addr: number; bytes: number[]; text: string }[] = [];
  let i = 0;
  while (i < bytes.length) {
    const d = disassemble(bytes, i);
    rows.push({ addr: origin + i, bytes: bytes.slice(i, i + d.length), text: d.text });
    i += d.length;
  }
  return rows;
}

export function HandAssembleLab() {
  const [p, setP] = useState(0);
  const rows = listingOf(PROGRAMS[p].src);
  const total = rows.reduce((n, r) => n + r.bytes.length, 0);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">✍️ Hand-assembly — source in, hex out</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        &ldquo;Assemble this program and give the machine code&rdquo; is a standard exam question.
        It is three columns: the address, the bytes, and what you wrote — and the addresses come
        from the byte counts.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {PROGRAMS.map((x, ix) => (
          <button
            key={x.label}
            className={`btn ${ix === p ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 11px", fontSize: 11.5 }}
            onClick={() => setP(ix)}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12, overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 6, minWidth: 320 }}>
          <span style={{ flex: "0 0 56px", fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--teal)" }}>ADDRESS</span>
          <span style={{ flex: "0 0 84px", fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--accent-2)" }}>BYTES</span>
          <span style={{ flex: 1, fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--ink-faint)" }}>INSTRUCTION</span>
          <span style={{ flex: "0 0 44px", fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--ink-faint)" }}>LEN</span>
        </div>
        {rows.map((r) => (
          <div key={r.addr} style={{ display: "flex", gap: 12, padding: "4px 0", borderTop: "1px solid var(--line)", minWidth: 320 }}>
            <span style={{ flex: "0 0 56px" }}><Cell text={hex4(r.addr)} tone="var(--teal)" /></span>
            <span style={{ flex: "0 0 84px" }}><Cell text={r.bytes.map(hex2).join(" ")} tone="var(--accent-2)" /></span>
            <span style={{ flex: 1 }}><Cell text={r.text} tone="var(--ink)" /></span>
            <span style={{ flex: "0 0 44px" }}><Cell text={`${r.bytes.length} B`} tone="var(--ink-faint)" /></span>
          </div>
        ))}
        <div style={{ textAlign: "right", marginTop: 8, fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-soft)" }}>
          {rows.length} instructions, <b style={{ color: "var(--good)" }}>{total} bytes</b>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          <b>The address column is the only part you have to work out.</b>{" "}
          Each address is the one above it plus that instruction&apos;s length, so a single
          miscounted byte shifts every line below it — and any jump written as an absolute address
          is then wrong.
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          These are the assembler&apos;s own bytes, produced by the same code the{" "}
          <b>8085 Lab</b> runs. Key any of these listings into a trainer kit and it behaves exactly
          as the panel says — and the second program shows why a label beats a hand-computed jump
          address.
        </div>
      </div>
    </div>
  );
}
