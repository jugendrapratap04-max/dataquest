"use client";

import { useState } from "react";

/* Three panels for "The register set".
 *
 * RegisterLab is the map: every register the 8085 has, including the two no
 * instruction can name, with the one fact that actually gets examined — width —
 * shown rather than listed.
 *
 * PairLab is the idea the lesson turns on: H and L are two bytes and one number
 * at the same time, and which of those they are is decided by the instruction
 * rather than by the registers. INR L against INX H at L = FFH is the entire
 * distinction in one click, and it is why 20FFH + 1 is 2100H and not 2000H.
 *
 * OpcodeBitsLab answers "why exactly seven registers" from the bits instead of
 * asserting it. MOV is 01 ddd sss, three bits per operand, eight codes — and the
 * eighth is M. The payoff is MOV M, M: that combination would be 76H, which is
 * already HLT, so the one instruction the encoding cannot express is the one
 * nobody needs.
 *
 * The opcodes here are the assembler's own. Every byte this panel can produce was
 * checked against assemble() in lib/asm8085.ts — MOV B,A is 47H, MOV A,M is 7EH,
 * MOV M,A is 77H — which are the same bytes lesson 5 shows for its programs. */

const hex2 = (v: number) => (v & 0xff).toString(16).toUpperCase().padStart(2, "0");
const hex4 = (v: number) => (v & 0xffff).toString(16).toUpperCase().padStart(4, "0");

/* ------------------------------------------------------- 1 · the map --- */

type Reg = {
  id: string;
  bits: number;
  pair?: string;
  nameable: boolean;
  what: string;
};

const REGS: Reg[] = [
  { id: "A", bits: 8, nameable: true, what: "The accumulator. One operand of almost every arithmetic and logic instruction and the place the answer goes — which is why it is drawn beside the ALU rather than with the others." },
  { id: "B", bits: 8, pair: "C", nameable: true, what: "A general-purpose byte. Pairs with C to make BC, which can hold a 16-bit address for LDAX and STAX, or a count for a loop." },
  { id: "C", bits: 8, pair: "B", nameable: true, what: "The low half of BC. Conventionally the loop counter in 8085 programs, because DCR C sets the zero flag and JNZ is right there." },
  { id: "D", bits: 8, pair: "E", nameable: true, what: "Pairs with E. DE is the usual second pointer — one block being read through HL while another is written through DE, which is how a block transfer is written." },
  { id: "E", bits: 8, pair: "D", nameable: true, what: "The low half of DE. XCHG swaps the whole of DE with HL in one instruction, which is how a program keeps two addresses and works on either." },
  { id: "H", bits: 8, pair: "L", nameable: true, what: "The high half of HL, and HL is the pointer the instruction set is built around. M means \"the byte at the address in HL\", so H holds the high byte of wherever M is pointing." },
  { id: "L", bits: 8, pair: "H", nameable: true, what: "The low half of HL. Increment the pair with INX H and a carry out of L moves into H by itself — increment L alone with INR L and it does not." },
  { id: "SP", bits: 16, nameable: true, what: "The stack pointer. Sixteen bits because it holds an address, and it moves by itself: PUSH takes two off it and POP puts two back. Chapter 4 is where this matters." },
  { id: "PC", bits: 16, nameable: false, what: "The program counter — the address of the next instruction. No instruction can load it directly, but every jump, call and return writes to it, and every fetch advances it by that instruction's own length." },
  { id: "W", bits: 8, pair: "Z", nameable: false, what: "Temporary, and invisible to every program ever written for this chip. When a three-byte instruction is being fetched, the two address bytes land in W and Z until the processor is ready to use them." },
  { id: "Z", bits: 8, pair: "W", nameable: false, what: "The other half of the pair that no program can name. It exists because an address arrives one byte at a time and has to wait somewhere until both halves are in." },
];

