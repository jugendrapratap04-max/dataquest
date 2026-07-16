"use client";

import { useState } from "react";

const COLS = ["city", "sales", "year"];
const ROWS: (string | number)[][] = [["Delhi", 100, 2023], ["Mumbai", 200, 2023], ["Delhi", 50, 2024]];
type Part = "columns" | "index" | "values";

const INFO: Record<Part, string> = {
  columns: "Column names — har column ka naam (city, sales, year). df.columns se milte hain.",
  index: "Index — har row ka label (0, 1, 2...). df.index se access hota hai.",
  values: "Values — asli data jo cells me hai. df.values ya df['col'] se.",
};

export function DataFrameAnatomy() {
  const [sel, setSel] = useState<Part>("columns");

  return (
    <div className="viz">
      <div className="viz-head"><span className="viz-title">🗂️ DataFrame Anatomy</span><span className="viz-badge">interactive</span></div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        DataFrame = rows + columns wala table (Excel jaisa). Neeche kisi hisse pe click karke uska matlab samjho.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table className="dfa">
          <thead>
            <tr>
              <th className={`dfa-corner`} onClick={() => setSel("index")}></th>
              {COLS.map((c) => (
                <th key={c} className={sel === "columns" ? "hl" : ""} onClick={() => setSel("columns")}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={i}>
                <td className={`dfa-idx ${sel === "index" ? "hl" : ""}`} onClick={() => setSel("index")}>{i}</td>
                {row.map((v, j) => (
                  <td key={j} className={sel === "values" ? "hl" : ""} onClick={() => setSel("values")}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="viz-controls" style={{ marginTop: 14 }}>
        {(["columns", "index", "values"] as Part[]).map((p) => (
          <button key={p} className={`btn ${sel === p ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px", textTransform: "capitalize" }} onClick={() => setSel(p)}>{p}</button>
        ))}
      </div>
      <div className="note tip" style={{ marginTop: 14 }}><span className="i">💡</span><div>{INFO[sel]}</div></div>
    </div>
  );
}
