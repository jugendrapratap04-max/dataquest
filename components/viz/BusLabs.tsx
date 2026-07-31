"use client";

import { useState } from "react";

/* Two panels for "The three buses".
 *
 * BusLab exists because "address, data, control" is three words a student can
 * repeat without knowing what distinguishes them, and the distinction is
 * DIRECTION plus WHO IS ALLOWED TO DRIVE. So every operation here shows the same
 * three rows and only the arrows and the active control line change — which is
 * the real answer to "how does a byte meant for the display not end up in
 * memory". The I/O rows carry the detail exams ask about: on an 8085 the 8-bit
 * port number appears on BOTH halves of the address bus.
 *
 * TristateLab is bus contention, which cannot be explained by a diagram because
 * the whole point is what happens when two devices do the same legal thing at the
 * same moment. Enabling two outputs at once is one click, and the panel says
 * plainly that the result is not a number — that is what "undefined" means when
 * it is made of volts rather than software.
 *
 * Neither simulates the 8085. The real thing runs in the 8085 Lab in lesson 5,
 * and the T-state costs quoted in the lesson come from lib/asm8085.ts. */

/* ------------------------------------------------ 1 · the three buses --- */

type Dir = "out" | "in" | "idle";

type Op = {
  id: string;
  name: string;
  asm: string;
  addr: string;
  addrNote: string;
  data: string;
  dataDir: Dir;
  dataNote: string;
  control: string;
  status: string;
  why: string;
};

const OPS: Op[] = [
  {
    id: "fetch",
    name: "Opcode fetch",
    asm: "the first byte of any instruction",
    addr: "2000H",
    addrNote: "from the program counter",
    data: "3EH",
    dataDir: "in",
    dataNote: "the opcode, coming back from memory",
    control: "RD low",
    status: "IO/M = 0 · S1 S0 = 1 1",
    why: "Every instruction starts here. The status lines say 1 1, which is what makes an opcode fetch different from an ordinary memory read even though the pins do the same thing.",
  },
  {
    id: "mread",
    name: "Memory read",
    asm: "LDA 2050H — the data half",
    addr: "2050H",
    addrNote: "from the instruction's own bytes",
    data: "5AH",
    dataDir: "in",
    dataNote: "the stored byte, coming back",
    control: "RD low",
    status: "IO/M = 0 · S1 S0 = 1 0",
    why: "The processor puts an address out and memory answers on the data bus. Notice the address bus is doing exactly what it did during the fetch — only the source of the number changed.",
  },
  {
    id: "mwrite",
    name: "Memory write",
    asm: "STA 2060H",
    addr: "2060H",
    addrNote: "from the instruction's own bytes",
    data: "7FH",
    dataDir: "out",
    dataNote: "the accumulator's byte, going out",
    control: "WR low",
    status: "IO/M = 0 · S1 S0 = 0 1",
    why: "The first operation where the processor drives the data bus rather than listening to it. The data bus is the only one of the three that can change direction.",
  },
  {
    id: "iowrite",
    name: "I/O write",
    asm: "OUT 80H",
    addr: "8080H",
    addrNote: "the port number, on BOTH halves",
    data: "7FH",
    dataDir: "out",
    dataNote: "the accumulator's byte, going out",
    control: "WR low",
    status: "IO/M = 1 · S1 S0 = 0 1",
    why: "Identical pins to a memory write, and the only difference is IO/M going high. That one line is what stops a byte meant for a display from landing in memory location 0080H.",
  },
  {
    id: "ioread",
    name: "I/O read",
    asm: "IN 80H",
    addr: "8080H",
    addrNote: "the port number, on BOTH halves",
    data: "??",
    dataDir: "in",
    dataNote: "whatever the device puts there",
    control: "RD low",
    status: "IO/M = 1 · S1 S0 = 1 0",
    why: "An I/O address is 8 bits, so there are 256 ports — not 65,536. The 8085 copies the port number onto the high half as well, which is why the address pins read 8080H rather than 0080H.",
  },
];

const ARROW: Record<Dir, string> = { out: "→  processor drives", in: "←  device drives", idle: "— idle" };

