"use client";

import { useState } from "react";

/* Real matplotlib, in the lesson, in the browser.
 *
 * Every other panel on this platform is hand-built React that *depicts* what the
 * library would do. For a visualization subject that is not good enough: the
 * whole skill being taught is "change the code, look at the picture, change it
 * again", and a depiction cannot close that loop.
 *
 * So this one actually runs. The wheels are vendored in public/pyodide, so the
 * figure comes back from the same matplotlib 3.10.8 that verify:lesson checked
 * every snippet in this lesson against — what the student draws here is what the
 * page claims, not an approximation of it.
 *
 * It is the only panel that costs a download (~9 MB, once per tab), which is why
 * it is opt-in behind a button rather than warming up on page load. */

type Preset = { key: string; label: string; code: string };

const PRESETS: Preset[] = [
  {
    key: "line",
    label: "line",
    code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May"]
sales = [120, 145, 132, 178, 205]

fig, ax = plt.subplots(figsize=(6, 3.4))
ax.plot(months, sales, marker="o")
ax.set_title("Monthly sales")
ax.set_xlabel("month")
ax.set_ylabel("units sold")
`,
  },
  {
    key: "bar",
    label: "bar",
    code: `import matplotlib.pyplot as plt

cities = ["Delhi", "Mumbai", "Pune", "Jaipur"]
orders = [340, 512, 198, 260]

fig, ax = plt.subplots(figsize=(6, 3.4))
ax.bar(cities, orders, color="#2DD4BF")
ax.set_title("Orders by city")
ax.set_ylabel("orders")

# A bar chart's job is comparing lengths, so the baseline must be zero.
# Try ax.set_ylim(180, 520) and watch Pune look like it barely exists.
`,
  },
  {
    key: "scatter",
    label: "scatter",
    code: `import matplotlib.pyplot as plt

hours = [1, 2, 2, 3, 4, 4, 5, 6, 7, 8]
score = [35, 41, 48, 50, 61, 55, 68, 72, 79, 88]

fig, ax = plt.subplots(figsize=(6, 3.4))
ax.scatter(hours, score)
ax.set_title("Study hours vs score")
ax.set_xlabel("hours studied")
ax.set_ylabel("score")
`,
  },
  {
    key: "hist",
    label: "histogram",
    code: `import matplotlib.pyplot as plt

ages = [19, 21, 22, 22, 23, 23, 23, 24, 25, 25, 26, 28, 31, 34, 41]

fig, ax = plt.subplots(figsize=(6, 3.4))
ax.hist(ages, bins=6, edgecolor="white")
ax.set_title("Age distribution")
ax.set_xlabel("age")
ax.set_ylabel("how many people")

# Change bins to 3, then to 12. The data never moved.
`,
  },
];

export function ChartLab() {
  const [preset, setPreset] = useState(PRESETS[0].key);
  const [code, setCode] = useState(PRESETS[0].code);
  const [busy, setBusy] = useState(false);
  const [figure, setFigure] = useState<string | null>(null);
  const [out, setOut] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [everRan, setEverRan] = useState(false);

  const load = (p: Preset) => {
    setPreset(p.key);
    setCode(p.code);
  };

  const run = async () => {
    setBusy(true);
    setErr("");
    try {
      // Imported here rather than at the top of the file so the seven megabytes
      // of Python only leave the server for a student who pressed the button.
      const { runPythonWithFigure } = await import("@/lib/pyodide-runner");
      const r = await runPythonWithFigure(code);
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
        <span className="viz-title">📈 Chart Lab — real matplotlib, running here</span>
        <span className="viz-badge">runs python</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        This is not a picture of matplotlib; it <b>is</b> matplotlib. Pick a chart type, change a
        number or a label, and press <b>Draw</b>. The first press downloads Python and the plotting
        library (about 9 MB, once per tab) — after that it redraws in well under a second.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12 }}>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            className={`btn ${preset === p.key ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 12px", fontFamily: "var(--mono)", fontSize: 12 }}
            onClick={() => load(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={13}
        aria-label="matplotlib code to draw"
        className="viz-code"
        style={{ width: "100%", border: "1px solid var(--line)", resize: "vertical", lineHeight: 1.6 }}
      />

      <div className="viz-controls" style={{ justifyContent: "center", margin: "12px 0 0" }}>
        <button className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? "Drawing…" : everRan ? "Draw again" : "Draw the chart"}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => load(PRESETS.find((p) => p.key === preset)!)}
          disabled={busy}
        >
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

      {out && (
        <div className="viz-code" style={{ marginTop: 12, whiteSpace: "pre-wrap", fontSize: 12 }}>{out}</div>
      )}

      {everRan && !figure && !err && (
        <p style={{ fontSize: 12.5, color: "var(--ink-faint)", textAlign: "center", padding: "14px 0 0" }}>
          That ran, but nothing drew a figure. Something has to create one — <code>plt.subplots()</code>.
        </p>
      )}

      <div className="note tip" style={{ marginTop: 14 }}>
        <span className="i">💡</span>
        <div>
          Notice there is no <code>plt.show()</code> anywhere. In a script that line is what opens the
          window; here the page already has somewhere to put the picture, so the figure is simply
          handed over. Same three lines of drawing code either way — only the last step differs.
        </div>
      </div>
    </div>
  );
}
