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
};

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
    s.onerror = () => reject(new Error("Pyodide load nahi ho paya"));
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

function toJs(v: any): unknown {
  if (v && typeof v.toJs === "function") {
    const j = v.toJs();
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

/** Run raw Python and return captured stdout (used by the free-play console). */
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

  try {
    try { await py.loadPackagesFromImports(userCode); } catch {}
    await py.runPythonAsync(userCode);
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
      py.globals.set("__dq_args_json", JSON.stringify(t.args));
      const raw = await py.runPythonAsync(
        `import json as __json\n${functionName}(*__json.loads(__dq_args_json))`
      );
      got = toJs(raw);
    } catch (e: any) {
      error = errLast(e);
    }
    const pass = !error && eq(got, t.expected);
    if (pass) passed++;
    cases.push({ pass, got, expected: t.expected, args: t.args, error });
  }

  return { compiled: true, stdout, cases, passed, total: tests.length };
}
