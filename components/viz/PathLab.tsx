"use client";

import { useState } from "react";

/* Every property was verified against Python 3.12's pathlib.PurePosixPath on
 * each path. pathlib is worth a viz because a path string hides structure:
 * the same text is a name, a stem, a suffix, a parent and a tuple of parts all
 * at once, and beginners reach for fragile string.split(".") instead. This
 * dissects a path into exactly what pathlib sees. PurePosixPath is used so the
 * output is the same on every OS (forward slashes) — the whole point of pathlib.*/

type Props = { name: string; stem: string; suffix: string; parent: string; parts: string[] };

// Mirror pathlib.PurePosixPath for a forward-slash path.
function dissect(path: string): Props {
  const parts = path.split("/").filter(Boolean);
  const name = parts[parts.length - 1] ?? "";
  const dot = name.lastIndexOf(".");
  const suffix = dot > 0 ? name.slice(dot) : "";
  const stem = suffix ? name.slice(0, -suffix.length) : name;
  const parentParts = parts.slice(0, -1);
  const parent = parentParts.length ? parentParts.join("/") : ".";
  return { name, stem, suffix, parent, parts };
}

const PRESETS = ["reports/2024/sales.csv", "archive.tar.gz", "data/README"];

const ROWS: { key: keyof Props | "parts"; code: string; note: string }[] = [
  { key: "name", code: ".name", note: "the final component — file plus extension" },
  { key: "stem", code: ".stem", note: "the name without its final suffix" },
  { key: "suffix", code: ".suffix", note: "the extension, WITH the dot (empty if none)" },
  { key: "parent", code: ".parent", note: "everything above the name" },
  { key: "parts", code: ".parts", note: "the whole path as a tuple of pieces" },
];

export function PathLab() {
  const [pick, setPick] = useState(0);
  const path = PRESETS[pick];
  const p = dissect(path);

  const value = (key: keyof Props | "parts") => {
    if (key === "parts") return "(" + p.parts.map((x) => `"${x}"`).join(", ") + (p.parts.length === 1 ? "," : "") + ")";
    const v = p[key];
    return `"${v}"`;
  };

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🗂️ Path Lab — one path, five views</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        <code>pathlib.Path</code> reads structure out of a path string so you never split on
        <code> &quot;.&quot;</code> or <code>&quot;/&quot;</code> by hand. Pick a path and see what it sees.
      </p>

      <div className="viz-controls" style={{ marginBottom: 12 }}>
        {PRESETS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x}</button>
        ))}
      </div>

      <div className="pl-path">Path(&quot;{path}&quot;)</div>

      <div className="pl-rows" key={pick}>
        {ROWS.map((r) => (
          <div key={r.code} className="pl-row">
            <code className="pl-attr">{r.code}</code>
            <code className="pl-val">{value(r.key)}</code>
            <span className="pl-note">{r.note}</span>
          </div>
        ))}
      </div>

      <div className="note tip" style={{ marginTop: 12 }}>
        <span className="i">💡</span>
        <div>
          Same result on Windows, Mac and Linux. Only <b>displaying</b> a joined path differs —
          <code> str(Path(&quot;a&quot;) / &quot;b&quot;)</code> is <code>a\b</code> on Windows and <code>a/b</code>{" "}
          elsewhere — so use <code>.as_posix()</code> when you need forward slashes.
        </div>
      </div>
    </div>
  );
}
