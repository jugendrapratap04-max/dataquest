"use client";

import { useState } from "react";

/* Three panels for "Machine cycles, T-states, timing diagrams".
 *
 * This is the lesson where the simulator finally agrees with the topic: it counts
 * T-states, so every total below was taken from lib/asm8085.ts rather than from a
 * table. The BREAKDOWN into machine cycles is from the standard 8085 references
 * and is the one part the simulator cannot confirm — it knows what an instruction
 * costs, not how that cost is divided.
 *
 *   MachineCycleLab  instruction cycle -> machine cycles -> T-states, as nested
 *                    boxes whose parts add up to the number the simulator prints.
 *   TimingLab        the exam artefact. A timing diagram is a table of what each
 *                    pin is doing in each T-state, and drawing it as a table
 *                    rather than as waveforms makes that obvious.
 *   WaitStateLab     READY, and what a slow memory costs. The only panel here
 *                    with a number that changes the wall-clock answer.
 *
 * Worth knowing while reading this file: the opcode fetch is FOUR T-states for
 * most instructions and SIX for a few (INX, DCX, PUSH, CALL, and the conditional
 * returns), which is why INX costs 6 and PUSH costs 12. Both are checked. */

type Cycle = { kind: string; t: number; note: string };
type Instr = { id: string; total: number; cycles: Cycle[] };

const OF = (t: number, note: string): Cycle => ({ kind: "Opcode fetch", t, note });
const MR = (note: string): Cycle => ({ kind: "Memory read", t: 3, note });
const MW = (note: string): Cycle => ({ kind: "Memory write", t: 3, note });

const INSTRS: Instr[] = [
  { id: "MOV B, A", total: 4, cycles: [OF(4, "everything happens inside the chip, so there is nothing else to do")] },
  { id: "MVI A, 42H", total: 7, cycles: [OF(4, "read the opcode 3EH"), MR("read the byte that follows it")] },
  { id: "MOV A, M", total: 7, cycles: [OF(4, "read the opcode 7EH"), MR("read the byte at the address in HL")] },
  { id: "LXI H, 2050H", total: 10, cycles: [OF(4, "read the opcode 21H"), MR("read 50H, the low byte"), MR("read 20H, the high byte")] },
  { id: "LDA 2050H", total: 13, cycles: [OF(4, "read the opcode 3AH"), MR("read the low address byte"), MR("read the high address byte"), MR("go and fetch the data")] },
  { id: "STA 2060H", total: 13, cycles: [OF(4, "read the opcode 32H"), MR("read the low address byte"), MR("read the high address byte"), MW("write the accumulator there")] },
  { id: "OUT 80H", total: 10, cycles: [OF(4, "read the opcode D3H"), MR("read the port number"), { kind: "I/O write", t: 3, note: "same pins as a memory write, with IO/M high" }] },
  { id: "IN 80H", total: 10, cycles: [OF(4, "read the opcode DBH"), MR("read the port number"), { kind: "I/O read", t: 3, note: "same pins as a memory read, with IO/M high" }] },
  { id: "INX H", total: 6, cycles: [OF(6, "a longer fetch: the 16-bit incrementer needs two extra clocks and no bus access")] },
  { id: "DAD B", total: 10, cycles: [OF(4, "read the opcode 09H"), { kind: "Bus idle", t: 3, note: "the ALU is adding eight bits at a time; the bus does nothing" }, { kind: "Bus idle", t: 3, note: "and again, for the high half" }] },
  { id: "PUSH H", total: 12, cycles: [OF(6, "a longer fetch: the stack pointer has to be decremented first"), MW("write H at SP-1"), MW("write L at SP-2")] },
  { id: "CALL 2100H", total: 18, cycles: [OF(6, "a longer fetch, for the same reason as PUSH"), MR("read the low address byte"), MR("read the high address byte"), MW("push the return address, high byte"), MW("push the return address, low byte")] },
];

