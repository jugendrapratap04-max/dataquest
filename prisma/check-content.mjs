// npm run db:check — does the content actually work?
//
// Two questions, both of which have to hold for every problem and lesson in the
// database, and neither of which is visible by reading the JSON:
//
//   1. Does each problem's own reference solution pass its own tests? If it
//      doesn't, that problem is unsolvable — the student writes a correct answer,
//      the checker says no, and they conclude they can't code. Now that the
//      server verifies submissions with this same runtime, a reference that
//      disagrees with itself means nobody can ever be paid for that problem.
//
//   2. Does every lesson render legibly? Markup in a field the page prints as
//      plain text shows the student a literal "<code>x = 5</code>", and a
//      multi-line snippet inside <code> collapses to one line. Both look fine in
//      the source and only fail on screen. Both have shipped here before.
//
// Content arrives in batches, so this runs against whatever is in the database
// rather than a fixture — a check that can't see the real content isn't a check.

import { PrismaClient } from "@prisma/client";
import { loadPyodide } from "pyodide";
import initSqlJs from "sql.js";
import path from "node:path";
import { readFile } from "node:fs/promises";

const prisma = new PrismaClient();

// Mirror lib/pyodide-runner.ts and lib/verify.ts exactly. JSON.stringify makes
// 45.0 == 45, which is the comparison the real grader uses — a stricter one here
// would report failures students never see.
const eq = (a, b) => { try { return JSON.stringify(a) === JSON.stringify(b); } catch { return a === b; } };
const toJs = (v) => {
  if (v && typeof v.toJs === "function") { const j = v.toJs(); try { v.destroy?.(); } catch {} return j; }
  return v;
};
const lastLine = (e) => {
  const m = e?.message ?? String(e);
  const l = String(m).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  return l[l.length - 1] || String(e);
};

const fails = [];

// ---------------------------------------------------------------- problems ---
const problems = await prisma.problem.findMany({
  orderBy: [{ kind: "asc" }, { slug: "asc" }],
  select: { slug: true, kind: true, functionName: true, solutionCode: true, testsJson: true, sqlSetup: true },
});
const sqlProblems = problems.filter((p) => p.kind === "sql");
const pyProblems = problems.filter((p) => p.kind === "python");

// SQL: diffing the reference against itself is tautological, so check what can
// actually break — the setup runs, the query runs, and it returns something.
const SQL = await initSqlJs({ wasmBinary: await readFile(path.join(process.cwd(), "public", "sqljs", "sql-wasm.wasm")) });
for (const p of sqlProblems) {
  const db = new SQL.Database();
  try {
    if (p.sqlSetup?.trim()) db.run(p.sqlSetup);
    const res = db.exec(p.solutionCode);
    if (!(res.length && res[0].values.length)) fails.push(`[sql] ${p.slug}: reference query returns ZERO rows`);
  } catch (e) {
    fails.push(`[sql] ${p.slug}: ${lastLine(e)}`);
  } finally {
    db.close();
  }
}

const py = await loadPyodide({ indexURL: path.join(process.cwd(), "public", "pyodide") + path.sep });
py.setStdout({ batched: () => {} });
py.setStderr({ batched: () => {} });

