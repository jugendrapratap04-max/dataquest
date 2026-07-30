"use client";

import { useState, type ReactNode } from "react";

/* The shell behind every panel on this platform that runs real Python instead of
 * depicting it.
 *
 * Every other visualization here is hand-built React that shows what a library
 * would do. For a visualization subject that is not enough: the skill being
 * taught is "change the code, look at the picture, change it again", and a
 * depiction cannot close that loop. So this one executes — matplotlib and
 * seaborn are vendored in public/pyodide, the same builds verify:lesson checked
 * every snippet against, which is why what a student draws here matches what the
 * page above it claims.
 *
 * A preset may carry more than one VARIANT of the same chart. That is what makes
 * the seaborn lesson work: one button gives you the seaborn line, the other gives
 * the matplotlib it stands in for, and running both is the argument. */

export type Variant = { label: string; code: string };
/** `prelude` is setup the student does not edit — the DataFrame both variants of
 *  a seaborn comparison are drawn from. It is shown above the editor and prepended
 *  at run time. Keeping it out of the textarea is what makes the line counter
 *  honest: the claim is "one line of drawing instead of twelve", and counting eight
 *  lines of shared table construction into both sides would bury it. */
export type Preset = { key: string; label: string; prelude?: string; variants: Variant[] };

export function PyChartLab({
  title, badge, blurb, presets, footer,
}: {
  title: string;
  badge: string;
  blurb: ReactNode;
  presets: Preset[];
  footer: ReactNode;
}) {
  const [presetKey, setPresetKey] = useState(presets[0].key);
  const [variantIx, setVariantIx] = useState(0);
  const [code, setCode] = useState(presets[0].variants[0].code);
  const [busy, setBusy] = useState(false);
  const [figure, setFigure] = useState<string | null>(null);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [everRan, setEverRan] = useState(false);

  const preset = presets.find((p) => p.key === presetKey) ?? presets[0];
  const variant = preset.variants[variantIx] ?? preset.variants[0];

  const loadPreset = (p: Preset) => {
    setPresetKey(p.key);
    setVariantIx(0);
    setCode(p.variants[0].code);
  };

  const loadVariant = (i: number) => {
    setVariantIx(i);
    setCode(preset.variants[i].code);
  };

  const run = async () => {
    setBusy(true);
    setErr("");
    try {
      // Imported here rather than at the top of the file so the megabytes of
      // Python only leave the server for a student who pressed the button.
      const { runPythonWithFigure } = await import("@/lib/pyodide-runner");
      const r = await runPythonWithFigure((preset.prelude ?? "") + code);
      setOut(r.stdout.trimEnd());
      setErr(r.error ?? "");
      setFigure(r.figure ?? null);
      setEverRan(true);
    } catch (e) {
      setErr(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">{title}</span>
        <span className="viz-badge">{badge}</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>{blurb}</p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: preset.variants.length > 1 ? 8 : 12 }}>
        {presets.map((p) => (
          <button
            key={p.key}
            className={`btn ${presetKey === p.key ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 12px", fontFamily: "var(--mono)", fontSize: 12 }}
            onClick={() => loadPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset.variants.length > 1 && (
        <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12 }}>
          {preset.variants.map((v, i) => (
            <button
              key={v.label}
              className={`btn ${variantIx === i ? "btn-primary" : "btn-ghost"}`}
              style={{ padding: "5px 11px", fontSize: 11.5 }}
              onClick={() => loadVariant(i)}
            >
              {v.label}
            </button>
          ))}
          <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-faint)" }}>
            {code.trim().split("\n").filter((l) => l.trim() && !l.trim().startsWith("#")).length} lines
          </span>
        </div>
      )}

      {preset.prelude && (
        <div className="viz-code" style={{ whiteSpace: "pre", overflowX: "auto", opacity: 0.72, fontSize: 12, marginBottom: 8 }}>
          <span style={{ color: "var(--code-com)" }}># the table both versions draw from — runs before your code, not editable{"\n"}</span>
          {preset.prelude.trimEnd()}
        </div>
      )}

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={14}
        aria-label="Python code to draw"
        className="viz-code"
        style={{ width: "100%", border: "1px solid var(--line)", resize: "vertical", lineHeight: 1.6 }}
      />

      <div className="viz-controls" style={{ justifyContent: "center", margin: "12px 0 0" }}>
        <button className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? "Drawing…" : everRan ? "Draw again" : "Draw the chart"}
        </button>
        <button className="btn btn-ghost" onClick={() => setCode(variant.code)} disabled={busy}>
          Reset the code
        </button>
      </div>

      {err && (
        <div className="note warn" style={{ marginTop: 14 }}>
          <span className="i">⚠️</span>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, whiteSpace: "pre-wrap" }}>{err}</div>
        </div>
      )}

      {figure && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className="fig-out" src={figure} alt="The chart this code drew" style={{ marginTop: 14 }} />
      )}

      {out && <div className="viz-code" style={{ marginTop: 12, whiteSpace: "pre-wrap", fontSize: 12 }}>{out}</div>}

      {everRan && !figure && !err && (
        <p style={{ fontSize: 12.5, color: "var(--ink-faint)", textAlign: "center", padding: "14px 0 0" }}>
          That ran, but nothing drew a figure. Something has to create one — <code>plt.subplots()</code>.
        </p>
      )}

      <div className="note tip" style={{ marginTop: 14 }}>
        <span className="i">💡</span>
        <div>{footer}</div>
      </div>
    </div>
  );
}
