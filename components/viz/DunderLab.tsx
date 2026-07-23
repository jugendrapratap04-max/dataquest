"use client";

import { useState } from "react";

/* Results verified in real Python 3.12. The one idea to land: the everyday
 * syntax you already use — len(x), x[0], a + b, a == b, print(x) — is not
 * special. Each is Python quietly calling a double-underscore method on the
 * object. Define that method on your own class and your object plugs straight
 * into the built-in syntax. So this shows the visible syntax, the hidden dunder
 * call it triggers, and the result. */

type Row = { syntax: string; dunder: string; result: string; note: string };

const ROWS: Row[] = [
  {
    syntax: "len(p)",
    dunder: "p.__len__()",
    result: "3",
    note: "len() is not built into your object — it calls __len__. Define it and len(p) just works.",
  },
  {
    syntax: "p[0]",
    dunder: "p.__getitem__(0)",
    result: '"A"',
    note: "Square-bracket indexing is __getitem__. With it, your object is subscriptable like a list.",
  },
  {
    syntax: '"B" in p',
    dunder: "p.__contains__(\"B\")",
    result: "True",
    note: "The in operator calls __contains__ — membership tests on your own type.",
  },
  {
    syntax: "p + q",
    dunder: "p.__add__(q)",
    result: "Playlist of 6 songs",
    note: "The + operator is __add__. This is operator overloading — you decide what 'adding' two Playlists means.",
  },
  {
    syntax: "p == q",
    dunder: "p.__eq__(q)",
    result: "True",
    note: "== calls __eq__ for value equality. WITHOUT it, == falls back to identity and two equal playlists compare as not-equal.",
  },
  {
    syntax: "print(p)",
    dunder: "p.__str__()",
    result: "Playlist of 3 songs",
    note: "print uses __str__ for a friendly form. In a list, Python uses __repr__ instead — [p] shows Playlist(['A','B','C']).",
  },
];

export function DunderLab() {
  const [pick, setPick] = useState(0);
  const r = ROWS[pick];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">✨ Dunder Lab — the method behind the syntax</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 10px" }}>
        <code>p = Playlist([&quot;A&quot;, &quot;B&quot;, &quot;C&quot;])</code>. Everyday syntax is secretly a call to a
        double-underscore method — pick one and see the hidden call Python makes.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {ROWS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x.syntax}</button>
        ))}
      </div>

      <div className="du-flow">
        <div className="du-cell syntax">
          <div className="du-cap">you write</div>
          <code className="du-code" key={`s${pick}`}>{r.syntax}</code>
        </div>
        <div className="du-eq">Python calls</div>
        <div className="du-cell dunder">
          <div className="du-cap">the dunder</div>
          <code className="du-code" key={`d${pick}`}>{r.dunder}</code>
        </div>
        <div className="du-eq">→</div>
        <div className="du-cell result">
          <div className="du-cap">result</div>
          <code className="du-code val" key={`r${pick}`}>{r.result}</code>
        </div>
      </div>

      <div className="imp-note" style={{ marginTop: 12 }}>{r.note}</div>
    </div>
  );
}
