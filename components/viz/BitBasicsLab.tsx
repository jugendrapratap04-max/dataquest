"use client";

import { useState } from "react";

/* The ground floor of the microprocessor course.
 *
 * WHY THESE EXIST. The first draft of this subject opened with "MVI A, 42H" and an
 * output of "A=0C", which quietly assumed the reader already knew what a byte was,
 * what hex was, and that a register is a box. Jugendra read it and said he could
 * not relate to it — his words, and he was right. A student with no background is
 * lost at the first output line, and no amount of good prose after that helps.
 *
 * So these three panels come BEFORE the processor is mentioned. They assume
 * nothing. A reader who has only ever used a light switch can follow them, and
 * everything else in the course — hex addresses, 64 KB, flags, 2^n — is built on
 * the three facts they establish:
 *
 *   BitSwitchLab   a switch is on or off, and eight of them make a number
 *   DoublingLab    each switch DOUBLES how many patterns you can make
 *   HexLab         four switches make one hex digit, so a byte is two of them
 *
 * They are deliberately playful. Nothing here is dumbed down — the place values,
 * the 2^n and the nibble split are exactly what an exam asks for — but the way in
 * is a switch you can press rather than a definition you have to accept. */

const PLACES = [128, 64, 32, 16, 8, 4, 2, 1];

const hex2 = (v: number) => v.toString(16).toUpperCase().padStart(2, "0");

/* ------------------------------------------------------ 1. eight switches --- */

/** 0100 0010 — 66, which is 42H, which is the letter B. The same 42H the
 *  processor lessons use later, so the number is already familiar when it
 *  reappears. */
const DEFAULT_BITS = [false, true, false, false, false, false, true, false];

export function BitSwitchLab() {
  const [bits, setBits] = useState<boolean[]>(DEFAULT_BITS);

  const value = bits.reduce((sum, on, i) => sum + (on ? PLACES[i] : 0), 0);
  const on = bits.filter(Boolean).length;
  const letter = value >= 32 && value <= 126 ? String.fromCharCode(value) : null;

  const toggle = (i: number) =>
    setBits((b) => b.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">💡 Eight switches — press them</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Each switch is only ever <b>off</b> or <b>on</b>. There is no half-on. Press a few and watch
        the number underneath change — that is the whole of how a computer holds a number.
      </p>

      {/* the switches */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
        {bits.map((isOn, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            aria-pressed={isOn}
            aria-label={`switch worth ${PLACES[i]}, currently ${isOn ? "on" : "off"}`}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              width: 56, padding: "8px 0", borderRadius: 9, cursor: "pointer",
              background: isOn ? "var(--accent-soft)" : "var(--panel-2)",
              border: `1.5px solid ${isOn ? "var(--accent)" : "var(--line)"}`,
              transition: "background .15s, border-color .15s",
            }}
          >
            <span style={{ fontSize: 9, color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>
              worth {PLACES[i]}
            </span>
            {/* a switch that looks like a switch */}
            <span
              style={{
                width: 22, height: 34, borderRadius: 5, background: "var(--panel)",
                border: "1px solid var(--line)", display: "flex", alignItems: isOn ? "flex-start" : "flex-end",
                padding: 2,
              }}
            >
              <span style={{ width: "100%", height: 14, borderRadius: 3, background: isOn ? "var(--accent)" : "var(--ink-faint)" }} />
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--mono)", color: isOn ? "var(--accent-2)" : "var(--ink-faint)" }}>
              {isOn ? 1 : 0}
            </span>
          </button>
        ))}
      </div>

      {/* what those switches add up to */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: "12px 14px", marginTop: 14 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 8 }}>
          {on === 0
            ? "every switch is off, so nothing is added up"
            : bits.map((b, i) => (b ? PLACES[i] : null)).filter(Boolean).join(" + ") + " = " + value}
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 13 }}>
            <span style={{ color: "var(--ink-faint)", fontSize: 10 }}>as switches </span>
            <b>{bits.map((b) => (b ? 1 : 0)).join("").replace(/(\d{4})(\d{4})/, "$1 $2")}</b>
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 13 }}>
            <span style={{ color: "var(--ink-faint)", fontSize: 10 }}>as a number </span>
            <b style={{ color: "var(--accent-2)" }}>{value}</b>
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 13 }}>
            <span style={{ color: "var(--ink-faint)", fontSize: 10 }}>written short </span>
            <b style={{ color: "var(--teal)" }}>{hex2(value)}H</b>
          </span>
          {letter && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 13 }}>
              <span style={{ color: "var(--ink-faint)", fontSize: 10 }}>as a letter </span>
              <b>{letter === " " ? "space" : letter}</b>
            </span>
          )}
        </div>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => setBits(Array(8).fill(false))}>all off (0)</button>
        <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => setBits(Array(8).fill(true))}>all on (255)</button>
        <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => setBits(DEFAULT_BITS)}>make the letter B</button>
        <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => setBits([false, false, false, false, true, false, true, false])}>make 10</button>
      </div>

      <div className="note key" style={{ marginTop: 14 }}>
        <span className="i">📌</span>
        <div>
          Press <b>all on</b>. The number is <b>255</b>, not 256 — because &ldquo;every switch
          off&rdquo; is also a pattern, and that one means zero. Eight switches give you{" "}
          <b>256 different patterns</b>, and they run from 0 to 255. That off-by-one is the most
          common mistake in this whole subject.
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- 2. the doubling --- */

