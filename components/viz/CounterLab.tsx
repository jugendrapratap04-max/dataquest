"use client";

import { useState } from "react";

/* Tallies verified against real Python 3.12's collections.Counter.most_common
 * on each list. Counter is the star of this module — one call turns a list into
 * a frequency table, sorted, with the most common on top. Beginners otherwise
 * write a manual loop that KeyErrors on the first item, so seeing the tally
 * appear as sorted bars is the fastest way to grasp what Counter buys you. */

type Preset = { label: string; call: string; items: (string | number)[]; numeric?: boolean };

const PRESETS: Preset[] = [
  { label: "votes", call: 'Counter(["a","b","a","c","a","b"])', items: ["a", "b", "a", "c", "a", "b"] },
  { label: "dice", call: "Counter([3,1,3,6,3,1,4])", items: [3, 1, 3, 6, 3, 1, 4], numeric: true },
  { label: '"banana"', call: 'Counter("banana")', items: ["b", "a", "n", "a", "n", "a"] },
];

// most_common: sort by count desc, ties keep first-seen order — exactly Python's.
function tally(items: (string | number)[]): { key: string; count: number }[] {
  const order: string[] = [];
  const counts = new Map<string, number>();
  for (const it of items) {
    const k = String(it);
    if (!counts.has(k)) order.push(k);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return order
    .map((k) => ({ key: k, count: counts.get(k)! }))
    .sort((a, b) => b.count - a.count || order.indexOf(a.key) - order.indexOf(b.key));
}

export function CounterLab() {
  const [pick, setPick] = useState(0);
  const p = PRESETS[pick];
  const rows = tally(p.items);
  const max = rows[0]?.count ?? 1;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📊 Counter Lab — a list becomes a frequency table</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>
        <code>Counter</code> tallies how often each item appears and sorts them for you. Pick an input
        and watch the counts — the <b>most common</b> lands on top.
      </p>

      <div className="viz-controls" style={{ marginBottom: 12 }}>
        {PRESETS.map((x, i) => (
          <button key={i} className={`ss-preset ${pick === i ? "on" : ""}`} onClick={() => setPick(i)}>{x.label}</button>
        ))}
      </div>

      <div className="ct-call">{p.call}</div>
      <div className="ct-input">
        input:&nbsp;
        {p.items.map((it, i) => <span key={i} className="ct-item">{String(it)}</span>)}
      </div>

      <div className="ct-bars" key={pick}>
        {rows.map((r, i) => (
          <div key={r.key} className={`ct-row ${i === 0 ? "top" : ""}`}>
            <span className="ct-key">{r.key}</span>
            <div className="ct-track">
              <div className="ct-bar" style={{ width: `${(r.count / max) * 100}%` }}>{r.count}</div>
            </div>
            {i === 0 && <span className="ct-most">most_common</span>}
          </div>
        ))}
      </div>

      <div className="ml-out" style={{ marginTop: 12 }}>
        <div className="ml-out-row">
          <span className="sf-rlabel">.most_common(1)</span>
          <span className="sf-rval">[({p.numeric ? rows[0]?.key : `"${rows[0]?.key}"`}, {rows[0]?.count})]</span>
        </div>
        <div className="ml-binds">One call replaces a whole counting loop — and a missing key returns 0, never a KeyError.</div>
      </div>
    </div>
  );
}
