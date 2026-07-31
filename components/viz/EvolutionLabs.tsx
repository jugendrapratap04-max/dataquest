"use client";

import { useState } from "react";

/* Two panels for "Evolution — what actually changed".
 *
 * They share a file because they answer the two questions the lesson exists for,
 * and neither can be answered by a table.
 *
 * MultiByteLab is the "why 8-bit hurts" panel. A student can be told that the
 * high half of a multi-byte sum must use ACI and will still write ADI, because
 * the bug is invisible: with most pairs of numbers the two instructions give the
 * SAME answer. So the panel lets you flip the numbers as well as the instruction,
 * and the point lands when one pair shows no difference at all. That is the shape
 * of the bug — right most of the time, wrong on data you did not test with.
 *
 * MicroFamilyLab is the processor / controller / computer question, which is on
 * every paper and is genuinely a question about where a boundary is drawn. So it
 * is drawn: one dashed line, and parts move across it as you switch. No code runs
 * here and none could — it is a model of packaging, and the lesson says so.
 *
 * The arithmetic in the first panel is hand-checked against lib/asm8085.ts: the
 * lesson's own add16.asm produces HL=2233, which is the ACI column. */

/* ------------------------------------------- 1 · sixteen bits, eight at a time --- */

type Pair = { label: string; hiA: number; loA: number; hiB: number; loB: number };

const PAIRS: Pair[] = [
  { label: "1234H + 0FFFH", hiA: 0x12, loA: 0x34, hiB: 0x0f, loB: 0xff },
  { label: "1234H + 0011H", hiA: 0x12, loA: 0x34, hiB: 0x00, loB: 0x11 },
];

const h2 = (v: number) => (v & 0xff).toString(16).toUpperCase().padStart(2, "0");

/* Module level, not inside the component. `react-hooks/static-components` is an
 * error in this project: a component declared during render is a new type on
 * every render, so React unmounts and remounts its whole subtree. */
function Cell({ v, tone }: { v: string; tone: string }) {
  return (
    <span
      style={{
        minWidth: 38, padding: "6px 0", textAlign: "center", borderRadius: 6,
        background: "var(--panel)", border: `1px solid ${tone}`,
        fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "var(--ink)",
      }}
    >
      {v}
    </span>
  );
}