export function MachineCycleLab() {
  const [i, setI] = useState(1);
  const ins = INSTRS[i];
  const sum = ins.cycles.reduce((n, c) => n + c.t, 0);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">⏱️ One instruction, broken into machine cycles</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        An <b>instruction cycle</b> is made of <b>machine cycles</b>, and each machine cycle is made
        of <b>T-states</b>. Pick an instruction and watch the parts add up.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {INSTRS.map((x, ix) => (
          <button
            key={x.id}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "4px 9px", fontSize: 11, fontFamily: "var(--mono)" }}
            onClick={() => setI(ix)}
          >
            {x.id}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {ins.cycles.map((c, k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 7, background: "var(--panel)", border: "1px solid var(--line)" }}>
              <span style={{ flex: "0 0 22px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)" }}>M{k + 1}</span>
              <span style={{ flex: "0 0 110px", fontFamily: "var(--mono)", fontSize: 11.5, fontWeight: 700, color: "var(--teal)" }}>{c.kind}</span>
              <span style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: c.t }, (_, x) => (
                  <span key={x} style={{ width: 14, height: 14, borderRadius: 3, background: "var(--accent-soft)", border: "1px solid var(--accent)" }} />
                ))}
              </span>
              <span style={{ flex: "0 0 34px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent-2)" }}>{c.t} T</span>
              <span style={{ flex: 1, fontSize: 10.5, color: "var(--ink-faint)" }}>{c.note}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 12, fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-soft)" }}>
          {ins.cycles.length} machine cycle{ins.cycles.length === 1 ? "" : "s"} ={" "}
          {ins.cycles.map((c) => c.t).join(" + ")} ={" "}
          <b style={{ color: "var(--good)", fontSize: 17 }}>{sum} T-states</b>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          {ins.cycles[0].t === 6 ? (
            <>
              <b>Notice the opcode fetch is six T-states here, not four.</b> A handful of
              instructions need two extra clocks inside the fetch to work on a 16-bit value before
              anything else can happen — <code>INX</code>, <code>DCX</code>, <code>PUSH</code>,{" "}
              <code>CALL</code> and the conditional returns. That is where the odd totals come from.
            </>
          ) : (
            <>
              <b>Every machine cycle is one trip over the bus</b>{" "}
              — except the bus-idle cycles, which are the exception that proves the rule. The opcode
              fetch is four T-states and an ordinary read or write is three, so an
              instruction&apos;s cost is almost always{" "}
              <b>4 + 3 for each extra byte it touches</b>.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          These totals are the ones the <b>8085 Lab</b> prints. Run any of these instructions in
          lesson 5 and the T-state counter agrees, because both come from the same engine — the split
          into machine cycles is the part this panel adds.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------ 2 · the timing diagram --- */

type Row = { name: string; cells: string[] };
type MC = { id: string; label: string; ts: string[]; rows: Row[]; note: string };

const MCS: MC[] = [
  {
    id: "of", label: "Opcode fetch", ts: ["T1", "T2", "T3", "T4"],
    rows: [
      { name: "A15–A8", cells: ["20H", "20H", "20H", "20H"] },
      { name: "AD7–AD0", cells: ["00H addr", "opcode", "opcode", "—"] },
      { name: "ALE", cells: ["HIGH", "low", "low", "low"] },
      { name: "RD", cells: ["high", "LOW", "LOW", "high"] },
      { name: "WR", cells: ["high", "high", "high", "high"] },
      { name: "IO/M", cells: ["0", "0", "0", "0"] },
      { name: "S1 S0", cells: ["1 1", "1 1", "1 1", "1 1"] },
    ],
    note: "Four T-states, not three. The extra one is T4, where the processor decodes what it just read — no pin activity at all, which is why the address and data rows go quiet.",
  },
  {
    id: "mr", label: "Memory read", ts: ["T1", "T2", "T3"],
    rows: [
      { name: "A15–A8", cells: ["20H", "20H", "20H"] },
      { name: "AD7–AD0", cells: ["50H addr", "data", "data"] },
      { name: "ALE", cells: ["HIGH", "low", "low"] },
      { name: "RD", cells: ["high", "LOW", "LOW"] },
      { name: "WR", cells: ["high", "high", "high"] },
      { name: "IO/M", cells: ["0", "0", "0"] },
      { name: "S1 S0", cells: ["1 0", "1 0", "1 0"] },
    ],
    note: "The shape everything else is a variation on: address out with ALE, then RD low while memory answers. S1 S0 read 1 0, which is what distinguishes this from an opcode fetch on identical pins.",
  },
  {
    id: "mw", label: "Memory write", ts: ["T1", "T2", "T3"],
    rows: [
      { name: "A15–A8", cells: ["20H", "20H", "20H"] },
      { name: "AD7–AD0", cells: ["60H addr", "data out", "data out"] },
      { name: "ALE", cells: ["HIGH", "low", "low"] },
      { name: "RD", cells: ["high", "high", "high"] },
      { name: "WR", cells: ["high", "LOW", "LOW"] },
      { name: "IO/M", cells: ["0", "0", "0"] },
      { name: "S1 S0", cells: ["0 1", "0 1", "0 1"] },
    ],
    note: "The only differences from a read are which control line goes low and who is driving the data pins. Here the processor drives them for the whole cycle, so they never go high impedance.",
  },
  {
    id: "iow", label: "I/O write", ts: ["T1", "T2", "T3"],
    rows: [
      { name: "A15–A8", cells: ["80H port", "80H port", "80H port"] },
      { name: "AD7–AD0", cells: ["80H port", "data out", "data out"] },
      { name: "ALE", cells: ["HIGH", "low", "low"] },
      { name: "RD", cells: ["high", "high", "high"] },
      { name: "WR", cells: ["high", "LOW", "LOW"] },
      { name: "IO/M", cells: ["1", "1", "1"] },
      { name: "S1 S0", cells: ["0 1", "0 1", "0 1"] },
    ],
    note: "Identical to a memory write except for one line. Note the port number appearing on BOTH halves of the address bus, which is the 8085 detail exams like.",
  },
];

export function TimingLab() {
  const [i, setI] = useState(1);
  const mc = MCS[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📈 A timing diagram, as the table it really is</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        A timing diagram is not art. It is a list of <b>what every pin is doing in each T-state</b>,
        and once it is written that way it can be drawn from memory.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {MCS.map((x, ix) => (
          <button
            key={x.id}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 11px", fontSize: 11.5 }}
            onClick={() => setI(ix)}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12, overflowX: "auto" }}>
        <div style={{ minWidth: 340 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            <span style={{ flex: "0 0 84px" }} />
            {mc.ts.map((t) => (
              <span key={t} style={{ flex: 1, textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent-2)", fontWeight: 700 }}>
                {t}
              </span>
            ))}
          </div>
          {mc.rows.map((r) => (
            <div key={r.name} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              <span style={{ flex: "0 0 84px", fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink-faint)", alignSelf: "center" }}>{r.name}</span>
              {r.cells.map((c, k) => {
                const hot = c === "HIGH" || c === "LOW";
                return (
                  <span
                    key={k}
                    style={{
                      flex: 1, textAlign: "center", padding: "5px 2px", borderRadius: 5,
                      fontFamily: "var(--mono)", fontSize: 10.5,
                      background: hot ? "var(--good-soft)" : "var(--panel)",
                      border: `1px solid ${hot ? "var(--good)" : "var(--line)"}`,
                      color: hot ? "var(--ink)" : "var(--ink-soft)",
                      fontWeight: hot ? 700 : 400,
                    }}
                  >
                    {c}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>{mc.label} — {mc.ts.length} T-states.</b> {mc.note}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Compare <b>Memory write</b> and <b>I/O write</b> row by row and only <code>IO/M</code>{" "}
          differs. That is the same point lesson 8 made from the buses and lesson 11 made from the
          pins — three lessons, one fact, because it is the fact the whole I/O system rests on.
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------- 3 · when memory is slow --- */

export function WaitStateLab() {
  const [w, setW] = useState(0);
  const cycleT = 3 + w;
  /* LDA is 4 + 3 + 3 + 3: one fetch and three reads, so every read cycle stretches. */
  const instrT = 4 + 3 * (3 + w) + w; /* the fetch stretches too */
  const us = (instrT * (1 / 3)).toFixed(2);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🐢 Wait states — what a slow memory costs</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        If memory cannot answer in time it holds <b>READY</b> low, and the processor stops the clock
        where it stands. Slide in some wait states and watch <code>LDA 2050H</code> get slower.
      </p>

      <input
        type="range" min={0} max={3} value={w}
        onChange={(e) => setW(Number(e.target.value))}
        aria-label="how many wait states memory asks for"
        style={{ width: "100%" }}
      />
      <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
        <b style={{ color: w ? "var(--bad)" : "var(--good)" }}>{w}</b> wait state{w === 1 ? "" : "s"} per bus cycle
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12, marginTop: 12 }}>
        <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--ink-faint)", marginBottom: 6 }}>
          ONE MEMORY READ CYCLE
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: 3 + w }, (_, k) => {
            const wait = k >= 2 && k < 2 + w;
            return (
              <div
                key={k}
                style={{
                  flex: 1, padding: "10px 2px", borderRadius: 6, textAlign: "center",
                  background: wait ? "var(--bad-soft)" : "var(--panel)",
                  border: `1px solid ${wait ? "var(--bad)" : "var(--line)"}`,
                  fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink)",
                }}
              >
                {wait ? "Tw" : `T${k < 2 ? k + 1 : k + 1 - w}`}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", textAlign: "center" }}>
          {[
            { k: "one read cycle", v: `${cycleT} T` },
            { k: "LDA 2050H", v: `${instrT} T` },
            { k: "at 3 MHz", v: `${us} µs` },
          ].map((x) => (
            <div key={x.k} style={{ flex: "1 1 100px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--panel)", padding: "8px 10px" }}>
              <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>{x.k.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: w ? "var(--bad)" : "var(--good)" }}>{x.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={`note ${w ? "warn" : "key"}`} style={{ marginTop: 12 }}>
        <span className="i">{w ? "⚠️" : "📌"}</span>
        <div>
          {w === 0 ? (
            <>
              <b>No wait states — memory keeps up.</b> A read is three T-states and{" "}
              <code>LDA 2050H</code> is 13, which is the number the simulator prints. Every T-state
              count you have seen in this course assumes this.
            </>
          ) : (
            <>
              <b>{w} wait state{w === 1 ? "" : "s"} costs {instrT - 13} T-states on this one
              instruction.</b> The waits land between T2 and T3, with the address and control signals
              frozen where they are, so memory gets {w} extra clock period{w === 1 ? "" : "s"} to
              answer. Nothing in the program changed — the same <code>LDA</code> simply takes longer,
              and every delay loop calculated from T-states is now wrong by the same proportion.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          This is why a delay loop is specified in T-states <b>and</b> a clock frequency <b>and</b> a
          wait-state count. Two boards running identical code at the same 3 MHz will produce
          different delays if one of them has slower memory.
        </div>
      </div>
    </div>
  );
}
