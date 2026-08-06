// Server-side re-run of a submitted solution.
//
// Grading in the browser is what makes the practice editor feel instant, and
// that shouldn't change. But a browser's verdict can't be *trusted* — it's the
// student's own machine, and the old submit route simply believed it. So the
// browser still decides what to show you as you iterate, and this decides
// whether any XP moves.
//
// Both runtimes are already vendored for the client (public/pyodide,
// public/sqljs) and both run in Node, so this costs nothing but time — no
// service, no API key, no bill. It runs once per problem per student, on a
// claimed first solve.

import path from "node:path";
import { readFile } from "node:fs/promises";

type ProblemLike = {
  kind: string;
  functionName: string;
  testsJson: string;
  solutionCode: string;
  sqlSetup: string;
};

export type VerifyResult = { passed: boolean; reason?: string };

/** Last meaningful line of an error. A Python traceback ends with a newline, so
 *  a plain .pop() on the split hands back an empty string — which is how this
 *  verifier spent its first run reporting "Error on the server: " and nothing else. */
function lastLine(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e);
  const lines = String(msg).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return lines[lines.length - 1] || String(e);
}

const PYODIDE_DIR = path.join(process.cwd(), "public", "pyodide");
const SQLJS_DIR = path.join(process.cwd(), "public", "sqljs");

// Loading Pyodide costs ~2s, and pandas another ~11s on top. Hold both for the
// life of the process so only the first verifier on a cold server pays it.
/* eslint-disable @typescript-eslint/no-explicit-any */
let pyPromise: Promise<any> | null = null;

// Set by getPy(), used by runGuarded() to stop a submission that never ends.
let interruptBuffer: Uint8Array | null = null;

/** How long one piece of submitted code may run before it is interrupted. A real
 *  solution to any problem here finishes in milliseconds; anything near this is
 *  either an infinite loop or an attack. */
const RUN_TIMEOUT_MS = 5000;

async function getPy(): Promise<any> {
  if (!pyPromise) {
    pyPromise = (async () => {
      const { loadPyodide } = await import("pyodide");
      // Point at our own wheel copy, the same one the browser uses — otherwise
      // loadPackage reaches for a CDN, and a verifier that needs the network to
      // agree you solved a loop problem is a verifier that fails offline.
      const py = await loadPyodide({
        indexURL: PYODIDE_DIR + path.sep,
        // THE reason this line exists: Pyodide's default for jsglobals is
        // `globalThis`, so `import js` inside a *submitted solution* would reach
        // the Node process — `js.process.env.AUTH_SECRET` and DATABASE_URL came
        // back in a canary test on 2026-07-29. In the browser that default is
        // harmless (it's the student's own tab); on the server it hands out the
        // session-signing key. An empty object keeps the `js` module importable
        // (so code that touches it fails with AttributeError, not a crash) while
        // reaching nothing.
        jsglobals: {},
      });
      // A dedicated byte the run guard flips to raise KeyboardInterrupt inside
      // Python. Must be installed once, on the interpreter, not per run.
      interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
      py.setInterruptBuffer(interruptBuffer);
      return py;
    })();
  }
  return pyPromise;
}

// The watchdog has to live on another thread, and that is not over-engineering.
//
// The obvious version — setTimeout(() => interruptBuffer[0] = 2, 5000) — cannot
// work: Python runs as synchronous WASM on this very thread, so a submission
// that loops forever blocks the event loop and the timer never fires. (Tried it
// first; the test process hung for ten minutes.) A worker thread keeps its own
// loop running and writes into memory *shared* with this one, so it can flip the
// interrupt byte while this thread is pinned.
const WATCHDOG_SRC = `
const { parentPort, workerData } = require("node:worker_threads");
const done = new Int32Array(workerData.done);
const interrupt = new Uint8Array(workerData.interrupt);
parentPort.on("message", (ms) => {
  // Sleeps until either the deadline passes or the main thread stores 1 and
  // notifies (the run finished on its own).
  if (Atomics.wait(done, 0, 0, ms) === "timed-out") interrupt[0] = 2;
});
`;

