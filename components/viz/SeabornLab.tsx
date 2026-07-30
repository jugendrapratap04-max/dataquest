"use client";

import { PyChartLab, type Preset } from "./PyChartLab";

/* Seaborn's whole claim is "the same statistical chart, in one line instead of
 * twelve". That is not a claim a student should take on trust, so every preset
 * here ships BOTH versions of the same figure and both of them run.
 *
 * The matplotlib variants are not strawmen. Each one does exactly what seaborn
 * does internally — group the rows, compute the quartiles, pick a colour per
 * category, build the legend — because the point is not that matplotlib is bad,
 * it is that seaborn already knows your data is a DataFrame. */

const DATA = `import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({
    "bill":   [12.5, 18.0, 24.5, 31.0, 9.5, 15.5, 27.0, 41.0, 22.0, 16.5, 35.5, 19.0],
    "tip":    [1.5, 2.5, 3.0, 4.5, 1.0, 2.0, 3.5, 6.0, 2.5, 2.0, 5.0, 2.5],
    "day":    ["Fri", "Fri", "Fri", "Sat", "Sat", "Sat", "Sun", "Sun", "Sun", "Fri", "Sat", "Sun"],
    "people": [2, 2, 4, 4, 1, 2, 3, 5, 3, 2, 4, 2],
})
`;

const PRESETS: Preset[] = [
  {
    key: "hist",
    label: "distribution",
    prelude: DATA,
    variants: [
      {
        label: "seaborn",
        code: `import seaborn as sns

fig, ax = plt.subplots(figsize=(6, 3.4))
sns.histplot(data=df, x="bill", bins=4, ax=ax)
ax.set_title("How big is a bill?")
`,
      },
      {
        label: "matplotlib",
        code: `fig, ax = plt.subplots(figsize=(6, 3.4))
ax.hist(df["bill"], bins=4, edgecolor="white")
ax.set_xlabel("bill")
ax.set_ylabel("Count")
ax.set_title("How big is a bill?")
`,
      },
    ],
  },
  {
    key: "box",
    label: "box by category",
    prelude: DATA,
    variants: [
      {
        label: "seaborn",
        code: `import seaborn as sns

fig, ax = plt.subplots(figsize=(6, 3.4))
sns.boxplot(data=df, x="day", y="bill", ax=ax)
ax.set_title("Bills by day")
`,
      },
      {
        label: "matplotlib",
        code: `days = sorted(df["day"].unique())
groups = [df.loc[df["day"] == d, "bill"].tolist() for d in days]

fig, ax = plt.subplots(figsize=(6, 3.4))
ax.boxplot(groups, tick_labels=days)
ax.set_xlabel("day")
ax.set_ylabel("bill")
ax.set_title("Bills by day")
`,
      },
    ],
  },
  {
    key: "hue",
    label: "scatter + hue",
    prelude: DATA,
    variants: [
      {
        label: "seaborn",
        code: `import seaborn as sns

fig, ax = plt.subplots(figsize=(6, 3.4))
sns.scatterplot(data=df, x="bill", y="tip", hue="day", ax=ax)
ax.set_title("Tip against bill, coloured by day")
`,
      },
      {
        label: "matplotlib",
        code: `fig, ax = plt.subplots(figsize=(6, 3.4))
for day in sorted(df["day"].unique()):
    part = df[df["day"] == day]
    ax.scatter(part["bill"], part["tip"], label=day)

ax.set_xlabel("bill")
ax.set_ylabel("tip")
ax.legend(title="day")
ax.set_title("Tip against bill, coloured by day")
`,
      },
    ],
  },
  {
    key: "heatmap",
    label: "correlation heatmap",
    prelude: DATA,
    variants: [
      {
        label: "seaborn",
        code: `import seaborn as sns

corr = df[["bill", "tip", "people"]].corr()

fig, ax = plt.subplots(figsize=(5, 4))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="viridis", ax=ax)
ax.set_title("What moves with what")
`,
      },
      {
        label: "matplotlib",
        code: `cols = ["bill", "tip", "people"]
corr = df[cols].corr()

fig, ax = plt.subplots(figsize=(5, 4))
im = ax.imshow(corr.values, cmap="viridis")
ax.set_xticks(range(len(cols)), labels=cols)
ax.set_yticks(range(len(cols)), labels=cols)
for i in range(len(cols)):
    for j in range(len(cols)):
        ax.text(j, i, f"{corr.iloc[i, j]:.2f}", ha="center", va="center", color="white")
fig.colorbar(im, ax=ax)
ax.set_title("What moves with what")
`,
      },
    ],
  },
];

export function SeabornLab() {
  return (
    <PyChartLab
      title="🎨 Seaborn Lab — the same chart, both ways"
      badge="runs python"
      presets={PRESETS}
      blurb={
        <>
          Pick a chart, then switch between <b>seaborn</b> and <b>matplotlib</b> and press
          <b> Draw</b> on each. Both are real, both run, and both draw the same figure — the line
          counter next to the toggle is the difference. Start with <b>correlation heatmap</b>, where
          it is five lines against eleven. The first press downloads Python, pandas and both
          libraries (about 20 MB, once per tab).
        </>
      }
      footer={
        <>
          The matplotlib versions are not strawmen — each one does what seaborn does internally:
          group the rows, compute the quartiles, choose a colour per category, build the legend.
          That is the real difference. matplotlib is handed <i>numbers</i>; seaborn is handed a
          <b> DataFrame and the names of columns</b>, so it can do the grouping for you.
        </>
      }
    />
  );
}