export function RegisterLab() {
  const [sel, setSel] = useState("A");
  const r = REGS.find((x) => x.id === sel) ?? REGS[0];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🗂️ Every register the 8085 has</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Click any of them. Watch the <b>width</b> and whether a program is allowed to say its name —
        those two facts explain most of what the instruction set can and cannot do.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {REGS.map((x) => (
          <button
            key={x.id}
            onClick={() => setSel(x.id)}
            style={{
              minWidth: 56, cursor: "pointer", padding: "8px 6px", borderRadius: 8,
              background: x.id === sel ? "var(--accent-soft)" : "var(--panel-2)",
              border: `${x.id === sel ? 2 : 1}px solid ${x.id === sel ? "var(--accent)" : "var(--line)"}`,
              color: "var(--ink)", opacity: x.nameable ? 1 : 0.75,
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700 }}>{x.id}</div>
            <div style={{ fontSize: 9, color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>{x.bits}-bit</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 120px", border: "1px solid var(--teal)", borderRadius: 9, background: "var(--panel-2)", padding: "8px 11px" }}>
          <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--teal)" }}>WIDTH</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--mono)" }}>{r.bits} bits</div>
        </div>
        <div style={{ flex: "1 1 120px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--panel-2)", padding: "8px 11px" }}>
          <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--ink-faint)" }}>PAIRS WITH</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--mono)" }}>{r.pair ?? "—"}</div>
        </div>
        <div style={{ flex: "1 1 150px", border: `1px solid ${r.nameable ? "var(--good)" : "var(--bad)"}`, borderRadius: 9, background: "var(--panel-2)", padding: "8px 11px" }}>
          <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: r.nameable ? "var(--good)" : "var(--bad)" }}>
            CAN A PROGRAM NAME IT?
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--mono)" }}>{r.nameable ? "yes" : "no"}</div>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>{r.id}.</b> {r.what}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Count the ones a program can name and write as a single byte: <b>A, B, C, D, E, H, L</b> —
          seven. <b>SP</b> and <b>PC</b> are sixteen bits because they hold addresses, and <b>W</b>{" "}
          and <b>Z</b> are not in the instruction set at all. The third panel on this page is where
          the number seven comes from.
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------- 2 · two bytes, or one number --- */

