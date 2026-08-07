/* Practice for the deploy track.
 *
 * ONLY `deploy-model` GETS PROBLEMS, AND THAT IS NOT AN OVERSIGHT. The other
 * three lessons teach git commands, writing a README and interview technique —
 * none of which any grading engine on this platform can check, and inventing
 * something python-shaped for them would be exercise-flavoured filler. It is
 * the same call Module 0 of the HTML course made and wrote down.
 *
 * These run in Pyodide against the wheels vendored in public/pyodide, so
 * scikit-learn and joblib are both available. The house rules for that runtime
 * apply: return plain floats and lists (a numpy scalar reprs as np.float64(0.5)
 * and an array is not JSON), and pin anything that could vary between runs.
 *
 * ⚠️ StandardScaler uses the POPULATION standard deviation (ddof=0), not the
 * sample one. The expected values below were computed from that definition
 * rather than assumed, and a list with zero variance is deliberately not used
 * as a test case — it divides by zero.
 */

const DP = (lessonSlug, difficulty, order, slug, title, functionName, desc, examples, starter, solution, tests, hints, tags) => ({
  lessonSlug, order, slug, title, difficulty, kind: "python",
  functionName, descriptionMd: desc, tagsCsv: tags.join(","),
  examplesJson: JSON.stringify(examples),
  starterCode: starter, solutionCode: solution, testsJson: JSON.stringify(tests),
  hintsJson: JSON.stringify(hints), sqlSetup: "",
  xp: difficulty === "Easy" ? 20 : difficulty === "Medium" ? 30 : 40,
});

const deployProblems = [
  DP("deploy-model", "Easy", 700, "scaler-learned", "What the Scaler Learned", "scaler_output",
    "A `StandardScaler` is not a formula you apply — it is a step that **learns two numbers from your training data**, a mean and a standard deviation, and then uses them on everything afterwards. That is exactly why it has to be saved with the model.\n\nGiven a list of numbers, fit a `StandardScaler` to them and return the transformed values, each rounded to 4 decimal places.\n\nThe values arrive as one column, so reshape them with `.reshape(-1, 1)` — and read them back out of the single column you get.",
    [{ input: "values=[10, 20, 30, 40]", output: "[-1.3416, -0.4472, 0.4472, 1.3416]" },
     { input: "values=[5, 15]", output: "[-1.0, 1.0]" }],
    "def scaler_output(values):\n    pass\n",
    "def scaler_output(values):\n    import numpy as np\n    from sklearn.preprocessing import StandardScaler\n    X = np.array(values, dtype=float).reshape(-1, 1)\n    out = StandardScaler().fit_transform(X)\n    return [round(float(v[0]), 4) for v in out]\n",
    [{ args: [[10, 20, 30, 40]], expected: [-1.3416, -0.4472, 0.4472, 1.3416] },
     { args: [[5, 15]], expected: [-1.0, 1.0] },
     { args: [[2, 4, 4, 4, 5, 5, 7, 9]], expected: [-1.5, -0.5, -0.5, -0.5, 0.0, 0.0, 1.0, 2.0] }],
    ["`StandardScaler().fit_transform(X)` both learns the numbers and applies them.",
     "scikit-learn wants a column, so `np.array(values, dtype=float).reshape(-1, 1)`.",
     "The result is one column, so each row is `v[0]` — wrap it in `float()` before rounding."],
    ["deploy", "sklearn", "preprocessing"]),

  DP("deploy-model", "Medium", 701, "one-object", "Scaler and Model, One Object", "pipeline_steps",
    "The lesson's rule in one line: **preprocessing is part of the model**. A `Pipeline` is how you make that true in code — the scaler and the estimator become one object, so one `dump` saves both and one `load` brings both back.\n\nBuild a `Pipeline` whose first step is named `\"scaler\"` and holds a `StandardScaler`, and whose second is named `\"model\"` and holds a `LogisticRegression`. Fit it to `features` and `labels`, then return the **names of its steps, in order**.\n\n`features` arrives as a flat list of numbers — one feature per row.",
    [{ input: "features=[1,2,3,100,200,300], labels=[0,0,0,1,1,1]", output: '["scaler", "model"]' }],
    "def pipeline_steps(features, labels):\n    pass\n",
    "def pipeline_steps(features, labels):\n    import numpy as np\n    from sklearn.pipeline import Pipeline\n    from sklearn.preprocessing import StandardScaler\n    from sklearn.linear_model import LogisticRegression\n    X = np.array(features, dtype=float).reshape(-1, 1)\n    pipe = Pipeline([\n        (\"scaler\", StandardScaler()),\n        (\"model\", LogisticRegression(max_iter=1000)),\n    ])\n    pipe.fit(X, labels)\n    return [name for name, _ in pipe.steps]\n",
    [{ args: [[1, 2, 3, 100, 200, 300], [0, 0, 0, 1, 1, 1]], expected: ["scaler", "model"] },
     { args: [[0, 1, 50, 60], [0, 0, 1, 1]], expected: ["scaler", "model"] }],
    ["`Pipeline([(\"scaler\", StandardScaler()), (\"model\", LogisticRegression())])`.",
     "Give LogisticRegression `max_iter=1000` so it converges quietly.",
     "`pipe.steps` is a list of (name, estimator) pairs — take the first of each."],
    ["deploy", "sklearn", "pipeline"]),

  DP("deploy-model", "Hard", 702, "save-and-load", "Survive Leaving the Notebook", "round_trip_predict",
    "This is deployment in one function. A model that only exists in memory dies with the kernel, so serving it means **writing it to a file after training and loading that file back**.\n\nFit a `Pipeline` of `StandardScaler` and `LogisticRegression` on `features` and `labels`. Save it with `joblib.dump`, load it back with `joblib.load`, and return the prediction the **loaded** object makes for `query`, as a plain `int`.\n\nIf the round trip works, the answer is the same one the fitted pipeline would have given — and that sameness is the whole point of saving the pipeline rather than the estimator alone.",
    [{ input: "features=[1,2,3,100,200,300], labels=[0,0,0,1,1,1], query=250", output: "1" },
     { input: "same training data, query=2", output: "0" }],
    "def round_trip_predict(features, labels, query):\n    pass\n",
    "def round_trip_predict(features, labels, query):\n    import joblib\n    import numpy as np\n    from sklearn.pipeline import Pipeline\n    from sklearn.preprocessing import StandardScaler\n    from sklearn.linear_model import LogisticRegression\n    X = np.array(features, dtype=float).reshape(-1, 1)\n    pipe = Pipeline([\n        (\"scaler\", StandardScaler()),\n        (\"model\", LogisticRegression(max_iter=1000)),\n    ])\n    pipe.fit(X, labels)\n    joblib.dump(pipe, \"model.joblib\")\n    loaded = joblib.load(\"model.joblib\")\n    return int(loaded.predict([[query]])[0])\n",
    [{ args: [[1, 2, 3, 100, 200, 300], [0, 0, 0, 1, 1, 1], 250], expected: 1 },
     { args: [[1, 2, 3, 100, 200, 300], [0, 0, 0, 1, 1, 1], 2], expected: 0 },
     { args: [[0, 1, 50, 60], [0, 0, 1, 1], 55], expected: 1 }],
    ["`joblib.dump(pipe, \"model.joblib\")` writes it; `joblib.load(...)` reads it back.",
     "Predict on a 2-D input: `loaded.predict([[query]])`.",
     "`predict` returns an array — take `[0]` and wrap it in `int()`."],
    ["deploy", "sklearn", "joblib", "serialisation"]),
];

export { deployProblems };
