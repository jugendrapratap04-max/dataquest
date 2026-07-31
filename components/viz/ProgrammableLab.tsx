"use client";

import { useState } from "react";

/* The one idea the word "microprocessor" is actually made of: the job lives in
 * memory, not in the wiring.
 *
 * Lesson 5 opens by asking what problem this device was invented to solve, and
 * the honest answer is not "arithmetic" — a 1960 washing-machine timer did its
 * job perfectly with gears. The answer is that changing what a wired machine
 * does means rebuilding it, and changing what a processor does means loading
 * different bytes. That is the whole invention, and it is a comparison rather
 * than a fact, so it needs two columns you can flip between rather than a
 * paragraph asserting it.
 *
 * The bytes on the right are real. Each program was put through lib/asm8085.ts
 * and the opcodes are what it emitted, so a student who keys them into a trainer
 * kit gets the same run. The left column is honestly a model — nobody is going
 * to simulate a cam timer — and the lesson says so. */

type Job = {
  id: string;
  name: string;
  goal: string;
  /** What a machine with the job in its wiring would have to be. */
  wired: string;
  asm: string[];
  /** Real opcodes, from the assembler. */
  bytes: string[];
  result: string;
};

const JOBS: Job[] = [
  {
    id: "add",
    name: "Add two numbers",
    goal: "Add 8 and 4, and leave the answer where a program can use it.",
    wired: "An adder circuit with the two numbers hard-wired into it. It adds 8 and 4 and nothing else — not 9 and 4, not two numbers somebody types.",
    asm: ["MVI A, 08H", "MVI B, 04H", "ADD B", "HLT"],
    bytes: ["3E", "08", "06", "04", "80", "76"],
    result: "A holds 0CH — twelve",
  },
  {
    id: "count",
    name: "Count down from 5",
    goal: "Start at five, take one away until nothing is left.",
    wired: "A different circuit entirely: a counter, a comparator and a clock. Nothing from the adder is reusable, because the adder had no notion of repeating.",
    asm: ["        MVI C, 05H", "LOOP:   DCR C", "        JNZ LOOP", "        HLT"],
    bytes: ["0E", "05", "0D", "C2", "02", "20", "76"],
    result: "C holds 00H after twelve steps",
  },
  {
    id: "store",
    name: "Put a byte in memory",
    goal: "Write 42H into box 2050H and leave it there.",
    wired: "A third circuit. Address decoding, a write pulse, wires to the memory chip — and it can only ever write to the one box it was wired to.",
    asm: ["MVI A, 42H", "LXI H, 2050H", "MOV M, A", "HLT"],
    bytes: ["3E", "42", "21", "50", "20", "77", "76"],
    result: "box 2050H holds 42H",
  },
];

export function ProgrammableLab() {
  const [i, setI] = useState(0);
  const job = JOBS[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔁 Same chip, different job</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Pick a job and watch the two columns. One of them has to be rebuilt every time. The other
        only changes the bytes sitting in memory.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
        {JOBS.map((j, ix) => (
          <button
            key={j.id}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 12px", fontSize: 12 }}
            onClick={() => setI(ix)}
          >
            {j.name}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", textAlign: "center", marginBottom: 12 }}>
        <b>The job:</b> {job.goal}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {/* the wired machine — a new one every time */}
        <div
          style={{
            flex: "1 1 240px", border: "1px solid var(--bad)", borderRadius: 10,
            background: "var(--panel-2)", padding: "12px 14px",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: ".07em", fontFamily: "var(--mono)", color: "var(--bad)", marginBottom: 8 }}>
            JOB IN THE WIRING
          </div>
          <div
            style={{
              height: 92, borderRadius: 8, border: "2px dashed var(--bad)",
              display: "grid", placeItems: "center", textAlign: "center",
              padding: "0 12px", fontSize: 11.5, color: "var(--ink-soft)", lineHeight: 1.55,
            }}
          >
            {job.wired}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--bad)", marginTop: 10, fontWeight: 600 }}>
            To change the job: build a different machine.
          </div>
        </div>

        {/* the processor — one chip, three sets of bytes */}
        <div
          style={{
            flex: "1 1 260px", border: "1px solid var(--teal)", borderRadius: 10,
            background: "var(--panel-2)", padding: "12px 14px",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: ".07em", fontFamily: "var(--mono)", color: "var(--teal)", marginBottom: 8 }}>
            JOB IN MEMORY
          </div>
          <div
            style={{
              borderRadius: 8, border: "2px solid var(--teal)", padding: "8px 10px",
              textAlign: "center", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700,
              color: "var(--ink)", marginBottom: 10,
            }}
          >
            8085 — the same chip, every time
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
            {job.bytes.map((b, ix) => (
              <span
                key={ix}
                style={{
                  minWidth: 30, padding: "5px 0", textAlign: "center", borderRadius: 5,
                  background: "var(--panel)", border: "1px solid var(--line)",
                  fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "var(--ink)",
                }}
              >
                {b}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", textAlign: "center", marginTop: 6, fontFamily: "var(--mono)" }}>
            {job.bytes.length} bytes, loaded at 2000H
          </div>
          <div style={{ fontSize: 11.5, color: "var(--teal)", marginTop: 10, fontWeight: 600 }}>
            To change the job: load different bytes.
          </div>
        </div>
      </div>

      <div className="viz-code" style={{ marginTop: 12, fontSize: 12, lineHeight: 1.7 }}>
        {job.asm.map((line, ix) => (
          <div key={ix}>{line}</div>
        ))}
        <div style={{ color: "var(--good)", marginTop: 6 }}>{"; result — "}{job.result}</div>
      </div>

      <div className="note key" style={{ marginTop: 14 }}>
        <span className="i">📌</span>
        <div>
          Those bytes are the real opcodes, not a drawing of them. <b>3E</b>{" "}
          means &ldquo;load the accumulator with the next byte&rdquo;, <b>0E</b> means the same for
          register C, <b>76</b> is stop. Three completely different jobs, one unchanged piece of
          silicon — and the only thing that moved between them is what was written in memory.
        </div>
      </div>
    </div>
  );
}
