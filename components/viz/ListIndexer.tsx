"use client";

import { useState } from "react";

const ITEMS = ["apple", "mango", "kiwi", "guava"];

export function ListIndexer() {
  const [sel, setSel] = useState<number | null>(null);

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">📇 List Indexer — index samjho</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        List me har item ka ek <b>index</b> hota hai — aage se <span className="kbd">0, 1, 2…</span> aur peeche se <span className="kbd">-1, -2…</span>. Kisi item pe click karke dono index dekho.
      </p>

      <div className="mem-grid" style={{ marginBottom: 14 }}>
        {ITEMS.map((it, i) => {
          const neg = i - ITEMS.length;
          const active = sel === i;
          return (
            <button key={i} className="mem-box" style={{ minWidth: 84, borderColor: active ? "var(--accent)" : "var(--line)", boxShadow: active ? "0 0 0 3px color-mix(in srgb,var(--accent) 20%,transparent)" : "none" }} onClick={() => setSel(active ? null : i)}>
              <div className="lbl">{i}</div>
              <div className="val" style={{ fontSize: 14 }}>{it}</div>
              <div className="typ"><span className="type-chip t-int">{neg}</span></div>
            </button>
          );
        })}
      </div>

      {sel !== null ? (
        <div className="viz-code">
          <div>fruits[<span className="c-num">{sel}</span>]  <span className="c-kw">→</span>  <span className="c-str">&quot;{ITEMS[sel]}&quot;</span></div>
          <div>fruits[<span className="c-num">{sel - ITEMS.length}</span>] <span className="c-kw">→</span>  <span className="c-str">&quot;{ITEMS[sel]}&quot;</span>  <span className="c-com"># same item, peeche se</span></div>
        </div>
      ) : (
        <div className="viz-code"><span className="c-com"># kisi fruit pe click karo</span><br />fruits <span className="c-kw">=</span> [<span className="c-str">&quot;apple&quot;</span>, <span className="c-str">&quot;mango&quot;</span>, <span className="c-str">&quot;kiwi&quot;</span>, <span className="c-str">&quot;guava&quot;</span>]</div>
      )}
    </div>
  );
}
