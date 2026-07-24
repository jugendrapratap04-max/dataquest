"use client";

import { useState } from "react";

/* The CSV text and SQLite behaviour were verified against real Python 3.12; the
 * pickle bytes are a representative prefix (real pickle output is binary and
 * version-tagged). The point is the DECISION beginners get wrong: these three
 * are not interchangeable. CSV is readable text but loses types; pickle keeps
 * any Python object but is binary and Python-only (and unsafe to load from
 * strangers); SQLite is a real queryable database in one file. */

type Fmt = {
  name: string;
  render: React.ReactNode;
  readable: boolean;
  types: boolean;
  query: boolean;
  cross: boolean;
  best: string;
};

const FORMATS: Fmt[] = [
  {
    name: "CSV",
    render: (
      <pre className="st-code">{`name,age
Freya,21
Om,25`}</pre>
    ),
    readable: true,
    types: false,
    query: false,
    cross: true,
    best: "Sharing tabular data anyone can open — but every value comes back a string, so cast with int()/float().",
  },
  {
    name: "Pickle",
    render: (
      <pre className="st-code st-bin">{`b'\\x80\\x04\\x95\\x1a...'
# binary — not human-readable`}</pre>
    ),
    readable: false,
    types: true,
    query: false,
    cross: false,
    best: "Saving any Python object exactly as-is (nested dicts, custom classes) — but Python-only, and NEVER load a pickle from an untrusted source.",
  },
  {
    name: "SQLite",
    render: (
      <div className="st-table">
        <div className="st-tr st-head"><span>name</span><span>age</span></div>
        <div className="st-tr"><span>Freya</span><span>21</span></div>
        <div className="st-tr"><span>Om</span><span>25</span></div>
        <div className="st-q">SELECT name FROM users WHERE age &gt; 22  →  Om</div>
      </div>
    ),
    readable: false,
    types: true,
    query: true,
    cross: true,
    best: "Data you need to query, filter and update — a real SQL database in a single file, no server.",
  },
];

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`st-flag ${on ? "yes" : "no"}`}>
      {on ? "✓" : "✕"} {label}
    </span>
  );
}

export function StorageLab() {
  const [pick, setPick] = useState(0);
  const f = FORMATS[pick];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">💾 Storage Lab — the same data, three ways to save it</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        Two rows — <code>Freya, 21</code> and <code>Om, 25</code> — stored three ways. They are not
        interchangeable; each trades something. Pick one and see what you get and give up.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {FORMATS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x.name}</button>
        ))}
      </div>

      <div className="st-render" key={pick}>{f.render}</div>

      <div className="st-flags">
        <Flag on={f.readable} label="human-readable" />
        <Flag on={f.types} label="keeps types" />
        <Flag on={f.query} label="queryable" />
        <Flag on={f.cross} label="cross-language" />
      </div>

      <div className="imp-note" style={{ marginTop: 12 }}><b>Best for:</b> {f.best}</div>
    </div>
  );
}
