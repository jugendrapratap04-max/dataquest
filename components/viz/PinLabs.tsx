"use client";

import { useState } from "react";

/* Three panels for "Pins and signals".
 *
 * This is the first lesson in the subject where almost nothing executes.
 * lib/asm8085.ts simulates registers and memory, not pin timing — so per
 * docs/MICROPROCESSOR-SYLLABUS.md these are purpose-built models, and the lesson
 * says so on the page rather than implying the panels are simulations.
 *
 *   PinLab            the 40 pins, by group. "Explain the pin diagram" is a
 *                     guaranteed question and it is unanswerable from a list.
 *   AleLab            multiplexing, which is the one idea in this lesson that a
 *                     static diagram actively obscures: the SAME eight pins carry
 *                     two different things a few hundred nanoseconds apart.
 *   ControlSignalLab  MEMR / MEMW / IOR / IOW built from IO/M, RD and WR. Three
 *                     switches, four outputs, and the impossible combinations
 *                     visible as impossible.
 *
 * No HTML entities in the JSX text here on purpose — an entity inside a text run
 * eats the space in front of it (docs/HANDOFF.md §4). Unicode characters are
 * written directly. */

/* ------------------------------------------------------ 1 · the 40 pins --- */

type Group = {
  id: string;
  name: string;
  pins: string;
  count: number;
  dir: string;
  what: string;
};

const GROUPS: Group[] = [
  {
    id: "addr", name: "Address bus", pins: "21–28", count: 8, dir: "output only",
    what: "A15 down to A8 — the high half of the address, and nothing else ever appears on them. Because they are one-way and never shared, they need no latch outside the chip: whatever the processor puts there stays there for the whole machine cycle.",
  },
  {
    id: "ad", name: "Address / data bus", pins: "12–19", count: 8, dir: "bidirectional",
    what: "AD7 down to AD0, and they do two jobs. At the start of a machine cycle they carry the LOW half of the address; a moment later they carry the data byte. This sharing is what makes 40 pins enough, and it is why an 8085 board needs an external latch. The second panel is this cycle, step by step.",
  },
  {
    id: "ctrl", name: "Control and status", pins: "29–35", count: 7, dir: "mostly output",
    what: "ALE, RD, WR, IO/M, S0, S1 and READY. ALE says the address/data pins are carrying an address right now. RD and WR say which direction data moves. IO/M says memory or device. S0 and S1 further identify the cycle — an opcode fetch reads 1 1 while an ordinary memory read reads 1 0. READY is the one input: a slow memory holds it low and the processor waits.",
  },
  {
    id: "intr", name: "Interrupts", pins: "6–11", count: 6, dir: "5 in, 1 out",
    what: "TRAP, RST 7.5, RST 6.5, RST 5.5 and INTR come in; INTA goes out to acknowledge the last of them. TRAP cannot be masked and the others can. Chapter 6 is entirely about these six pins.",
  },
  {
    id: "serial", name: "Serial I/O", pins: "4–5", count: 2, dir: "1 in, 1 out",
    what: "SOD out and SID in, moving data one bit at a time. This is the 8085's own addition over the 8080 — a simple serial link with no extra chip. SIM writes the output bit and RIM reads the input one.",
  },
  {
    id: "dma", name: "DMA", pins: "38–39", count: 2, dir: "1 in, 1 out",
    what: "HOLD comes in from a device asking for the buses; HLDA goes out saying the processor has let go of them. While HLDA is high the address and data pins are in high impedance and the 8085 is doing nothing at all. Lesson 27.",
  },
  {
    id: "reset", name: "Reset", pins: "3, 36", count: 2, dir: "1 in, 1 out",
    what: "RESET IN clears the program counter to 0000H, which is why every 8085 system starts executing at address zero. RESET OUT tells the rest of the board to reset with it, so the peripherals and the processor agree about when time started.",
  },
  {
    id: "clock", name: "Clock", pins: "1, 2, 37", count: 3, dir: "2 in, 1 out",
    what: "X1 and X2 take a crystal, and the 8085 divides it by two — a 6 MHz crystal gives a 3 MHz processor. CLK OUT hands that clock to the rest of the board. Having the generator on-chip is one of the 8085's main improvements over the 8080.",
  },
  {
    id: "power", name: "Power", pins: "20, 40", count: 2, dir: "supply",
    what: "Vss and Vcc — a single 5 V supply. The 8080 needed three different voltages, so this pair is quietly one of the reasons the 8085 replaced it.",
  },
];

