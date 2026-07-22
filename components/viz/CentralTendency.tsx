"use client";

import { useState } from "react";

const DOMAIN = 24;

function median(arr: number[]) {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function CentralTendency() {
  const [data, setData] = useState<number[]>([4, 5, 6, 7, 8]);
  const [val, setVal] = useState("");

  const mean = data.reduce((s, x) => s + x, 0) / data.length;
  const med = median(data);
  const pos = (v: number) => `${Math.min(100, Math.max(0, (v / DOMAIN) * 100))}%`;

  const add = () => {
    const n = Number(val);
    if (!Number.isNaN(n) && val.trim() !== "") { setData((d) => [...d, n]); setVal(""); }
  };

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">📍 Central Tendency — mean vs median</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 16px" }}>
        The data points are the dots below. Add a <b>large number (say 22)</b> and watch — the <b>mean</b> slides towards it while the <b>median</b> holds its ground. That is why the median is the safer choice when there are outliers.
      </p>

      <div className="ct-track">
        {data.map((v, i) => <span key={i} className="ct-dot" style={{ left: pos(v) }} title={String(v)} />)}
        <span className="ct-marker mean" style={{ left: pos(mean) }}><span>mean {mean.toFixed(1)}</span></span>
        <span className="ct-marker med" style={{ left: pos(med) }}><span>median {med}</span></span>
      </div>

      <div className="viz-controls" style={{ marginTop: 26 }}>
        <input className="viz-input" style={{ width: 120 }} placeholder="number (0-24)" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} onClick={add}>Add point</button>
        <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => setData([4, 5, 6, 7, 8])}>Reset</button>
      </div>
    </div>
  );
}
