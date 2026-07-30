"use client";

import { useState } from "react";

/* Fifty years of processors, and what actually changed.
 *
 * "Evolution" is the chapter students skim, because it is usually a table of
 * years and transistor counts with nothing to think about. The one number worth
 * thinking about is the ADDRESS SPACE, and it is not in the table — it is
 * computed from the address lines, two to the power of n. So this panel computes
 * it in front of you, which turns "the 8086 had 20 address lines" from a fact to
 * memorise into a calculation you can do in an exam.
 *
 * The other thing a table hides is that improvement changed SHAPE. Until the
 * Pentium the answer was always the same — wider words, more address lines, a
 * faster clock. Then the clock stopped rising and the answer became "more cores",
 * which is why the last two entries look so different from the first seven. */

type Chip = {
  name: string;
  year: number;
  bits: number;
  addressLines: number;
  clock: string;
  transistors: string;
  unlocked: string;
  hurt: string;
};

const CHIPS: Chip[] = [
  {
    name: "4004", year: 1971, bits: 4, addressLines: 12, clock: "740 kHz", transistors: "2,300",
    unlocked: "The first processor on one chip. It was built for a Japanese desk calculator, and it proved that general-purpose logic could replace custom wiring at all.",
    hurt: "Four bits holds 0 to 15. Anything larger needed several instructions per digit, so even adding two ordinary numbers was a subroutine.",
  },
  {
    name: "8008", year: 1972, bits: 8, addressLines: 14, clock: "500 kHz", transistors: "3,500",
    unlocked: "Eight bits — one byte, which is enough for a character. This is where text became something a processor could handle naturally.",
    hurt: "Slow, and 16 KB of memory. The instruction set was awkward enough that people wrote around it rather than with it.",
  },
  {
    name: "8080", year: 1974, bits: 8, addressLines: 16, clock: "2 MHz", transistors: "4,500",
    unlocked: "16 address lines, so 64 KB — enough for a real program and its data. The first personal computers were built on this chip.",
    hurt: "It needed three power supplies and an external clock generator, so a working board took several extra chips.",
  },
  {
    name: "8085", year: 1976, bits: 8, addressLines: 16, clock: "3 MHz", transistors: "6,500",
    unlocked: "The 8080 made practical: one 5 V supply, the clock generator on-chip, and a serial port built in. Same 64 KB, far less board around it. This is the chip you are learning, and it is still taught because it is the smallest processor that has everything a processor needs.",
    hurt: "Still eight bits. 200 + 200 does not fit in the accumulator, and every 16-bit number is two registers and a carry chain.",
  },
  {
    name: "8086", year: 1978, bits: 16, addressLines: 20, clock: "5–10 MHz", transistors: "29,000",
    unlocked: "Sixteen bits, so 65,535 in one register instead of 255. And 20 address lines for 1 MB — sixteen times the 8085. It also split fetching from executing so the two overlap, which is pipelining, and is why it beats the 8085 by more than the clock alone explains.",
    hurt: "Twenty address lines had to be reached through sixteen-bit registers, and the fix was segmentation — the single most confusing thing in this whole subject.",
  },
  {
    name: "80286", year: 1982, bits: 16, addressLines: 24, clock: "6–12 MHz", transistors: "134,000",
    unlocked: "16 MB, and protected mode: the first Intel chip that could stop one program from writing over another's memory. Operating systems became enforceable rather than advisory.",
    hurt: "Still 16-bit registers, and getting out of protected mode back to real mode needed a reset. Famously awkward.",
  },
  {
    name: "80386", year: 1985, bits: 32, addressLines: 32, clock: "16–33 MHz", transistors: "275,000",
    unlocked: "Thirty-two bits and 4 GB, plus paging — which is what makes virtual memory possible. The programming model here lasted, essentially unchanged, for twenty years.",
    hurt: "Memory could not keep up with the processor. This is the point where waiting for RAM became the main cost, and caches stopped being optional.",
  },
  {
    name: "Pentium", year: 1993, bits: 32, addressLines: 32, clock: "60–300 MHz", transistors: "3,100,000",
    unlocked: "Two instructions at once — superscalar — plus branch prediction and a real cache hierarchy. Almost none of the speed came from the clock.",
    hurt: "Heat. Pushing the clock higher was costing more power than it returned, and by 4 GHz that road was closed.",
  },
  {
    name: "modern x86-64", year: 2024, bits: 64, addressLines: 48, clock: "~5 GHz", transistors: "billions",
    unlocked: "Sixty-four bits, 48 address lines in use for 256 TB, and — the real change — many cores instead of one faster one. A phone chip today has more cores than the 8085 had registers.",
    hurt: "The clock has barely moved in twenty years. Speed now depends on your program being able to use several cores at once, which is a much harder thing to ask of a programmer.",
  },
];

