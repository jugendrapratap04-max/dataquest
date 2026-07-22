"use client";

import { useState } from "react";

/* Every `out` below is what real Python 3.12 printed for that exact f-string —
 * spaces included, which is the whole point.
 *
 * Alignment and padding specs are unlearnable from prose: ">12" only means
 * something once you can SEE the twelve-character column and where the value
 * sits in it. So the output is drawn inside a ruled box with the padding
 * spaces rendered as visible dots. */

type Spec = { src: string; out: string; note: string };

const WIDTH = 12;

const SPECS: Spec[] = [
  { src: "f\"{price}\"",         out: "1234.5678",    note: "No spec at all — you get the raw value, every digit of it." },
  { src: "f\"{price:.2f}\"",     out: "1234.57",      note: "`.2f` = fixed-point, 2 decimals. It ROUNDS for display; the stored value is untouched." },
  { src: "f\"{price:,}\"",       out: "1,234.5678",   note: "`,` groups thousands. On its own it does not round." },
  { src: "f\"{price:,.2f}\"",    out: "1,234.57",     note: "Both together — this is the money format you will use most." },
  { src: "f\"{price:>12.2f}\"",  out: "     1234.57", note: "`>12` = pad to 12 characters, value pushed RIGHT. Numbers in a column line up this way." },
  { src: "f\"{price:<12.2f}\"",  out: "1234.57     ", note: "`<12` = pad to 12, value LEFT. This is the default for text." },
  { src: "f\"{price:^12.2f}\"",  out: "  1234.57   ", note: "`^12` = centred in 12. Odd leftovers go to the right." },
  { src: "f\"{price:012.2f}\"",  out: "000001234.57", note: "A leading 0 pads with zeros instead of spaces — invoice and ID numbers." },
  { src: "f\"{price:+.2f}\"",    out: "+1234.57",     note: "`+` always shows the sign, so positives and negatives align." },
  { src: "f\"{rate:.1%}\"",      out: "87.6%",        note: "`%` multiplies by 100 and appends the sign. rate is 0.8756, not 87.56." },
];

export function FormatLab() {
  const [pick, setPick] = useState(1);
  const s = SPECS[pick];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🎯 Format Lab — what the bit after the colon does</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        <code>price = 1234.5678</code> and <code>rate = 0.8756</code>. Pick a spec and watch the
        twelve-character column — padding spaces are drawn as <span className="fmt-dot">·</span> so you
        can actually see them.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {SPECS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>
            {x.src.replace(/^f"|"$/g, "")}
          </button>
        ))}
      </div>

      <div className="fmt-src">{s.src}</div>

      <div className="fmt-col">
        <div className="fmt-ruler">
          {Array.from({ length: WIDTH }, (_, i) => (
            <span key={i} className="fmt-tick">{(i + 1) % 5 === 0 ? (i + 1) : "·"}</span>
          ))}
        </div>
        <div className="fmt-cells" key={pick}>
          {Array.from({ length: Math.max(WIDTH, s.out.length) }, (_, i) => {
            const ch = s.out[i];
            if (ch === undefined) return <span key={i} className="fmt-cell empty" />;
            return (
              <span key={i} className={`fmt-cell ${ch === " " ? "pad" : "val"}`}>
                {ch === " " ? "·" : ch}
              </span>
            );
          })}
        </div>
        <div className="fmt-len">
          length {s.out.length}{s.out.length === WIDTH && " — exactly fills the column"}
        </div>
      </div>

      <div className="imp-note" style={{ marginTop: 12 }}>{s.note}</div>
    </div>
  );
}
