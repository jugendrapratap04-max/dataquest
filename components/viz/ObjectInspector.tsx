"use client";

import { useState } from "react";

type Dog = { name: string; breed: string; age: number };
const POOL: Dog[] = [
  { name: "Bruno", breed: "Labrador", age: 3 },
  { name: "Rex", breed: "Pug", age: 5 },
  { name: "Milo", breed: "Beagle", age: 2 },
];

export function ObjectInspector() {
  const [dogs, setDogs] = useState<Dog[]>([POOL[0]]);
  const [barkIdx, setBarkIdx] = useState<number | null>(null);

  const add = () => {
    if (dogs.length < POOL.length) setDogs(POOL.slice(0, dogs.length + 1));
  };
  const reset = () => { setDogs([POOL[0]]); setBarkIdx(null); };

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🔎 Object Inspector</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Ek <b>class</b> = blueprint. Usse jitne chaaho <b>objects</b> (instances) banao — har ek ka apna <b>data</b>, par methods <b>shared</b>. Naya dog banao aur <code>bark()</code> dabao.
      </p>

      <div className="oi-wrap">
        <div className="oi-class">
          <div className="oi-tag">class · blueprint</div>
          <div className="oi-cname">Dog</div>
          <div className="oi-line"><span className="c-com"># har object me hoga:</span></div>
          <div className="oi-line c-kw">name, breed, age</div>
          <div className="oi-line"><span className="c-com"># sab share karte hain:</span></div>
          <div className="oi-line c-fn">bark()</div>
        </div>

        <div className="oi-arrow">banata hai →</div>

        <div className="oi-objs">
          {dogs.map((d, i) => (
            <div key={i} className={`oi-obj${barkIdx === i ? " active" : ""}`}>
              <div className="oi-tag">object #{i + 1}</div>
              <div className="oi-attrs">
                <div><span className="oi-k">name</span><span className="oi-v">&quot;{d.name}&quot;</span></div>
                <div><span className="oi-k">breed</span><span className="oi-v">&quot;{d.breed}&quot;</span></div>
                <div><span className="oi-k">age</span><span className="oi-v">{d.age}</span></div>
              </div>
              <button className="oi-bark" onClick={() => setBarkIdx(i)}>.bark()</button>
            </div>
          ))}
        </div>
      </div>

      <div className="viz-controls" style={{ marginTop: 14, marginBottom: 0 }}>
        <button className="ss-preset" onClick={add} disabled={dogs.length >= POOL.length}>+ naya Dog banao</button>
        <button className="ss-preset" onClick={reset}>reset</button>
      </div>

      {barkIdx !== null && dogs[barkIdx] && (
        <div className="viz-code" style={{ marginTop: 14 }}>
          <div><span className="c-com"># self = jis object pe call hua, uska data</span></div>
          <div>{dogs[barkIdx].name.toLowerCase()}.bark() <span className="c-kw">→</span> <span className="c-str">&quot;{dogs[barkIdx].name} says woof!&quot;</span></div>
        </div>
      )}
    </div>
  );
}
