"use client";

import { useState } from "react";

/* Three panels for "Memory — a Street of Numbered Boxes".
 *
 * They share a file because they share one idea, and the idea is the single
 * hardest thing in this lesson: an address and its contents are TWO DIFFERENT
 * NUMBERS. Every later confusion in the subject — pointers, indirect addressing,
 * why MOV A, M is not MOV A, L — grows out of not separating them early.
 *
 * So the first panel never shows a box without showing its number beside it, and
 * never in the same colour. The second panel exists because "read" and "write"
 * are not opposites: reading copies and leaves the box alone, writing destroys
 * what was there. The third derives 64 KB from switches rather than asserting it,
 * which connects straight back to the doubling panel in lesson 1.
 *
 * Nothing here is a simulation of the 8085 — it is a model of memory, and the
 * lesson says so. The real thing runs in the code blocks beside these panels. */

const hex2 = (v: number) => v.toString(16).toUpperCase().padStart(2, "0");
const hex4 = (v: number) => v.toString(16).toUpperCase().padStart(4, "0");

/* ------------------------------------------------------- 1 · the street --- */

const START = 0x2050;
const CONTENTS = [0x07, 0x63, 0xff, 0x00, 0x41, 0x9c, 0x10, 0x2a, 0x80, 0x05, 0xbb, 0x3f];

export function MemoryStreetLab() {
  const [i, setI] = useState(0);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🏠 The street — every box has a number</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Click any box. Watch the two numbers underneath — they are never the same thing.
      </p>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
        {CONTENTS.map((v, ix) => (
          <button
            key={ix}
            onClick={() => setI(ix)}
            style={{
              flex: "none", width: 58, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "6px 0 8px", borderRadius: 8,
              background: ix === i ? "var(--accent-soft)" : "var(--panel-2)",
              border: `1px solid ${ix === i ? "var(--accent)" : "var(--line)"}`,
            }}
          >
            <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--teal)" }}>{hex4(START + ix)}</span>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--ink)" }}>{hex2(v)}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 190px", border: "1px solid var(--teal)", borderRadius: 10, padding: "10px 14px", background: "var(--panel-2)" }}>
          <div style={{ fontSize: 10, letterSpacing: ".07em", color: "var(--teal)", fontFamily: "var(--mono)", marginBottom: 4 }}>
            THE BOX NUMBER — its address
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--mono)" }}>{hex4(START + i)}H</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 4 }}>
            Where it is. Never changes — box {hex4(START + i)}H is always in the same place.
          </div>
        </div>
        <div style={{ flex: "1 1 190px", border: "1px solid var(--accent)", borderRadius: 10, padding: "10px 14px", background: "var(--panel-2)" }}>
          <div style={{ fontSize: 10, letterSpacing: ".07em", color: "var(--accent-2)", fontFamily: "var(--mono)", marginBottom: 4 }}>
            WHAT IS INSIDE — its contents
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--mono)" }}>{hex2(CONTENTS[i])}H</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 4 }}>
            One byte — eight switches. A program can change this whenever it likes.
          </div>
        </div>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}>
        <span className="i">💡</span>
        <div>
          Think of a street of houses. <b>2050</b> is the house number painted on the door;{" "}
          <b>{hex2(CONTENTS[i])}</b> is the family living inside. The number on the door does not
          move house, and the family can move out tomorrow. Confusing the two is the mistake this
          whole lesson exists to prevent.
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------- 2 · reading and writing --- */

type LogLine = { text: string; kind: "read" | "write" };

