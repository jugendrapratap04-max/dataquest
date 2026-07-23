"use client";

import { useState } from "react";

/* The datetime is fixed at Thursday, 23 July 2026, 14:05:09, and every output
 * below was produced by datetime(2026,7,23,14,5,9).strftime(...) in real Python
 * 3.12. The lab uses a fixed time on purpose: datetime.now() would make the
 * output unverifiable and change every second.
 *
 * The idea to land: a format string is a sentence made of %-tokens, and the
 * codes are case-sensitive — %m is the month, %M is the minute. Swapping them
 * is the classic silent bug, so the trap preset renders 14:07 (July) where a
 * clock should read 14:05. */

const DT = "Thursday, 23 July 2026 — 14:05:09";

const TOKENS: Record<string, { out: string; desc: string }> = {
  "%Y": { out: "2026", desc: "year, 4-digit" },
  "%y": { out: "26", desc: "year, 2-digit" },
  "%m": { out: "07", desc: "month 01–12" },
  "%d": { out: "23", desc: "day 01–31" },
  "%B": { out: "July", desc: "month name" },
  "%b": { out: "Jul", desc: "month, short" },
  "%A": { out: "Thursday", desc: "weekday name" },
  "%a": { out: "Thu", desc: "weekday, short" },
  "%H": { out: "14", desc: "hour, 24-clock" },
  "%I": { out: "02", desc: "hour, 12-clock" },
  "%M": { out: "05", desc: "minute" },
  "%S": { out: "09", desc: "second" },
  "%p": { out: "PM", desc: "AM / PM" },
  "%j": { out: "204", desc: "day of year" },
};

type Preset = { fmt: string; trap?: boolean };

const PRESETS: Preset[] = [
  { fmt: "%d-%m-%Y" },
  { fmt: "%Y-%m-%d" },
  { fmt: "%d %B %Y" },
  { fmt: "%A, %d %b" },
  { fmt: "%I:%M %p" },
  { fmt: "%H:%M:%S" },
  { fmt: "%H:%m", trap: true },
];

// Split a format string into %X tokens and literal runs, in order.
function parse(fmt: string): { tok: boolean; text: string }[] {
  const parts: { tok: boolean; text: string }[] = [];
  let i = 0;
  while (i < fmt.length) {
    if (fmt[i] === "%" && i + 1 < fmt.length) {
      parts.push({ tok: true, text: fmt.slice(i, i + 2) });
      i += 2;
    } else {
      let j = i;
      while (j < fmt.length && fmt[j] !== "%") j++;
      parts.push({ tok: false, text: fmt.slice(i, j) });
      i = j;
    }
  }
  return parts;
}

function render(fmt: string): string {
  return parse(fmt).map((p) => (p.tok ? TOKENS[p.text]?.out ?? p.text : p.text)).join("");
}

export function StrftimeLab() {
  const [pick, setPick] = useState(0);
  const p = PRESETS[pick];
  const parts = parse(p.fmt);
  const output = render(p.fmt);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🕐 Strftime Lab — a format string is a sentence of %-codes</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 6px" }}>
        The moment is fixed at <b>{DT}</b>. Each preset formats that one instant a different way — watch
        which token controls which part.
      </p>

      <div className="viz-controls" style={{ margin: "12px 0" }}>
        {PRESETS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""} ${x.trap ? "trap" : ""}`} onClick={() => setPick(i)}>
            {x.fmt}{x.trap ? " ⚠️" : ""}
          </button>
        ))}
      </div>

      <div className="sf-tokens">
        {parts.map((part, i) =>
          part.tok ? (
            <span key={i} className={`sf-tok ${p.trap && part.text === "%m" ? "bad" : ""}`}>
              <span className="sf-code">{part.text}</span>
              <span className="sf-out">{TOKENS[part.text]?.out ?? "?"}</span>
              <span className="sf-desc">{TOKENS[part.text]?.desc ?? "unknown"}</span>
            </span>
          ) : (
            <span key={i} className="sf-lit">{part.text === " " ? "␣" : part.text}</span>
          )
        )}
      </div>

      <div className={`sf-result ${p.trap ? "bad" : ""}`}>
        <span className="sf-rlabel">strftime gives</span>
        <span className="sf-rval">{output}</span>
      </div>

      {p.trap ? (
        <div className="note warn" style={{ marginTop: 12 }}>
          <span className="i">⚠️</span>
          <div>
            This reads <code>14:07</code> — but the time is <code>14:05</code>. <code>%m</code> is the
            <b> month</b> (July = 07), not the minute. The minute is capital <code>%M</code>. The codes
            are case-sensitive, nothing errors, and you ship a clock that is silently wrong.
          </div>
        </div>
      ) : (
        <div className="imp-note" style={{ marginTop: 12 }}>
          Every <code>%</code>-code is replaced by a piece of the date; anything else — dashes, spaces,
          colons — is printed as-is. That is the whole grammar.
        </div>
      )}
    </div>
  );
}
