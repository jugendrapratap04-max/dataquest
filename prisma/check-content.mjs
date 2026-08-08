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

import { prisma, via } from "./db.mjs";
console.log(`db: ${via}`);
import { loadPyodide } from "pyodide";
import initSqlJs from "sql.js";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { readSchema } from "../lib/sql-schema.ts";


// Mirror lib/pyodide-runner.ts and lib/verify.ts exactly. JSON.stringify makes
// 45.0 == 45, which is the comparison the real grader uses — a stricter one here
// would report failures students never see.
const eq = (a, b) => { try { return JSON.stringify(a) === JSON.stringify(b); } catch { return a === b; } };
// dict_converter, for the same reason as lib/pyodide-runner.ts: the default hands
// back a Map, which stringifies to "{}", so a dict answer would fail here while
// passing in the browser. Keep the three copies identical.
const toJs = (v) => {
  if (v && typeof v.toJs === "function") { const j = v.toJs({ dict_converter: Object.fromEntries }); try { v.destroy?.(); } catch {} return j; }
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
  // starterCode is selected for the HTML check below, which compares it against
  // the reference. Without it that comparison silently graded an empty string,
  // so a starter that already solved the problem would always have looked fine.
  select: { slug: true, kind: true, functionName: true, solutionCode: true, testsJson: true, sqlSetup: true, starterCode: true },
});
const sqlProblems = problems.filter((p) => p.kind === "sql");
const pyProblems = problems.filter((p) => p.kind === "python");
const asmProblems = problems.filter((p) => p.kind === "asm8085");
const htmlProblems = problems.filter((p) => p.kind === "html");

/* HTML: the reference answer must pass its own checks, and the starter must NOT.
 *
 * The second half is the one that matters and the one nothing else would catch.
 * A DOM assertion cannot see crossed nesting or a missing closing tag — the
 * parser repairs both before grading — so an exercise built around tidying up
 * markup grades as already-solved, and the student is told "correct" without
 * having done anything. That exact problem was written and only caught because
 * this comparison was run by hand; running it here means the next one cannot
 * ship.
 */
if (htmlProblems.length) {
  const { parseHTML } = await import("linkedom");
  const { gradeHtml, validateHtmlTests } = await import("../lib/html-check.ts");
  for (const p of htmlProblems) {
    let tests;
    try { tests = JSON.parse(p.testsJson || "[]"); }
    catch { fails.push(`[html] ${p.slug}: testsJson is not valid JSON`); continue; }

    const shape = validateHtmlTests(tests);
    if (shape) { fails.push(`[html] ${p.slug}: ${shape}`); continue; }
    if (!p.solutionCode?.trim()) { fails.push(`[html] ${p.slug}: no reference answer`); continue; }

    const ref = gradeHtml(parseHTML(p.solutionCode).document, tests);
    if (ref.passed !== ref.total) {
      const missed = ref.results.filter((r) => !r.pass).map((r) => `${r.says} (${r.detail})`);
      fails.push(`[html] ${p.slug}: reference fails its own checks ${ref.passed}/${ref.total} — ${missed.join("; ")}`);
      continue;
    }
    const start = gradeHtml(parseHTML(p.starterCode || "").document, tests);
    if (start.passed === start.total) {
      fails.push(`[html] ${p.slug}: the STARTER code already passes ${start.total}/${start.total} — there is nothing to solve`);
    }
  }
}