let watchdog: { worker: import("node:worker_threads").Worker; done: Int32Array } | null = null;

async function getWatchdog(interrupt: Uint8Array) {
  if (!watchdog) {
    const { Worker } = await import("node:worker_threads");
    const done = new Int32Array(new SharedArrayBuffer(4));
    const worker = new Worker(WATCHDOG_SRC, {
      eval: true,
      workerData: { done: done.buffer, interrupt: interrupt.buffer },
    });
    // Never hold the process open for the sake of the watchdog.
    worker.unref();
    watchdog = { worker, done };
  }
  return watchdog;
}

/** Run one piece of submitted Python with a hard time limit.
 *
 *  Without this, `while True: pass` pins the runtime and the function stops
 *  answering every other student until the platform kills it. Pyodide checks the
 *  interrupt byte between bytecodes, so setting it to 2 (SIGINT) raises
 *  KeyboardInterrupt inside the student's code. */
async function runGuarded<T>(fn: () => Promise<T>): Promise<T> {
  if (!interruptBuffer) return fn();
  interruptBuffer[0] = 0;
  const wd = await getWatchdog(interruptBuffer);
  Atomics.store(wd.done, 0, 0);
  wd.worker.postMessage(RUN_TIMEOUT_MS);
  try {
    return await fn();
  } finally {
    // Wake the watchdog early so it doesn't interrupt the *next* submission.
    Atomics.store(wd.done, 0, 1);
    Atomics.notify(wd.done, 0);
    interruptBuffer[0] = 0;
  }
}

/** Mirror the browser runner's comparison exactly, or the two disagree and the
 *  student gets no XP for a solution their screen just called correct. */
function eq(a: unknown, b: unknown): boolean {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return a === b; }
}

/** The watchdog stops a run by raising KeyboardInterrupt. Reporting that verbatim
 *  would tell a student their loop problem failed with a keyboard error. */
const TIMEOUT_REASON =
  "Your code ran too long on the server (over 5 seconds) — check for a loop that never ends.";

function isTimeout(e: unknown): boolean {
  const s = `${(e as { type?: string })?.type ?? ""} ${(e as { message?: string })?.message ?? ""}`;
  return s.includes("KeyboardInterrupt");
}

/** dict_converter for the same reason as in lib/pyodide-runner.ts: without it a
 *  dict answer arrives as a Map, stringifies to "{}", and the server refuses a
 *  solution the browser just accepted. Keep the three copies identical. */
function toJs(v: any): unknown {
  if (v && typeof v.toJs === "function") {
    const j = v.toJs({ dict_converter: Object.fromEntries });
    try { v.destroy?.(); } catch {}
    return j;
  }
  return v;
}

