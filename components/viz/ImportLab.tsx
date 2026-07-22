"use client";

import { useState } from "react";

/* Every result below came from running the statement in real Python 3.12 and
 * pasting the output in — including the exact NameError messages.
 *
 * The thing this has to land: `import X` and `from X import y` do NOT do the
 * same job with different spelling. They bind DIFFERENT names, so half the
 * "why doesn't math.sqrt work?" confusion is just not knowing what is in scope.
 * The `import *` row exists to show the cost: 61 names at once, one of which
 * quietly replaces a builtin. */

type Form = {
  stmt: string;
  binds: string[];
  extra?: string;
  results: Record<string, string | null>;   // null = works, string = the error
  note: string;
};

const TESTS = ["math.sqrt(16)", "sqrt(16)", "m.sqrt(16)", "pi"];

const OK: Record<string, string> = {
  "math.sqrt(16)": "4.0",
  "sqrt(16)": "4.0",
  "m.sqrt(16)": "4.0",
  "pi": "3.141592653589793",
};

const FORMS: Form[] = [
  {
    stmt: "import math",
    binds: ["math"],
    note: "One name: the module itself. Everything inside it needs the math. prefix.",
    results: {
      "math.sqrt(16)": null,
      "sqrt(16)": "NameError: name 'sqrt' is not defined",
      "m.sqrt(16)": "NameError: name 'm' is not defined",
      "pi": "NameError: name 'pi' is not defined",
    },
  },
  {
    stmt: "import math as m",
    binds: ["m"],
    note: "Only the nickname is bound. `math` itself is now NOT defined — this surprises people.",
    results: {
      "math.sqrt(16)": "NameError: name 'math' is not defined",
      "sqrt(16)": "NameError: name 'sqrt' is not defined",
      "m.sqrt(16)": null,
      "pi": "NameError: name 'pi' is not defined",
    },
  },
  {
    stmt: "from math import sqrt",
    binds: ["sqrt"],
    note: "You took one tool out of the box. The box was never put on your bench, so `math` does not exist.",
    results: {
      "math.sqrt(16)": "NameError: name 'math' is not defined",
      "sqrt(16)": null,
      "m.sqrt(16)": "NameError: name 'm' is not defined",
      "pi": "NameError: name 'pi' is not defined",
    },
  },
  {
    stmt: "from math import sqrt, pi",
    binds: ["sqrt", "pi"],
    note: "Two names, both usable bare. Still no `math`.",
    results: {
      "math.sqrt(16)": "NameError: name 'math' is not defined",
      "sqrt(16)": null,
      "m.sqrt(16)": "NameError: name 'm' is not defined",
      "pi": null,
    },
  },
  {
    stmt: "from math import *",
    binds: ["acos", "asin", "ceil", "cos", "floor", "pi", "pow", "sqrt", "tan"],
    extra: "…and 52 more",
    note: "61 names at once, and you cannot see which. One of them is pow — which REPLACES the builtin pow, so pow(2, 3) starts returning 8.0 instead of 8.",
    results: {
      "math.sqrt(16)": "NameError: name 'math' is not defined",
      "sqrt(16)": null,
      "m.sqrt(16)": "NameError: name 'm' is not defined",
      "pi": null,
    },
  },
];

export function ImportLab() {
  const [pick, setPick] = useState(0);
  const f = FORMS[pick];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📦 Import Lab — what each import actually puts in your file</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        These five lines all &quot;import math&quot;. They bind completely different names — which is why
        <code> math.sqrt</code> works in one and raises <code>NameError</code> in the next.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {FORMS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x.stmt}</button>
        ))}
      </div>

      <div className="imp-grid">
        <div>
          <div className="fl-cap">names now in your file</div>
          <div className="imp-names" key={`n${pick}`}>
            {f.binds.map((b) => <span key={b} className="imp-chip">{b}</span>)}
            {f.extra && <span className="imp-chip more">{f.extra}</span>}
          </div>
          <div className="imp-note">{f.note}</div>
        </div>

        <div>
          <div className="fl-cap">so these lines…</div>
          <div className="imp-tests">
            {TESTS.map((t) => {
              const err = f.results[t];
              return (
                <div key={t} className={`imp-row ${err ? "bad" : "ok"}`} >
                  <span className="imp-expr">{t}</span>
                  <span className="imp-arrow">→</span>
                  <span className="imp-out" key={`${pick}-${t}`}>{err ?? OK[t]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {pick === 4 && (
        <div className="note warn" style={{ marginTop: 12 }}>
          <span className="i">⚠️</span>
          <div>
            This is why <code>from x import *</code> is banned in real codebases. You cannot tell by
            reading the file where a name came from, and here it silently redefines the builtin{" "}
            <code>pow</code> — so a whole-number count quietly becomes a float.
          </div>
        </div>
      )}
    </div>
  );
}
