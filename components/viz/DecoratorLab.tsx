"use client";

import { useState } from "react";

/* Outputs verified in real Python 3.12. A decorator is hard to picture because
 * the extra behaviour is not IN the function you called — it is in a wrapper
 * placed AROUND it. So this shows the value flowing through the layers: the
 * input reaches the original greet(), its result comes back out, and the
 * decorator's wrapper transforms that result on the way to you. "@shout" is
 * just sugar for greet = shout(greet). */

type Deco = {
  name: string;
  sugar: string;
  wrap: (inner: string) => string;
  desc: string;
};

const ORIGINAL = (name: string) => `hi ${name}`;
const INPUT = "freya";

const DECOS: Deco[] = [
  { name: "(no decorator)", sugar: "greet(\"freya\")", wrap: (s) => s, desc: "Just the original function — you get its result unchanged." },
  { name: "@shout", sugar: "greet = shout(greet)", wrap: (s) => s.toUpperCase(), desc: "The wrapper takes greet's result and upper-cases it before handing it back." },
  { name: "@exclaim", sugar: "greet = exclaim(greet)", wrap: (s) => s + "!", desc: "The wrapper appends a '!' to whatever greet returned." },
  { name: "@bracket", sugar: "greet = bracket(greet)", wrap: (s) => "[" + s + "]", desc: "The wrapper puts brackets around greet's result — same input, new packaging." },
];

export function DecoratorLab() {
  const [pick, setPick] = useState(1);
  const d = DECOS[pick];
  const inner = ORIGINAL(INPUT);
  const final = d.wrap(inner);
  const decorated = pick !== 0;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🎁 Decorator Lab — behaviour wrapped around a function</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 10px" }}>
        <code>greet(name)</code> returns <code>&quot;hi &quot; + name</code>. A decorator does not change greet — it
        <b> wraps</b> it, transforming the result on the way out. Pick one and follow the value.
      </p>

      <div className="dc-fn">
        {"def greet(name):"}<br />
        {"    return \"hi \" + name"}
      </div>

      <div className="viz-controls" style={{ margin: "12px 0" }}>
        {DECOS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x.name}</button>
        ))}
      </div>

      <div className="dc-sugar">
        <span className="dc-cap">@ is just sugar for</span>
        <code>{d.sugar}</code>
      </div>

      <div className="dc-flow" key={pick}>
        <div className="dc-stage in">
          <div className="dc-slabel">input</div>
          <code>&quot;{INPUT}&quot;</code>
        </div>
        <div className="dc-arrow">↓</div>
        <div className="dc-stage orig">
          <div className="dc-slabel">greet() runs</div>
          <code>&quot;{inner}&quot;</code>
        </div>
        {decorated && (
          <>
            <div className="dc-arrow">↓ wrapper</div>
            <div className="dc-stage wrap">
              <div className="dc-slabel">{d.name} transforms it</div>
              <code>&quot;{final}&quot;</code>
            </div>
          </>
        )}
        <div className="dc-arrow">↓</div>
        <div className="dc-stage out">
          <div className="dc-slabel">you get</div>
          <code className="dc-final">&quot;{final}&quot;</code>
        </div>
      </div>

      <div className="imp-note" style={{ marginTop: 12 }}>{d.desc}</div>
    </div>
  );
}