export function MemoryRwLab() {
  const [box, setBox] = useState(0x07);
  const [acc, setAcc] = useState(0x00);
  const [log, setLog] = useState<LogLine[]>([]);

  const push = (text: string, kind: LogLine["kind"]) => setLog((l) => [...l.slice(-4), { text, kind }]);

  const read = () => {
    setAcc(box);
    push(`READ  — copied ${hex2(box)} out of the box. The box still holds ${hex2(box)}.`, "read");
  };
  const write = (v: number) => {
    push(`WRITE — put ${hex2(v)} in. Whatever was there (${hex2(box)}) is gone forever.`, "write");
    setBox(v);
  };

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📥 Reading and writing are not opposites</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Press <b>Read</b> a few times and watch the box. Then press <b>Write</b> once and watch what
        happens to what was in it.
      </p>

      <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--teal)", marginBottom: 4 }}>BOX 2050H</div>
          <div style={{ width: 86, height: 62, display: "grid", placeItems: "center", borderRadius: 10, border: "2px solid var(--teal)", background: "var(--panel-2)", fontSize: 24, fontWeight: 700, fontFamily: "var(--mono)" }}>
            {hex2(box)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <button className="btn btn-primary" style={{ padding: "7px 16px", fontSize: 12 }} onClick={read}>
            Read  →
          </button>
          <button className="btn btn-ghost" style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => write(0x42)}>
            ←  Write 42
          </button>
          <button className="btn btn-ghost" style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => write(0x99)}>
            ←  Write 99
          </button>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--accent-2)", marginBottom: 4 }}>REGISTER A</div>
          <div style={{ width: 86, height: 62, display: "grid", placeItems: "center", borderRadius: 10, border: "2px solid var(--accent)", background: "var(--panel-2)", fontSize: 24, fontWeight: 700, fontFamily: "var(--mono)" }}>
            {hex2(acc)}
          </div>
        </div>
      </div>

      <div className="viz-code" style={{ marginTop: 14, minHeight: 62, fontSize: 12, lineHeight: 1.7 }}>
        {log.length === 0
          ? "// press a button"
          : log.map((l, k) => (
              <div key={k} style={{ color: l.kind === "write" ? "var(--bad)" : "var(--good)" }}>{l.text}</div>
            ))}
      </div>

      <div className="note warn" style={{ marginTop: 12 }}>
        <span className="i">⚠️</span>
        <div>
          <b>Reading copies. Writing destroys.</b> You can read a box a thousand times and it still
          holds the same byte — like reading a house number does not take it off the door. But a box
          holds exactly one byte, so writing a new one means the old one is gone. There is no undo,
          and nothing warns you.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- 3 · how many boxes can we even number --- */

export function AddressWidthLab() {
  const [n, setN] = useState(4);
  const boxes = Math.pow(2, n);
  const pretty =
    boxes >= 1024 * 1024 ? `${boxes / (1024 * 1024)} MB` : boxes >= 1024 ? `${boxes / 1024} KB` : `${boxes} boxes`;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔢 How long can the street be?</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Every box needs its own number, and the number is written with switches. Drag the slider and
        watch how far the street reaches.
      </p>

      <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 10, flexWrap: "wrap" }}>
        {Array.from({ length: 16 }, (_, b) => (
          <div
            key={b}
            style={{
              width: 20, height: 26, borderRadius: 4,
              background: b < n ? "var(--teal)" : "var(--panel-2)",
              border: `1px solid ${b < n ? "var(--teal)" : "var(--line)"}`,
              display: "grid", placeItems: "center",
              fontSize: 9, fontFamily: "var(--mono)",
              color: b < n ? "#04240F" : "var(--ink-faint)",
              fontWeight: 700,
            }}
          >
            {b < n ? "1" : "0"}
          </div>
        ))}
      </div>

      <input
        type="range" min={1} max={16} value={n}
        onChange={(e) => setN(Number(e.target.value))}
        aria-label="how many switches in an address"
        style={{ width: "100%" }}
      />

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-soft)" }}>
          {n} switch{n === 1 ? "" : "es"} → 2<sup>{n}</sup> ={" "}
          <b style={{ color: "var(--teal)", fontSize: 17 }}>{boxes.toLocaleString("en-IN")}</b> boxes
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-faint)", marginTop: 4 }}>
          each box holds one byte, so that is {pretty}
        </div>
      </div>

      <div className={`note ${n === 16 ? "key" : "tip"}`} style={{ marginTop: 14 }}>
        <span className="i">{n === 16 ? "📌" : "💡"}</span>
        <div>
          {n === 16 ? (
            <>
              <b>Sixteen switches — and that is the 8085.</b> 65,536 boxes, one byte each, which is
              exactly <b>64 KB</b>. Not a design limit somebody chose: it is what sixteen switches
              can count to. To reach further you need a seventeenth wire, and the 8085 does not have
              one.
            </>
          ) : (
            <>
              Same doubling as the switches in lesson 1 — one more switch, twice as many boxes. Keep
              dragging to 16 and see where the 8085 stops.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