/** The largest value n bits can hold, exactly.
 *
 *  This has to be BigInt. `Math.pow(2, 64) - 1` in a double comes out as
 *  18,446,744,073,709,552,000 — the true value is ...551,615, and a course that
 *  prints a wrong number on a page about precision has lost the argument.
 *
 *  Written as BigInt(1) rather than the `1n` literal on purpose: this project
 *  compiles to ES2017, where the literal syntax is a build error. The constructor
 *  is available at any target. */
function maxValue(bits: number): string {
  const one = BigInt(1);
  return ((one << BigInt(bits)) - one).toLocaleString("en-IN");
}

/** 2^n bytes, written the way a human would say it. */
function addressSpace(lines: number): string {
  const bytes = Math.pow(2, lines);
  const units = ["bytes", "KB", "MB", "GB", "TB", "PB"];
  let v = bytes;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) { v /= 1024; u++; }
  return `${v} ${units[u]}`;
}

export function CpuEvolutionLab() {
  const [i, setI] = useState(3); // the 8085, since that is what the course teaches
  const c = CHIPS[i];
  const maxT = 48;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧬 Fifty years of processors — and what actually changed</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Pick a chip. The address space is not looked up — it is <b>calculated</b> from the address
        lines, which is the one number in this table you will be asked to work out rather than
        recall.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
        {CHIPS.map((chip, ix) => (
          <button
            key={chip.name}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 9px", fontSize: 11, fontFamily: "var(--mono)" }}
            onClick={() => setI(ix)}
          >
            {chip.name}
          </button>
        ))}
      </div>

      {/* The word-length bar: the single clearest picture of what "8-bit" means. */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700 }}>{c.name}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-faint)" }}>{c.year}</span>
        </div>

        <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
          {Array.from({ length: 64 }, (_, b) => (
            <div
              key={b}
              style={{
                flex: 1, height: 14, borderRadius: 2,
                background: b < c.bits ? "var(--accent)" : "var(--line)",
                opacity: b < c.bits ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontFamily: "var(--mono)", marginBottom: 14 }}>
          {c.bits} bits in one register — holds 0 to {maxValue(c.bits)}
        </div>

        <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
          {Array.from({ length: maxT }, (_, b) => (
            <div
              key={b}
              style={{
                flex: 1, height: 10, borderRadius: 2,
                background: b < c.addressLines ? "var(--teal)" : "var(--line)",
                opacity: b < c.addressLines ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>
          {c.addressLines} address lines → 2<sup>{c.addressLines}</sup> = <b style={{ color: "var(--teal)" }}>{addressSpace(c.addressLines)}</b> of memory
        </div>

        <div style={{ display: "flex", gap: 18, marginTop: 14, flexWrap: "wrap", fontFamily: "var(--mono)", fontSize: 12 }}>
          <span style={{ color: "var(--ink-faint)" }}>clock <b style={{ color: "var(--ink)" }}>{c.clock}</b></span>
          <span style={{ color: "var(--ink-faint)" }}>transistors <b style={{ color: "var(--ink)" }}>{c.transistors}</b></span>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>What it unlocked.</b> {c.unlocked}</div>
      </div>
      <div className="note warn" style={{ marginTop: 10 }}>
        <span className="i">⚠️</span>
        <div><b>What still hurt.</b> {c.hurt}</div>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}>
        <span className="i">💡</span>
        <div>
          Walk left to right and watch the pattern — then watch it break. From the 4004 to the
          80386 the answer to &ldquo;make it faster&rdquo; is always the same three things: wider
          registers, more address lines, higher clock. From the Pentium on, the clock stops moving
          and the answer becomes <b>do more at once</b> — pipelines, then two instructions per
          cycle, then many cores. That change of shape is the most important thing in this lesson,
          and it is the reason the last two rows read so differently from the first seven.
        </div>
      </div>
    </div>
  );
}