export function PinLab() {
  const [sel, setSel] = useState("ad");
  const g = GROUPS.find((x) => x.id === sel) ?? GROUPS[0];
  const total = GROUPS.reduce((n, x) => n + x.count, 0);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📌 Forty pins, in nine groups</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Nobody memorises forty pins. They memorise nine groups and what each group is for — click
        through them and the diagram stops being a list.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {GROUPS.map((x) => (
          <button
            key={x.id}
            onClick={() => setSel(x.id)}
            style={{
              cursor: "pointer", padding: "7px 10px", borderRadius: 8, textAlign: "left",
              background: x.id === sel ? "var(--accent-soft)" : "var(--panel-2)",
              border: `${x.id === sel ? 2 : 1}px solid ${x.id === sel ? "var(--accent)" : "var(--line)"}`,
              color: "var(--ink)",
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>{x.name}</div>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>
              {x.count} pin{x.count === 1 ? "" : "s"}
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 110px", border: "1px solid var(--teal)", borderRadius: 9, background: "var(--panel-2)", padding: "8px 11px" }}>
          <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--teal)" }}>PIN NUMBERS</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--mono)" }}>{g.pins}</div>
        </div>
        <div style={{ flex: "1 1 110px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--panel-2)", padding: "8px 11px" }}>
          <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--ink-faint)" }}>HOW MANY</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--mono)" }}>{g.count}</div>
        </div>
        <div style={{ flex: "1 1 140px", border: "1px solid var(--accent)", borderRadius: 9, background: "var(--panel-2)", padding: "8px 11px" }}>
          <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--accent-2)" }}>DIRECTION</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--mono)" }}>{g.dir}</div>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>{g.name}.</b> {g.what}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          The groups add up to <b>{total}</b>, and the arithmetic is the point. Sixteen address lines
          plus eight data lines plus control, status, interrupts, serial, DMA, reset, clock and power
          does not fit in forty — which is why eight of those pins had to do two jobs.
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------- 2 · the same pins, twice over --- */

type Phase = {
  t: string;
  ale: string;
  ad: string;
  a15: string;
  latch: string;
  rd: string;
  detail: string;
};

const PHASES: Phase[] = [
  {
    t: "T1 — the address goes out",
    ale: "HIGH", ad: "50H — the LOW address byte", a15: "20H — the high address byte",
    latch: "(catching)", rd: "high (inactive)",
    detail: "The processor wants the byte at 2050H. The high half goes onto A15–A8 where it will stay all cycle. The low half goes onto AD7–AD0, and ALE goes high to announce that those pins are carrying an address right now.",
  },
  {
    t: "end of T1 — ALE falls, the latch closes",
    ale: "falling", ad: "50H — about to be released", a15: "20H",
    latch: "50H — held",
    rd: "high (inactive)",
    detail: "The falling edge of ALE is the moment that matters. An external latch — a 74LS373 on almost every 8085 board — copies AD7–AD0 into its own outputs and holds them. Those outputs are A7–A0, and they now stay steady for the rest of the cycle.",
  },
  {
    t: "T2 — the pins change jobs",
    ale: "LOW", ad: "released — high impedance", a15: "20H",
    latch: "50H — held", rd: "LOW (active)",
    detail: "The processor lets go of AD7–AD0 so that memory can drive them. RD goes low, meaning read. The full address 2050H is still present on the bus — half from A15–A8 and half from the latch — even though the processor is no longer sending the low half.",
  },
  {
    t: "T3 — the data arrives",
    ale: "LOW", ad: "5AH — the DATA byte", a15: "20H",
    latch: "50H — held", rd: "LOW (active)",
    detail: "Memory puts the byte on AD7–AD0 and the processor reads it. The same eight pins that carried 50H two T-states ago now carry 5AH, and nothing about the pins says which is which — only when you look decides that.",
  },
];

export function AleLab() {
  const [i, setI] = useState(0);
  const p = PHASES[i];

  const rows: [string, string, string][] = [
    ["A15–A8", p.a15, "var(--teal)"],
    ["AD7–AD0", p.ad, "var(--accent)"],
    ["ALE", p.ale, "var(--good)"],
    ["RD", p.rd, "var(--ink-faint)"],
    ["latch output → A7–A0", p.latch, "var(--teal)"],
  ];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔀 One set of pins, two jobs — ALE and the latch</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        A memory read of address <b>2050H</b>, four steps. Watch the <b>AD7–AD0</b> row: it changes
        what it means halfway through, and the latch row is what stops that being a problem.
      </p>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12 }}>
        {rows.map(([label, value, tone]) => (
          <div
            key={label}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "7px 2px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span style={{ flex: "0 0 150px", fontSize: 10.5, fontFamily: "var(--mono)", color: tone }}>{label}</span>
            <span style={{ flex: 1, fontSize: 13, fontFamily: "var(--mono)", fontWeight: 700, color: "var(--ink)" }}>{value}</span>
          </div>
        ))}
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 12 }}>
        <div className="ss-stepper">
          <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} aria-label="previous step">‹</button>
          {PHASES.map((_, k) => (
            <button key={k} className={`ss-step${k === i ? " on" : ""}`} onClick={() => setI(k)} aria-current={k === i}>
              {k + 1}
            </button>
          ))}
          <button onClick={() => setI((n) => Math.min(PHASES.length - 1, n + 1))} disabled={i === PHASES.length - 1} aria-label="next step">›</button>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>{p.t}</b><br />{p.detail}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          This is a <b>model of the timing</b>, not a simulation — the 8085 Lab in lesson 5 runs real
          code but has no pins. The exam question it answers is short: <b>why is a latch needed, and
          what clocks it?</b> Because AD7–AD0 stop carrying the address after T1, and the falling
          edge of ALE is what tells the latch to keep it.
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- 3 · four control signals from three --- */

