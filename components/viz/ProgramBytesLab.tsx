"use client";

import { useState } from "react";
import { assemble, disassemble, hex2, hex4 } from "@/lib/asm8085";

/* Three panels for "What a Program Actually Is", in the order the lesson needs
 * them: one instruction taken apart, then a whole program read from the wrong
 * place, then a number too big for one box.
 *
 * All three decode with the real assembler and disassembler from lib/asm8085.ts
 * rather than a lookup table written for the page, so nothing here can drift away
 * from what the student's own code does. */

/* ------------------------------------------ 1 · one instruction, in bytes --- */

const SHOWN = [
  { src: "HLT", note: "One byte. Nothing to say but \"stop\"." },
  { src: "MOV B, A", note: "Still one byte — WHICH registers is packed inside the opcode itself." },
  { src: "MVI A, 42H", note: "Two bytes: the instruction, then the number it needs." },
  { src: "MVI C, 09H", note: "Same shape, different register and different number." },
  { src: "LXI H, 2050H", note: "Three bytes: the instruction, then an address — low half first." },
  { src: "STA 2060H", note: "Three again. Every instruction carrying an address is three bytes." },
];

/** What each byte of an instruction is doing. */
function roleOf(src: string, i: number, len: number): string {
  if (i === 0) return "opcode";
  if (len === 2) return "data";
  return i === 1 ? "address · low" : "address · high";
}

export function InstructionBytesLab() {
  const [i, setI] = useState(2);
  const chosen = SHOWN[i];
  const bytes = (() => {
    const a = assemble(chosen.src + "\nHLT");
    const out: number[] = [];
    for (let k = 0; ; k++) {
      const b = a.code.get(0x2000 + k);
      if (b === undefined) break;
      out.push(b);
    }
    return out.slice(0, disassemble(out, 0).length);
  })();

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧱 One instruction, taken apart</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Pick an instruction. Every one of them is one, two or three bytes — never more.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
        {SHOWN.map((s, ix) => (
          <button
            key={s.src}
            className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 10px", fontSize: 11.5, fontFamily: "var(--mono)" }}
            onClick={() => setI(ix)}
          >
            {s.src}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {bytes.map((b, k) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 76, padding: "9px 0", borderRadius: 9,
                background: k === 0 ? "var(--accent-soft)" : "var(--panel-2)",
                border: `1px solid ${k === 0 ? "var(--accent)" : "var(--teal)"}`,
                fontSize: 19, fontWeight: 700, fontFamily: "var(--mono)",
              }}
            >
              {hex2(b)}
            </div>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: k === 0 ? "var(--accent-2)" : "var(--teal)", marginTop: 4 }}>
              {roleOf(chosen.src, k, bytes.length)}
            </div>
          </div>
        ))}
      </div>

      <div className="note tip" style={{ marginTop: 14 }}>
        <span className="i">💡</span>
        <div>
          <b>{bytes.length} byte{bytes.length === 1 ? "" : "s"}.</b> {chosen.note} These are the exact
          numbers you would key into a trainer kit, and the exact numbers an exam means when it says
          &ldquo;hand-assemble this program&rdquo;.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------ 3 · a number too big for a box --- */

