"use client";

import { useState } from "react";

// Clean code is hard to teach as a list of rules, because every rule sounds
// obvious in isolation. Shown as before-and-after on the same function, with
// the reason attached, it lands: each tab is one rule and one visible change.

type Rule = { key: string; label: string; before: string; after: string; why: string };

const RULES: Rule[] = [
  {
    key: "names",
    label: "naming",
    before: "def calc(x, y):\n    z = x * y\n    return z",
    after: "def area(width, height):\n    return width * height",
    why: "Names are the cheapest documentation there is. calc/x/y/z force the reader to work out what the function is for; area/width/height simply say it. PEP 8 asks for lower_case_with_underscores.",
  },
  {
    key: "spacing",
    label: "spacing",
    before: "total=price*qty\nif total>1000 :\n    discount=total*0.1",
    after: "total = price * qty\nif total > 1000:\n    discount = total * 0.1",
    why: "One space around operators and after commas, none before a colon. It changes nothing about how the code runs and a great deal about how fast it can be read.",
  },
  {
    key: "docstring",
    label: "docstring",
    before: "def area(width, height):\n    return width * height",
    after: "def area(width, height):\n    \"\"\"Return the area of a rectangle.\"\"\"\n    return width * height",
    why: "A one-line docstring says what the function returns, in the place help() and every editor will look for it. A comment above the def does not reach either of them.",
  },
  {
    key: "hints",
    label: "type hints",
    before: "def area(width, height):\n    return width * height",
    after: "def area(width: float, height: float) -> float:\n    return width * height",
    why: "Hints do not change how Python runs; they tell the reader and the editor what was meant. The payoff is autocomplete that works and a type checker that catches a string being passed where a number belongs.",
  },
];

export function StyleLab() {
  const [rule, setRule] = useState<Rule>(RULES[0]);

  const pane = (title: string, code: string, ok: boolean) => (
    <div style={{ flex: "1 1 220px", minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".04em",
          textTransform: "uppercase",
          color: ok ? "var(--good, #1FA85A)" : "var(--bad, #DB3B3B)",
          marginBottom: 6,
        }}
      >
        {ok ? "✓ " : "✗ "}
        {title}
      </div>
      <div className="viz-code" style={{ whiteSpace: "pre", overflowX: "auto" }}>
        {code}
      </div>
    </div>
  );

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧹 Style Lab</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        One rule at a time, on the same small function. Nothing here changes what the code does.
      </p>

      <div className="viz-controls">
        <div className="ss-stepper">
          <span className="ss-lbl">rule</span>
          {RULES.map((r) => (
            <button
              key={r.key}
              className={`ss-step${rule.key === r.key ? " on" : ""}`}
              onClick={() => setRule(r)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        {pane("harder to read", rule.before, false)}
        {pane("clearer", rule.after, true)}
      </div>

      <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{rule.why}</div>
    </div>
  );
}
