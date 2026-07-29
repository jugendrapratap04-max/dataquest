"use client";

import { useState } from "react";

type Op = "double" | "plus" | "square" | "mask";

const SRC = [3, 7, 2, 9, 5, 4];

const OPS: Record<Op, { label: string; code: string; apply: (n: number) => number | boolean }> = {
  double: { label: "× 2", code: "arr * 2", apply: (n) => n * 2 },
  plus:   { label: "+ 10", code: "arr + 10", apply: (n) => n + 10 },
  square: { label: "squared", code: "arr ** 2", apply: (n) => n * n },
  mask:   { label: "> 4", code: "arr > 4", apply: (n) => n > 4 },
};

export function VectorizeLab() {
  const [op, setOp] = useState<Op>("double");
  const spec = OPS[op];
  const out = SRC.map(spec.apply);

  const Cell = ({ v, dim }: { v: number | boolean; dim?: boolean }) => (
    <div style={{
      minWidth: 42, padding: "9px 6px", textAlign: "center", borderRadius: 8,
      fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600,
      border: `1.5px solid ${dim ? "var(--line)" : "color-mix(in srgb, var(--teal) 55%, transparent)"}`,
      background: dim ? "var(--panel)" : "color-mix(in srgb, var(--teal) 14%, transparent)",
      color: dim ? "var(--ink-faint)" : "var(--ink)",
    }}>{typeof v === "boolean" ? (v ? "True" : "False") : v}</div>
  );

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">⚡ Vectorization — one instruction, every element</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        A list needs a loop to change every value. An array does not. Pick an operation and watch it land on all six at once — the thing you write once, NumPy runs six times.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 4 }}>
        {SRC.map((n, i) => <Cell key={i} v={n} dim />)}
      </div>
      <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--teal)", margin: "8px 0" }}>
        ↓ &nbsp;{spec.code}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {out.map((n, i) => <Cell key={i} v={n} />)}
      </div>

      {op === "mask" && (
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 12.5, color: "var(--ink-soft)" }}>
          Feed that back in as <code className="kbd">arr[arr &gt; 4]</code> and you keep only where it said True:{" "}
          <b style={{ fontFamily: "var(--mono)" }}>[{SRC.filter((n) => n > 4).join(" ")}]</b>
        </div>
      )}

      <div className="cast-flow" style={{ justifyContent: "center", marginTop: 14 }}>
        <div className="cast-res ok" style={{ minWidth: 120 }}><div className="lbl">lines you wrote</div><div className="val">1</div></div>
        <div className="cast-res" style={{ minWidth: 120 }}><div className="lbl">elements changed</div><div className="val">{SRC.length}</div></div>
      </div>

      <div className="viz-controls" style={{ justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        {(Object.keys(OPS) as Op[]).map((k) => (
          <button key={k} className={`btn ${op === k ? "btn-primary" : "btn-ghost"}`} style={{ padding: "8px 14px" }}
                  onClick={() => setOp(k)}>{OPS[k].label}</button>
        ))}
      </div>

      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>
        The last one returns <b>True/False</b> rather than numbers, and that is the door into everything else. A boolean array can be used as an index — which is exactly how filtering a DataFrame works in the next lessons.
      </div></div>
    </div>
  );
}
