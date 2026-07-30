"use client";

import { useState } from "react";

/* Choosing a chart is taught as a table of rules, and a table of rules is exactly
 * the thing nobody remembers. So this panel makes the wrong answers visible:
 * pick a question, then pick any chart, and it draws that chart from that
 * question's data and says what it did to the answer.
 *
 * Every combination renders — including the four that are ridiculous. Watching a
 * pie chart destroy a time series teaches the rule in a way that "use a line
 * chart for time" does not. */

type Verdict = "right" | "ok" | "wrong";
type ChartKey = "bar" | "line" | "pie" | "scatter" | "hist";

type Question = {
  key: string;
  ask: string;
  shape: string;
  labels: string[];
  values: number[];
  /** Only for the two-numeric-columns question. */
  pairs?: [number, number][];
  xName: string;
  yName: string;
  verdicts: Record<ChartKey, { v: Verdict; why: string }>;
};

const QUESTIONS: Question[] = [
  {
    key: "cities",
    ask: "Which city takes the most orders?",
    shape: "one number per category",
    labels: ["Delhi", "Mumbai", "Pune", "Jaipur"],
    values: [340, 512, 198, 260],
    xName: "city",
    yName: "orders",
    verdicts: {
      bar: { v: "right", why: "Four lengths from a shared baseline. The ranking is readable without reading a single number, which is the whole job." },
      pie: { v: "ok", why: "It works, and it makes you compare angles instead of lengths. Delhi beats Jaipur by 31%, and as an angle that gap is 6% of the circle." },
      line: { v: "wrong", why: "A line says these points are in sequence and the space between them means something. Cities are not in sequence — reorder them and the 'trend' changes." },
      scatter: { v: "wrong", why: "A scatter plot is for two numeric columns. Here one axis is a name, so the horizontal position carries no information at all." },
      hist: { v: "wrong", why: "A histogram buckets the values and counts them, so the cities disappear entirely. It answers 'how many cities had around 300 orders' — a question nobody asked." },
    },
  },
  {
    key: "months",
    ask: "Are orders growing month by month?",
    shape: "one number per time period",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [120, 145, 132, 178, 205, 262],
    xName: "month",
    yName: "orders",
    verdicts: {
      line: { v: "right", why: "The slope is the answer. A line is the only chart here that draws the thing you are asking about rather than leaving you to infer it." },
      bar: { v: "ok", why: "Perfectly honest, just heavier: six bars to compare pairwise where one line shows the direction at a glance. Fine for six months, tiring for sixty." },
      scatter: { v: "ok", why: "The points are right and the connection is missing. For a trend the line between them is the message, not decoration." },
      pie: { v: "wrong", why: "It turns a sequence into six slices of a year and throws the order away. June being the biggest slice is invisible as growth." },
      hist: { v: "wrong", why: "This counts how many months fell in each range. Time vanishes, which is the one variable the question is about." },
    },
  },
  {
    key: "tips",
    ask: "Do bigger bills get bigger tips?",
    shape: "two numbers per row",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    values: [1.5, 2.5, 3.0, 4.5, 1.0, 2.0, 3.5, 6.0, 2.5, 5.0],
    pairs: [[12.5, 1.5], [18, 2.5], [24.5, 3], [31, 4.5], [9.5, 1], [15.5, 2], [27, 3.5], [41, 6], [22, 2.5], [35.5, 5]],
    xName: "bill",
    yName: "tip",
    verdicts: {
      scatter: { v: "right", why: "One dot per row, both numbers on their own axis. The shape of the cloud is the relationship — and it is also where you would spot a curve or one stray point." },
      hist: { v: "ok", why: "It shows the spread of the tips, honestly. It just cannot say anything about bills, so it answers half the question." },
      line: { v: "wrong", why: "Joining the dots in row order draws a path through the spreadsheet, not a relationship. Sort the rows differently and the line changes shape." },
      bar: { v: "wrong", why: "One bar per row invites you to compare individual transactions, which is not the question. Ten bars, no relationship visible." },
      pie: { v: "wrong", why: "Tips as a share of all tips. Nothing about bills appears anywhere, and the reader is invited to compare customers." },
    },
  },
  {
    key: "spread",
    ask: "What does a typical order value look like?",
    shape: "one column of numbers",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
    values: [210, 240, 245, 255, 260, 265, 270, 280, 290, 310, 340, 420, 640, 980, 1450],
    xName: "order",
    yName: "value",
    verdicts: {
      hist: { v: "right", why: "The shape of one column is exactly what a histogram is for — and here it shows a long right tail, which is why the mean of this data is not typical of it." },
      scatter: { v: "ok", why: "A strip of points does show the spread and the outliers. It is a defensible second choice; the histogram counts them for you." },
      bar: { v: "wrong", why: "Fifteen bars, one per order. That is the raw data drawn tall, not a distribution — and with fifteen thousand rows it is unreadable." },
      line: { v: "wrong", why: "A line implies the fifteen orders are a sequence in time. They are a column of values; sorting them differently redraws the line." },
      pie: { v: "wrong", why: "Fifteen slices of a total nobody asked about. It cannot show a tail, an outlier or a typical value." },
    },
  },
];

