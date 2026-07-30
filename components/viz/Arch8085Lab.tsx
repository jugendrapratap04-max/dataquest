"use client";

import { useState } from "react";

/* The 8085 architecture block diagram — the one picture this whole subject is
 * built on, and the thing every textbook opens with.
 *
 * It is hand-drawn SVG rather than a generated image for the reason stated in
 * docs/MICROPROCESSOR-SYLLABUS.md: block names, bus widths and signal names are
 * the one thing an engineering course cannot get wrong, and generated diagrams get
 * them wrong constantly. The blocks and signals here follow Gaonkar's figure — the
 * standard Indian reference — including the parts students are usually surprised
 * by, such as the W and Z temporary registers that no instruction can name.
 *
 * It has two modes, and the second is why it exists:
 *
 *   EXPLORE — click any block and read what it does.
 *   TRACE   — step through what actually happens when `MVI A, 42H` runs. The
 *             blocks light up in order, and the buses show what is on them at
 *             each step. A static diagram tells you the parts; this tells you why
 *             they are wired that way.
 *
 * The trace is the fetch-decode-execute cycle from lesson 1, drawn on the hardware
 * that performs it — so the two lessons describe the same thing from two sides. */

type Block = {
  id: string;
  label: string;
  sub?: string;
  x: number; y: number; w: number; h: number;
  /** What it does, in the panel below. */
  what: string;
};

const W = 780;
const H = 540;

// The internal data bus sits at this y and every block that can put a byte on it
// connects to it. Its width — 8 bits — is why a 16-bit value takes two trips.
const BUS_Y = 268;

