// Loads Pyodide (Python compiled to WebAssembly) from our own /public copy and
// runs a user's function against test cases — entirely in the browser.

export type TestCase = { args: unknown[]; expected: unknown };
export type CaseResult = { pass: boolean; got: unknown; expected: unknown; args: unknown[]; error?: string };
export type RunResult = {
  compiled: boolean;
  error?: string;
  stdout: string;
  cases: CaseResult[];
  passed: number;
  total: number;
  /** A PNG data URI of the matplotlib figure the code left behind, if any. */
  figure?: string;
};

/** Hand back whatever matplotlib figure the run produced, as a PNG data URI.
 *
 *  A visualization problem is graded on values — bar heights, axis limits, the
 *  label it set — because that is what can be compared. But a student writing a
 *  chart and never seeing the chart is being taught to fly on instruments, so the
 *  figure comes back alongside the verdict.
 *
 *  Reads sys.modules rather than importing anything: on the 150 problems that
 *  have nothing to do with plotting this must cost nothing, and importing
 *  matplotlib to discover it was never wanted would cost seven megabytes.
 *
 *  It also closes every figure. pyplot keeps a module-level registry that
 *  outlives one run, so without the close a chart from the previous press of Run
 *  is still sitting there and gets reported as this run's output. */
const FIGURE_PROBE = `
def __dq_fig():
    import sys
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is None:
        return ""
    nums = plt.get_fignums()
    if not nums:
        return ""
    import base64, io
    buf = io.BytesIO()
    try:
        plt.figure(nums[-1]).savefig(buf, format="png", dpi=96, bbox_inches="tight", facecolor="white")
    except Exception:
        return ""
    finally:
        plt.close("all")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")

__dq_fig()
`;


/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { loadPyodide?: (opts: { indexURL: string }) => Promise<any>; }
}

let pyPromise: Promise<any> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-pyodide]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.setAttribute("data-pyodide", "1");
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Python could not load"));
    document.head.appendChild(s);
  });
}

export function getPyodide(): Promise<any> {
  if (!pyPromise) {
    pyPromise = (async () => {
      if (!window.loadPyodide) await loadScript("/pyodide/pyodide.js");
      return window.loadPyodide!({ indexURL: "/pyodide/" });
    })();
  }
  return pyPromise;
}

function eq(a: unknown, b: unknown): boolean {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return a === b; }
}

/** Pyodide's default turns a Python dict into a JS **Map**, and
 *  `JSON.stringify(new Map([["a", 1]]))` is `"{}"` — so a problem whose answer is
 *  a dict would compare an empty object against the expected one and fail every
 *  test no matter what the student wrote. `dict_converter` gives a plain object
 *  instead. The same three lines exist in lib/verify.ts and
 *  prisma/check-content.mjs and all three have to agree, or the browser, the
 *  server and the content check disagree about whether an answer is correct. */
function toJs(v: any): unknown {
  if (v && typeof v.toJs === "function") {
    const j = v.toJs({ dict_converter: Object.fromEntries });
    try { v.destroy?.(); } catch {}
    return j;
  }
  return v;
}

/** A Python traceback ends in a newline, so splitting on newlines leaves an
 *  empty last element. These two both drop it — without that, the line a
 *  beginner most needs ("ZeroDivisionError: division by zero") came back as an
 *  empty string, and the UI, seeing a falsy error, reported the crash as if the
 *  function had simply returned the wrong value. */
function errLines(e: any): string[] {
  const msg = e?.message ?? String(e);
  return String(msg).split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim() !== "");
}

/** Last meaningful line — the actual exception, without the traceback plumbing. */
function errLast(e: any): string {
  const lines = errLines(e);
  return lines[lines.length - 1] || String(e?.message ?? e) || "Python error";
}

/** Last few lines — enough context for a syntax/compile failure. */
function errTail(e: any, n = 4): string {
  const lines = errLines(e);
  return lines.slice(-n).join("\n") || String(e?.message ?? e) || "Python error";
}

/** Runs FIGURE_PROBE in a namespace of its own, so the probe's own name does not
 *  end up in the student's globals. */
async function captureFigure(py: any): Promise<string | undefined> {
  const probe = py.globals.get("dict")();
  try {
    const uri = await py.runPythonAsync(FIGURE_PROBE, { globals: probe });
    return typeof uri === "string" && uri.length > 0 ? uri : undefined;
  } catch {
    return undefined;
  } finally {
    try { probe.destroy(); } catch {}
  }
}

/** Run raw Python and return captured stdout, for a console with no test cases. */
export async function runPython(code: string): Promise<{ stdout: string; error?: string }> {
  const py = await getPyodide();
  let stdout = "";
  py.setStdout({ batched: (s: string) => { stdout += s + "\n"; } });
  py.setStderr({ batched: (s: string) => { stdout += s + "\n"; } });
  try {
    try { await py.loadPackagesFromImports(code); } catch {}
    await py.runPythonAsync(code);
    return { stdout };
  } catch (e: any) {
    return { stdout, error: errTail(e) };
  }
}

/** Same, plus the figure it drew — for a console that has somewhere to show one. */
export async function runPythonWithFigure(code: string): Promise<{ stdout: string; error?: string; figure?: string }> {
  const r = await runPython(code);
  return { ...r, figure: await captureFigure(await getPyodide()) };
}

/** Define the user's code, then call `functionName` for every test case. */
export async function runTests(
  userCode: string,
  functionName: string,
  tests: TestCase[]
): Promise<RunResult> {
  const py = await getPyodide();
  let stdout = "";
  py.setStdout({ batched: (s: string) => { stdout += s + "\n"; } });
  py.setStderr({ batched: (s: string) => { stdout += s + "\n"; } });

  // Each run gets an empty namespace. The interpreter is cached for the whole
  // tab, so otherwise a run inherits every function defined by the runs before
  // it: clear the editor after solving, press Run, and the leftover function
  // answers the tests — "All test cases passed" on an empty file.
  const ns = py.globals.get("dict")();
  try {
    try {
      try { await py.loadPackagesFromImports(userCode); } catch {}
      await py.runPythonAsync(userCode, { globals: ns });
    } catch (e: any) {
      return {
        compiled: false,
        error: errTail(e),
        stdout, cases: [], passed: 0, total: tests.length,
      };
    }

    const cases: CaseResult[] = [];
    let passed = 0;

    for (const t of tests) {
      let got: unknown;
      let error: string | undefined;
      try {
        // Pass args as JSON and rebuild them in Python — reliable for dicts/lists/numbers.
        ns.set("__dq_args_json", JSON.stringify(t.args));
        const raw = await py.runPythonAsync(
          `import json as __json\n${functionName}(*__json.loads(__dq_args_json))`,
          { globals: ns }
        );
        got = toJs(raw);
      } catch (e: any) {
        error = errLast(e);
      }
      const pass = !error && eq(got, t.expected);
      if (pass) passed++;
      cases.push({ pass, got, expected: t.expected, args: t.args, error });
    }

    // After the cases, not before: on a plotting problem the figure is built
    // inside the function, so there is nothing to capture until it has been called.
    return { compiled: true, stdout, cases, passed, total: tests.length, figure: await captureFigure(py) };
  } finally {
    try { ns.destroy(); } catch {}
  }
}