export function PairLab() {
  const [hl, setHl] = useState(0x20ff);
  const [last, setLast] = useState<string | null>(null);
  const h = (hl >> 8) & 0xff;
  const l = hl & 0xff;

  const inrL = () => { setHl(((h << 8) | ((l + 1) & 0xff)) & 0xffff); setLast("INR L"); };
  const inxH = () => { setHl((hl + 1) & 0xffff); setLast("INX H"); };
  const reset = (v: number) => { setHl(v); setLast(null); };

  const split = last === "INR L" && l === 0x00;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔗 H and L — two bytes, or one number</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        HL starts at <b>20FFH</b>, one short of a boundary. Press <b>INR L</b> and then reset and
        press <b>INX H</b> — the two instructions disagree about what these registers are.
      </p>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 14 }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--ink-faint)", marginBottom: 4 }}>H</div>
            <div style={{ width: 74, padding: "10px 0", borderRadius: 9, border: "1px solid var(--accent)", background: "var(--panel)", fontFamily: "var(--mono)", fontSize: 21, fontWeight: 700 }}>
              {hex2(h)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--ink-faint)", marginBottom: 4 }}>L</div>
            <div style={{ width: 74, padding: "10px 0", borderRadius: 9, border: "1px solid var(--accent)", background: "var(--panel)", fontFamily: "var(--mono)", fontSize: 21, fontWeight: 700 }}>
              {hex2(l)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--teal)", marginBottom: 4 }}>HL — the same two bytes</div>
            <div style={{ width: 132, padding: "10px 0", borderRadius: 9, border: "2px solid var(--teal)", background: "var(--panel)", fontFamily: "var(--mono)", fontSize: 21, fontWeight: 700 }}>
              {hex4(hl)}H
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11.5, color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>
          M means the byte at {hex4(hl)}H
        </div>

        <div className="viz-controls" style={{ justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" style={{ padding: "6px 13px", fontSize: 12, fontFamily: "var(--mono)" }} onClick={inrL}>
            INR L
          </button>
          <button className="btn btn-primary" style={{ padding: "6px 13px", fontSize: 12, fontFamily: "var(--mono)" }} onClick={inxH}>
            INX H
          </button>
          <button className="btn btn-ghost" style={{ padding: "6px 13px", fontSize: 12 }} onClick={() => reset(0x20ff)}>
            Reset to 20FFH
          </button>
        </div>
      </div>

      <div className={`note ${split ? "warn" : "key"}`} style={{ marginTop: 12 }}>
        <span className="i">{split ? "⚠️" : "📌"}</span>
        <div>
          {last === null ? (
            <>
              <b>Both readings are true at once.</b> H and L are two ordinary byte registers you can
              load and copy separately — and they are also one 16-bit number that instructions like{" "}
              <code>LXI</code>, <code>DAD</code> and <code>INX</code> treat as a single value. Nothing
              in the registers decides which; the instruction does.
            </>
          ) : split ? (
            <>
              <b><code>INR L</code> treated L as a byte on its own.</b> FFH plus one wrapped to 00H
              and H never heard about it — so HL went from 20FFH to <b>2000H</b>, which is 255 bytes
              backwards. This is a real bug in real programs: a pointer walking a block hits a
              boundary and jumps back to the start of the page.
            </>
          ) : (
            <>
              <b><code>INX H</code> treated the pair as one number.</b> 20FFH plus one is{" "}
              <b>2100H</b> — the carry out of L moved into H by itself, because a 16-bit increment is
              exactly that. This is the instruction a pointer loop needs.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Worth knowing while you are here: <code>INX</code> affects <b>no flags at all</b>, because
          it uses the 16-bit incrementer rather than the ALU — the block you met in lesson 7. That is
          what makes it safe to put inside a loop whose exit depends on <code>DCR C</code>.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------- 3 · why exactly seven --- */

const CODES = ["B", "C", "D", "E", "H", "L", "M", "A"];

export function OpcodeBitsLab() {
  const [dst, setDst] = useState(0);
  const [src, setSrc] = useState(7);
  const byte = 0x40 | (dst << 3) | src;
  const isHalt = dst === 6 && src === 6;

  const bits = byte.toString(2).padStart(8, "0");
  const groups: [string, string, string][] = [
    ["01", "this is a MOV", "var(--ink-faint)"],
    [bits.slice(2, 5), `destination — ${CODES[dst]}`, "var(--teal)"],
    [bits.slice(5, 8), `source — ${CODES[src]}`, "var(--accent-2)"],
  ];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧮 Why exactly seven — count the bits</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        A <code>MOV</code> is one byte: two fixed bits, then <b>three bits for the destination</b>{" "}
        and <b>three for the source</b>. Pick each side and watch the byte assemble itself.
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        {([["destination", dst, setDst, "var(--teal)"], ["source", src, setSrc, "var(--accent-2)"]] as const).map(([label, val, set, tone]) => (
          <div key={label} style={{ flex: "1 1 220px" }}>
            <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: tone, marginBottom: 5, textAlign: "center" }}>
              {label.toUpperCase()}
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
              {CODES.map((c, i) => (
                <button
                  key={c}
                  onClick={() => set(i)}
                  style={{
                    width: 40, padding: "5px 0", borderRadius: 6, cursor: "pointer",
                    background: i === val ? "var(--accent-soft)" : "var(--panel-2)",
                    border: `1px solid ${i === val ? "var(--accent)" : "var(--line)"}`,
                    color: "var(--ink)", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 14, marginTop: 14 }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {groups.map(([b, label, tone]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, color: tone, letterSpacing: ".08em" }}>{b}</div>
              <div style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-faint)" }}>which is the byte</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color: isHalt ? "var(--bad)" : "var(--good)" }}>
            {hex2(byte)}H
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", marginTop: 2 }}>
            {isHalt ? "HLT" : `MOV ${CODES[dst]}, ${CODES[src]}`}
          </div>
        </div>
      </div>

      <div className={`note ${isHalt ? "warn" : "key"}`} style={{ marginTop: 12 }}>
        <span className="i">{isHalt ? "⚠️" : "📌"}</span>
        <div>
          {isHalt ? (
            <>
              <b>You have found 76H.</b> By the pattern this should be <code>MOV M, M</code> — copy
              the byte at HL to the byte at HL, which does nothing at all. So that code was given to{" "}
              <b><code>HLT</code></b> instead. The one combination the encoding cannot express is the
              one nobody needed, and the gap was used for the instruction that stops the processor.
            </>
          ) : (
            <>
              <b>Three bits name a register, so there are 2<sup>3</sup> = 8 codes.</b> Seven of them
              are registers and the eighth is <b>M</b> — not a register at all, but the byte in memory
              at HL. That is why <code>MOV A, M</code> is one byte like every other MOV, and why the
              8085 has seven general-purpose registers rather than eight or thirty-two.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Try <b>M</b> on both sides. Then set destination <b>B</b> and source <b>A</b> and check the
          byte against lesson 5, where <code>MOV B, A</code> assembled to <b>47H</b> — this panel and
          the assembler are computing it the same way, because it is the same formula.
        </div>
      </div>
    </div>
  );
}