// 8085: the reference program must assemble, run, and — this is the part worth
// checking — actually SATISFY its own tests. Grading diffs a student's answer
// against the reference, so a reference that crashes or that leaves the checked
// state untouched makes the problem unsolvable in a way nothing else would catch.
if (asmProblems.length) {
  const { grade } = await import("../lib/asm8085.ts");
  for (const p of asmProblems) {
    let tests;
    try { tests = JSON.parse(p.testsJson || "[]"); }
    catch { fails.push(`[asm8085] ${p.slug}: testsJson is not valid JSON`); continue; }
    if (!Array.isArray(tests) || !tests.length) { fails.push(`[asm8085] ${p.slug}: no test cases`); continue; }
    if (!tests.every((t) => Array.isArray(t.check) && t.check.length)) {
      fails.push(`[asm8085] ${p.slug}: every test needs a non-empty "check" list saying what to compare`);
      continue;
    }
    if (!p.solutionCode?.trim()) { fails.push(`[asm8085] ${p.slug}: no reference program`); continue; }
    const r = grade(p.solutionCode, p.solutionCode, tests);
    if (r.referenceBroken) { fails.push(`[asm8085] ${p.slug}: reference does not run — ${r.referenceBroken}`); continue; }
    if (!r.compiled) { fails.push(`[asm8085] ${p.slug}: reference does not assemble — ${r.error}`); continue; }
    if (r.passed !== r.total) { fails.push(`[asm8085] ${p.slug}: reference fails its own tests (${r.passed}/${r.total})`); continue; }
    // A test whose checked state is ALL ZEROS would pass for an empty program, so
    // it is not testing anything. Usually it means the check names the wrong
    // register.
    //
    // Pull out only the VALUES — everything after each "=" — because the names
    // beside them contain hex letters of their own. The first version of this
    // guard compared the whole string and could therefore never fire: "CY=1"
    // survives having [1-9A-F] stripped as "Y=", which is never equal to itself.
    for (const [i, t] of tests.entries()) {
      const c = r.cases[i];
      if (!c || !c.want) continue;
      // Strip the NAMES (everything up to each "="), keep the values. Matching the
      // values directly does not work: a value pattern loose enough to cover the
      // memory-range form "[2050..2054]=10 20 30" also swallows the first letters
      // of the next name, so "A=00 Z=0 CY=0" came out holding a "C" and escaped.
      const values = c.want.replace(/[A-Z0-9_.:[\]]+=/g, "").replace(/\s/g, "");
      if (values && /^0+$/.test(values)) {
        fails.push(`[asm8085] ${p.slug}: test ${i + 1} checks ${JSON.stringify(t.check)} and the reference leaves it all zero — an empty program would pass`);
      }
    }
  }
}

