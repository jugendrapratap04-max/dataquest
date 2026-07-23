"use client";

import { useState } from "react";

/* The patterns and their matches were verified against real Python 3.12's
 * re.findall on this exact string. Regex is the one topic where you cannot
 * reason about a pattern from its symbols alone — you have to SEE what it
 * catches. So this highlights the matches inside the text and lists them, the
 * way a regex tester does, for a handful of the most common patterns. */

const TEXT = "Call 98765 or 43210, code A7";

type Pat = { re: string; note: string };

const PATS: Pat[] = [
  { re: "\\d+", note: "\\d is a digit, + means one or more — so it grabs each whole run of digits." },
  { re: "\\d{5}", note: "{5} means exactly five, so it matches the 5-digit phone numbers but not the lone 7." },
  { re: "[A-Z]\\d", note: "A character class [A-Z] (any capital) followed by one digit — matches the code A7." },
  { re: "\\w+", note: "\\w is a letter, digit or underscore; + makes it whole words. Note it splits on spaces and punctuation." },
  { re: "[aeiou]", note: "A character class matches any ONE of the listed characters — here, each vowel." },
];

// Build the highlighted pieces by running the pattern globally over the text.
function segments(reStr: string): { text: string; hit: boolean }[] {
  const out: { text: string; hit: boolean }[] = [];
  let re: RegExp;
  try { re = new RegExp(reStr, "g"); } catch { return [{ text: TEXT, hit: false }]; }
  let last = 0;
  for (const m of TEXT.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: TEXT.slice(last, i), hit: false });
    out.push({ text: m[0], hit: true });
    last = i + m[0].length;
    if (m[0].length === 0) last++; // guard against zero-width loops
  }
  if (last < TEXT.length) out.push({ text: TEXT.slice(last), hit: false });
  return out;
}

function matches(reStr: string): string[] {
  try { return [...TEXT.matchAll(new RegExp(reStr, "g"))].map((m) => m[0]); } catch { return []; }
}

export function RegexLab() {
  const [pick, setPick] = useState(0);
  const p = PATS[pick];
  const segs = segments(p.re);
  const hits = matches(p.re);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🔎 Regex Lab — see what a pattern catches</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        <code>re.findall(pattern, text)</code> on a fixed line. Pick a pattern and watch which parts of
        the text it matches — the symbols make sense once you can see them land.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {PATS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>
            r&quot;{x.re}&quot;
          </button>
        ))}
      </div>

      <div className="rx-text" key={pick}>
        {segs.map((s, i) => (
          <span key={i} className={s.hit ? "rx-hit" : "rx-plain"}>{s.text}</span>
        ))}
      </div>

      <div className="rx-result">
        <span className="sf-rlabel">findall →</span>
        <span className="rx-list">
          [{hits.map((h, i) => <span key={i}><span className="rx-tok">&quot;{h}&quot;</span>{i < hits.length - 1 ? ", " : ""}</span>)}]
          <span className="rx-count">{hits.length} match{hits.length === 1 ? "" : "es"}</span>
        </span>
      </div>

      <div className="imp-note" style={{ marginTop: 12 }}>{p.note}</div>
    </div>
  );
}