export function ByteOrderLab() {
  const [lowFirst, setLowFirst] = useState(true);
  const value = 0x1234;
  const low = value & 0xff;
  const high = (value >> 8) & 0xff;
  const boxes = lowFirst ? [low, high] : [high, low];
  // The 8085 always reads back low-first, whatever order you stored them in.
  const readBack = (boxes[1] << 8) | boxes[0];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔀 A number that needs two boxes</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        <b>1234H</b> does not fit in one box, so it takes two. Flip the order and watch what the
        processor reads back.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 14 }}>
        <button className={`btn ${lowFirst ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setLowFirst(true)}>
          low byte first
        </button>
        <button className={`btn ${!lowFirst ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setLowFirst(false)}>
          high byte first
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {boxes.map((b, k) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--teal)", marginBottom: 4 }}>
              {hex4(0x2050 + k)}
            </div>
            <div style={{ width: 82, padding: "12px 0", borderRadius: 9, background: "var(--panel-2)", border: "1px solid var(--teal)", fontSize: 21, fontWeight: 700, fontFamily: "var(--mono)" }}>
              {hex2(b)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 14, fontFamily: "var(--mono)", fontSize: 13 }}>
        <span style={{ color: "var(--ink-faint)" }}>LHLD 2050H reads back → </span>
        <b style={{ fontSize: 19, color: readBack === value ? "var(--good)" : "var(--bad)" }}>{hex4(readBack)}H</b>
      </div>

      <div className={`note ${lowFirst ? "key" : "warn"}`} style={{ marginTop: 14 }}>
        <span className="i">{lowFirst ? "📌" : "⚠️"}</span>
        <div>
          {lowFirst ? (
            <>
              <b>Low byte first is the rule.</b> The 8085 always puts the small half in the lower
              address, and always reads it back the same way — so storing and loading agree, and you
              get 1234H out.
            </>
          ) : (
            <>
              <b>Same two bytes, and now the number is wrong.</b> You stored them high-first, but the
              processor still reads low-first, so it builds <b>3412H</b>. Nothing failed — memory did
              exactly as it was told. The order is an agreement, and only one side kept it.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------- 2 · the whole program --- */

/* The stored-program idea, made pressable.
 *
 * "A program is just bytes, and nothing marks a byte as data or instruction" is
 * the most important sentence in the first chapter and the easiest one to nod at
 * without believing. So this panel does not say it — it makes you do it.
 *
 * Twelve bytes sit in memory. You choose which one to start reading from, and the
 * panel decodes forward from there with the real disassembler (lib/asm8085.ts,
 * round-trip tested against the assembler). Start at the first byte and you get
 * the program somebody wrote. Start one byte later and the very same memory
 * decodes into a different, still perfectly valid program — because the processor
 * has no way of knowing 42H was meant to be data.
 *
 * That is why a wrong jump address is dangerous, why the program counter matters,
 * and what "stored-program computer" actually means. */

/* MVI A, 42H · MOV B, A · MVI C, 09H · ADD C · STA 2060H · HLT
 * Chosen so that starting one byte late produces something that still decodes —
 * which is the whole point, and would not happen with every set of bytes. */
const BYTES = [0x3e, 0x42, 0x47, 0x0e, 0x09, 0x81, 0x32, 0x60, 0x20, 0x76, 0x00, 0x00];
const BASE = 0x2000;

const INTENDED = 0;

export function ProgramBytesLab() {
  const [start, setStart] = useState(INTENDED);

  // Walk forward from the chosen byte, decoding as we go.
  const lines: { at: number; bytes: number[]; text: string }[] = [];
  let p = start;
  let guard = 0;
  while (p < BYTES.length && guard++ < 16) {
    const d = disassemble(BYTES, p);
    lines.push({ at: BASE + p, bytes: BYTES.slice(p, p + d.length), text: d.text });
    if (/^HLT/.test(d.text)) break;
    p += d.length;
  }

  // Which bytes this reading treats as opcodes, so the row can show the split.
  const opcodeAt = new Set(lines.map((l) => l.at - BASE));

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📖 The same bytes, read from a different place</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        These twelve bytes never change. Click a different byte to start reading from, and watch the
        program change completely.
      </p>

      <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 6 }}>
        {BYTES.map((b, i) => {
          const isStart = i === start;
          const isOpcode = opcodeAt.has(i);
          const inRange = i >= start;
          return (
            <button
              key={i}
              onClick={() => setStart(i)}
              title={`start reading at ${hex4(BASE + i)}H`}
              style={{
                flex: "none", width: 54, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "6px 0 7px", borderRadius: 8,
                opacity: inRange ? 1 : 0.4,
                background: isStart ? "var(--accent-soft)" : isOpcode && inRange ? "var(--good-soft)" : "var(--panel-2)",
                border: `1px solid ${isStart ? "var(--accent)" : isOpcode && inRange ? "var(--good)" : "var(--line)"}`,
              }}
            >
              <span style={{ fontSize: 8.5, fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>{hex4(BASE + i)}</span>
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--mono)" }}>{hex2(b)}</span>
              <span style={{ fontSize: 8, fontFamily: "var(--mono)", color: isOpcode && inRange ? "var(--good)" : "var(--ink-faint)" }}>
                {!inRange ? "·" : isOpcode ? "op" : "data"}
              </span>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--mono)", margin: "10px 0 8px" }}>
        reading from {hex4(BASE + start)}H →
      </p>

      <div className="viz-code" style={{ overflowX: "auto", fontSize: 12.5, lineHeight: 1.75 }}>
        {lines.map((l, i) => (
          <div key={i}>
            <span style={{ color: "var(--ink-faint)" }}>{hex4(l.at)}  </span>
            <span style={{ color: "var(--teal)" }}>{l.bytes.map(hex2).join(" ").padEnd(9)}</span>
            <span style={{ color: "var(--ink)" }}>  {l.text}</span>
          </div>
        ))}
      </div>

      <div className={`note ${start === INTENDED ? "key" : "warn"}`} style={{ marginTop: 14 }}>
        <span className="i">{start === INTENDED ? "📌" : "⚠️"}</span>
        <div>
          {start === INTENDED ? (
            <>
              <b>This is the program somebody wrote.</b> Put 42H in A, copy it to B, put 09H in C,
              add C, store the answer at 2060H, stop. Notice that <b>42H and 09H are marked
              &ldquo;data&rdquo;</b>{" "}
              — not because anything in those bytes says so, but because the opcode before each one
              said &ldquo;the next byte is a number, not an instruction&rdquo;.
            </>
          ) : (
            <>
              <b>Same twelve bytes. Different program.</b> Nothing in memory changed — you only
              started reading somewhere else, and bytes that were data a moment ago are now being
              obeyed as instructions. The processor cannot tell the difference and does not try; it
              reads whatever the program counter points at.
            </>
          )}
        </div>
      </div>

      {start !== INTENDED && (
        <div className="viz-controls" style={{ justifyContent: "center", marginTop: 12 }}>
          <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setStart(INTENDED)}>
            ← back to the intended start
          </button>
        </div>
      )}

      <div className="note tip" style={{ marginTop: 12 }}>
        <span className="i">💡</span>
        <div>
          Try starting at <b>2001</b>, the 42H. It was data a second ago and now it is{" "}
          <code>MOV B, D</code> — a real instruction the processor will happily carry out. This is
          exactly what happens when a jump goes to the wrong address, and it is why the program
          counter is the most important register on the chip.
        </div>
      </div>
    </div>
  );
}