// SQL: diffing the reference against itself is tautological, so check what can
// actually break — the setup runs, the query runs, and it returns something.
const SQL = await initSqlJs({ wasmBinary: await readFile(path.join(process.cwd(), "public", "sqljs", "sql-wasm.wasm")) });
for (const p of sqlProblems) {
  const db = new SQL.Database();
  try {
    if (p.sqlSetup?.trim()) db.run(p.sqlSetup);
    const res = db.exec(p.solutionCode);
    if (!(res.length && res[0].values.length)) fails.push(`[sql] ${p.slug}: reference query returns ZERO rows`);

    // The workbench shows students a table/column panel parsed out of the setup
    // SQL with a regex (lib/sql-schema.ts). Check it against what SQLite itself
    // reports, so a setup that outgrows the parser fails here instead of quietly
    // showing the wrong columns.
    if (p.sqlSetup?.trim()) {
      const tRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
      const realTables = tRes.length ? tRes[0].values.map((r) => String(r[0])) : [];
      const parsed = Object.fromEntries(readSchema(p.sqlSetup).map((t) => [t.name, t.cols.map((c) => c.split(" ")[0])]));
      const parsedTables = Object.keys(parsed).sort();
      if (JSON.stringify(realTables) !== JSON.stringify(parsedTables)) {
        fails.push(`[sql] ${p.slug}: schema panel lists tables ${JSON.stringify(parsedTables)}, SQLite has ${JSON.stringify(realTables)}`);
      } else {
        for (const t of realTables) {
          const cRes = db.exec(`PRAGMA table_info(${t})`);
          const realCols = cRes.length ? cRes[0].values.map((r) => String(r[1])) : [];
          if (JSON.stringify(realCols) !== JSON.stringify(parsed[t])) {
            fails.push(`[sql] ${p.slug}: schema panel shows ${t}(${parsed[t]}), SQLite has ${t}(${realCols})`);
          }
        }
      }
    }
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
  quiz: ["items[].options[]"],
  // drills: items[].code goes through highlightPython (like code.code), so it is
  // markup by the time it renders — only the plain-text output line is checked.
  drills: ["items[].out"],
  worked: ["title", "steps[].label", "output"],
  faded: ["blanks[].answer", "output"],
  trace: ["steps[].answer"],
  debug: ["symptom"],
};
const HTML = {
  objectives: ["items[]"], hook: ["q", "why"], think: ["q", "a"], def: ["hi"], analogy: ["html"],
  mistakes: ["items[].why"], interview: ["items[].q", "items[].a"],
  p: ["html"], psoft: ["html"], note: ["html"], recap: ["items[]"], memsetup: ["note"],
  quiz: ["items[].q", "items[].why"],
  drills: ["intro", "items[].task"],
  worked: ["goal", "steps[].why"],
  faded: ["intro", "blanks[].why"],
  trace: ["intro", "steps[].q", "steps[].why"],
  debug: ["intro", "q", "why"],
};
// Resolves a field spec against a block. Supports "field", "arr[]",
// "arr[].field" and one extra level of nesting, "arr[].field[]" — the array is
// named in the spec, so blocks that use `steps`/`blanks` instead of `items`
// work without a special case each.
const pick = (obj, spec) => {
  const m = spec.match(/^(\w+)\[\](?:\.(.+))?$/);
  if (!m) return [[spec, obj[spec]]];
  const [, arr, rest] = m;
  const list = obj[arr] ?? [];
  if (!rest) return list.map((it, i) => [`${arr}[${i}]`, it]);
  const nested = rest.match(/^(\w+)\[\]$/);
  if (nested) {
    const out = [];
    list.forEach((it, i) => (it?.[nested[1]] ?? []).forEach((o, j) => out.push([`${arr}[${i}].${nested[1]}[${j}]`, o])));
    return out;
  }
  return list.map((it, i) => [`${arr}[${i}].${rest}`, it?.[rest]]);
};
const TAG = /<\/?(code|b|i|strong|em|pre|br|span|p|ul|li|div)\b[^>]*>/i;

/* On the HTML course, markup inside a `mistakes` example IS the lesson.
 *
 * The check below exists because markup in a plain-text field usually means an
 * author expected it to render and it will not. `mistakes.bad` and `.fix` are
 * different: both renderers put them in `<pre>{value}</pre>`, so React escapes
 * them and the tags appear on screen exactly as written — which is the entire
 * point of showing a student `<p>My heading</p>` as the wrong way to write a
 * heading. Every other field, and every other track, is still checked.
 */
const MARKUP_IS_THE_CONTENT = { html: new Set(["mistakes.items[].bad", "mistakes.items[].fix"]) };

const lessons = await prisma.lesson.findMany({
  select: { slug: true, contentJson: true, track: { select: { slug: true } } },
  orderBy: { order: "asc" },
});
let blocks = 0;
for (const L of lessons) {
  let content;
  try { content = JSON.parse(L.contentJson || "[]"); } catch { fails.push(`[lesson] ${L.slug}: contentJson is not valid JSON`); continue; }
  for (const b of content) {
    blocks++;
    const exempt = MARKUP_IS_THE_CONTENT[L.track?.slug];
    for (const spec of PLAIN[b.t] ?? []) for (const [where, v] of pick(b, spec)) {
      if (exempt?.has(`${b.t}.${spec}`)) continue;
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

// ------------------------------------------------- quiz answer positions ---
// A quiz is only a check on understanding if the answer's POSITION carries no
// information. This was 78 of 102 answers at option B and none ever at D, so
// "always pick B" scored 76% platform-wide without reading a word. Guarding it
// here because the bias creeps back one hand-written question at a time.
const seen = [0, 0, 0, 0];
let quizQs = 0;
for (const L of lessons) {
  let content;
  try { content = JSON.parse(L.contentJson || "[]"); } catch { continue; }
  for (const b of content) {
    if (b.t !== "quiz" || !Array.isArray(b.items)) continue;
    const d = [0, 0, 0, 0];
    for (const q of b.items) {
      if (!Array.isArray(q.options) || typeof q.correct !== "number") continue;
      if (q.correct < 0 || q.correct >= q.options.length)
        fails.push(`[quiz] ${L.slug}: correct index ${q.correct} is outside its ${q.options.length} options`);
      if (new Set(q.options).size !== q.options.length)
        fails.push(`[quiz] ${L.slug}: duplicate option text in "${String(q.q).slice(0, 40)}"`);
      d[q.correct]++; seen[q.correct]++; quizQs++;
    }
    const n = b.items.length;
    const top = Math.max(...d);
    if (n >= 4 && top / n > 0.5)
      fails.push(`[quiz] ${L.slug}: ${top}/${n} answers sit at option ${"ABCD"[d.indexOf(top)]} (${JSON.stringify(d)}) — a student can score by always picking it. Spread the answers across A/B/C/D.`);
  }
}
if (quizQs >= 40) seen.forEach((c, i) => {
  if (c === 0) fails.push(`[quiz] option ${"ABCD"[i]} is never the correct answer in any quiz (${quizQs} questions) — students notice.`);
});

// ------------------------------------------------------------------ report ---
// Counted per kind and summed, so a kind nobody added to this line shows up as
// a total that does not add up rather than as silence.
console.log(`problems: ${problems.length} (${pyProblems.length} python, ${sqlProblems.length} sql, ${asmProblems.length} asm8085, ${htmlProblems.length} html)`);
/* ------------------------------------------------------------------- XP ---
 * No account may hold XP it did not earn.
 *
 * XP is paid in /api/submit — problem.xp, once, on the first passing
 * submission. Nowhere else: finishing a lesson deliberately pays none, so that
 * this invariant stays enforceable and so that a self-declared "I read it"
 * cannot mint the number the leaderboard ranks on (app/api/progress/route.ts
 * carries the reasoning). Anything above that sum was put there by hand, and six seeded
 * demo accounts held 16,080 XP between them against zero submissions for
 * months. It was visible the whole time and nothing was looking: the profile
 * page showed "Level 9" beside "0 problems solved, 0 of 25 badges", and the
 * leaderboard had already been fixed for the same accounts without anyone
 * noticing the number itself was the problem.
 *
 * Reported rather than corrected. A checker that quietly rewrites user rows is
 * a checker nobody can trust to only read. */
const accounts = await prisma.user.findMany({ select: { id: true, email: true, xp: true } });
for (const u of accounts) {
  if (u.xp === 0) continue;
  const passed = await prisma.submission.findMany({
    where: { userId: u.id, passed: true },
    select: { problem: { select: { xp: true } } },
    distinct: ["problemId"],
  });
  const earned = passed.reduce((n, s) => n + s.problem.xp, 0);
  if (u.xp > earned) {
    fails.push(`[xp] ${u.email}: holds ${u.xp} XP but has earned ${earned} across ${passed.length} solved problem(s)`);
  }
}

console.log(`lessons:  ${lessons.length} (${blocks} blocks)`);
console.log(`quizzes:  ${quizQs} questions, answers at ${JSON.stringify(seen)} across A/B/C/D`);
if (fails.length === 0) {
  console.log("\nAll content checks passed.");
} else {
  console.log(`\n${fails.length} PROBLEM(S):\n`);
  for (const f of fails) console.log("  " + f);
}
await prisma.$disconnect();
process.exit(fails.length ? 1 : 0);