for (const p of pyProblems) {
  let tests;
  try { tests = JSON.parse(p.testsJson || "[]"); } catch { fails.push(`[python] ${p.slug}: testsJson is not valid JSON`); continue; }
  if (!tests.length || !p.functionName) { fails.push(`[python] ${p.slug}: no tests or no functionName`); continue; }

  // Fresh namespace per problem, like the real runner — otherwise a problem can
  // be answered by a function the previous one left behind, and this file would
  // bless content it never checked.
  const ns = py.globals.get("dict")();
  try {
    try { await py.loadPackagesFromImports(p.solutionCode); } catch {}
    try { await py.runPythonAsync(p.solutionCode, { globals: ns }); }
    catch (e) { fails.push(`[python] ${p.slug}: reference doesn't run — ${lastLine(e)}`); continue; }

    for (const t of tests) {
      try {
        ns.set("__dq_args_json", JSON.stringify(t.args));
        const got = toJs(await py.runPythonAsync(
          `import json as __json\n${p.functionName}(*__json.loads(__dq_args_json))`, { globals: ns }));
        if (!eq(got, t.expected)) {
          fails.push(`[python] ${p.slug}: ${p.functionName}(${JSON.stringify(t.args).slice(1, -1)}) -> ${JSON.stringify(got)}, expected ${JSON.stringify(t.expected)}`);
          break;
        }
      } catch (e) {
        fails.push(`[python] ${p.slug}: ${p.functionName}(${JSON.stringify(t.args).slice(1, -1)}) threw — ${lastLine(e)}`);
        break;
      }
    }
  } finally { try { ns.destroy(); } catch {} }
}

// ----------------------------------------------------------------- lessons ---
// Keep these two maps in step with app/(app)/learn/[slug]/page.tsx. A field that
// moves from {b.x} to dangerouslySetInnerHTML (or back) has to move here too.
const PLAIN = {
  h2: ["text"], def: ["term", "en"], analogy: ["concept", "real"], code: ["file", "output"],
  mistakes: ["items[].bad", "items[].fix"], interview: ["items[].level"],
  dtypes: ["items[].tag", "items[].name", "items[].desc", "items[].ex"],
};
const HTML = {
  objectives: ["items[]"], hook: ["q", "why"], think: ["q", "a"], def: ["hi"], analogy: ["html"],
  mistakes: ["items[].why"], interview: ["items[].q", "items[].a"],
  p: ["html"], psoft: ["html"], note: ["html"], recap: ["items[]"],
};
const pick = (obj, spec) => {
  if (spec.startsWith("items[]")) {
    const rest = spec.slice("items[]".length).replace(/^\./, "");
    return (obj.items ?? []).map((it, i) => [`items[${i}]${rest ? "." + rest : ""}`, rest ? it?.[rest] : it]);
  }
  return [[spec, obj[spec]]];
};
const TAG = /<\/?(code|b|i|strong|em|pre|br|span|p|ul|li|div)\b[^>]*>/i;

const lessons = await prisma.lesson.findMany({ select: { slug: true, contentJson: true }, orderBy: { order: "asc" } });
let blocks = 0;
for (const L of lessons) {
  let content;
  try { content = JSON.parse(L.contentJson || "[]"); } catch { fails.push(`[lesson] ${L.slug}: contentJson is not valid JSON`); continue; }
  for (const b of content) {
    blocks++;
    for (const spec of PLAIN[b.t] ?? []) for (const [where, v] of pick(b, spec)) {
      if (typeof v === "string" && TAG.test(v))
        fails.push(`[lesson] ${L.slug}: markup in plain-text field ${b.t}.${where} would print literally — ${v.slice(0, 60)}`);
    }
    for (const spec of HTML[b.t] ?? []) for (const [where, v] of pick(b, spec)) {
      if (typeof v !== "string") continue;
      for (const m of v.matchAll(/<code>([\s\S]*?)<\/code>/gi)) {
        if (m[1].includes("\n"))
          fails.push(`[lesson] ${L.slug}: multi-line snippet inside <code> at ${b.t}.${where} collapses to one line — use <pre>`);
      }
    }
  }
}

// ------------------------------------------------------------------ report ---
console.log(`problems: ${problems.length} (${pyProblems.length} python, ${sqlProblems.length} sql)`);
console.log(`lessons:  ${lessons.length} (${blocks} blocks)`);
if (fails.length === 0) {
  console.log("\nAll content checks passed.");
} else {
  console.log(`\n${fails.length} PROBLEM(S):\n`);
  for (const f of fails) console.log("  " + f);
}
await prisma.$disconnect();
process.exit(fails.length ? 1 : 0);
