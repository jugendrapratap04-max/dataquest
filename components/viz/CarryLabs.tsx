"use client";

import { useState } from "react";
import { run, hex2 } from "@/lib/asm8085";

/* Three panels for "Counting, Carrying and Running Out of Room".
 *
 * The last lesson of the ground floor, and the one that has to land properly,
 * because every flag in the rest of the course is an answer to a question asked
 * here: what happens when a column has no room left?
 *
 * Two of the three panels get their numbers from the REAL simulator rather than
 * from arithmetic written for the page. That is not ceremony — it means the flags
 * a student sees here are the same flags the code blocks beside them produce, and
 * neither can drift. The column-by-column carries in the first panel are worked
 * out here, because the simulator has no way to expose the inside of an addition,
 * but its final answer is checked against the simulator too. */

/** Ask the real 8085. Returns the accumulator and all five flags. */
function ask(a: number, b: number, op: "ADD" | "SUB") {
  const r = run(`MVI A, 0${hex2(a)}H\nMVI B, 0${hex2(b)}H\n${op} B\nHLT`);
  return { ok: r.ok, A: r.regs.A, ...r.flags };
}

const bits = (v: number) => Array.from({ length: 8 }, (_, i) => (v >> (7 - i)) & 1);

/* ----------------------------------------- 1 · adding, column by column --- */

const SUMS = [
  { a: 0x3c, b: 0x2a, label: "60 + 42", note: "Fits comfortably. Some columns carry, and the last one does not." },
  { a: 0xf0, b: 0x20, label: "240 + 32", note: "272 needs nine bits. The eighth column carries into a ninth that does not exist." },
  { a: 0xff, b: 0x01, label: "255 + 1", note: "Every column carries, all the way out. The byte lands on zero." },
];