export function DoublingLab() {
  const [n, setN] = useState(3);

  const patterns = Math.pow(2, n);
  const note =
    n === 1 ? "One switch. Off or on — two answers." :
    n === 8 ? "Eight switches is called a BYTE. It is the size a processor works in." :
    n === 16 ? "Sixteen switches is how the 8085 names a place in memory — that is where 64 KB comes from." :
    `Each switch you add doubles it.`;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">✖️ Add one switch, double everything</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        One switch gives 2 answers. Add a second and every one of those 2 splits into 2 — so 4. Add a
        third and it doubles again. Slide it up and watch how fast that grows.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-ghost" style={{ padding: "4px 12px" }} onClick={() => setN((x) => Math.max(1, x - 1))} aria-label="one fewer switch">−</button>
        <input
          type="range" min={1} max={16} value={n}
          onChange={(e) => setN(Number(e.target.value))}
          aria-label="how many switches"
          style={{ flex: "1 1 220px", maxWidth: 320 }}
        />
        <button className="btn btn-ghost" style={{ padding: "4px 12px" }} onClick={() => setN((x) => Math.min(16, x + 1))} aria-label="one more switch">+</button>
      </div>

      {/* the switches themselves, so "sixteen" is a thing you can see */}
      <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            style={{
              width: 16, height: 26, borderRadius: 4,
              background: i < n ? "var(--accent)" : "var(--panel-2)",
              border: `1px solid ${i < n ? "var(--accent)" : "var(--line)"}`,
              opacity: i < n ? 1 : 0.45,
            }}
          />
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 14 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-faint)" }}>
          {n} switch{n === 1 ? "" : "es"} · 2{n > 1 ? <sup>{n}</sup> : ""} patterns
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "var(--mono)", color: "var(--accent-2)", lineHeight: 1.2 }}>
          {patterns.toLocaleString("en-IN")}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
          different patterns · numbers 0 to {(patterns - 1).toLocaleString("en-IN")}
        </div>
      </div>

      <div className={`note ${n === 8 || n === 16 ? "key" : "tip"}`} style={{ marginTop: 14 }}>
        <span className="i">{n === 8 || n === 16 ? "📌" : "💡"}</span>
        <div>{note}</div>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 12 }}>
        <button className={`btn ${n === 1 ? "btn-primary" : "btn-ghost"}`} style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => setN(1)}>1 switch</button>
        <button className={`btn ${n === 4 ? "btn-primary" : "btn-ghost"}`} style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => setN(4)}>4</button>
        <button className={`btn ${n === 8 ? "btn-primary" : "btn-ghost"}`} style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => setN(8)}>8 — a byte</button>
        <button className={`btn ${n === 16 ? "btn-primary" : "btn-ghost"}`} style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => setN(16)}>16 — an address</button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- 3. hex --- */

const NIBBLE = [8, 4, 2, 1];

const nibbleValue = (bits: boolean[]) => bits.reduce((s, on, i) => s + (on ? NIBBLE[i] : 0), 0);
const hexDigit = (v: number) => v.toString(16).toUpperCase();

/** One group of four switches.
 *
 *  Declared at module scope, not inside HexLab. A component defined in a render
 *  body is a NEW component type on every render, so React unmounts and remounts
 *  it — which in this repo has already cost a quiz that jumped back to question 1
 *  after every answer. The compiler now rejects it outright. */