const BLOCKS: Block[] = [
  {
    id: "intr", label: "Interrupt control", x: 232, y: 18, w: 168, h: 40,
    what: "Watches the five interrupt pins — INTR, RST 5.5, RST 6.5, RST 7.5 and TRAP — and decides whether the processor should stop what it is doing. It holds the mask bits that SIM sets and RIM reads, and it enforces the priority order when two arrive at once. Chapter 5 is entirely about this block.",
  },
  {
    id: "serial", label: "Serial I/O control", x: 420, y: 18, w: 168, h: 40,
    what: "Two pins, SID in and SOD out, that move data one bit at a time. This is the 8085's own addition over the 8080 — it means a simple serial link needs no extra chip. SIM writes the output bit and RIM reads the input bit, which is why those two instructions look so strange: each one does several unrelated jobs.",
  },
  {
    id: "acc", label: "Accumulator", sub: "8-bit", x: 20, y: 86, w: 112, h: 44,
    what: "Register A. One operand of almost every arithmetic and logic instruction, and where the result goes — ADD B means A = A + B, and there is no instruction to add B into C. Concentrating arithmetic here is what keeps the opcodes one byte long, and it is why the accumulator is drawn next to the ALU rather than with the other registers.",
  },
  {
    id: "temp", label: "Temp register", sub: "8-bit", x: 148, y: 86, w: 112, h: 44,
    what: "Holds the SECOND operand while the ALU works, and no instruction can name it. When you write ADD B, the contents of B travel over the internal data bus into here, because the ALU has two inputs and only one of them is the accumulator. Every arithmetic instruction uses this register and no program ever mentions it.",
  },
  {
    id: "ir", label: "Instruction register", sub: "8-bit", x: 300, y: 86, w: 150, h: 44,
    what: "Where the opcode lands after it is fetched. The first byte of every instruction comes off the data bus into here — and then the program counter has already moved on, which is why the byte in this register is the instruction being executed rather than the one being fetched.",
  },
  {
    id: "flags", label: "Flag flip-flops", sub: "S Z AC P CY", x: 20, y: 150, w: 112, h: 52,
    what: "Five single-bit outputs of the ALU: Sign, Zero, Auxiliary Carry, Parity and Carry. They are flip-flops rather than a register, which is the honest picture — there is no eight-bit flag register on the chip, only five bits that PUSH PSW happens to pack into a byte along with three fixed values.",
  },
  {
    id: "alu", label: "ALU", sub: "8-bit", x: 148, y: 150, w: 112, h: 52,
    what: "The arithmetic and logic unit. Two 8-bit inputs — the accumulator and the temp register — one 8-bit output back to the accumulator, and five flag bits out to the flip-flops. It is eight bits wide, which is what makes the 8085 an 8-bit processor: even DAD, which adds sixteen bits, goes through here in two passes.",
  },
  {
    id: "decoder", label: "Instruction decoder", sub: "and machine cycle encoding", x: 300, y: 150, w: 150, h: 52,
    what: "Turns the opcode into actions. It works out how many bytes the instruction needs, how many machine cycles that will take, and which internal paths to open — and it hands that timetable to the timing and control unit. This block is where 3EH becomes \"read the next byte into the accumulator\".",
  },
  {
    id: "regs", label: "Register array", x: 500, y: 86, w: 260, h: 152,
    what: "The programmer's registers, plus two that are not. B–C, D–E and H–L can each work as one 8-bit register or as a 16-bit pair. The stack pointer and program counter are 16 bits because they hold addresses. W and Z are temporary and no instruction can name them — the processor uses them to hold an address while an instruction like LXI is still being fetched.",
  },
  {
    id: "incdec", label: "Incrementer / decrementer", sub: "address latch · 16-bit", x: 500, y: 292, w: 260, h: 46,
    what: "Adds or subtracts one from a 16-bit value, and this is the block doing the work in more places than you would guess: every INX and DCX, every automatic step of the program counter after a fetch, and every PUSH and POP moving the stack pointer. It is also why INX affects no flags — it is not the ALU, so there is nothing to set them.",
  },
  {
    id: "timing", label: "Timing and control unit", x: 20, y: 292, w: 430, h: 46,
    what: "The conductor. It takes the decoder's timetable and drives the actual pins in the right order — ALE to latch the address, RD or WR at the right moment, the status lines saying whether this is memory or I/O. T-states are its clock ticks, which is why an instruction's cost is a property of this block rather than of the arithmetic.",
  },
  {
    id: "abuf", label: "Address buffer", sub: "8-bit", x: 500, y: 372, w: 124, h: 44,
    what: "Drives the eight high address lines, A15 to A8. One direction only — the processor never reads anything on these pins — so this half of the address never needs to be latched by anything outside the chip.",
  },
  {
    id: "adbuf", label: "Address/data buffer", sub: "8-bit", x: 636, y: 372, w: 124, h: 44,
    what: "The multiplexed half, AD7 to AD0. It carries the low byte of the ADDRESS at the start of a machine cycle and then the DATA — which is how the 8085 fits a 16-bit address and an 8-bit data path into 40 pins. It is also why ALE exists and why every 8085 board needs an external latch, which is lesson 7.",
  },
];

/** The sub-boxes inside the register array, laid out as Gaonkar draws them. */
const REG_CELLS = [
  ["W (8)", "Z (8)", "temporary"],
  ["B (8)", "C (8)", ""],
  ["D (8)", "E (8)", ""],
  ["H (8)", "L (8)", ""],
];

type Step = {
  title: string;
  detail: string;
  active: string[];
  /** What is on the address pins and the data pins at this moment. */
  addr?: string;
  data?: string;
  signals?: string;
};

