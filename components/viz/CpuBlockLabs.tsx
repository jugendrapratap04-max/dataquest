"use client";

import { useState } from "react";

/* Two panels for "Inside the chip".
 *
 * AluPathLab exists because the temp register is the block that makes the
 * accumulator make sense. A student is told "A is special" and has no reason to
 * believe it; watching B's byte travel into a second ALU input, and the answer
 * come back only into A, is the reason. The ADD / CMP switch is the same journey
 * with one difference — CMP throws the result away and keeps the flags — which is
 * exactly the bug in this lesson's debug task.
 *
 * MemoryModelLab is von Neumann against Harvard, which is a claim about
 * SIMULTANEITY and therefore cannot be taught by a block diagram. The timeline is
 * the whole argument: one bus means fetch and data take turns, two buses means
 * they do not.
 *
 * Both are models of the hardware, not simulations of it. The real 8085 runs in
 * the 8085 Lab beside them; the numbers here (2AH + 16H = 40H) are what
 * lib/asm8085.ts produces for the lesson's own add.asm. */

/* ------------------------------------------------- 1 · the path of an ADD --- */

type Op = "ADD" | "CMP";

type Stage = {
  title: string;
  detail: string;
  /** Which boxes are lit at this stage. */
  live: string[];
};

const STAGES: Record<Op, Stage[]> = {
  ADD: [
    {
      title: "1 · B puts its byte on the internal data bus",
      detail: "Nothing can reach the ALU directly from a register. B's copy of 16H travels along the one 8-bit bus that every block hangs off.",
      live: ["b", "bus"],
    },
    {
      title: "2 · it lands in the temp register",
      detail: "The ALU has two inputs and only one of them is the accumulator, so the second operand needs somewhere to wait. That is the whole job of the temp register — and no instruction can name it.",
      live: ["bus", "temp"],
    },
    {
      title: "3 · the ALU adds, and answers five questions",
      detail: "Both inputs are ready: 2AH in the accumulator, 16H in temp. The ALU produces 40H and, at the same moment, the five flag bits that describe it.",
      live: ["acc", "temp", "alu", "flags"],
    },
    {
      title: "4 · the answer goes back into the accumulator",
      detail: "There is nowhere else it can go. The ALU's output is wired to A, which is why ADD B means A = A + B and why no instruction can add B into C.",
      live: ["alu", "acc", "flags"],
    },
  ],
  CMP: [
    {
      title: "1 · B puts its byte on the internal data bus",
      detail: "Identical to an ADD. The processor does not yet know or care what will happen to the result.",
      live: ["b", "bus"],
    },
    {
      title: "2 · it lands in the temp register",
      detail: "Same block, same reason. Every arithmetic and logic instruction on this chip uses the temp register, and no program ever mentions it.",
      live: ["bus", "temp"],
    },
    {
      title: "3 · the ALU subtracts, and answers five questions",
      detail: "CMP is a SUB underneath: 2AH − 16H = 14H, with the flags that go with it. Larger, smaller or equal is a question about a subtraction.",
      live: ["acc", "temp", "alu", "flags"],
    },
    {
      title: "4 · the answer is thrown away — only the flags survive",
      detail: "The accumulator is left holding 2AH, exactly as before. That is the entire difference between CMP and SUB, and it is why you can compare a value without destroying it.",
      live: ["flags"],
    },
  ],
};

/** What each box shows at a given stage, for the chosen operation. */
function boxValues(op: Op, step: number) {
  const temp = step >= 1 ? "16" : "--";
  const acc = op === "ADD" && step >= 3 ? "40" : "2A";
  const flags = step >= 2 ? (op === "ADD" ? "Z=0 CY=0" : "Z=0 CY=0") : "-- --";
  const alu = step < 2 ? "idle" : op === "ADD" ? "2A + 16" : "2A - 16";
  return { temp, acc, flags, alu };
}

function Box({ label, sub, value, live, tone }: { label: string; sub?: string; value: string; live: boolean; tone: string }) {
  return (
    <div
      style={{
        flex: "1 1 120px", borderRadius: 9, padding: "9px 10px",
        background: live ? "var(--good-soft)" : "var(--panel-2)",
        border: `${live ? 2 : 1}px solid ${live ? "var(--good)" : "var(--line)"}`,
      }}
    >
      <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: tone }}>{label}</div>
      {sub && <div style={{ fontSize: 9, color: "var(--ink-faint)" }}>{sub}</div>}
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--ink)", marginTop: 3 }}>{value}</div>
    </div>
  );
}