const CHARTS: { key: ChartKey; label: string }[] = [
  { key: "bar", label: "bar" },
  { key: "line", label: "line" },
  { key: "scatter", label: "scatter" },
  { key: "hist", label: "histogram" },
  { key: "pie", label: "pie" },
];

const W = 340;
const H = 172;
const L = 34;
const R = 8;
const T = 10;
const B = 26;

const PALETTE = ["var(--teal)", "var(--accent)", "var(--indigo)", "var(--good)", "var(--bad)", "var(--ink-faint)"];

function Frame({ children, xLabel, yLabel }: { children: React.ReactNode; xLabel: string; yLabel: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${yLabel} against ${xLabel}`}>
      <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="var(--line)" strokeWidth="1" />
      <line x1={L} y1={T} x2={L} y2={H - B} stroke="var(--line)" strokeWidth="1" />
      <text x={W - R} y={H - 6} textAnchor="end" fontSize="8" fill="var(--ink-faint)" fontFamily="var(--mono)">{xLabel}</text>
      <text x={4} y={T + 8} fontSize="8" fill="var(--ink-faint)" fontFamily="var(--mono)">{yLabel}</text>
      {children}
    </svg>
  );
}

function Plot({ q, chart }: { q: Question; chart: ChartKey }) {
  const max = Math.max(...q.values);
  const plotW = W - L - R;
  const plotH = H - T - B;
  const y = (v: number) => H - B - (v / max) * plotH;
  const tick = (t: string, x: number) => (
    <text key={t + x} x={x} y={H - B + 10} textAnchor="middle" fontSize="7" fill="var(--ink-faint)" fontFamily="var(--mono)">{t}</text>
  );
  const showTicks = q.labels.length <= 6;

  if (chart === "bar") {
    const step = plotW / q.values.length;
    const bw = Math.max(3, step * 0.62);
    return (
      <Frame xLabel={q.xName} yLabel={q.yName}>
        {q.values.map((v, i) => {
          const cx = L + step * (i + 0.5);
          return (
            <g key={i}>
              <rect x={cx - bw / 2} y={y(v)} width={bw} height={H - B - y(v)} fill="var(--teal)" rx="1.5" />
              {showTicks && tick(q.labels[i], cx)}
            </g>
          );
        })}
      </Frame>
    );
  }

  if (chart === "line") {
    const step = q.values.length > 1 ? plotW / (q.values.length - 1) : 0;
    const pts = q.values.map((v, i) => `${L + step * i},${y(v)}`).join(" ");
    return (
      <Frame xLabel={q.xName} yLabel={q.yName}>
        <polyline points={pts} fill="none" stroke="var(--teal)" strokeWidth="2" />
        {q.values.map((v, i) => (
          <g key={i}>
            <circle cx={L + step * i} cy={y(v)} r="2.6" fill="var(--teal)" />
            {showTicks && tick(q.labels[i], L + step * i)}
          </g>
        ))}
      </Frame>
    );
  }

  if (chart === "scatter") {
    const xs = q.pairs ? q.pairs.map((p) => p[0]) : q.values.map((_, i) => i);
    const ys = q.pairs ? q.pairs.map((p) => p[1]) : q.values;
    const xMax = Math.max(...xs);
    const yMax = Math.max(...ys);
    return (
      <Frame xLabel={q.pairs ? q.xName : "row number"} yLabel={q.yName}>
        {ys.map((v, i) => (
          <circle
            key={i}
            cx={L + (xs[i] / xMax) * plotW * 0.94 + 4}
            cy={H - B - (v / yMax) * plotH}
            r="3"
            fill="var(--teal)"
            stroke="var(--panel)"
            strokeWidth="0.8"
          />
        ))}
      </Frame>
    );
  }

  if (chart === "hist") {
    const lo = Math.min(...q.values);
    const hi = Math.max(...q.values);
    const bins = 5;
    const width = (hi - lo) / bins || 1;
    const counts = Array.from({ length: bins }, (_, b) =>
      q.values.filter((v) => (b === bins - 1 ? v <= lo + width * (b + 1) : v < lo + width * (b + 1)) && v >= lo + width * b).length
    );
    const cMax = Math.max(...counts, 1);
    const step = plotW / bins;
    return (
      <Frame xLabel={`${q.yName} (bucketed)`} yLabel="count">
        {counts.map((c, i) => (
          <g key={i}>
            <rect
              x={L + step * i + 1}
              y={H - B - (c / cMax) * plotH}
              width={step - 2}
              height={(c / cMax) * plotH}
              fill="var(--teal)"
              stroke="var(--panel)"
              strokeWidth="1"
            />
            <text x={L + step * (i + 0.5)} y={H - B + 10} textAnchor="middle" fontSize="7" fill="var(--ink-faint)" fontFamily="var(--mono)">{c}</text>
          </g>
        ))}
      </Frame>
    );
  }

  // pie
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${q.yName} as slices of a pie`}>
      {piePaths(q.values).map((d, i) => (
        <path key={i} d={d} fill={PALETTE[i % PALETTE.length]} stroke="var(--panel)" strokeWidth="1" />
      ))}
    </svg>
  );
}

