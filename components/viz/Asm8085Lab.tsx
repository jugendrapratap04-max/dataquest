"use client";

import { useMemo, useState } from "react";
import { run, hex2, hex4, type RunResult } from "@/lib/asm8085";

/* A real 8085, on the page.
 *
 * This is the panel the whole subject rests on. Every other way of teaching
 * assembly on a website ends with "now try this on a trainer kit in the lab" —
 * which for most students means never. Here the instruction actually executes,
 * the registers actually change, and the T-state counter actually adds up to the
 * number the exam asks for.
 *
 * It runs in TWO modes and the second one is the teaching one:
 *   - RUN, which executes to HLT and shows the final state, like a trainer kit.
 *   - STEP, which executes one instruction at a time, so the student watches a
 *     register change and can point at the instruction that changed it.
 *
 * Stepping is done by re-running the program from the start with a step limit,
 * rather than by holding a live machine. That is not laziness: it makes every
 * displayed state reproducible from the source alone, so what the panel shows and
 * what verify:lesson checked cannot drift apart. The programs here are a few
 * dozen instructions, so re-running is free. */

type Preset = {
  key: string;
  label: string;
  blurb: string;
  code: string;
  /** Bytes the program expects to find in memory, and where. */
  memory?: { at: number; bytes: number[] };
  /** Addresses worth watching, beyond the ones the program writes. */
  watch?: number[];
};

const PRESETS: Preset[] = [
  {
    key: "move",
    label: "1 · move a byte",
    blurb: "The smallest useful program there is. Step through it and watch one byte travel: into A, then into B, then into memory.",
    code: `        MVI A, 42H      ; put 42H into the accumulator
        MOV B, A        ; copy it to B
        LXI H, 2050H    ; point HL at address 2050H
        MOV M, A        ; write A to the byte HL points at
        HLT
`,
    watch: [0x2050],
  },
  {
    key: "flags",
    label: "2 · make the flags move",
    blurb: "Four additions, chosen so each one lights a different flag. Step once per instruction and read the flag row — this is the fastest way to stop guessing what AC means.",
    code: `        MVI A, 0FH      ; 0F + 01 carries out of bit 3 only
        ADI 01H         ;   -> AC = 1, CY = 0
        MVI A, 0FFH     ; FF + 01 carries out of bit 7 too
        ADI 01H         ;   -> CY = 1, Z = 1, AC = 1
        MVI A, 05H      ; 05 - 0A needs a borrow
        SUI 0AH         ;   -> CY = 1 (borrow), S = 1
        HLT
`,
  },
  {
    key: "loop",
    label: "3 · a delay loop",
    blurb: "The loop every syllabus asks you to time. Run it and read T-states: 7 for the MVI, then DCR and JNZ five times round, then HLT. The counter is the answer to the exam question.",
    code: `        MVI C, 05H      ; 7 T-states
LOOP:   DCR C           ; 4 T-states, five times
        JNZ LOOP        ; 10 when it jumps, 7 when it falls through
        HLT             ; 5 T-states
`,
  },
  {
    key: "sum",
    label: "4 · add up a block",
    blurb: "Five bytes at 2050H, added and stored at 2060H. This is the first program that does something a person would actually want, and it is three instructions long inside the loop.",
    code: `        LXI H, 2050H    ; where the numbers are
        MVI C, 05H      ; how many
        XRA A           ; clear the accumulator (and CY)
LOOP:   ADD M           ; add the byte HL points at
        INX H           ; move to the next one
        DCR C           ; one fewer to go
        JNZ LOOP
        STA 2060H       ; store the total
        HLT
`,
    memory: { at: 0x2050, bytes: [0x10, 0x20, 0x30, 0x40, 0x50] },
    watch: [0x2060],
  },
  {
    key: "largest",
    label: "5 · find the largest",
    blurb: "CMP is a subtraction whose answer is thrown away — only the flags survive, and CY answers 'was A smaller?'. Step through and watch A keep whichever byte is bigger.",
    code: `        LXI H, 2050H
        MOV C, M        ; first byte is the count
        DCR C           ; that many comparisons, minus one
        INX H
        MOV A, M        ; start with the first number
LOOP:   INX H
        CMP M           ; CY = 1 means A is smaller
        JNC SKIP
        MOV A, M        ; so take the bigger one
SKIP:   DCR C
        JNZ LOOP
        STA 2060H
        HLT
`,
    memory: { at: 0x2050, bytes: [0x04, 0x05, 0x09, 0x03, 0x07] },
    watch: [0x2060],
  },
  {
    key: "call",
    label: "6 · the stack",
    blurb: "CALL pushes the return address; RET pops it. Step past the CALL and watch SP drop by two and two bytes appear below it — that is the whole mechanism behind every function you have ever written.",
    code: `        LXI SP, 2400H   ; the stack lives here
        MVI A, 05H
        CALL DOUBLE
        HLT
DOUBLE: ADD A           ; A = A + A
        RET
`,
    watch: [0x23fe, 0x23ff],
  },
];

