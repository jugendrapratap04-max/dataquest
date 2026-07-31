"use client";

import { useState } from "react";

/* Three panels for "Memory organization and decoding".
 *
 * Like lesson 11, none of this executes — the simulator has a flat 64 KB of
 * memory and no chip selects at all, so these are models and the lesson says so.
 * What they replace is the worst part of this topic: it is normally taught as a
 * table of address ranges to copy down, when every one of those ranges is the
 * output of a calculation the student should be able to do.
 *
 *   DecodeLab     the calculation itself: chip size decides how many address
 *                 lines the chip uses, and everything above that is what the
 *                 decoder has to check.
 *   Decoder138Lab the part that actually does the checking on a real board.
 *                 Three inputs, eight outputs, 8 KB each.
 *   FoldbackLab   what happens when the decoder checks FEWER lines than it
 *                 should. The chip appears several times over, and the number of
 *                 copies is 2 to the power of however many lines were ignored.
 *
 * The arithmetic is exact and worth stating once: a chip of 2^n bytes uses
 * A0 to A(n-1); the 16 - n lines above it are available to the decoder; and if
 * the decoder checks only k of those, the chip answers at 2^(16-n-k) addresses. */

const hex4 = (v: number) => (v & 0xffff).toString(16).toUpperCase().padStart(4, "0");

/* ------------------------------------------- 1 · which lines go where --- */

const SIZES = [
  { label: "1 KB", bytes: 1024, lines: 10 },
  { label: "2 KB", bytes: 2048, lines: 11 },
  { label: "4 KB", bytes: 4096, lines: 12 },
  { label: "8 KB", bytes: 8192, lines: 13 },
];