async function verifyPython(problem: ProblemLike, code: string): Promise<VerifyResult> {
  let tests: { args: unknown[]; expected: unknown }[];
  try {
    tests = JSON.parse(problem.testsJson || "[]");
  } catch {
    return { passed: false, reason: "This problem's tests could not be read." };
  }
  if (tests.length === 0 || !problem.functionName) {
    // Nothing to check against — don't hand out XP for a problem that can't be
    // graded, and don't pretend it was verified either.
    return { passed: false, reason: "This problem has no test cases." };
  }

  const py = await getPy();
  py.setStdout({ batched: () => {} });
  py.setStderr({ batched: () => {} });

  // Every submission runs in its own empty namespace.
  //
  // The interpreter is cached for the life of the process, so without this a
  // submission inherits whatever the last one defined — and the last one was
  // some other student. Confirmed against the running server: A solved
  // make-greeting honestly, B submitted the single line `# lol`, and B was paid
  // 20 XP because A's `greet` was still sitting in globals. Reusing the runtime
  // is fine; reusing its globals is the whole hole this file exists to close.
  const ns = py.globals.get("dict")();
  try {
    try {
      try { await py.loadPackagesFromImports(code); } catch {}
      // Deliberately the SYNCHRONOUS runner. runPythonAsync drives the code from
      // a setImmediate callback, so a KeyboardInterrupt from the watchdog is
      // thrown *outside* this promise chain — it escaped every catch here and
      // took the whole process down with it (seen on 2026-07-29). runPython
      // throws on this stack, where it can be caught and turned into a message.
      // Packages are already loaded above, so nothing here needs top-level await.
      await runGuarded(async () => py.runPython(code, { globals: ns }));
    } catch (e: any) {
      if (isTimeout(e)) return { passed: false, reason: TIMEOUT_REASON };
      return { passed: false, reason: `The code did not run on the server: ${lastLine(e)}` };
    }

    for (const t of tests) {
      try {
        ns.set("__dq_args_json", JSON.stringify(t.args));
        const raw = await runGuarded(async () =>
          py.runPython(
            `import json as __json\n${problem.functionName}(*__json.loads(__dq_args_json))`,
            { globals: ns }
          )
        );
        if (!eq(toJs(raw), t.expected)) {
          return { passed: false, reason: "Re-run on the server: not every test passed." };
        }
      } catch (e: any) {
        // Say what actually went wrong. A bare "error aaya" is unfalsifiable: the
        // student can't tell a bug in their code from a bug in this verifier, and
        // neither can we.
        if (isTimeout(e)) return { passed: false, reason: TIMEOUT_REASON };
        return { passed: false, reason: `Error on the server: ${lastLine(e)}` };
      }
    }
    return { passed: true };
  } finally {
    try { ns.destroy(); } catch {}
  }
}

async function verifySql(problem: ProblemLike, code: string): Promise<VerifyResult> {
  if (!problem.solutionCode?.trim()) {
    return { passed: false, reason: "This problem has no reference query." };
  }

  const initSqlJs = (await import("sql.js")).default;
  const wasmBinary = await readFile(path.join(SQLJS_DIR, "sql-wasm.wasm"));
  const SQL = await initSqlJs({ wasmBinary });

  // Same rule as the browser: grade by diffing result sets against the reference
  // query on an identical fresh database, so any correct query passes rather
  // than one blessed spelling.
  const run = (sql: string) => {
    const db = new SQL.Database();
    try {
      if (problem.sqlSetup?.trim()) db.run(problem.sqlSetup);
      const res = db.exec(sql);
      return res.length ? { columns: res[0].columns, values: res[0].values } : { columns: [], values: [] };
    } finally {
      db.close();
    }
  };

  let mine: { columns: string[]; values: unknown[][] };
  let ref: { columns: string[]; values: unknown[][] };
  try {
    mine = run(code);
  } catch (e: any) {
    return { passed: false, reason: `The query did not run on the server: ${String(e?.message || e)}` };
  }
  try {
    ref = run(problem.solutionCode);
  } catch {
    return { passed: false, reason: "This problem's own reference query is broken." };
  }

  const norm = (rows: unknown[][], ordered: boolean) => {
    const fixed = rows.map((r) =>
      r.map((c) => (typeof c === "number" ? Math.round(c * 1e6) / 1e6 : c))
    );
    const asText = fixed.map((r) => JSON.stringify(r));
    // Row order only matters when the reference asked for it.
    return ordered ? asText : [...asText].sort();
  };

  const ordered = /order\s+by/i.test(problem.solutionCode);
  if (mine.values.length !== ref.values.length) {
    return { passed: false, reason: "The result rows did not match on the server." };
  }
  const a = norm(mine.values, ordered);
  const b = norm(ref.values, ordered);
  if (a.join("|") !== b.join("|")) {
    return { passed: false, reason: "The result did not match on the server." };
  }
  return { passed: true };
}