const FLAGS = ["S", "Z", "AC", "P", "CY"] as const;

/** One register or flag cell, highlighted when it changed on the last step.
 *
 *  `as` matters: a flag is one bit and must read 0 or 1. Formatting it as a byte
 *  printed the flags as "00" and "01", which is wrong on the page and actively
 *  confusing next to the registers beside them. */
function Cell({ name, value, as = "byte", changed }: { name: string; value: number; as?: "byte" | "word" | "bit"; changed: boolean }) {
  const wide = as === "word";
  const text = as === "word" ? hex4(value) : as === "bit" ? String(value) : hex2(value);
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        padding: "5px 0", borderRadius: 7, minWidth: wide ? 52 : 40,
        background: changed ? "var(--accent-soft)" : "var(--panel-2)",
        border: `1px solid ${changed ? "var(--accent)" : "var(--line)"}`,
        transition: "background .18s, border-color .18s",
      }}
    >
      <span style={{ fontSize: 9.5, letterSpacing: ".06em", color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>{name}</span>
      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", color: changed ? "var(--accent-2)" : "var(--ink)" }}>
        {text}
      </span>
    </div>
  );
}

export function Asm8085Lab() {
  const [presetKey, setPresetKey] = useState(PRESETS[0].key);
  const [code, setCode] = useState(PRESETS[0].code);
  /** null = not stepping (show the finished program). A number = stop after N. */
  const [step, setStep] = useState<number | null>(null);

  const preset = PRESETS.find((p) => p.key === presetKey) ?? PRESETS[0];

  const memory = useMemo(
    () => Object.fromEntries((preset.memory?.bytes ?? []).map((b, i) => [preset.memory!.at + i, b])),
    [preset]
  );

  // The full run, and the run stopped one instruction earlier. Diffing the two is
  // what lets a cell light up: "this instruction changed exactly this".
  const full = useMemo(() => run(code, { memory }), [code, memory]);
  const now: RunResult = useMemo(
    () => (step === null ? full : run(code, { memory, stopAfter: step })),
    [step, full, code, memory]
  );
  const before: RunResult | null = useMemo(
    () => (step === null || step === 0 ? null : run(code, { memory, stopAfter: step - 1 })),
    [step, code, memory]
  );

  const total = full.steps;
  const stepping = step !== null;
  const changed = (k: keyof RunResult["regs"]) => !!before && before.regs[k] !== now.regs[k];
  const flagChanged = (f: (typeof FLAGS)[number]) => !!before && before.flags[f] !== now.flags[f];

  // Which source line is about to run — the one the student should be looking at.
  const nextLine = useMemo(() => {
    if (!stepping) return -1;
    const lines = code.split("\n");
    // Count real instructions from the top; the PC after N steps is not a line
    // number, so walk the source instead. Good enough for straight-line teaching
    // programs and honest about loops: it highlights the instruction just run.
    let seen = 0;
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].split(";")[0].replace(/^[A-Za-z_][A-Za-z0-9_]*\s*:/, "").trim();
      if (!t) continue;
      seen++;
      if (seen === step) return i;
    }
    return -1;
  }, [stepping, step, code]);

  const load = (p: Preset) => { setPresetKey(p.key); setCode(p.code); setStep(null); };

  const watch = [...new Set([...(preset.watch ?? []), ...Object.keys(now.memory).map(Number)])]
    .filter((a) => !(preset.memory && a >= preset.memory.at && a < preset.memory.at + preset.memory.bytes.length))
    .sort((a, b) => a - b)
    .slice(0, 8);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔬 8085 Lab — a real processor, running here</span>
        <span className="viz-badge">runs 8085</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        This is not a diagram of an 8085. It assembles your source into real opcodes and executes
        them. Nothing to download — press <b>Step</b> and watch one instruction change one register.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 10 }}>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            className={`btn ${presetKey === p.key ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 10px", fontSize: 11.5 }}
            onClick={() => load(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>{preset.blurb}</p>

      {preset.memory && (
        <div className="viz-code" style={{ overflowX: "auto", marginBottom: 10, fontSize: 12 }}>
          <span style={{ color: "var(--code-com)" }}># the bytes this program expects in memory{"\n"}</span>
          {preset.memory.bytes.map((b, i) => `${hex4(preset.memory!.at + i)}: ${hex2(b)}`).join("    ")}
        </div>
      )}

      <textarea
        value={code}
        onChange={(e) => { setCode(e.target.value); setStep(null); }}
        spellCheck={false}
        rows={Math.max(8, code.split("\n").length + 1)}
        aria-label="8085 assembly source"
        className="viz-code"
        style={{ width: "100%", border: "1px solid var(--line)", resize: "vertical", lineHeight: 1.65 }}
      />

      <div className="viz-controls" style={{ justifyContent: "center", margin: "12px 0 0", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={() => setStep(null)}>Run to HLT</button>
        <div className="ss-stepper">
          <button onClick={() => setStep((s) => Math.max(0, (s ?? total) - 1))} aria-label="one instruction back">‹</button>
          <button className="ss-step on" onClick={() => setStep((s) => (s === null ? 1 : Math.min(total, s + 1)))}>
            {stepping ? `Step ${step} of ${total}` : "Step"}
          </button>
          <button onClick={() => setStep((s) => Math.min(total, (s ?? 0) + 1))} aria-label="one instruction forward">›</button>
        </div>
        <button className="btn btn-ghost" onClick={() => { setCode(preset.code); setStep(null); }}>Reset</button>
      </div>

      {!now.ok && (
        <div className="note warn" style={{ marginTop: 14 }}>
          <span className="i">⚠️</span>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
            {now.line ? `Line ${now.line}: ` : ""}{now.error}
          </div>
        </div>
      )}

      {now.ok && (
        <>
          {stepping && nextLine >= 0 && (
            <p style={{ fontSize: 12, color: "var(--ink-faint)", textAlign: "center", margin: "12px 0 0", fontFamily: "var(--mono)" }}>
              just ran: {code.split("\n")[nextLine].trim()}
            </p>
          )}

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 12 }}>
            <Cell name="A" value={now.regs.A} changed={changed("A")} />
            <Cell name="B" value={now.regs.B} changed={changed("B")} />
            <Cell name="C" value={now.regs.C} changed={changed("C")} />
            <Cell name="D" value={now.regs.D} changed={changed("D")} />
            <Cell name="E" value={now.regs.E} changed={changed("E")} />
            <Cell name="H" value={now.regs.H} changed={changed("H")} />
            <Cell name="L" value={now.regs.L} changed={changed("L")} />
            <Cell name="SP" value={now.regs.SP} as="word" changed={changed("SP")} />
            <Cell name="PC" value={now.regs.PC} as="word" changed={changed("PC")} />
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            {FLAGS.map((f) => (
              <Cell key={f} name={f} value={now.flags[f] ? 1 : 0} as="bit" changed={flagChanged(f)} />
            ))}
            <div
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "5px 12px", borderRadius: 7, background: "var(--panel-2)", border: "1px solid var(--line)",
              }}
            >
              <span style={{ fontSize: 9.5, letterSpacing: ".06em", color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>T-STATES</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--good)" }}>{now.tStates}</span>
            </div>
          </div>

          {watch.length > 0 && (
            <div className="viz-code" style={{ overflowX: "auto", marginTop: 12, fontSize: 12 }}>
              <span style={{ color: "var(--code-com)" }}># memory the program wrote{"\n"}</span>
              {watch.map((a) => `${hex4(a)}: ${hex2(now.memory[a] ?? 0)}`).join("    ")}
            </div>
          )}

          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: "pointer", fontSize: 12.5, color: "var(--ink-soft)" }}>
              Show the machine code it assembled
            </summary>
            <div className="viz-code" style={{ overflowX: "auto", marginTop: 8, fontSize: 12, whiteSpace: "pre-wrap" }}>
              {Object.entries(full.code).map(([a, b]) => `${hex4(Number(a))}: ${hex2(b)}`).join("   ")}
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 8 }}>
              These are the bytes you would key into a trainer kit, and the bytes an exam asks you to
              hand-assemble. <code>MVI A, 42H</code> is <code>3E 42</code> — one byte saying
              &ldquo;load the accumulator with what comes next&rdquo;, then the 42H itself.
            </p>
          </details>
        </>
      )}

      <div className="note tip" style={{ marginTop: 14 }}>
        <span className="i">💡</span>
        <div>
          Change something and it re-runs. Delete the <code>HLT</code> and read the message — the
          processor does not know your program has ended, it just keeps fetching. Then put{" "}
          <code>MVI C, 0FFH</code>{" "}
          in the delay loop and watch the T-state counter, which is exactly the calculation asked
          for in &ldquo;design a 1 ms delay&rdquo;.
        </div>
      </div>
    </div>
  );
}
