"use client";

import { useState } from "react";

/* Three panels for "Branching, the stack and subroutines".
 *
 *   StackLab       PUSH and POP with the stack pointer moving and memory
 *                  filling. The direction — downwards — is the thing students
 *                  get wrong, and a diagram that grows the wrong way teaches it
 *                  wrong permanently.
 *   CallReturnLab  CALL pushes the return address and RET pops it. The panel
 *                  shows the actual bytes: for this lesson's callstack.asm the
 *                  return address 2006H appears in memory as 06 20.
 *   ConditionLab   the eight conditional jumps, each with the flag it reads.
 *                  Three bits of opcode, eight conditions, all of them used —
 *                  which is why there is no JAC.
 *
 * Numbers checked against lib/asm8085.ts: PUSH H then PUSH B from SP = 2400H
 * leaves SP at 23FCH with CD AB 34 12 in memory. */

const hex2 = (v: number) => (v & 0xff).toString(16).toUpperCase().padStart(2, "0");
const hex4 = (v: number) => (v & 0xffff).toString(16).toUpperCase().padStart(4, "0");

/* ------------------------------------------------------ 1 · the stack --- */

type Step = { label: string; sp: number; cells: (number | null)[]; note: string };

const TOP = 0x2400;
/* cells are 23FCH, 23FDH, 23FEH, 23FFH */
const STEPS: Step[] = [
  {
    label: "LXI SP, 2400H", sp: 0x2400, cells: [null, null, null, null],
    note: "The stack pointer is set once, near the top of RAM. Nothing has been pushed, so nothing is in use — and the stack will grow downwards from here.",
  },
  {
    label: "PUSH H  (HL = 1234H)", sp: 0x23fe, cells: [null, null, 0x34, 0x12],
    note: "Two bytes went out and SP moved DOWN by two. The high byte went to 23FFH and the low byte to 23FEH, so the pair reads back correctly — and the stack pointer now points at the last byte written.",
  },
  {
    label: "PUSH B  (BC = ABCDH)", sp: 0x23fc, cells: [0xcd, 0xab, 0x34, 0x12],
    note: "Down another two. The older value is still there, untouched, above the newer one — which is what makes it a stack: the most recent thing pushed is the closest to the pointer.",
  },
  {
    label: "POP D", sp: 0x23fe, cells: [0xcd, 0xab, 0x34, 0x12],
    note: "DE now holds ABCDH and SP has moved back UP by two. Notice the bytes are still in memory — POP does not erase anything, it just moves the pointer. They are simply no longer protected, and the next PUSH will overwrite them.",
  },
];

