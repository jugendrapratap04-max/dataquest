// Data-visualization & EDA practice problems — shared by the full seed and the
// additive applier (apply-problems.mjs), so both stay in sync from one source.
//
// House pattern for this track. Two things are different from every other track:
//
// 1. **A chart is graded on its numbers, not its pixels.** There is no way to
//    diff two PNGs meaningfully, so a plotting problem returns what the figure
//    is *made of* — the bar heights, the axis limits, the label that was set, how
//    many points landed in each bin. Those are the things a wrong chart gets
//    wrong, and they are checkable. The student still sees the picture: the
//    practice editor shows whatever figure the run left behind, in its Chart tab.
// 2. **matplotlib must not open a window.** Pyodide's default backend is webagg,
//    which would try to serve one. Every solution here builds its figure through
//    `plt.subplots()` and never calls `plt.show()` — which is also the right habit
//    for any plot destined for a file or a report rather than a screen.
//
// Return scalars, lists or strings — not dicts. Dicts do survive the JSON
// comparison now, but object key order survives with them, so a correct answer
// built in a different order would be marked wrong.

const REC = "`records` is a list of dicts (like the rows of a database). Use `pd.DataFrame(records)` to build the DataFrame.";

const VP = (lessonSlug, difficulty, order, slug, title, functionName, desc, examples, starter, solution, tests, hints, tags) => ({
  lessonSlug, order, slug, title, difficulty, kind: "python",
  functionName, descriptionMd: desc, tagsCsv: tags.join(","),
  examplesJson: JSON.stringify(examples),
  starterCode: starter, solutionCode: solution, testsJson: JSON.stringify(tests),
  hintsJson: JSON.stringify(hints), sqlSetup: "",
  xp: difficulty === "Easy" ? 20 : difficulty === "Medium" ? 30 : 40,
});

const vizProblems = [
  /* ================= 1. viz-intro — reading a dataset before drawing it ============= */
  VP("viz-intro", "Easy", 201, "eda-mean-minus-median", "Mean Minus Median", "mean_minus_median",
    "The gap between the mean and the median is the cheapest shape check there is: when the mean sits well above the median, something large is sitting in the upper tail.\n\nWrite a function `mean_minus_median(values)` that returns **mean minus median**, rounded to 2 decimals.",
    [{ input: "values=[1, 2, 3, 100]", output: "24.0" }, { input: "values=[1, 2, 3, 4]", output: "0.0" }],
    "import statistics as st\n\ndef mean_minus_median(values):\n    pass\n",
    "import statistics as st\n\ndef mean_minus_median(values):\n    return round(st.mean(values) - st.median(values), 2)\n",
    [
      { args: [[1, 2, 3, 100]], expected: 24 },
      { args: [[1, 2, 3, 4]], expected: 0 },
      { args: [[12, 14, 15, 15, 16, 18, 19, 21, 24, 31, 87]], expected: 6.73 },
      { args: [[5, 5, 5, 5]], expected: 0 },
    ],
    ["`st.mean(values)` and `st.median(values)` from the `statistics` module.", "Subtract in that order — mean first — then `round(x, 2)`.", "A symmetric dataset gives 0. That is a real answer, not a bug."],
    ["eda", "statistics"]),

  VP("viz-intro", "Easy", 202, "eda-count-above-mean", "How Many Beat the Average", "count_above_mean",
    "In `[12, 15, 19, 87]` the mean is 33.25 and **only one of the four values is above it**. That is the whole problem with quoting an average on its own.\n\nWrite a function `count_above_mean(values)` that returns how many values are **strictly greater** than the mean.",
    [{ input: "values=[12, 15, 19, 87]", output: "1" }, { input: "values=[5, 5, 5]", output: "0" }],
    "import statistics as st\n\ndef count_above_mean(values):\n    pass\n",
    "import statistics as st\n\ndef count_above_mean(values):\n    m = st.mean(values)\n    return len([v for v in values if v > m])\n",
    [
      { args: [[12, 15, 19, 87]], expected: 1 },
      { args: [[1, 2, 3, 4]], expected: 2 },
      { args: [[5, 5, 5]], expected: 0 },
      { args: [[10, 20, 30, 40, 50]], expected: 2 },
    ],
    ["Work out the mean once, before the loop — not inside it.", "Strictly greater means `>`, not `>=`. A value equal to the mean does not count.", "A list comprehension plus `len()` is the shortest way."],
    ["eda", "statistics"]),

  VP("viz-intro", "Medium", 203, "eda-worst-column", "The Emptiest Column", "worst_column",
    `Before any average, find out what is missing. Write a function \`worst_column(records)\` that returns the **name of the column with the most missing values**.\n\n${REC} No two columns will be tied.`,
    [{ input: 'records=[{"a": 1, "b": None}, {"a": None, "b": None}, {"a": 3, "b": 4}]', output: '"b"' }],
    "import pandas as pd\n\ndef worst_column(records):\n    pass\n",
    "import pandas as pd\n\ndef worst_column(records):\n    df = pd.DataFrame(records)\n    return str(df.isna().sum().idxmax())\n",
    [
      { args: [[{ a: 1, b: null }, { a: null, b: null }, { a: 3, b: 4 }]], expected: "b" },
      { args: [[{ city: "Delhi", orders: 340, rating: 4.2 }, { city: "Mumbai", orders: null, rating: null }, { city: "Pune", orders: 198, rating: null }]], expected: "rating" },
      { args: [[{ x: 1, y: 2 }, { x: null, y: 2 }]], expected: "x" },
    ],
    ["`df.isna()` gives True/False for every cell; `.sum()` counts the Trues per column.", "`.idxmax()` returns the *label* of the largest value — which is the column name.", "Wrap it in `str(...)`, or a pandas label comes back instead of a plain string."],
    ["eda", "pandas", "missing-data"]),

  VP("viz-intro", "Medium", 204, "eda-summary-row", "Never Report a Mean Alone", "summary_row",
    "A mean nobody can check is not a finding. Report it with the count and the spread, and the reader can tell 812 from four rows apart from 812 from forty thousand.\n\nWrite a function `summary_row(values)` that returns the list `[n, mean, median, sd]` — the count first, then the other three each **rounded to 2 decimals**. Use the sample standard deviation (`st.stdev`). `values` always has at least two numbers.",
    [{ input: "values=[1, 2, 3, 4]", output: "[4, 2.5, 2.5, 1.29]" }],
    "import statistics as st\n\ndef summary_row(values):\n    pass\n",
    "import statistics as st\n\ndef summary_row(values):\n    return [len(values), round(st.mean(values), 2), round(st.median(values), 2), round(st.stdev(values), 2)]\n",
    [
      { args: [[1, 2, 3, 4]], expected: [4, 2.5, 2.5, 1.29] },
      { args: [[2, 4, 4, 4, 5, 5, 7, 9]], expected: [8, 5, 4.5, 2.14] },
      { args: [[10, 20]], expected: [2, 15, 15, 7.07] },
    ],
    ["Build the list in the stated order: count, mean, median, sd.", "`len()` for the count — do not round that one.", "`st.stdev` is the sample standard deviation, dividing by n-1. `st.pstdev` divides by n and gives a different answer."],
    ["eda", "statistics"]),
];

export { vizProblems };
