/* Prove scikit-learn actually runs in OUR Pyodide before any ML content is written.
 *
 * Vendoring the wheels and assuming they work is how you write six lessons
 * against a runtime that turns out to be missing something. This loads the same
 * folder the student's browser loads (public/pyodide) and runs the shapes the ML
 * track will actually need.
 *
 * Every snippet must be DETERMINISTIC — same output on every run, on every
 * machine — or it cannot be used in a lesson: verify:lesson and db:check both
 * compare against an exact expected string. Anything involving a split or an
 * iterative solver therefore pins random_state.
 *
 * Usage: npm run test:sklearn
 */
import { loadPyodide } from "pyodide";
import path from "node:path";

const CASES = [
  ["import + version shape", `
import sklearn, numpy, scipy
print(type(sklearn.__version__).__name__)
print(numpy.__version__.split(".")[0].isdigit())
`, "str\nTrue"],

  ["LinearRegression fits a clean line", `
import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[1], [2], [3], [4]])
y = np.array([2, 4, 6, 8])

model = LinearRegression().fit(X, y)
print(round(float(model.coef_[0]), 6))
print(round(float(model.intercept_), 6))
print([round(float(v), 6) for v in model.predict(np.array([[5], [10]]))])
`, "2.0\n0.0\n[10.0, 20.0]"],

  // NOTE for the ML lessons: assert the SIZE and the REPRODUCIBILITY, never
  // which rows landed in the test set. The exact indices for a given
  // random_state are an implementation detail of the sklearn/numpy version and
  // would silently break the lesson on an upgrade. (Found the hard way: this
  // case first claimed [1, 4, 8]; the real answer here is [1, 5, 8].)
  ["train_test_split is reproducible with random_state", `
import numpy as np
from sklearn.model_selection import train_test_split

X = np.arange(10).reshape(-1, 1)
y = np.arange(10)

Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=42)
print(len(Xtr), len(Xte))
print(sorted(list(ytr) + list(yte)) == list(range(10)))

again = train_test_split(X, y, test_size=0.3, random_state=42)[3]
print(list(again) == list(yte))
`, "7 3\nTrue\nTrue"],

  ["classifier + accuracy_score", `
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

X = np.array([[0], [1], [2], [3], [4], [5]])
y = np.array([0, 0, 0, 1, 1, 1])

clf = DecisionTreeClassifier(random_state=0).fit(X, y)
pred = clf.predict(X)
print([int(p) for p in pred])
print(round(float(accuracy_score(y, pred)), 6))
`, "[0, 0, 0, 1, 1, 1]\n1.0"],

  ["KMeans clusters, with n_init pinned", `
import numpy as np
from sklearn.cluster import KMeans

X = np.array([[1], [2], [10], [11]])
km = KMeans(n_clusters=2, random_state=0, n_init=10).fit(X)
labels = [int(l) for l in km.labels_]
print(labels[0] == labels[1], labels[2] == labels[3], labels[0] == labels[2])
print(sorted(round(float(c[0]), 6) for c in km.cluster_centers_))
`, "True True False\n[1.5, 10.5]"],

  ["scipy is present and usable", `
from scipy import stats
r = stats.pearsonr([1, 2, 3, 4], [2, 4, 6, 8])
print(round(float(r[0]), 6))
`, "1.0"],
];

const py = await loadPyodide({ indexURL: path.join(process.cwd(), "public", "pyodide") + path.sep });

let out = "";
py.setStdout({ batched: (s) => { out += s + "\n"; } });
py.setStderr({ batched: () => {} });

let pass = 0;
const fails = [];

for (const [label, code, expected] of CASES) {
  out = "";
  const started = Date.now();
  try {
    // loadPackagesFromImports narrates ("Loading numpy, scipy...") onto the same
    // stream the snippet prints to, so capture only across runPython. The app
    // silences it the same way — see lib/pyodide-runner.ts.
    py.setStdout({ batched: () => {} });
    await py.loadPackagesFromImports(code);
    py.setStdout({ batched: (s) => { out += s + "\n"; } });
    py.runPython(code);
    py.setStdout({ batched: () => {} });
  } catch (e) {
    const last = String(e?.message ?? e).split("\n").filter(Boolean).pop();
    fails.push(`${label}\n        crashed: ${last}`);
    continue;
  }
  const got = out.trim();
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  if (got !== expected) {
    fails.push(`${label}\n        expected: ${JSON.stringify(expected)}\n        got:      ${JSON.stringify(got)}`);
    continue;
  }
  pass++;
  console.log(`  ok   ${label.padEnd(46)} ${secs}s`);
}

console.log("");
for (const f of fails) console.log(` FAIL  ${f}`);
console.log(`\n${pass}/${CASES.length} scikit-learn checks passed in Pyodide.`);
if (fails.length) process.exit(1);
