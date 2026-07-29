"use client";

import { useState } from "react";

// The single idea that makes logging click: the level is a dial, not a label.
// Set it, and every message below the line disappears — same code, different
// amount of noise. This is why logging beats print(): you cannot turn print off.

type Level = { key: string; rank: number; colour: string };

const LEVELS: Level[] = [
  { key: "DEBUG", rank: 10, colour: "#7C8AA5" },
  { key: "INFO", rank: 20, colour: "#2C5FC0" },
  { key: "WARNING", rank: 30, colour: "#E8920C" },
  { key: "ERROR", rank: 40, colour: "#DB3B3B" },
  { key: "CRITICAL", rank: 50, colour: "#8E1B1B" },
];

const MESSAGES = [
  { level: "DEBUG", text: "row 41: raw value = ' 1,204 '" },
  { level: "INFO", text: "loaded 5,000 rows from sales.csv" },
  { level: "WARNING", text: "row 41 had a comma in a number, cleaned" },
  { level: "ERROR", text: "row 88 could not be parsed, skipped" },
  { level: "CRITICAL", text: "database unreachable, run abandoned" },
];

const rankOf = (key: string) => LEVELS.find((l) => l.key === key)!.rank;

export function LogLevels() {
  const [level, setLevel] = useState<Level>(LEVELS[1]);
  const shown = MESSAGES.filter((m) => rankOf(m.level) >= level.rank);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🪵 Log Levels</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        The same five lines of code, every time. Move the level and watch how much of it reaches you.
      </p>

      <div className="viz-controls">
        <div className="ss-stepper">
          <span className="ss-lbl">level</span>
          {LEVELS.map((l) => (
            <button
              key={l.key}
              className={`ss-step${level.key === l.key ? " on" : ""}`}
              onClick={() => setLevel(l)}
            >
              {l.key}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        {MESSAGES.map((m) => {
          const visible = rankOf(m.level) >= level.rank;
          const colour = LEVELS.find((l) => l.key === m.level)!.colour;
          return (
            <div
              key={m.level}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                opacity: visible ? 1 : 0.28,
                background: visible ? "var(--panel-2)" : "transparent",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  background: colour,
                  padding: "2px 8px",
                  borderRadius: 20,
                  minWidth: 68,
                  textAlign: "center",
                }}
              >
                {m.level}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{m.text}</span>
            </div>
          );
        })}
      </div>

      <div className="viz-code">
        <div>
          <span className="c-kw">logging</span>.basicConfig(level=logging.
          <span className="c-str">{level.key}</span>)
        </div>
        <div style={{ marginTop: 4, color: "var(--ink-soft)" }}>
          # {shown.length} of {MESSAGES.length} messages get through
        </div>
      </div>
    </div>
  );
}