/** 8085 assembly. Cheapest of the three by a wide margin — no WASM to load, no
 *  subprocess: the simulator is a few hundred lines of TypeScript that both the
 *  browser and this run directly, so student and server literally share the
 *  grader (lib/asm8085.ts `grade`). There is nothing here for the two to disagree
 *  about, which is the failure mode the other two verifiers work hard to avoid.
 *
 *  It also needs no sandboxing. Submitted assembly cannot reach the filesystem or
 *  the environment because the simulated machine has neither — the whole world it
 *  can touch is a 64 KB Uint8Array. */
async function verifyAsm8085(problem: ProblemLike, code: string): Promise<VerifyResult> {
  if (!problem.solutionCode?.trim()) {
    return { passed: false, reason: "This problem has no reference program." };
  }
  let tests: unknown[];
  try {
    tests = JSON.parse(problem.testsJson || "[]");
  } catch {
    return { passed: false, reason: "This problem's tests could not be read." };
  }
  if (!Array.isArray(tests) || tests.length === 0) {
    return { passed: false, reason: "This problem has no test cases." };
  }

  const { grade } = await import("./asm8085");
  const r = grade(code, problem.solutionCode, tests as Parameters<typeof grade>[2]);
  if (r.referenceBroken) {
    return { passed: false, reason: "This problem's own reference program is broken." };
  }
  if (!r.compiled) {
    return { passed: false, reason: `The program did not assemble: ${r.error}` };
  }
  if (r.passed !== r.total) {
    return { passed: false, reason: "Re-run on the server: not every test passed." };
  }
  return { passed: true };
}

/* HTML, re-graded on the server.
 *
 * The workbench already ran these checks in the browser, and that verdict is
 * worth exactly nothing here — a POST of {problemId, passed:true} with no
 * markup at all would otherwise buy the XP, which is the hole this whole file
 * exists to close for every other language.
 *
 * linkedom rather than a headless browser: nothing about these assertions needs
 * layout, styles or scripts, only the parsed tree. It is a devDependency-sized
 * parser doing a devDependency-sized job.
 */
async function verifyHtml(problem: ProblemLike, code: string): Promise<VerifyResult> {
  let tests: unknown;
  try {
    tests = JSON.parse(problem.testsJson || "[]");
  } catch {
    return { passed: false, reason: "This problem's tests could not be read." };
  }

  const { validateHtmlTests, gradeHtml } = await import("./html-check");
  const bad = validateHtmlTests(tests);
  if (bad) return { passed: false, reason: `This problem's tests are malformed: ${bad}` };

  const { parseHTML } = await import("linkedom");

  // The reference answer is graded first. If it cannot pass its own checks the
  // problem is broken, and telling the student they failed would be a lie.
  if (problem.solutionCode?.trim()) {
    const ref = gradeHtml(parseHTML(problem.solutionCode).document, tests as never);
    if (ref.passed !== ref.total) {
      return { passed: false, reason: "This problem's own reference answer does not pass its checks." };
    }
  }

  const r = gradeHtml(parseHTML(code).document, tests as never);
  if (r.passed !== r.total) {
    const missed = r.results.filter((x) => !x.pass).map((x) => x.says);
    return { passed: false, reason: `Re-checked on the server and this did not pass: ${missed.join("; ")}` };
  }
  return { passed: true };
}

export async function verifySolution(problem: ProblemLike, code: string): Promise<VerifyResult> {
  if (!code.trim()) return { passed: false, reason: "No code was submitted." };
  try {
    if (problem.kind === "sql") return await verifySql(problem, code);
    if (problem.kind === "html") return await verifyHtml(problem, code);
    if (problem.kind === "asm8085") return await verifyAsm8085(problem, code);
    return await verifyPython(problem, code);
  } catch (e: any) {
    // A broken verifier must not hand out XP — but it also shouldn't look like
    // the student's fault.
    return { passed: false, reason: `The server could not verify this: ${lastLine(e)}` };
  }
}
