"use client";

import { useState } from "react";

/* Three containers, one input, side by side.
 *
 * Students learn list, set and dict as three separate topics and then cannot
 * say which to reach for. Feeding the same items to all three answers it in one
 * move: the list keeps everything in order, the set silently drops the repeat,
 * the dict keeps one entry per key and the last value wins.
 *
 * The word that matters is "silently" — nothing errors, the data just quietly
 * changes shape, which is exactly how this bites people on real data. */

type Entry = { key: string; value: string };

const START: Entry[] = [
  { key: "mumbai", value: "120" },
  { key: "delhi", value: "95" },
];

const SUGGEST: Entry[] = [
  { key: "mumbai", value: "150" },
  { key: "pune", value: "60" },
  { key: "delhi", value: "95" },
];

export function CollectionBench() {
  const [items, setItems] = useState<Entry[]>(START);
  const [k, setK] = useState("");
  const [v, setV] = useState("");
  const [lastKey, setLastKey] = useState<string | null>(null);

  const add = (entry: Entry) => {
    if (!entry.key.trim()) return;
    setItems((p) => [...p, { key: entry.key.trim(), value: entry.value.trim() || "0" }]);
    setLastKey(entry.key.trim());
    setK(""); setV("");
  };

  // What each container actually holds after the same sequence of adds.
  const asList = items;
  const asSet: string[] = [];
  for (const it of items) if (!asSet.includes(it.key)) asSet.push(it.key);
  const asDict: Entry[] = [];
  for (const it of items) {
    const at = asDict.findIndex((d) => d.key === it.key);
    if (at >= 0) asDict[at] = it; else asDict.push(it);
  }

  const dropped = asList.length - asSet.length;

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🧺 Collection Bench — same data, three containers</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Add city sales below and watch all three react at once. Add a city that is
        <b> already there</b> — that is where they stop agreeing.
      </p>

      <div className="viz-controls" style={{ marginBottom: 12 }}>
        <input className="viz-input" style={{ width: 110 }} placeholder="city" value={k}
          onChange={(e) => setK(e.target.value)} aria-label="key" />
        <input className="viz-input" style={{ width: 80 }} placeholder="sales" value={v}
          onChange={(e) => setV(e.target.value)} aria-label="value"
          onKeyDown={(e) => { if (e.key === "Enter") add({ key: k, value: v }); }} />
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} onClick={() => add({ key: k, value: v })}>Add</button>
        {SUGGEST.map((s) => (
          <button key={s.key + s.value} className="ss-preset" onClick={() => add(s)}>
            {s.key} {s.value}
          </button>
        ))}
        <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => { setItems(START); setLastKey(null); }}>Reset</button>
      </div>

      <div className="cb3">
        <div className="cb3-col">
          <div className="cb3-cap">list <span>keeps everything, in order</span></div>
          <div className="cb3-box">
            {asList.map((it, i) => (
              <div className={`cb3-row ${it.key === lastKey && i === asList.length - 1 ? "just" : ""}`} key={i}>
                <span className="cb3-k">(&quot;{it.key}&quot;, {it.value})</span>
              </div>
            ))}
          </div>
          <div className="cb3-n">{asList.length} items</div>
        </div>

        <div className="cb3-col">
          <div className="cb3-cap">set <span>unique only, no values</span></div>
          <div className="cb3-box">
            {asSet.map((key) => (
              <div className={`cb3-row ${key === lastKey ? "just" : ""}`} key={key}>
                <span className="cb3-k">&quot;{key}&quot;</span>
              </div>
            ))}
          </div>
          <div className="cb3-n">{asSet.length} items{dropped > 0 && <b> · {dropped} dropped</b>}</div>
        </div>

        <div className="cb3-col">
          <div className="cb3-cap">dict <span>one entry per key</span></div>
          <div className="cb3-box">
            {asDict.map((it) => (
              <div className={`cb3-row ${it.key === lastKey ? "just" : ""}`} key={it.key}>
                <span className="cb3-k">&quot;{it.key}&quot;</span>
                <span className="cb3-arrow">:</span>
                <span className="cb3-v">{it.value}</span>
              </div>
            ))}
          </div>
          <div className="cb3-n">{asDict.length} keys</div>
        </div>
      </div>

      {dropped > 0 && (
        <div className="note warn" style={{ marginTop: 12 }}>
          <span className="i">⚠️</span>
          <div>
            You added <b>{asList.length}</b> rows and the set kept <b>{asSet.length}</b>. Nothing errored —
            {" "}{dropped} {dropped === 1 ? "row" : "rows"} simply vanished. On a real dataset that is how a
            total quietly comes out wrong.
          </div>
        </div>
      )}
    </div>
  );
}