const TRACE: Step[] = [
  {
    title: "1 · the program counter already knows where to look",
    detail: "PC holds 2000H. Nothing has been fetched yet — this is the state the processor sits in between instructions, and the only thing that says what happens next is this 16-bit number.",
    active: ["regs"],
  },
  {
    title: "2 · the address goes out on the pins",
    detail: "The contents of PC pass through the address buffer and the address/data buffer, so 2000H appears on A15–A0. ALE goes high to tell the outside world that the low eight pins are carrying an address right now, not data.",
    active: ["regs", "abuf", "adbuf", "timing"],
    addr: "2000H", signals: "ALE = 1, IO/M = 0, RD = 1",
  },
  {
    title: "3 · memory answers, and the opcode arrives",
    detail: "RD goes low and memory puts 3EH on AD7–AD0. The address/data buffer is now carrying data, and the byte travels along the internal data bus to the instruction register. This is the FETCH, and it took four T-states.",
    active: ["adbuf", "ir", "timing"],
    addr: "2000H", data: "3EH", signals: "RD = 0, ALE = 0",
  },
  {
    title: "4 · the decoder works out what 3EH means",
    detail: "\"Load the accumulator with the byte that follows.\" So the decoder knows two things: this instruction is two bytes long, and the second byte is data rather than an opcode. It hands that plan to the timing and control unit. This is the DECODE, and it needs no pins at all.",
    active: ["ir", "decoder", "timing"],
  },
  {
    title: "5 · the program counter steps on by itself",
    detail: "PC goes to 2001H through the incrementer. Nobody wrote an instruction to do this — advancing the program counter is part of fetching, which is why PC ends up at 2002H after a two-byte instruction and not at 2001H.",
    active: ["incdec", "regs"],
  },
  {
    title: "6 · the second byte is read",
    detail: "Another memory read, three T-states this time: 2001H goes out, 42H comes back on AD7–AD0 and onto the internal data bus. The bus does not know or care that this byte is data — it is data only because the opcode said the next byte would be.",
    active: ["regs", "abuf", "adbuf", "timing"],
    addr: "2001H", data: "42H", signals: "RD = 0",
  },
  {
    title: "7 · and into the accumulator",
    detail: "42H leaves the internal data bus and lands in the accumulator. The instruction is finished: seven T-states, two memory reads, and A now holds 42H. Notice the ALU was never involved — MVI is a data transfer, so no flag changed either.",
    active: ["acc"],
    data: "42H",
  },
];

function Box({ b, active, selected, onClick }: { b: Block; active: boolean; selected: boolean; onClick: () => void }) {
  const stroke = selected ? "var(--accent)" : active ? "var(--good)" : "var(--line)";
  const fill = selected ? "var(--accent-soft)" : active ? "var(--good-soft)" : "var(--panel-2)";
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }} role="button" aria-label={b.label} tabIndex={0}>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="5" fill={fill} stroke={stroke} strokeWidth={selected || active ? 2 : 1} />
      <text x={b.x + b.w / 2} y={b.y + (b.sub ? b.h / 2 - 2 : b.h / 2 + 4)} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--ink)">
        {b.label}
      </text>
      {b.sub && (
        <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 12} textAnchor="middle" fontSize="8.5" fill="var(--ink-faint)" fontFamily="var(--mono)">
          {b.sub}
        </text>
      )}
    </g>
  );
}