export function AluPathLab() {
  const [op, setOp] = useState<Op>("ADD");
  const [step, setStep] = useState(0);
  const stages = STAGES[op];
  const s = stages[step];
  const live = new Set(s.live);
  const v = boxValues(op, step);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">⚙️ What actually happens during <code>ADD B</code></span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        A is 2AH and B is 16H. Step through the four stages, then run the same journey as a{" "}
        <code>CMP</code> and watch where the two part company.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12 }}>
        {(["ADD", "CMP"] as Op[]).map((o) => (
          <button
            key={o}
            className={`btn ${op === o ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 14px", fontSize: 12, fontFamily: "var(--mono)" }}
            onClick={() => { setOp(o); setStep(0); }}
          >
            {o} B
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Box label="REGISTER B" value="16" live={live.has("b")} tone="var(--ink-faint)" />
          <Box label="TEMP REGISTER" sub="no instruction can name it" value={v.temp} live={live.has("temp")} tone="var(--accent-2)" />
          <Box label="ACCUMULATOR" sub="one ALU input, always" value={v.acc} live={live.has("acc")} tone="var(--teal)" />
        </div>

        <div
          style={{
            margin: "10px 0", height: 16, borderRadius: 4,
            background: live.has("bus") ? "var(--good-soft)" : "var(--panel)",
            border: `1px solid ${live.has("bus") ? "var(--good)" : "var(--line)"}`,
            display: "grid", placeItems: "center",
            fontSize: 9, fontFamily: "var(--mono)", color: live.has("bus") ? "var(--good)" : "var(--ink-faint)",
          }}
        >
          internal data bus · 8-bit
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Box label="ALU" sub="two inputs, one output" value={v.alu} live={live.has("alu")} tone="var(--accent-2)" />
          <Box label="FLAG FLIP-FLOPS" sub="S Z AC P CY" value={v.flags} live={live.has("flags")} tone="var(--teal)" />
        </div>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 12 }}>
        <div className="ss-stepper">
          <button onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0} aria-label="previous stage">‹</button>
          {stages.map((_, i) => (
            <button key={i} className={`ss-step${i === step ? " on" : ""}`} onClick={() => setStep(i)} aria-current={i === step}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setStep((n) => Math.min(stages.length - 1, n + 1))} disabled={step === stages.length - 1} aria-label="next stage">›</button>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div><b>{s.title}</b><br />{s.detail}</div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Stage 4 is the one to compare. <code>ADD</code> leaves 40H in the accumulator;{" "}
          <code>CMP</code> leaves 2AH, because the subtraction it did was never stored. Same wires,
          same ALU, same flags — the only difference is whether the output is written back.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------ 2 · one memory or two --- */

type Model = "vn" | "harvard";

const SLOTS = ["fetch the opcode", "read the data", "fetch the opcode", "write the answer"];

export function MemoryModelLab() {
  const [m, setM] = useState<Model>("vn");
  const vn = m === "vn";

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🛣️ One memory or two — von Neumann and Harvard</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        The difference is not what the boxes are called. It is whether an instruction and its data
        can travel <b>at the same moment</b>. Switch between them and read the timeline.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12 }}>
        <button className={`btn ${vn ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 13px", fontSize: 12 }} onClick={() => setM("vn")}>
          von Neumann — one memory
        </button>
        <button className={`btn ${vn ? "btn-ghost" : "btn-primary"}`} style={{ padding: "6px 13px", fontSize: 12 }} onClick={() => setM("harvard")}>
          Harvard — two memories
        </button>
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "stretch", justifyContent: "center", flexWrap: "wrap" }}>
          <div
            style={{
              flex: "0 0 130px", borderRadius: 9, border: "2px solid var(--teal)",
              display: "grid", placeItems: "center", padding: "16px 0",
              fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--ink)",
            }}
          >
            PROCESSOR
          </div>

          <div style={{ flex: "1 1 210px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            {(vn ? ["one bus — code AND data"] : ["bus 1 — code only", "bus 2 — data only"]).map((label) => (
              <div
                key={label}
                style={{
                  height: 14, borderRadius: 4, background: "var(--panel)",
                  border: "1px solid var(--accent)", display: "grid", placeItems: "center",
                  fontSize: 9, fontFamily: "var(--mono)", color: "var(--accent-2)",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div style={{ flex: "0 0 150px", display: "flex", flexDirection: "column", gap: 8 }}>
            {(vn ? ["MEMORY — code and data together"] : ["PROGRAM MEMORY", "DATA MEMORY"]).map((label) => (
              <div
                key={label}
                style={{
                  flex: 1, borderRadius: 9, border: "1px solid var(--line)", background: "var(--panel)",
                  display: "grid", placeItems: "center", padding: "10px 6px", textAlign: "center",
                  fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-soft)",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* the timeline — the whole argument */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--ink-faint)", marginBottom: 6 }}>
            FOUR TRIPS TO MEMORY, IN TIME →
          </div>
          {vn ? (
            <div style={{ display: "flex", gap: 4 }}>
              {SLOTS.map((s, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: 6, textAlign: "center",
                    background: "var(--panel)", border: "1px solid var(--line)",
                    fontSize: 10, color: "var(--ink-soft)",
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 2].map((i) => (
                  <div key={i} style={{ flex: 1, padding: "8px 4px", borderRadius: 6, textAlign: "center", background: "var(--teal-soft)", border: "1px solid var(--teal)", fontSize: 10, color: "var(--ink)" }}>
                    {SLOTS[i]}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 3].map((i) => (
                  <div key={i} style={{ flex: 1, padding: "8px 4px", borderRadius: 6, textAlign: "center", background: "var(--accent-soft)", border: "1px solid var(--accent)", fontSize: 10, color: "var(--ink)" }}>
                    {SLOTS[i]}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: vn ? "var(--bad)" : "var(--good)", marginTop: 8, textAlign: "center" }}>
            {vn ? "four trips, one after another — the bus is the queue" : "two rows, two buses — the same four trips take half the time"}
          </div>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          {vn ? (
            <>
              <b>The 8085 is von Neumann</b>, and so is the machine you are reading this on. One
              memory holds instructions and data together, which is why a program can be loaded like
              any other file — and why a wrong jump address will happily execute your data.
            </>
          ) : (
            <>
              <b>The 8051 microcontroller is Harvard</b>, and so is the core of most embedded chips.
              Code and data are separate memories with separate buses, so a fetch and a data access
              do not queue behind each other — and code cannot be overwritten by a runaway pointer.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Neither is the winner. Von Neumann is simpler and more flexible, which is what a general
          computer needs; Harvard is faster and safer, which is what a fixed embedded job needs.
          Modern processors quietly do both — one memory, but <b>separate instruction and data
          caches</b>, so the top level looks Harvard and the bottom stays von Neumann.
        </div>
      </div>
    </div>
  );
}