function BusRow({ label, sub, value, dir, tone, note }: { label: string; sub: string; value: string; dir: Dir; tone: string; note: string }) {
  return (
    <div style={{ border: `1px solid ${tone}`, borderRadius: 9, background: "var(--panel-2)", padding: "9px 11px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, letterSpacing: ".06em", fontFamily: "var(--mono)", color: tone }}>
          {label} <span style={{ color: "var(--ink-faint)" }}>{sub}</span>
        </span>
        <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>{ARROW[dir]}</span>
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--ink)", marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{note}</div>
    </div>
  );
}

export function BusLab() {
  const [i, setI] = useState(0);
  const op = OPS[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🚌 The three buses, one operation at a time</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Same three rows every time. Watch which way the <b>data</b> arrow points, and which single
        control line changes — that is the entire difference between these five.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {OPS.map((o, ix) => (
          <button
            key={o.id}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 10px", fontSize: 11.5 }}
            onClick={() => setI(ix)}
          >
            {o.name}
          </button>
        ))}
      </div>

      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", textAlign: "center", marginBottom: 10 }}>
        {op.asm}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <BusRow label="ADDRESS BUS" sub="16 lines · one way, always" value={op.addr} dir="out" tone="var(--teal)" note={op.addrNote} />
        <BusRow label="DATA BUS" sub="8 lines · both ways" value={op.data} dir={op.dataDir} tone="var(--accent)" note={op.dataNote} />
        <BusRow label="CONTROL BUS" sub="what kind of trip this is" value={op.control} dir="out" tone="var(--ink-faint)" note={op.status} />
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>{op.why}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Compare <b>Memory write</b> and <b>I/O write</b> back to back. Same address value, same
          byte, same <code>WR</code> — and one lands in a memory chip while the other reaches a
          device. The whole difference is <code>IO/M</code>, which is why the control bus is not a
          detail you can skip past.
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- 2 · why only one device may drive --- */

type Device = { id: string; name: string; byte: string; hint: string };

const DEVICES: Device[] = [
  { id: "rom", name: "ROM", byte: "3E", hint: "holds the program" },
  { id: "ram", name: "RAM", byte: "5A", hint: "holds the data" },
  { id: "port", name: "Input port", byte: "F0", hint: "holds whatever a switch says" },
];

export function TristateLab() {
  const [on, setOn] = useState<string[]>(["rom"]);
  const toggle = (id: string) => setOn((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const live = DEVICES.filter((d) => on.includes(d.id));
  const state = live.length === 0 ? "floating" : live.length === 1 ? "ok" : "clash";
  const busValue = state === "ok" ? live[0].byte : state === "floating" ? "??" : "✗✗";
  const busTone = state === "ok" ? "var(--good)" : state === "floating" ? "var(--ink-faint)" : "var(--bad)";

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">⚡ One bus, three devices — and only one may speak</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        All three are wired to the same eight lines. Switch them on and off — including two at once,
        which is the state the whole design exists to prevent.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {DEVICES.map((d) => {
          const active = on.includes(d.id);
          return (
            <button
              key={d.id}
              onClick={() => toggle(d.id)}
              style={{
                flex: "1 1 120px", cursor: "pointer", textAlign: "left",
                borderRadius: 9, padding: "9px 11px",
                background: active ? "var(--accent-soft)" : "var(--panel-2)",
                border: `${active ? 2 : 1}px solid ${active ? "var(--accent)" : "var(--line)"}`,
                color: "var(--ink)",
              }}
              aria-pressed={active}
            >
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{d.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{d.hint}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, marginTop: 5, color: active ? "var(--accent-2)" : "var(--ink-faint)" }}>
                {active ? `driving ${d.byte}` : "high impedance"}
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 12, borderRadius: 9, border: `2px solid ${busTone}`,
          background: "var(--panel-2)", padding: "12px", textAlign: "center",
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: ".06em", fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>
          THE DATA BUS IS CARRYING
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, fontFamily: "var(--mono)", color: busTone, marginTop: 2 }}>{busValue}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 2 }}>
          {live.length} device{live.length === 1 ? "" : "s"} driving
        </div>
      </div>

      <div className={`note ${state === "ok" ? "tip" : "warn"}`} style={{ marginTop: 12 }}>
        <span className="i">{state === "ok" ? "💡" : "⚠️"}</span>
        <div>
          {state === "ok" ? (
            <>
              <b>Exactly one driver — this is the only legal state.</b> The other two are in{" "}
              <b>high impedance</b>: still connected, but electrically letting go of the wire. That
              third state is what &ldquo;tri-state&rdquo; means, and it is what makes a shared bus
              possible at all.
            </>
          ) : state === "floating" ? (
            <>
              <b>Nobody is driving.</b> The lines are not zero — they are <i>floating</i>, holding
              whatever charge was left behind, so a read here returns a number that is real, stable
              enough to look convincing, and completely meaningless. This is what a wrong chip-select
              produces, and it is far harder to spot than a crash.
            </>
          ) : (
            <>
              <b>Contention.</b> Two chips are driving the same wire, one pulling it high and the
              other low, and the result is not a byte — it is a short circuit through both output
              stages. The data is lost and on real hardware the chips get hot. Nothing in software
              can fix it: the fix is the <b>address decoder</b>, which must guarantee that at most
              one device is ever selected.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