export function StackLab() {
  const [i, setI] = useState(0);
  const s = STEPS[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🥞 The stack grows downwards</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Step through two pushes and a pop. Watch the <b>stack pointer</b> — it moves down as things
        are stored and up as they are taken back, which is the opposite of what most people draw.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12 }}>
        <div className="ss-stepper">
          <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} aria-label="previous step">‹</button>
          {STEPS.map((_, k) => (
            <button key={k} className={`ss-step${k === i ? " on" : ""}`} onClick={() => setI(k)} aria-current={k === i}>
              {k + 1}
            </button>
          ))}
          <button onClick={() => setI((n) => Math.min(STEPS.length - 1, n + 1))} disabled={i === STEPS.length - 1} aria-label="next step">›</button>
        </div>
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12 }}>
        <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", marginBottom: 10 }}>
          {s.label}
        </div>

        <div style={{ display: "flex", flexDirection: "column-reverse", gap: 3 }}>
          {[0x23fc, 0x23fd, 0x23fe, 0x23ff].map((addr, k) => {
            const v = s.cells[k];
            const here = addr === s.sp;
            return (
              <div key={addr} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: "0 0 52px", fontFamily: "var(--mono)", fontSize: 10.5, color: here ? "var(--accent-2)" : "var(--ink-faint)" }}>
                  {hex4(addr)}
                </span>
                <span
                  style={{
                    flex: "0 0 46px", textAlign: "center", padding: "5px 0", borderRadius: 6,
                    background: v === null ? "var(--panel)" : "var(--good-soft)",
                    border: `1px solid ${v === null ? "var(--line)" : "var(--good)"}`,
                    fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: v === null ? "var(--ink-faint)" : "var(--ink)",
                  }}
                >
                  {v === null ? "··" : hex2(v)}
                </span>
                {here && (
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent-2)" }}>← SP</span>
                )}
              </div>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.6 }}>
            <span style={{ flex: "0 0 52px", fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink-faint)" }}>{hex4(TOP)}</span>
            <span style={{ flex: "0 0 46px", textAlign: "center", fontSize: 10, color: "var(--ink-faint)" }}>top</span>
            {s.sp === TOP && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent-2)" }}>← SP</span>}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 10, fontFamily: "var(--mono)", fontSize: 13, color: "var(--accent-2)" }}>
          SP = {hex4(s.sp)}H
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>{s.note}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Downwards is not an arbitrary choice. Programs are loaded from the <b>bottom</b> of memory
          upwards, so putting the stack at the top and growing it down means the two only meet when
          memory is genuinely full — and until then neither has to know how big the other will get.
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------- 2 · call and return --- */

type CallStep = { label: string; pc: string; sp: number; stack: string; note: string };

const CALL_STEPS: CallStep[] = [
  {
    label: "about to execute CALL 2100H at 2003H", pc: "2003", sp: 0x2400, stack: "empty",
    note: "The CALL is three bytes, at 2003H, 2004H and 2005H. So the instruction after it starts at 2006H — and that is the address the processor will need to come back to.",
  },
  {
    label: "CALL pushes the return address", pc: "2003", sp: 0x23fe, stack: "06 20",
    note: "Before jumping anywhere, CALL pushes 2006H onto the stack — low byte at 23FEH, high byte at 23FFH. Nothing in the program said to do this; it is part of what CALL is.",
  },
  {
    label: "and jumps", pc: "2100", sp: 0x23fe, stack: "06 20",
    note: "Now the program counter holds 2100H and the subroutine runs. The return address is sitting on the stack the whole time, which is why anything the subroutine pushes must also be popped.",
  },
  {
    label: "RET pops it back into PC", pc: "2006", sp: 0x2400, stack: "empty",
    note: "RET takes two bytes off the stack and puts them in the program counter. It does not know where it is going — it goes wherever the top of the stack says, which is exactly why a lost PUSH sends a program somewhere impossible.",
  },
];

export function CallReturnLab() {
  const [i, setI] = useState(0);
  const s = CALL_STEPS[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📞 <code>CALL</code> and <code>RET</code> — where the address comes from</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        A subroutine call is a jump that leaves a note saying where to come back to. The note goes on
        the <b>stack</b>, and <code>RET</code> reads it.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12 }}>
        <div className="ss-stepper">
          <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} aria-label="previous step">‹</button>
          {CALL_STEPS.map((_, k) => (
            <button key={k} className={`ss-step${k === i ? " on" : ""}`} onClick={() => setI(k)} aria-current={k === i}>
              {k + 1}
            </button>
          ))}
          <button onClick={() => setI((n) => Math.min(CALL_STEPS.length - 1, n + 1))} disabled={i === CALL_STEPS.length - 1} aria-label="next step">›</button>
        </div>
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", textAlign: "center", marginBottom: 10 }}>
          {s.label}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { k: "program counter", v: `${s.pc}H`, tone: "var(--teal)" },
            { k: "stack pointer", v: `${hex4(s.sp)}H`, tone: "var(--accent-2)" },
            { k: "on the stack", v: s.stack, tone: "var(--good)" },
          ].map((x) => (
            <div key={x.k} style={{ flex: "1 1 120px", border: `1px solid ${x.tone}`, borderRadius: 9, background: "var(--panel)", padding: "9px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: x.tone }}>{x.k.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{x.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>{s.note}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Because the return address lives on the stack rather than in a register, calls{" "}
          <b>nest automatically</b>. A subroutine that calls another simply pushes a second address on
          top, and each <code>RET</code> takes the most recent one — no depth limit except memory.
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------- 3 · eight conditions --- */

type Cond = { code: string; jump: string; call: string; ret: string; flag: string; when: string };

const CONDS: Cond[] = [
  { code: "000", jump: "JNZ", call: "CNZ", ret: "RNZ", flag: "Z = 0", when: "the last result was not zero — the workhorse of every counted loop" },
  { code: "001", jump: "JZ", call: "CZ", ret: "RZ", flag: "Z = 1", when: "the last result was zero, or a comparison found the two values equal" },
  { code: "010", jump: "JNC", call: "CNC", ret: "RNC", flag: "CY = 0", when: "no carry or borrow — after a compare, the accumulator was greater than or equal" },
  { code: "011", jump: "JC", call: "CC", ret: "RC", flag: "CY = 1", when: "a carry or borrow happened — after a compare, the accumulator was the smaller one" },
  { code: "100", jump: "JPO", call: "CPO", ret: "RPO", flag: "P = 0", when: "odd parity — an odd number of bits are set. Used for checking serial data, and rarely for anything else" },
  { code: "101", jump: "JPE", call: "CPE", ret: "RPE", flag: "P = 1", when: "even parity, including zero bits set" },
  { code: "110", jump: "JP", call: "CP", ret: "RP", flag: "S = 0", when: "positive — the top bit is clear. P here means plus, not parity, which catches everybody once" },
  { code: "111", jump: "JM", call: "CM", ret: "RM", flag: "S = 1", when: "minus — the top bit is set, which is what makes a two's complement value negative" },
];

export function ConditionLab() {
  const [i, setI] = useState(0);
  const c = CONDS[i];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🚦 Eight conditions, and all eight are used</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Three bits of the opcode choose the condition, so there are exactly <b>eight</b> — and each
        one comes in three forms: jump, call and return.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {CONDS.map((x, ix) => (
          <button
            key={x.code}
            onClick={() => setI(ix)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", cursor: "pointer",
              padding: "5px 9px", borderRadius: 7, textAlign: "left",
              background: ix === i ? "var(--accent-soft)" : "transparent",
              border: `1px solid ${ix === i ? "var(--accent)" : "var(--line)"}`,
              color: "var(--ink)",
            }}
          >
            <span style={{ flex: "0 0 34px", fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink-faint)" }}>{x.code}</span>
            <span style={{ flex: "0 0 44px", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700 }}>{x.jump}</span>
            <span style={{ flex: "0 0 44px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)" }}>{x.call}</span>
            <span style={{ flex: "0 0 44px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)" }}>{x.ret}</span>
            <span style={{ flex: 1, textAlign: "right", fontFamily: "var(--mono)", fontSize: 11, color: "var(--teal)" }}>{x.flag}</span>
          </button>
        ))}
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          <b>{c.jump} fires when {c.flag}</b> — {c.when}.
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Every one of the eight codes is taken, which is the answer to a question from lesson 10:
          there is <b>no jump on the auxiliary carry</b> because there is no code left for one. And
          note the trap in the list — <code>JP</code> is <b>jump on plus</b>, while parity is{" "}
          <code>JPE</code> and <code>JPO</code>.
        </div>
      </div>
    </div>
  );
}