export function BinaryAddLab() {
  const [p, setP] = useState(1);
  const [step, setStep] = useState(8);
  const { a, b, note } = SUMS[p];

  // Work right to left, keeping the carry into each column.
  const cols: { a: number; b: number; cin: number; sum: number; cout: number }[] = [];
  let carry = 0;
  for (let i = 0; i < 8; i++) {
    const ab = (a >> i) & 1;
    const bb = (b >> i) & 1;
    const total = ab + bb + carry;
    cols.push({ a: ab, b: bb, cin: carry, sum: total & 1, cout: total > 1 ? 1 : 0 });
    carry = total > 1 ? 1 : 0;
  }
  const result = (a + b) & 0xff;
  const carryOut = a + b > 0xff ? 1 : 0;
  // The simulator's answer, so the panel cannot quietly disagree with the lesson.
  const truth = ask(a, b, "ADD");

  const load = (i: number) => { setP(i); setStep(0); };
  const shown = (i: number) => 7 - i < step;   // columns fill from the right

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">➕ Adding, one column at a time</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Exactly how you add on paper, except every column can only hold 0 or 1. Step from the right
        and watch what happens when a column runs out of room.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 14 }}>
        {SUMS.map((s, i) => (
          <button key={s.label} className={`btn ${i === p ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => load(i)}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ margin: "0 auto", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 13 }}>
          <tbody>
            <tr>
              <td style={{ paddingRight: 10, fontSize: 10, color: "var(--accent-2)" }}>carried in</td>
              {bits(a).map((_, i) => (
                <td key={i} style={{ width: 30, textAlign: "center", padding: "3px 0", color: "var(--accent-2)", fontSize: 11 }}>
                  {shown(i) && cols[7 - i].cin ? "1" : ""}
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ paddingRight: 10, fontSize: 10, color: "var(--ink-faint)" }}>{hex2(a)}H</td>
              {bits(a).map((v, i) => (
                <td key={i} style={{ width: 30, textAlign: "center", padding: "3px 0" }}>{v}</td>
              ))}
            </tr>
            <tr>
              <td style={{ paddingRight: 10, fontSize: 10, color: "var(--ink-faint)" }}>+ {hex2(b)}H</td>
              {bits(b).map((v, i) => (
                <td key={i} style={{ width: 30, textAlign: "center", padding: "3px 0", borderBottom: "1px solid var(--line)" }}>{v}</td>
              ))}
            </tr>
            <tr>
              <td style={{ paddingRight: 10, fontSize: 10, color: "var(--teal)" }}>=</td>
              {bits(result).map((v, i) => (
                <td key={i} style={{
                  width: 30, textAlign: "center", padding: "5px 0", fontWeight: 700,
                  color: shown(i) ? "var(--teal)" : "var(--line)",
                }}>
                  {shown(i) ? v : "·"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 12 }}>
        <div className="ss-stepper">
          <button onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0} aria-label="one column back">‹</button>
          <button className="ss-step on" onClick={() => setStep((n) => Math.min(8, n + 1))}>
            {step === 0 ? "Start" : step >= 8 ? "All 8 columns" : `Column ${step} of 8`}
          </button>
          <button onClick={() => setStep((n) => Math.min(8, n + 1))} disabled={step >= 8} aria-label="one column forward">›</button>
        </div>
      </div>

      {step >= 8 && (
        <div className={`note ${carryOut ? "warn" : "key"}`} style={{ marginTop: 14 }}>
          <span className="i">{carryOut ? "⚠️" : "📌"}</span>
          <div>
            The byte holds <b>{hex2(result)}H</b>
            {carryOut ? (
              <> and the eighth column carried — but there is no ninth column to carry into, so that
              bit goes to the <b>carry flag</b> instead. {note} The processor keeps it; it does not
              throw it away, and it does not warn you either.</>
            ) : (
              <> and nothing carried out. {note}</>
            )}
            <br /><br />
            <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-faint)" }}>
              the simulator agrees: A={hex2(truth.A)} CY={truth.CY ? 1 : 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------- 2 · roll-over --- */

export function RolloverLab() {
  const [v, setV] = useState(0xfd);
  const flags = { Z: v === 0, S: (v & 0x80) !== 0 };

  const bump = (d: number) => setV((n) => (n + d) & 0xff);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔁 What happens after 255</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Press <b>+1</b> until you go past 255. Then press <b>−1</b> from zero. There is nowhere else
        for the number to go.
      </p>

      <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 12 }}>
        {bits(v).map((b, i) => (
          <div key={i} style={{
            width: 30, height: 34, display: "grid", placeItems: "center", borderRadius: 5,
            background: b ? "var(--accent)" : "var(--panel-2)",
            border: `1px solid ${b ? "var(--accent)" : "var(--line)"}`,
            color: b ? "#201607" : "var(--ink-faint)", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14,
          }}>{b}</div>
        ))}
      </div>

      <div style={{ textAlign: "center", fontFamily: "var(--mono)", marginBottom: 12 }}>
        <span style={{ fontSize: 26, fontWeight: 700 }}>{v}</span>
        <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>  ({hex2(v)}H)</span>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center" }}>
        <button className="btn btn-ghost" style={{ padding: "7px 18px", fontSize: 13 }} onClick={() => bump(-1)}>−1</button>
        <button className="btn btn-primary" style={{ padding: "7px 18px", fontSize: 13 }} onClick={() => bump(1)}>+1</button>
        <button className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => setV(0xfd)}>reset</button>
      </div>

      <div className={`note ${v === 0 ? "key" : v === 0xff ? "warn" : "tip"}`} style={{ marginTop: 14 }}>
        <span className="i">{v === 0 ? "📌" : v === 0xff ? "⚠️" : "💡"}</span>
        <div>
          {v === 0 ? (
            <><b>Zero.</b> Every switch is off. If you got here by adding one to 255, the answer
            <i> should</i> have been 256 — but 256 needs a ninth switch and there is not one. The
            byte wrapped, and the <b>zero flag</b> came on to say the answer is zero.</>
          ) : v === 0xff ? (
            <><b>255 — every switch on.</b> There is no bigger number a byte can hold. Press +1 and
            watch where it goes.</>
          ) : (
            <>Eight switches, so the count runs 0 to 255 and then has nowhere to go. Keep pressing.
            Also try <b>−1</b> from zero: it lands on 255, because one below zero wraps the same way.</>
          )}
          {flags.Z && <> <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-faint)" }}>Z=1</span></>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------- 3 · flags as five questions --- */

const OPS = [
  { a: 0x3c, b: 0x2a, op: "ADD" as const, label: "60 + 42" },
  { a: 0xff, b: 0x01, op: "ADD" as const, label: "255 + 1" },
  { a: 0x40, b: 0x40, op: "ADD" as const, label: "64 + 64" },
  { a: 0x07, b: 0x07, op: "SUB" as const, label: "7 − 7" },
  { a: 0x05, b: 0x09, op: "SUB" as const, label: "5 − 9" },
];

const QUESTIONS = [
  { key: "Z" as const, q: "Was the answer zero?", yes: "Yes — every bit is off.", no: "No — something is left." },
  { key: "CY" as const, q: "Did it run out of room?", yes: "Yes — a bit fell off the end, or a subtraction needed to borrow.", no: "No — the answer fitted in eight bits." },
  { key: "S" as const, q: "Is the top bit set?", yes: "Yes — bit 7 is on, which counts as negative when you are treating bytes as signed.", no: "No — bit 7 is off." },
  { key: "P" as const, q: "Is the number of 1s even?", yes: "Yes — even parity. Used for spotting corruption on a wire.", no: "No — an odd number of 1 bits." },
  { key: "AC" as const, q: "Did the lower half carry into the upper half?", yes: "Yes — a carry out of bit 3. This is the one DAA uses for decimal arithmetic.", no: "No carry out of bit 3." },
];

export function FlagAnswersLab() {
  const [i, setI] = useState(1);
  const o = OPS[i];
  const r = ask(o.a, o.b, o.op);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🚩 The five flags are five questions</span>
        <span className="viz-badge">runs 8085</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        After every sum the processor answers the same five questions about the result, and stores
        each answer as one bit. Pick a sum and read the answers.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
        {OPS.map((x, ix) => (
          <button key={x.label} className={`btn ${ix === i ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 11px", fontSize: 11.5, fontFamily: "var(--mono)" }} onClick={() => setI(ix)}>
            {x.label}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 14, marginBottom: 14 }}>
        <span style={{ color: "var(--ink-faint)" }}>answer in A → </span>
        <b style={{ fontSize: 20 }}>{hex2(r.A)}H</b>
        <span style={{ color: "var(--ink-faint)" }}>  ({r.A})</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {QUESTIONS.map((qq) => {
          const on = r[qq.key];
          return (
            <div key={qq.key} style={{
              display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 11px", borderRadius: 8,
              background: on ? "var(--good-soft)" : "var(--panel-2)",
              border: `1px solid ${on ? "var(--good)" : "var(--line)"}`,
            }}>
              <span style={{
                flex: "none", width: 34, textAlign: "center", fontFamily: "var(--mono)", fontWeight: 700,
                fontSize: 12, color: on ? "var(--good)" : "var(--ink-faint)",
              }}>{qq.key}={on ? 1 : 0}</span>
              <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                <b>{qq.q}</b> {on ? qq.yes : qq.no}
              </span>
            </div>
          );
        })}
      </div>

      <div className="note tip" style={{ marginTop: 14 }}>
        <span className="i">💡</span>
        <div>
          These are not warnings and nothing stops when one comes on. They are just answers, sitting
          there for the next instruction to use — which is exactly how <code>JZ</code> and
          <code> JC</code> work: jump <i>if</i> the answer to that question was yes. Every decision a
          program makes is built out of these five bits.
        </div>
      </div>
    </div>
  );
}