export function DecodeLab() {
  const [si, setSi] = useState(1);
  const [block, setBlock] = useState(0);
  const s = SIZES[si];
  const blocks = 65536 / s.bytes;
  const b = Math.min(block, blocks - 1);
  const base = b * s.bytes;
  const end = base + s.bytes - 1;
  const spare = 16 - s.lines;
  /* The high lines the decoder must check, most significant first. */
  const pattern = Array.from({ length: spare }, (_, i) => (base >> (15 - i)) & 1);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧮 Which address lines go to the chip, and which to the decoder</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        A memory chip has its own address pins, and they are always the <b>lowest</b>{" "}
        ones. Everything above them is the decoder&apos;s problem. Pick a size, then slide it around
        the map.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 10, flexWrap: "wrap" }}>
        {SIZES.map((x, ix) => (
          <button
            key={x.label}
            className={`btn ${ix === si ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "5px 12px", fontSize: 11.5, fontFamily: "var(--mono)" }}
            onClick={() => { setSi(ix); setBlock(0); }}
          >
            {x.label}
          </button>
        ))}
      </div>

      <input
        type="range" min={0} max={blocks - 1} value={b}
        onChange={(e) => setBlock(Number(e.target.value))}
        aria-label="where the chip sits in the 64 KB map"
        style={{ width: "100%" }}
      />

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 14, marginTop: 12 }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-faint)" }}>this chip answers to</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, color: "var(--teal)" }}>
            {hex4(base)}H – {hex4(end)}H
          </div>
        </div>

        <div style={{ display: "flex", gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
          {Array.from({ length: 16 }, (_, i) => {
            const line = 15 - i;
            const forChip = line < s.lines;
            const bit = forChip ? null : ((base >> line) & 1);
            return (
              <div key={line} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 8.5, fontFamily: "var(--mono)", color: "var(--ink-faint)" }}>A{line}</div>
                <div
                  style={{
                    width: 26, padding: "5px 0", borderRadius: 5, marginTop: 2,
                    background: forChip ? "var(--teal-soft)" : "var(--accent-soft)",
                    border: `1px solid ${forChip ? "var(--teal)" : "var(--accent)"}`,
                    fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "var(--ink)",
                  }}
                >
                  {forChip ? "•" : bit}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 10, flexWrap: "wrap", fontSize: 11 }}>
          <span style={{ color: "var(--teal)", fontFamily: "var(--mono)" }}>
            ● A0–A{s.lines - 1} go to the chip ({s.lines} lines)
          </span>
          <span style={{ color: "var(--accent-2)", fontFamily: "var(--mono)" }}>
            ● A{s.lines}–A15 go to the decoder ({spare} lines)
          </span>
        </div>
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          <b>{s.label} is 2<sup>{s.lines}</sup> bytes, so the chip has {s.lines} address pins.</b> They
          cover every byte inside it, which is why the range is always {s.label} long and always
          starts on a multiple of {s.label}. The remaining <b>{spare}</b> lines say nothing about
          which byte — only about whether this chip is the one being addressed at all. Here they must
          read <b>{pattern.join("")}</b>.
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          This is the whole exam calculation, in both directions. <b>Size to lines:</b> a 4 KB chip is
          2<sup>12</sup>, so 12 pins, so A12–A15 are left for decoding. <b>Range to size:</b> a chip
          answering 8000H–9FFFH covers 2000H bytes, which is 8 KB, which is 13 pins.
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------- 2 · the 74LS138 --- */

export function Decoder138Lab() {
  const [c, setC] = useState(0);
  const [bsel, setBsel] = useState(1);
  const [a, setA] = useState(0);
  const active = (c << 2) | (bsel << 1) | a;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔢 The 74LS138 — three inputs, eight chip selects</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Wire the top three address lines into a 3-to-8 decoder and the 64 KB map falls into eight
        8 KB blocks — one output per block, and only ever one at a time.
      </p>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {([["C ← A15", c, setC], ["B ← A14", bsel, setBsel], ["A ← A13", a, setA]] as const).map(([label, val, set]) => (
          <button
            key={label}
            className={`btn ${val ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "7px 13px", fontSize: 12, fontFamily: "var(--mono)" }}
            onClick={() => set(val ? 0 : 1)}
          >
            {label} = {val}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 12 }}>
        {Array.from({ length: 8 }, (_, i) => {
          const on = i === active;
          const from = i * 8192;
          return (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 7,
                background: on ? "var(--good-soft)" : "var(--panel-2)",
                border: `${on ? 2 : 1}px solid ${on ? "var(--good)" : "var(--line)"}`,
              }}
            >
              <span style={{ flex: "0 0 34px", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>Y{i}</span>
              <span style={{ flex: "0 0 60px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)" }}>
                {i.toString(2).padStart(3, "0")}
              </span>
              <span style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)" }}>
                {hex4(from)}H – {hex4(from + 8191)}H
              </span>
              <span style={{ flex: "0 0 54px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 10, color: on ? "var(--good)" : "var(--ink-faint)" }}>
                {on ? "ACTIVE" : "high"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="note key" style={{ marginTop: 12 }}>
        <span className="i">📌</span>
        <div>
          <b>Y{active} is low, and every other output is high.</b> That is the point of a decoder:
          exactly one chip is ever selected, which is what stops two of them driving the data bus at
          once. Feed Y{active} to a chip&apos;s CS pin and that chip owns{" "}
          {hex4(active * 8192)}H – {hex4(active * 8192 + 8191)}H.
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Eight blocks of 8 KB because <b>three lines were used and thirteen were left</b> —
          2<sup>13</sup> is 8192. Wire A15, A14, A13 and A12 into a 4-to-16 decoder instead and you
          get sixteen blocks of 4 KB. The decoder does not decide the block size; the lines you do
          not give it do.
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- 3 · what a lazy decoder costs --- */

export function FoldbackLab() {
  /* A 2 KB chip: A0-A10 go to the chip, A11-A15 are available to the decoder. */
  const CHIP = 2048;
  const AVAILABLE = 5;
  const [checked, setChecked] = useState(5);
  const ignored = AVAILABLE - checked;
  const copies = Math.pow(2, ignored);
  const region = CHIP * copies;
  const bases = Array.from({ length: copies }, (_, i) => i * CHIP);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">👻 Partial decoding, and the copies it leaves behind</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        One 2 KB chip at address 0000H. Five address lines are available to select it — slide how
        many of them the decoder actually bothers to check.
      </p>

      <input
        type="range" min={2} max={5} value={checked}
        onChange={(e) => setChecked(Number(e.target.value))}
        aria-label="how many high address lines the decoder checks"
        style={{ width: "100%" }}
      />
      <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
        decoder checks <b style={{ color: "var(--accent-2)" }}>{checked}</b> of 5 lines &nbsp;·&nbsp;{" "}
        <b style={{ color: ignored ? "var(--bad)" : "var(--good)" }}>{ignored}</b> ignored
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: 14, marginTop: 12 }}>
        <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", letterSpacing: ".06em", color: "var(--ink-faint)", marginBottom: 6 }}>
          THE FIRST 16 KB OF THE MAP, IN 2 KB SLOTS
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: 8 }, (_, i) => {
            const answers = i * CHIP < region;
            return (
              <div
                key={i}
                style={{
                  flex: 1, padding: "12px 2px", borderRadius: 6, textAlign: "center",
                  background: answers ? (i === 0 ? "var(--good-soft)" : "var(--bad-soft)") : "var(--panel)",
                  border: `1px solid ${answers ? (i === 0 ? "var(--good)" : "var(--bad)") : "var(--line)"}`,
                  fontFamily: "var(--mono)", fontSize: 9.5, color: "var(--ink)",
                }}
              >
                {hex4(i * CHIP)}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-faint)" }}>the same 2 KB of silicon appears</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 700, color: copies === 1 ? "var(--good)" : "var(--bad)" }}>
            {copies} time{copies === 1 ? "" : "s"}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>
            at {bases.slice(0, 4).map((x) => hex4(x) + "H").join(", ")}{copies > 4 ? ", …" : ""}
          </div>
        </div>
      </div>

      <div className={`note ${copies === 1 ? "key" : "warn"}`} style={{ marginTop: 12 }}>
        <span className="i">{copies === 1 ? "📌" : "⚠️"}</span>
        <div>
          {copies === 1 ? (
            <>
              <b>Absolute decoding.</b> Every available line is checked, so the chip answers at
              exactly one range and the other 62 KB of the map is genuinely free for something else.
              It costs more gates, and it is what you do when the board might grow.
            </>
          ) : (
            <>
              <b>Partial decoding, and {ignored} ignored line{ignored === 1 ? "" : "s"} means{" "}
              {copies} copies.</b> The chip cannot tell those addresses apart, so writing to{" "}
              {hex4(bases[1])}H changes the byte at 0000H — the same physical cell under a different
              name. This is called <b>foldback</b>, and the arithmetic is simply 2<sup>{ignored}</sup>.
              The {region / 1024} KB it covers is now unusable by anything else, whether or not you
              meant to spend it.
            </>
          )}
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 10 }}>
        <span className="i">💡</span>
        <div>
          Partial decoding is not a mistake by definition — it is a deliberate trade of address space
          for gates, and small dedicated boards do it on purpose. It becomes a bug the moment
          somebody adds a second chip in a range the first one is quietly answering to, and then two
          devices drive the bus together. That is the contention from lesson 8, arriving from the one
          direction nobody looks.
        </div>
      </div>
    </div>
  );
}