export function ControlSignalLab() {
  const [io, setIo] = useState(false); // false = memory, true = I/O
  const [rd, setRd] = useState(true);
  const [wr, setWr] = useState(false);

  const memr = !io && rd;
  const memw = !io && wr;
  const ior = io && rd;
  const iow = io && wr;
  const both = rd && wr;
  const none = !rd && !wr;

  const OUTS: [string, boolean, string][] = [
    ["MEMR", memr, "read a memory location"],
    ["MEMW", memw, "write a memory location"],
    ["IOR", ior, "read an input port"],
    ["IOW", iow, "write an output port"],
  ];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔌 Four control signals out of three pins</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        The 8085 does not have MEMR, MEMW, IOR and IOW pins. A board builds all four from{" "}
        <b>IO/M</b>, <b>RD</b> and <b>WR</b> with a handful of gates. Flip the three and watch which
        one comes out.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          className={`btn ${io ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "7px 13px", fontSize: 12, fontFamily: "var(--mono)" }}
          onClick={() => setIo((v) => !v)}
        >
          IO/M = {io ? "1 · I/O" : "0 · memory"}
        </button>
        <button
          className={`btn ${rd ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "7px 13px", fontSize: 12, fontFamily: "var(--mono)" }}
          onClick={() => setRd((v) => !v)}
        >
          RD {rd ? "active" : "idle"}
        </button>
        <button
          className={`btn ${wr ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "7px 13px", fontSize: 12, fontFamily: "var(--mono)" }}
          onClick={() => setWr((v) => !v)}
        >
          WR {wr ? "active" : "idle"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        {OUTS.map(([name, on, what]) => (
          <div
            key={name}
            style={{
              flex: "1 1 120px", borderRadius: 9, padding: "10px 11px", textAlign: "center",
              background: on ? "var(--good-soft)" : "var(--panel-2)",
              border: `${on ? 2 : 1}px solid ${on ? "var(--good)" : "var(--line)"}`,
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{name}</div>
            <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: on ? "var(--good)" : "var(--ink-faint)", marginTop: 2 }}>
              {on ? "ACTIVE" : "idle"}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)", marginTop: 4 }}>{what}</div>
          </div>
        ))}
      </div>

      <div className={`note ${both ? "warn" : "key"}`} style={{ marginTop: 12 }}>
        <span className="i">{both ? "⚠️" : "📌"}</span>
        <div>
          {both ? (
            <>
              <b>The processor never does this.</b> RD and WR active together would mean reading and
              writing in the same moment, and the timing and control unit cannot produce it. The
              panel allows it so you can see that the gates would happily assert two signals at once
              — the guarantee that they do not comes from the processor, not from the logic.
            </>
          ) : none ? (
            <>
              <b>Nothing is active, and that is a real state.</b> Between machine cycles both RD and
              WR are idle, so all four outputs are off and no chip on the board is selected. A bus
              with no driver is the floating case from lesson 8.
            </>
          ) : (
            <>
              <b>One signal, from an AND of two conditions.</b> {io ? "IO/M is high, so the two I/O signals are the ones enabled" : "IO/M is low, so the two memory signals are the ones enabled"}, and{" "}
              {rd ? "RD" : "WR"} picks the direction. All four are active-low in real hardware, which
              is why they are drawn with bars over them and why the gates are usually NANDs.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Two instructions you have already run are two rows of this table. <code>STA 2060H</code> is
          IO/M low with WR active, which is <b>MEMW</b>. <code>OUT 80H</code> is IO/M high with WR
          active, which is <b>IOW</b>. Same pins, same byte, one line different — which is exactly
          the bug lesson 8 ended with.
        </div>
      </div>
    </div>
  );
}