/** Slice paths, walked round the circle. Kept out of the component body because a
 *  running angle is a reassignment during render, which the compiler rejects. */
function piePaths(values: number[]): string[] {
  const total = values.reduce((s, v) => s + v, 0);
  const cx = W / 2;
  const cy = H / 2;
  const r = 66;
  const out: string[] = [];
  let angle = -Math.PI / 2;
  for (const v of values) {
    const sweep = (v / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    out.push(`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`);
  }
  return out;
}

const BADGE: Record<Verdict, { text: string; colour: string; bg: string }> = {
  right: { text: "the right chart", colour: "var(--good)", bg: "var(--good-soft)" },
  ok: { text: "defensible", colour: "var(--accent-2)", bg: "var(--accent-soft)" },
  wrong: { text: "the wrong chart", colour: "var(--bad)", bg: "var(--bad-soft)" },
};

export function ChartChoiceLab() {
  const [qKey, setQKey] = useState(QUESTIONS[0].key);
  const [chart, setChart] = useState<ChartKey>("bar");

  const q = QUESTIONS.find((x) => x.key === qKey) ?? QUESTIONS[0];
  const verdict = q.verdicts[chart];
  const badge = BADGE[verdict.v];

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">🎯 Which chart? — pick a question, then pick wrong on purpose</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Every combination draws, including the ridiculous ones. Choose a question, then work along
        the chart buttons and read what each one did to the answer — the wrong ones are the
        instructive half.
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 8 }}>
        {QUESTIONS.map((x) => (
          <button
            key={x.key}
            className={`btn ${qKey === x.key ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 11px", fontSize: 11.5 }}
            onClick={() => setQKey(x.key)}
          >
            {x.ask}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "var(--ink-faint)", textAlign: "center", margin: "0 0 10px", fontFamily: "var(--mono)" }}>
        what you have: {q.shape}
      </p>

      <div className="viz-controls" style={{ justifyContent: "center", marginBottom: 12 }}>
        {CHARTS.map((c) => (
          <button
            key={c.key}
            className={`btn ${chart === c.key ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 12px", fontFamily: "var(--mono)", fontSize: 12 }}
            onClick={() => setChart(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--panel-2)", padding: "8px 6px 2px" }}>
        <Plot q={q} chart={chart} />
      </div>

      <div
        style={{
          marginTop: 12, padding: "10px 12px", borderRadius: 10,
          background: badge.bg, border: `1px solid ${badge.colour}`, color: "var(--ink)",
        }}
      >
        <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".08em", color: badge.colour, fontWeight: 700, marginBottom: 4 }}>
          {chart} · {badge.text}
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>{verdict.why}</div>
      </div>

      <div className="note tip" style={{ marginTop: 14 }}>
        <span className="i">💡</span>
        <div>
          Notice that the rule never mentions the data — it mentions the <b>question</b>. The same
          four numbers are a bar chart when you are ranking them, a line when they are a sequence,
          and a histogram when you want their shape. Decide what you are asking first and the chart
          stops being a matter of taste.
        </div>
      </div>
    </div>
  );
}
