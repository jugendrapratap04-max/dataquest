/* Machine-learning practice problems.
 *
 * A separate module, registered in apply-problems.mjs, rather than inline in
 * seed.mjs — because `db:content` only UPDATES seed problems that already exist
 * and never creates them, while the modules in SETS upsert. Inline problems
 * therefore need a full `db:seed` to appear, and the ML problems were added to a
 * database people are already using. Same reason the DSA problems live in
 * dsa-problems.mjs.
 *
 * These run in Pyodide with the wheels vendored in public/pyodide, so scikit-
 * learn, numpy and scipy are all available to a student's solution. Two rules on
 * top of the usual ones:
 *
 *   - PIN every random_state. A split or an iterative solver without one gives a
 *     different answer on every run, and `db:check` compares against an exact
 *     value.
 *   - Return plain floats and lists. numpy scalars carry their own repr
 *     (np.float64(0.5)) and a numpy array is not JSON — wrap in float()/int()
 *     or build a list.
 */

const ML = (lessonSlug, difficulty, order, slug, title, functionName, desc, examples, starter, solution, tests, hints, tags) => ({
  lessonSlug, order, slug, title, difficulty, kind: "python",
  functionName, descriptionMd: desc, tagsCsv: tags.join(","),
  examplesJson: JSON.stringify(examples),
  starterCode: starter, solutionCode: solution, testsJson: JSON.stringify(tests),
  hintsJson: JSON.stringify(hints), sqlSetup: "",
  xp: difficulty === "Easy" ? 20 : difficulty === "Medium" ? 30 : 40,
});

const TWENTY_ROWS = Array.from({ length: 20 }, (_, i) => [i]);
const TWENTY_PAIRS = Array.from({ length: 20 }, (_, i) => [i, i * 2]);
const TEN_TEN = [...Array(10).fill(0), ...Array(10).fill(1)];

export const mlProblems = [
  ML("ml-intro", "Medium", 500, "line-rule", "The Rule It Found", "line_rule",
    "`sizes` and `prices` are two lists of the same length — the size of a flat and what it sold for.\n\nFit a `LinearRegression` to them and return the rule it found, as `[slope, intercept]`, each rounded to 4 decimal places.\n\nNobody writes the formula here. You hand it the observations and read back what it worked out.",
    [{ input: "sizes=[50,80,110,140], prices=[30,45,60,75]", output: "[0.5, 5.0]" }, { input: "sizes=[1,2,3], prices=[2,4,6]", output: "[2.0, 0.0]" }],
    "def line_rule(sizes, prices):\n    pass\n",
    "def line_rule(sizes, prices):\n    import numpy as np\n    from sklearn.linear_model import LinearRegression\n    X = np.array(sizes).reshape(-1, 1)\n    y = np.array(prices)\n    m = LinearRegression().fit(X, y)\n    return [round(float(m.coef_[0]), 4), round(float(m.intercept_), 4)]\n",
    [{ args: [[50, 80, 110, 140], [30, 45, 60, 75]], expected: [0.5, 5.0] }, { args: [[1, 2, 3], [2, 4, 6]], expected: [2.0, 0.0] }, { args: [[0, 1], [5, 5]], expected: [0.0, 5.0] }],
    ["scikit-learn wants features as rows and columns, so reshape the sizes with `.reshape(-1, 1)`.",
      "After `.fit()`, the slope is `model.coef_[0]` and the intercept is `model.intercept_`.",
      "Wrap both in `float()` before rounding — they come back as numpy scalars, which print differently."],
    ["ml", "regression"]),

  ML("ml-intro", "Easy", 501, "baseline-accuracy", "What Doing Nothing Scores", "baseline_accuracy",
    "`labels` is the list of correct answers for a dataset. Return the accuracy of a model that always predicts the **most common** label and never looks at the features, rounded to 4 decimal places.\n\nThis is the floor. Any real model has to beat it — and on lopsided data the floor is embarrassingly high, which is exactly why it has to be measured rather than assumed.\n\nAn empty list scores 0.0.",
    [{ input: "labels=[0,0,0,0,1]", output: "0.8" }, { input: 'labels=["a","b","b","b"]', output: "0.75" }],
    "def baseline_accuracy(labels):\n    pass\n",
    "def baseline_accuracy(labels):\n    if not labels:\n        return 0.0\n    counts = {}\n    for v in labels:\n        counts[v] = counts.get(v, 0) + 1\n    return round(max(counts.values()) / len(labels), 4)\n",
    [{ args: [[0, 0, 0, 0, 1]], expected: 0.8 }, { args: [[1, 1, 1]], expected: 1 }, { args: [[0, 1]], expected: 0.5 }, { args: [[]], expected: 0 }, { args: [["a", "b", "b", "b"]], expected: 0.75 }],
    ["Count how often each label appears, then take the biggest count over the total.",
      "No model is needed — this is what `DummyClassifier(strategy=\"most_frequent\")` would score.",
      "Labels are not always 0 and 1. Count whatever is actually in the list."],
    ["ml", "evaluation"]),

  ML("ml-intro", "Medium", 502, "unseen-score", "Score It On What It Never Saw", "unseen_score",
    "`features` is a list of rows and `labels` is the answer for each row.\n\nHold back 30% with `train_test_split(..., test_size=0.3, random_state=42)`, fit a `DecisionTreeClassifier(random_state=0)` on the rest, and return its accuracy **on the held-back rows**, rounded to 4 decimal places.\n\nBoth `random_state` values are given so the answer is reproducible. Leave either out and your number changes on every run — which is also why nobody could check your work.",
    [{ input: "20 rows, the first ten labelled 0 and the rest 1", output: "1.0" }],
    "def unseen_score(features, labels):\n    pass\n",
    "def unseen_score(features, labels):\n    import numpy as np\n    from sklearn.tree import DecisionTreeClassifier\n    from sklearn.model_selection import train_test_split\n    from sklearn.metrics import accuracy_score\n    X = np.array(features)\n    y = np.array(labels)\n    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=42)\n    tree = DecisionTreeClassifier(random_state=0).fit(Xtr, ytr)\n    return round(float(accuracy_score(yte, tree.predict(Xte))), 4)\n",
    [{ args: [TWENTY_ROWS, TEN_TEN], expected: 1.0 }, { args: [TWENTY_PAIRS, TEN_TEN], expected: 1.0 }],
    ["`train_test_split` returns four things, in the order Xtrain, Xtest, ytrain, ytest.",
      "Fit on the TRAIN halves and score on the TEST halves. Scoring on the training half measures memory, not learning.",
      "Pass both random_state values exactly as given, or your split and your tree differ from the expected answer."],
    ["ml", "evaluation"]),
];