export function Arch8085Lab() {
  const [mode, setMode] = useState<"explore" | "trace">("explore");
  const [selected, setSelected] = useState<string | null>("acc");
  const [step, setStep] = useState(0);

  const s = TRACE[step];
  const active = mode === "trace" ? new Set(s.active) : new Set<string>();
  const chosen = BLOCKS.find((b) => b.id === selected) ?? BLOCKS[2];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧩 Inside the 8085 — the block diagram, wired up</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        The diagram every textbook opens with, except you can press it. <b>Explore</b> to click a
        block and read what it does; <b>Trace</b> to watch <code>MVI A, 42H</code> travel through
        the hardware, one step at a time, with the buses showing what they are carrying.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12 }}>
        <button className={`btn ${mode === "explore" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setMode("explore")}>
          Explore the blocks
        </button>
        <button className={`btn ${mode === "trace" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setMode("trace")}>
          Trace an instruction
        </button>
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 8, overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 560 }} role="img" aria-label="8085 internal architecture block diagram">
          {/* the internal data bus — the spine everything hangs off */}
          <rect x={12} y={BUS_Y} width={W - 24} height={16} rx="3" fill="var(--teal-soft, var(--panel))" stroke="var(--teal)" strokeWidth="1.2" />
          <text x={20} y={BUS_Y + 11.5} fontSize="9" fontFamily="var(--mono)" fill="var(--teal)">
            internal data bus · 8-bit
          </text>

          {/* stubs from each block down or up to the bus */}
          {BLOCKS.filter((b) => !["intr", "serial"].includes(b.id)).map((b) => {
            const cx = b.x + b.w / 2;
            const from = b.y > BUS_Y ? b.y : b.y + b.h;
            const to = b.y > BUS_Y ? BUS_Y + 16 : BUS_Y;
            return <line key={b.id} x1={cx} y1={from} x2={cx} y2={to} stroke={active.has(b.id) ? "var(--good)" : "var(--line)"} strokeWidth={active.has(b.id) ? 2 : 1} />;
          })}

          {/* accumulator and temp register feed the ALU directly, not via the bus */}
          <line x1={76} y1={130} x2={76} y2={150} stroke={active.has("acc") ? "var(--good)" : "var(--line)"} strokeWidth="1" />
          <line x1={204} y1={130} x2={204} y2={150} stroke={active.has("temp") ? "var(--good)" : "var(--line)"} strokeWidth="1" />
          <line x1={132} y1={176} x2={148} y2={176} stroke="var(--line)" strokeWidth="1" />

          {BLOCKS.map((b) => (
            <Box key={b.id} b={b} active={active.has(b.id)} selected={mode === "explore" && selected === b.id} onClick={() => { setSelected(b.id); if (mode === "trace") setMode("explore"); }} />
          ))}

          {/* the register array's own cells */}
          {REG_CELLS.map((row, r) => (
            <g key={r}>
              <rect x={512} y={104 + r * 26} width={70} height={20} rx="3" fill="var(--panel)" stroke="var(--line)" strokeWidth="0.8" />
              <text x={547} y={118 + r * 26} textAnchor="middle" fontSize="8.5" fontFamily="var(--mono)" fill="var(--ink-soft)">{row[0]}</text>
              <rect x={588} y={104 + r * 26} width={70} height={20} rx="3" fill="var(--panel)" stroke="var(--line)" strokeWidth="0.8" />
              <text x={623} y={118 + r * 26} textAnchor="middle" fontSize="8.5" fontFamily="var(--mono)" fill="var(--ink-soft)">{row[1]}</text>
              {row[2] && <text x={670} y={118 + r * 26} fontSize="7.5" fill="var(--ink-faint)" fontFamily="var(--mono)">{row[2]}</text>}
            </g>
          ))}
          <rect x={512} y={210} width={146} height={20} rx="3" fill="var(--panel)" stroke="var(--line)" strokeWidth="0.8" />
          <text x={585} y={224} textAnchor="middle" fontSize="8.5" fontFamily="var(--mono)" fill="var(--ink-soft)">stack pointer (16)</text>
          <rect x={512} y={184} width={146} height={20} rx="3" fill="var(--panel)" stroke="var(--line)" strokeWidth="0.8" />
          <text x={585} y={198} textAnchor="middle" fontSize="8.5" fontFamily="var(--mono)" fill="var(--ink-soft)">program counter (16)</text>

          {/* pins into the two top blocks */}
          <text x={232} y={12} fontSize="8" fontFamily="var(--mono)" fill="var(--ink-faint)">INTR  INTA  RST 5.5  6.5  7.5  TRAP</text>
          <text x={420} y={12} fontSize="8" fontFamily="var(--mono)" fill="var(--ink-faint)">SID   SOD</text>
          <line x1={316} y1={58} x2={316} y2={BUS_Y} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={504} y1={58} x2={504} y2={BUS_Y} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3" />

          {/* external buses out of the two buffers */}
          <line x1={562} y1={416} x2={562} y2={452} stroke={active.has("abuf") ? "var(--good)" : "var(--line)"} strokeWidth={active.has("abuf") ? 2.4 : 1.6} markerEnd="url(#ah)" />
          <line x1={698} y1={416} x2={698} y2={452} stroke={active.has("adbuf") ? "var(--good)" : "var(--line)"} strokeWidth={active.has("adbuf") ? 2.4 : 1.6} markerEnd="url(#ah)" />
          <text x={562} y={470} textAnchor="middle" fontSize="9.5" fontFamily="var(--mono)" fontWeight="600" fill="var(--ink-soft)">A15–A8</text>
          <text x={562} y={482} textAnchor="middle" fontSize="8" fill="var(--ink-faint)">address, one way</text>
          <text x={698} y={470} textAnchor="middle" fontSize="9.5" fontFamily="var(--mono)" fontWeight="600" fill="var(--ink-soft)">AD7–AD0</text>
          <text x={698} y={482} textAnchor="middle" fontSize="8" fill="var(--ink-faint)">address, then data</text>

          {/* control, status, DMA and reset out of timing and control */}
          <line x1={120} y1={338} x2={120} y2={368} stroke={active.has("timing") ? "var(--good)" : "var(--line)"} strokeWidth={active.has("timing") ? 2.4 : 1.6} markerEnd="url(#ah)" />
          <line x1={300} y1={338} x2={300} y2={368} stroke={active.has("timing") ? "var(--good)" : "var(--line)"} strokeWidth={active.has("timing") ? 2.4 : 1.6} markerEnd="url(#ah)" />
          <text x={120} y={384} textAnchor="middle" fontSize="9" fontFamily="var(--mono)" fill="var(--ink-soft)">RD  WR  ALE</text>
          <text x={120} y={395} textAnchor="middle" fontSize="8" fill="var(--ink-faint)">control</text>
          <text x={300} y={384} textAnchor="middle" fontSize="9" fontFamily="var(--mono)" fill="var(--ink-soft)">IO/M  S1  S0</text>
          <text x={300} y={395} textAnchor="middle" fontSize="8" fill="var(--ink-faint)">status</text>
          <text x={30} y={420} fontSize="8" fontFamily="var(--mono)" fill="var(--ink-faint)">X1  X2  CLK OUT   ·   RESET IN  RESET OUT   ·   READY   ·   HOLD  HLDA   ·   Vcc  Vss</text>

          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-faint)" />
            </marker>
          </defs>

          {/* what the buses are carrying, during a trace */}
          {mode === "trace" && (s.addr || s.data) && (
            <g>
              <rect x={12} y={496} width={W - 24} height={34} rx="5" fill="var(--panel)" stroke="var(--teal)" strokeWidth="1" />
              <text x={24} y={517} fontSize="10" fontFamily="var(--mono)" fill="var(--ink)">
                {s.addr ? `address pins: ${s.addr}` : ""}
                {s.addr && s.data ? "     " : ""}
                {s.data ? `data pins: ${s.data}` : ""}
                {s.signals ? `     ${s.signals}` : ""}
              </text>
            </g>
          )}
        </svg>
      </div>

      {mode === "explore" ? (
        <>
          <div className="note key" style={{ marginTop: 12 }}>
            <span className="i">📌</span>
            <div><b>{chosen.label}.</b> {chosen.what}</div>
          </div>
          <div className="note tip" style={{ marginTop: 10 }}>
            <span className="i">💡</span>
            <div>
              Three blocks are worth clicking even though no program can name them: the{" "}
              <b>temp register</b>, which holds the second operand of every arithmetic instruction;{" "}
              <b>W and Z</b> inside the register array; and the{" "}
              <b>incrementer / decrementer</b>, which is why <code>INX</code> affects no flags — it
              never goes near the ALU.
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="viz-controls" style={{ justifyContent: "center", marginTop: 12 }}>
            <div className="ss-stepper">
              <button onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0} aria-label="previous step">‹</button>
              {TRACE.map((_, i) => (
                <button key={i} className={`ss-step${i === step ? " on" : ""}`} onClick={() => setStep(i)} aria-current={i === step}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setStep((n) => Math.min(TRACE.length - 1, n + 1))} disabled={step === TRACE.length - 1} aria-label="next step">›</button>
            </div>
          </div>
          <div className="note key" style={{ marginTop: 12 }}>
            <span className="i">📌</span>
            <div><b>{s.title}</b><br />{s.detail}</div>
          </div>
          <div className="note tip" style={{ marginTop: 10 }}>
            <span className="i">💡</span>
            <div>
              Seven steps, two memory reads, seven T-states — and the ALU was never used, because{" "}
              <code>MVI</code> only moves a byte. Run the same instruction in the <b>8085 Lab</b> and
              the T-state counter says 7 as well. Same instruction, same number, two different views
              of it: one the hardware, one the registers.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
