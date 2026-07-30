"use client";

import { PyChartLab, type Preset } from "./PyChartLab";

/* The matplotlib playground for lesson 2. One variant per preset — the seaborn
 * lesson is where a second one appears. */

const PRESETS: Preset[] = [
  {
    key: "line",
    label: "line",
    variants: [{
      label: "matplotlib",
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May"]
sales = [120, 145, 132, 178, 205]

fig, ax = plt.subplots(figsize=(6, 3.4))
ax.plot(months, sales, marker="o")
ax.set_title("Monthly sales")
ax.set_xlabel("month")
ax.set_ylabel("units sold")
`,
    }],
  },
  {
    key: "bar",
    label: "bar",
    variants: [{
      label: "matplotlib",
      code: `import matplotlib.pyplot as plt

cities = ["Delhi", "Mumbai", "Pune", "Jaipur"]
orders = [340, 512, 198, 260]

fig, ax = plt.subplots(figsize=(6, 3.4))
ax.bar(cities, orders, color="#2DD4BF")
ax.set_title("Orders by city")
ax.set_ylabel("orders")

# A bar chart's job is comparing lengths, so the baseline must be zero.
# Uncomment the next line and watch Pune almost disappear.
# ax.set_ylim(180, 520)
`,
    }],
  },
  {
    key: "scatter",
    label: "scatter",
    variants: [{
      label: "matplotlib",
      code: `import matplotlib.pyplot as plt

hours = [1, 2, 2, 3, 4, 4, 5, 6, 7, 8]
score = [35, 41, 48, 50, 61, 55, 68, 72, 79, 88]

fig, ax = plt.subplots(figsize=(6, 3.4))
ax.scatter(hours, score)
ax.set_title("Study hours vs score")
ax.set_xlabel("hours studied")
ax.set_ylabel("score")
`,
    }],
  },
  {
    key: "hist",
    label: "histogram",
    variants: [{
      label: "matplotlib",
      code: `import matplotlib.pyplot as plt

ages = [19, 21, 22, 22, 23, 23, 23, 24, 25, 25, 26, 28, 31, 34, 41]

fig, ax = plt.subplots(figsize=(6, 3.4))
ax.hist(ages, bins=6, edgecolor="white")
ax.set_title("Age distribution")
ax.set_xlabel("age")
ax.set_ylabel("how many people")

# Change bins to 3, then to 12. The data never moved.
`,
    }],
  },
];

export function ChartLab() {
  return (
    <PyChartLab
      title="📈 Chart Lab — real matplotlib, running here"
      badge="runs python"
      presets={PRESETS}
      blurb={
        <>
          This is not a picture of matplotlib; it <b>is</b> matplotlib. Pick a chart type, change a
          number or a label, and press <b>Draw</b>. The first press downloads Python and the plotting
          library (about 9 MB, once per tab) — after that it redraws in well under a second.
        </>
      }
      footer={
        <>
          Notice there is no <code>plt.show()</code> anywhere. In a script that line is what opens the
          window; here the page already has somewhere to put the picture, so the figure is simply
          handed over. Same three lines of drawing code either way — only the last step differs.
        </>
      }
    />
  );
}