export function MultiByteLab() {
  const [p, setP] = useState(0);
  const [carried, setCarried] = useState(true);
  const pair = PAIRS[p];

  const lowSum = pair.loA + pair.loB;
  const low = lowSum & 0xff;
  const carry = lowSum > 0xff ? 1 : 0;
  const high = (pair.hiA + pair.hiB + (carried ? carry : 0)) & 0xff;
  const correct = (((pair.hiA << 8) | pair.loA) + ((pair.hiB << 8) | pair.loB)) & 0xffff;
  const got = (high << 8) | low;
  const right = got === correct;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">➕ Sixteen bits, eight at a time</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        A register holds one byte, so a 16-bit sum is done in two halves. Switch the instruction the
        second half uses — then switch the numbers and try it again.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {PAIRS.map((x, ix) => (
          <button
            key={x.label}
            className={`btn ${ix === p ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 11px", fontSize: 11.5, fontFamily: "var(--mono)" }}
            onClick={() => setP(ix)}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: "14px" }}>
        {/* the two halves, side by side, high on the left the way a number is written */}
        <div style={{ display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--ink-faint)", marginBottom: 6 }}>
              HIGH BYTE — done second
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <Cell v={h2(pair.hiA)} tone="var(--line)" />
              <span style={{ fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>+</span>
              <Cell v={h2(pair.hiB)} tone="var(--line)" />
              <span style={{ fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>+</span>
              <Cell v={carried ? String(carry) : "—"} tone={carried && carry ? "var(--good)" : "var(--line)"} />
              <span style={{ fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>=</span>
              <Cell v={h2(high)} tone="var(--accent)" />
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--ink-faint)", marginBottom: 6 }}>
              LOW BYTE — done first
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <Cell v={h2(pair.loA)} tone="var(--line)" />
              <span style={{ fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>+</span>
              <Cell v={h2(pair.loB)} tone="var(--line)" />
              <span style={{ fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>=</span>
              <Cell v={h2(low)} tone="var(--accent)" />
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: carry ? "var(--good)" : "var(--ink-faint)", marginTop: 6 }}>
              carry out = {carry}
            </div>
          </div>
        </div>

        {/* which instruction the high half uses */}
        <div className="viz-controls" style={{ justifyContent: "center", marginTop: 16 }}>
          <button
            className={`btn ${carried ? "btn-ghost" : "btn-primary"}`}
            style={{ padding: "6px 13px", fontSize: 12, fontFamily: "var(--mono)" }}
            onClick={() => setCarried(false)}
          >
            ADI — ignores the carry
          </button>
          <button
            className={`btn ${carried ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 13px", fontSize: 12, fontFamily: "var(--mono)" }}
            onClick={() => setCarried(true)}
          >
            ACI — adds the carry in
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-faint)" }}>HL ends up holding</div>
          <div
            style={{
              fontFamily: "var(--mono)", fontSize: 27, fontWeight: 700,
              color: right ? "var(--good)" : "var(--bad)", marginTop: 2,
            }}
          >
            {h2(high)}{h2(low)}H
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-faint)", marginTop: 2 }}>
            the true sum is {h2(correct >> 8)}{h2(correct)}H
          </div>
        </div>
      </div>

      <div className={`note ${right ? "tip" : "warn"}`} style={{ marginTop: 14 }}>
        <span className="i">{right ? "💡" : "⚠️"}</span>
        <div>
          {carry === 0 ? (
            <>
              <b>Both instructions give the same answer here</b> — the low bytes did not overflow, so
              there was no carry to lose. This is what makes the bug so hard to catch: it is correct
              on most numbers, passes whatever you tested with, and goes wrong later on data you did
              not choose. Switch back to <b>1234H + 0FFFH</b> and try <code>ADI</code> again.
            </>
          ) : right ? (
            <>
              <b>Correct — and only because the carry was picked up.</b> 34H + FFH is 133H, so the low
              byte kept 33H and the ninth bit went to the carry flag. <code>ACI</code> is the
              instruction that reads it back: 12H + 0FH + 1 = 22H.
            </>
          ) : (
            <>
              <b>Short by exactly 100H.</b> The low half overflowed and the bit that fell out went to
              the carry flag, where <code>ADI</code> never looks. Being wrong by exactly one unit of
              the high byte is the signature of a lost carry — 100H here, 10000H one byte further up.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- 2 · processor, controller, computer --- */

type Kind = {
  id: string;
  name: string;
  example: string;
  scale: string;
  onChip: string[];
  offChip: string[];
  use: string;
};

const KINDS: Kind[] = [
  {
    id: "up",
    name: "Microprocessor",
    example: "8085, 8086, the chip in a laptop",
    scale: "one chip — but it cannot run alone",
    onChip: ["ALU", "Registers", "Control unit", "Instruction decoder"],
    offChip: ["RAM", "ROM", "I/O ports", "Timer", "Clock circuit", "Address latch"],
    use: "Where the job changes and the memory has to be large: computers, and anything that runs software somebody else wrote.",
  },
  {
    id: "uc",
    name: "Microcontroller",
    example: "8051, AVR, ARM Cortex-M, the chip in a washing machine",
    scale: "one chip, and that is the whole computer",
    onChip: ["ALU", "Registers", "Control unit", "RAM", "ROM", "I/O ports", "Timers", "Serial port"],
    offChip: ["A power supply", "Whatever it is controlling"],
    use: "Where the job is fixed and small: appliances, cars, toys, instruments. One chip, a few components, done.",
  },
  {
    id: "umc",
    name: "Microcomputer",
    example: "A trainer kit, a single-board computer, a desktop PC",
    scale: "a whole board — chips plus everything a person touches",
    onChip: ["A processor or a controller"],
    offChip: ["Memory chips", "I/O devices", "Keypad or keyboard", "Display", "Power supply", "Storage"],
    use: "It is not a rival to the other two — it is the finished machine built around one of them.",
  },
];

export function MicroFamilyLab() {
  const [i, setI] = useState(0);
  const k = KINDS[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📦 Processor, controller, computer — where the line is drawn</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        All three words describe the same parts. The only thing that changes is which side of the
        chip boundary each part sits on. Click through and watch the parts move.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
        {KINDS.map((x, ix) => (
          <button
            key={x.id}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 12px", fontSize: 12 }}
            onClick={() => setI(ix)}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: "14px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-faint)", textAlign: "center", marginBottom: 12 }}>
          {k.example}
        </div>

        <div style={{ border: "2px dashed var(--teal)", borderRadius: 10, padding: "10px 12px 12px" }}>
          <div style={{ fontSize: 9.5, letterSpacing: ".07em", fontFamily: "var(--mono)", color: "var(--teal)", marginBottom: 8 }}>
            INSIDE THE CHIP
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {k.onChip.map((part) => (
              <span
                key={part}
                style={{
                  padding: "5px 10px", borderRadius: 6, fontSize: 11.5,
                  background: "var(--teal-soft)", border: "1px solid var(--teal)", color: "var(--ink)",
                }}
              >
                {part}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12, padding: "0 2px" }}>
          <div style={{ fontSize: 9.5, letterSpacing: ".07em", fontFamily: "var(--mono)", color: "var(--ink-faint)", marginBottom: 8 }}>
            OUTSIDE IT — WHAT YOU STILL HAVE TO ADD
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {k.offChip.map((part) => (
              <span
                key={part}
                style={{
                  padding: "5px 10px", borderRadius: 6, fontSize: 11.5,
                  background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink-soft)",
                }}
              >
                {part}
              </span>
            ))}
          </div>
        </div>

        <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--accent-2)", textAlign: "center", marginTop: 14 }}>
          {k.scale}
        </div>
      </div>

      <div className="note key" style={{ marginTop: 14 }}>
        <span className="i">📌</span>
        <div><b>Where it belongs.</b> {k.use}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          The exam answer in one line: a <b>microprocessor</b> is the CPU alone and needs memory and
          I/O around it; a <b>microcontroller</b> has them built in, so one chip is the whole
          computer; a <b>microcomputer</b> is the finished machine built around either. The 8085 you
          are learning is the first, and the trainer kit it runs on is the third.
        </div>
      </div>
    </div>
  );
}
