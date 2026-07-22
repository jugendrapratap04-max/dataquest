"use client";

import { useState } from "react";

type Var = { id: number; name: string; raw: string; py: string; type: "int" | "float" | "str" | "bool" };

function detect(raw: string): { type: Var["type"]; py: string } {
  const v = raw.trim();
  if (v === "True" || v === "False") return { type: "bool", py: v };
  if (/^-?\d+$/.test(v)) return { type: "int", py: v };
  if (/^-?\d*\.\d+$/.test(v)) return { type: "float", py: v };
  // strip surrounding quotes if user added them, then re-quote for display
  const inner = v.replace(/^["']|["']$/g, "");
  return { type: "str", py: `"${inner}"` };
}

const typeName = { int: "int", float: "float", str: "str", bool: "bool" };

export function VariablesPlayground() {
  const [vars, setVars] = useState<Var[]>([
    { id: 1, name: "age", raw: "21", py: "21", type: "int" },
    { id: 2, name: "name", raw: "Priya", py: '"Priya"', type: "str" },
  ]);
  const [nm, setNm] = useState("");
  const [val, setVal] = useState("");
  const [reveal, setReveal] = useState<number | null>(null);
  const [nextId, setNextId] = useState(3);

  const add = () => {
    const name = (nm.trim() || "x").replace(/\s+/g, "_");
    const raw = val.trim() || "0";
    const { type, py } = detect(raw);
    setVars((p) => [...p, { id: nextId, name, raw, py, type }]);
    setNextId((n) => n + 1);
    setNm(""); setVal("");
  };

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧠 Memory Playground — see your variables</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Every variable is a <b>labelled box</b>. Give it a name and a value, and watch which <b>type</b> Python picks. Click a box to see what <span className="kbd">type()</span> would answer.
      </p>

      <div className="viz-controls">
        <input className="viz-input" style={{ width: 110 }} placeholder="name (age)" value={nm} onChange={(e) => setNm(e.target.value)} />
        <span className="mono" style={{ color: "var(--accent-2)", fontWeight: 700 }}>=</span>
        <input className="viz-input" style={{ width: 130 }} placeholder="value (21)" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} onClick={add}>Assign →</button>
        {vars.length > 0 && <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => setVars([])}>Clear</button>}
      </div>

      <div className="mem-grid">
        {vars.length === 0 && <div style={{ color: "var(--ink-faint)", fontSize: 13, fontFamily: "var(--mono)" }}>// no variables yet — create one above</div>}
        {vars.map((v) => (
          <button key={v.id} className="mem-box" onClick={() => setReveal(reveal === v.id ? null : v.id)}>
            <div className="lbl">{v.name}</div>
            <div className="val">{v.py}</div>
            <div className="typ"><span className={`type-chip t-${v.type}`}>{typeName[v.type]}</span></div>
            {reveal === v.id && <div className="type-reveal">type({v.name}) → &lt;class &apos;{v.type}&apos;&gt;</div>}
          </button>
        ))}
      </div>

      {vars.length > 0 && (
        <div className="viz-code">
          {vars.map((v) => (
            <div key={v.id}><span className="c-str" style={{ color: "var(--ink)" }}>{v.name}</span> <span className="c-kw">=</span> <span className={v.type === "str" ? "c-str" : v.type === "bool" ? "c-kw" : "c-num"}>{v.py}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}