function Group({ bits, set, label }: { bits: boolean[]; set: (b: boolean[]) => void; label: string }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", background: "var(--panel-2)" }}>
      <div style={{ fontSize: 10, color: "var(--ink-faint)", fontFamily: "var(--mono)", textAlign: "center", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
        {bits.map((on, i) => (
          <button
            key={i}
            onClick={() => set(bits.map((v, j) => (j === i ? !v : v)))}
            aria-pressed={on}
            aria-label={`${label} bit worth ${NIBBLE[i]}`}
            style={{
              width: 34, padding: "5px 0", borderRadius: 6, cursor: "pointer",
              background: on ? "var(--accent-soft)" : "var(--panel)",
              border: `1.5px solid ${on ? "var(--accent)" : "var(--line)"}`,
              fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700,
              color: on ? "var(--accent-2)" : "var(--ink-faint)",
            }}
          >
            {on ? 1 : 0}
            <div style={{ fontSize: 8, fontWeight: 400, color: "var(--ink-faint)" }}>{NIBBLE[i]}</div>
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontFamily: "var(--mono)", fontSize: 12 }}>
        adds to <b>{nibbleValue(bits)}</b> → written <b style={{ color: "var(--teal)", fontSize: 15 }}>{hexDigit(nibbleValue(bits))}</b>
      </div>
    </div>
  );
}

export function HexLab() {
  // 0100 0010 again — 42H, the same byte the processor lessons use later.
  const [high, setHigh] = useState<boolean[]>([false, true, false, false]);
  const [low, setLow] = useState<boolean[]>([false, false, true, false]);

  const hv = nibbleValue(high);
  const lv = nibbleValue(low);
  const digit = hexDigit;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔢 Why 66 gets written as 42H</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Writing out eight 1s and 0s every time is painful. So people split the eight switches into{" "}
        <b>two groups of four</b>. Four switches can only add up to 0…15, and each of those sixteen
        totals gets one short symbol. Press the switches in either group.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
        <Group bits={high} set={setHigh} label="left four" />
        <span style={{ fontFamily: "var(--mono)", fontSize: 18, color: "var(--ink-faint)" }}>+</span>
        <Group bits={low} set={setLow} label="right four" />
      </div>

      <div style={{ textAlign: "center", marginTop: 14 }}>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--mono)" }}>
          <span style={{ color: "var(--teal)" }}>{digit(hv)}{digit(lv)}</span>
          <span style={{ fontSize: 16, color: "var(--ink-faint)" }}>H</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4, fontFamily: "var(--mono)" }}>
          which is the number {hv * 16 + lv} · as switches {high.map((b) => (b ? 1 : 0)).join("")} {low.map((b) => (b ? 1 : 0)).join("")}
        </div>
      </div>

      {/* the sixteen symbols, with the two in use lit */}
      <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        {Array.from({ length: 16 }, (_, v) => {
          const used = v === hv || v === lv;
          return (
            <div
              key={v}
              style={{
                minWidth: 34, padding: "4px 0", borderRadius: 6, textAlign: "center",
                background: used ? "var(--teal-soft, var(--accent-soft))" : "var(--panel-2)",
                border: `1px solid ${used ? "var(--teal)" : "var(--line)"}`,
                fontFamily: "var(--mono)",
              }}
            >
              <div style={{ fontSize: 9, color: "var(--ink-faint)" }}>{v}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: used ? "var(--teal)" : "var(--ink-soft)" }}>{digit(v)}</div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11.5, color: "var(--ink-faint)", textAlign: "center", marginTop: 6 }}>
        0 to 9 use the digits we already have. 10 to 15 had no digits, so they borrowed letters:
        A B C D E F.
      </p>

      <div className="note key" style={{ marginTop: 14 }}>
        <span className="i">📌</span>
        <div>
          This is the whole reason a byte is always written as <b>exactly two</b> symbols followed by
          H. Four switches → one symbol. Eight switches → two symbols. So <b>FF</b>H is every switch
          on, and <b>00</b>H is every switch off. You will see thousands of these; there is nothing
          more to it than the two groups above.
        </div>
      </div>

      <div className="note warn" style={{ marginTop: 10 }}>
        <span className="i">⚠️</span>
        <div>
          Set the left group to <b>0001</b> and the right to <b>0000</b>. That reads <b>10H</b> — and
          it is <b>sixteen</b>, not ten. The H is not decoration; it changes what the number means.
        </div>
      </div>
    </div>
  );
}
