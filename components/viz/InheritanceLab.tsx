"use client";

import { useState } from "react";

/* Results verified in real Python 3.12. Inheritance confuses beginners because
 * the code that runs is not always in the class you called it on — Python looks
 * in the child first, then walks UP to the parent. So this shows the lookup: you
 * call something on a Dog, and the viz lights up whether it was found on Dog
 * (its own / an override) or inherited from Animal, and what it returns. */

type Member = {
  call: string;
  foundIn: "Dog" | "Animal";
  kind: string;
  result: string;
  note: string;
};

const MEMBERS: Member[] = [
  {
    call: "d.speak()",
    foundIn: "Dog",
    kind: "overridden",
    result: '"Bruno says woof"',
    note: "Dog defines its own speak(), so Python finds it there first and never reaches Animal's. This is an override.",
  },
  {
    call: "d.describe()",
    foundIn: "Animal",
    kind: "inherited",
    result: '"Bruno is an animal"',
    note: "Dog has no describe(), so the lookup falls through to Animal and runs the inherited one — no code rewritten.",
  },
  {
    call: "d.breed",
    foundIn: "Dog",
    kind: "own attribute",
    result: '"Lab"',
    note: "breed was set in Dog.__init__, so it lives on the Dog instance directly.",
  },
  {
    call: "d.name",
    foundIn: "Animal",
    kind: "set via super()",
    result: '"Bruno"',
    note: "Dog.__init__ called super().__init__(name), which ran Animal's __init__ and set self.name. Skip that super() call and this attribute would not exist.",
  },
];

export function InheritanceLab() {
  const [pick, setPick] = useState(0);
  const m = MEMBERS[pick];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧬 Inheritance Lab — where Python finds what you called</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        <code>d = Dog(&quot;Bruno&quot;, &quot;Lab&quot;)</code>. Call something on it — Python looks on <b>Dog</b> first,
        then walks up to <b>Animal</b>, and stops at the first place it exists.
      </p>

      <div className="viz-controls" style={{ marginBottom: 14 }}>
        {MEMBERS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x.call}</button>
        ))}
      </div>

      <div className="ih-chain">
        <div className={`ih-cls ${m.foundIn === "Dog" ? "found" : "passed"}`}>
          <div className="ih-cls-head">
            <span className="ih-cls-name">class Dog(Animal)</span>
            <span className="ih-cls-tag">
              {m.foundIn === "Dog" ? "✓ found here" : "not here — look up ↓"}
            </span>
          </div>
          <div className="ih-members">
            <code>__init__(name, breed)</code><code>speak()</code><code>breed</code>
          </div>
        </div>

        <div className="ih-arrow">inherits ↓</div>

        <div className={`ih-cls ${m.foundIn === "Animal" ? "found" : "dim"}`}>
          <div className="ih-cls-head">
            <span className="ih-cls-name">class Animal</span>
            <span className="ih-cls-tag">{m.foundIn === "Animal" ? "✓ found here" : ""}</span>
          </div>
          <div className="ih-members">
            <code>__init__(name)</code><code>speak()</code><code>describe()</code><code>name</code>
          </div>
        </div>
      </div>

      <div className="ml-out" style={{ marginTop: 12 }}>
        <div className="ml-out-row">
          <span className="sf-rlabel">{m.kind}</span>
          <span className="sf-rval">{m.call} → {m.result}</span>
        </div>
        <div className="ml-binds">{m.note}</div>
      </div>
    </div>
  );
}
