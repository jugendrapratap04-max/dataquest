/* Runs every checkable snippet of a lesson in real Python and diffs the actual
 * behaviour against what the content claims:
 *   code   -> output              worked -> full/output
 *   drills -> code/out            faded  -> blanks filled in must produce output
 *   trace  -> first N lines + print(var) must equal the claimed answer
 *   debug  -> broken code must raise the claimed symptom; the fix must run clean
 * Usage: npm run verify:lesson -- <track> <lesson-slug> */
import { trackLessons, lessonContent } from "./seed.mjs";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Marks where our own probe output begins, so a traced program is free to print.
const SENTINEL = "__TRACE_VALUE__";

const [track, slug] = process.argv.slice(2);
const found = (trackLessons[track] ?? []).find((l) => l.slug === slug);
if (!found) { console.error(`no lesson ${track}/${slug}`); process.exit(1); }

// Check what the STUDENT sees, not what the author typed. The quiz and the
// syntax section are merged in by lessonContent(), and reading `found.content`
// directly meant neither was ever verified — a syntax breakdown could name a
// part that was not in its form and nothing would say so.
const lesson = { ...found, content: lessonContent(found) };

// A SQL lesson is one carrying a `sqlsetup` block: the CREATE TABLE + INSERT
// its examples run against. Its snippets are queries, not Python, so they go to
// sql.js — the same engine the student's browser uses, so a claimed result here
// is a result they can reproduce.
//
// Without this the verifier fed "SELECT * FROM employees" to python and reported
// a SyntaxError, which meant the SQL track had no verification at all and its
// claimed outputs were nobody's word but the author's.
const sqlSetupBlock = lesson.content.find((b) => b.t === "sqlsetup");
let runSql = null;
if (sqlSetupBlock) {
  const initSqlJs = (await import("sql.js")).default;
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const SQL = await initSqlJs({
    wasmBinary: await readFile(path.join(process.cwd(), "public", "sqljs", "sql-wasm.wasm")),
  });
  // Rows as "a | b", header first. Deterministic and readable, so a lesson can
  // claim it verbatim — and NULL is spelled out rather than shown as a blank,
  // because a blank cell and an empty string are different answers.
  const fmt = (res) =>
    res
      .map((r) =>
        [r.columns.join(" | "), ...r.values.map((v) => v.map((x) => (x === null ? "NULL" : String(x))).join(" | "))].join("\n")
      )
      .join("\n\n");
  runSql = (code) => {
    // A fresh database per snippet. Examples must not depend on the order the
    // lesson happens to run them in.
    const db = new SQL.Database();
    try {
      db.run(sqlSetupBlock.sql);
      return { ok: true, out: fmt(db.exec(code)).trimEnd() };
    } catch (e) {
      return { ok: false, out: String(e.message ?? e).split("\n").pop() };
    } finally {
      db.close();
    }
  };
}

// An 8085 lesson is one whose snippets are assembly rather than Python. It says
// so by carrying a `memsetup` block — the bytes its examples read, shown on the
// page so the student can key the same values into a trainer kit — or by marking
// a code block `lang: "asm8085"` when it needs no preloaded memory.
//
// Same arrangement as SQL: the verifier runs the snippets through the very engine
// the student's browser will use (lib/asm8085.ts), so a claimed register value is
// one they can reproduce rather than the author's word for it.
const memSetup = lesson.content.find((b) => b.t === "memsetup");
const isAsm = !!memSetup || lesson.content.some((b) => b.t === "code" && b.lang === "asm8085");
let runAsm = null;
if (isAsm) {
  const { run: run8085, formatState } = await import("../lib/asm8085.ts");
  // Memory is reloaded for every snippet. Examples must not depend on the order
  // the lesson happens to run them in — the same rule the SQL verifier follows by
  // opening a fresh database per query.
  const preset = {};
  if (memSetup) memSetup.bytes.forEach((b, i) => { preset[memSetup.at + i] = b; });
  const DEFAULT_SHOW = ["A", "B", "C", "D", "E", "H", "L", "CY", "Z"];
  runAsm = (code, show) => {
    const r = run8085(code, { memory: { ...preset } });
    return { ok: r.ok, out: formatState(r, show ?? DEFAULT_SHOW) };
  };
}

const dir = mkdtempSync(join(tmpdir(), "lesson-"));
const runPy = (code) => {
  const f = join(dir, "s.py");
  writeFileSync(f, code, "utf8");
  try {
    // Canned stdin so snippets that demonstrate input() actually run instead of
    // dying on EOF. Anything claiming output must match what these lines produce.
    // cwd is the throwaway directory, not the repo.
    //
    // Snippets legitimately write files — a file-handling lesson has to, and a
    // visualization lesson calling fig.savefig("chart.png") has to. With the
    // default cwd every one of those lands in the project root and gets committed
    // by whoever runs `git add -A` next. The temp directory is deleted with the run.
    //
    // MPLBACKEND is here for the same reason: matplotlib's default on this machine
    // is an interactive backend, so a snippet that draws would try to open a window
    // from a child process with nowhere to put it. AGG draws to memory, which is
    // also what Pyodide does when it hands the figure back as a PNG — so the
    // verifier and the student's browser render through the same code path.
    return { ok: true, out: execFileSync("python", [f], { cwd: dir, env: { ...process.env, MPLBACKEND: "AGG" }, encoding: "utf8", input: "Aarav\n21\n85\n", stdio: ["pipe", "pipe", "pipe"] }).replace(/\r\n/g, "\n").trimEnd() };
  } catch (e) {
    const err = (e.stderr || "").replace(/\r\n/g, "\n").trimEnd();
    return { ok: false, out: err.split("\n").filter(Boolean).pop() ?? "" };
  }
};

// A lesson whose snippets import scikit-learn or scipy cannot be checked by the
// local interpreter: neither is installed there. Installing them would not fix
// it either — the student's browser loads the pinned wheels in public/pyodide,
// and local CPython would verify against different versions of numpy, pandas and
// sklearn than the ones they actually run.
//
// So those lessons run in OUR Pyodide, from the same folder the app serves. Same
// arrangement as the SQL and 8085 engines above, for the same reason: a claimed
// output should be one the student can reproduce, not the author's word for it.
//
// Only sklearn and scipy are listed. numpy, pandas and matplotlib exist locally
// AND in Pyodide, and eleven verified lessons already depend on the local ones —
// moving those is a separate change with its own risk.
const BROWSER_ONLY = ["sklearn", "scipy"];
const needsPyodide = BROWSER_ONLY.some((p) =>
  new RegExp(`(import|from) ${p}\\b`).test(JSON.stringify(lesson.content))
);

let runPyodide = null;
if (needsPyodide) {
  const { loadPyodide } = await import("pyodide");
  const { sep } = await import("node:path");
  const py = await loadPyodide({ indexURL: join(process.cwd(), "public", "pyodide") + sep });
  py.setStderr({ batched: () => {} });

  // Packages are loaded ONCE, from every snippet in the lesson at once, so the
  // per-snippet call below can stay synchronous like the other two engines.
  // loadPackagesFromImports also narrates onto stdout ("Loading numpy, scipy…"),
  // which would land in the captured output — silence stdout across it, exactly
  // as lib/pyodide-runner.ts does for the student.
  py.setStdout({ batched: () => {} });
  const snippets = [];
  for (const b of lesson.content) {
    for (const v of [b.code, b.full, b.fix]) if (typeof v === "string") snippets.push(v);
    for (const s of b.steps ?? []) if (typeof s.code === "string") snippets.push(s.code);
    for (const i of b.items ?? []) if (typeof i.code === "string") snippets.push(i.code);
  }
  // Import LINES only, not the snippets joined together: concatenating separate
  // programs usually is not valid Python, and loadPackagesFromImports tokenises
  // what it is given. A list of import statements always parses.
  const importLines = [
    ...new Set((snippets.join("\n").match(/^[ \t]*(?:import|from)\s+[^\n]+/gm) ?? []).map((s) => s.trim())),
  ];
  await py.loadPackagesFromImports(importLines.join("\n"));

  let buf = "";
  runPyodide = (code) => {
    buf = "";
    // A fresh namespace per snippet. One Pyodide instance is reused for speed,
    // but each snippet must start clean or a name defined in an earlier block
    // silently rescues a later one that forgot to define it — which is exactly
    // the mistake this tool exists to catch.
    const ns = py.globals.get("dict")();
    try {
      py.setStdout({ batched: (s) => { buf += s + "\n"; } });
      py.runPython(code, { globals: ns });
      return { ok: true, out: buf.replace(/\r\n/g, "\n").trimEnd() };
    } catch (e) {
      const last = String(e?.message ?? e).split("\n").filter(Boolean).pop() ?? "";
      return { ok: false, out: last };
    } finally {
      py.setStdout({ batched: () => {} });
      ns.destroy();
    }
  };
}

/** Whichever engine this lesson is written in. A case may carry a `show` list,
 *  which only the 8085 engine reads — the others ignore the second argument. */
const run = runAsm ?? runSql ?? runPyodide ?? runPy;

const cases = [];
/** Blocks deliberately not run, reported at the end so they stay visible. */
const skipped = [];
/** Nothing in an HTML lesson is executable — see the note in the loop below. */
const isHtml = track === "html";
for (const b of lesson.content) {
  /* Shell blocks have no runner, so they are skipped rather than failed.
   *
   * Every `code` block was handed to python — including deploy-git's `git.sh`,
   * six lines of git commands, which came back "SyntaxError: invalid syntax"
   * and made that lesson permanently unverifiable. The block was fine; the
   * verifier was reading it in the wrong language.
   *
   * Skipped loudly, not silently: an unchecked block should show up as one, or
   * this becomes a way for real snippets to escape verification unnoticed. */
  /* An HTML lesson has no executable snippet at all.
   *
   * Its `code`, `drills`, `worked` and `debug` blocks are markup, and markup
   * has no output to diff — which is the whole reason HTML practice is graded
   * by DOM assertions instead (lib/html-check.ts). Handing any of it to python
   * reports a SyntaxError on content that is perfectly correct, which is how
   * deploy-git spent its whole life "failing". */
  if (isHtml) {
    if (b.t === "code") skipped.push(b.file ?? "snippet");
    continue;
  }
  if (b.t === "code" && /\.(sh|bash|zsh|ps1|html|htm|css)$/.test(b.file ?? "")) {
    skipped.push(b.file);
    continue;
  }
  if (b.t === "code") cases.push({ what: `code ${b.file}`, code: b.code, claim: b.output ?? null, show: b.show });
  if (b.t === "drills") b.items.forEach((d, i) => cases.push({ what: `drill ${i + 1}`, code: d.code, claim: d.out ?? null, show: d.show }));
  if (b.t === "worked") {
    cases.push({ what: `worked "${b.title}" (full)`, code: b.full, claim: b.output ?? null });
    cases.push({ what: `worked "${b.title}" (steps joined)`, code: b.steps.map((s) => s.code).join("\n"), claim: b.output ?? null });
  }
  if (b.t === "faded") {
    let i = 0;
    const filled = b.code.replace(/____/g, () => b.blanks[i++].answer);
    if (i !== b.blanks.length) cases.push({ what: "faded blank count", code: "raise SystemExit('blank/answer count mismatch')", claim: "" });
    cases.push({ what: "faded (answers filled in)", code: filled, claim: b.output ?? null });
  }
  if (b.t === "trace" && runSql) {
    // A SQL trace reads a query one clause at a time, which is how you actually
    // debug one: run the first N lines and see what is still standing.
    //
    // Two things are worth counting and the question says which. **rows** is the
    // one that moves as WHERE, GROUP BY and JOIN are added. **columns** is the
    // one that moves in a SELECT lesson, where the row count never changes — and
    // without it lesson 1 could not have a trace at all, because `SELECT name`
    // on its own is not a query and no prefix shorter than the whole thing runs.
    // A step may carry its own `sql`. It usually has to: unlike Python, a SQL
    // statement does not build up a line at a time — `SELECT name` on its own is
    // not a query, so for most lessons there is no valid prefix shorter than the
    // whole thing. Where prefixes ARE valid (adding WHERE, then ORDER BY) the
    // line form still works and reads better.
    b.steps.forEach((s, i) => {
      const m = s.q.match(/line (\d+)/i);
      if (!m && !s.sql) { cases.push({ what: `trace step ${i + 1} (needs a line number or its own sql)`, code: "SELECT bad syntax", claim: "" }); return; }
      const upto = s.sql
        ? s.sql.replace(/;\s*$/, "")
        : b.code.split("\n").slice(0, Number(m[1])).join("\n").replace(/;\s*$/, "");
      const wantsCols = /column/i.test(s.q);
      cases.push({
        what: `trace step ${i + 1}: ${wantsCols ? "columns" : "rows"}`,
        code: wantsCols ? `${upto} LIMIT 1` : `SELECT COUNT(*) AS n FROM (${upto})`,
        claim: wantsCols ? `__COLS__${s.answer}` : `n\n${s.answer}`,
        accept: wantsCols ? [] : (s.accept ?? []).map((a) => `n\n${a}`),
      });
    });
  }
  // An 8085 trace asks the same question the Python one does — "after line 4,
  // what is in C?" — except the thing holding the value is a register. Assemble
  // the first N lines, append HLT so the program terminates, and read it back.
  if (b.t === "trace" && runAsm) {
    b.steps.forEach((s, i) => {
      const m = s.q.match(/line (\d+)/i);
      const v = s.q.match(/<code>([A-Za-z]{1,2})<\/code>/);
      if (!m || !v) { cases.push({ what: `trace step ${i + 1} (unparseable question)`, code: "BAD", claim: "" }); return; }
      const upto = b.code.split("\n").slice(0, Number(m[1])).join("\n");
      cases.push({
        what: `trace: after line ${m[1]}, ${v[1]}`,
        code: `${upto}\nHLT`,
        claim: s.answer,
        accept: s.accept ?? [],
        show: [v[1]],
        // formatState prints "C=00"; the student types "00", so drop the label.
        strip: true,
      });
    });
  }
  if (b.t === "trace" && !runSql && !runAsm) {
    b.steps.forEach((s, i) => {
      const m = s.q.match(/line (\d+)/i);
      const v = s.q.match(/<code>(\w+)<\/code>/);
      if (!m || !v) { cases.push({ what: `trace step ${i + 1} (unparseable question)`, code: "raise SystemExit('cannot parse')", claim: "" }); return; }
      const upto = b.code.split("\n").slice(0, Number(m[1])).join("\n");
      // A traced program may print things of its own — a lesson about print vs
      // return has to. So mark where our own output starts and read only what
      // comes after it, instead of banning prints from traced code.
      const probe = `${upto}\nprint("${SENTINEL}")\nprint(${v[1]})`;
      // `accept` lists equally-correct spellings a student might type. The
      // checker has to honour them too, or it fails a lesson for being lenient.
      cases.push({ what: `trace: after line ${m[1]}, ${v[1]}`, code: probe, claim: s.answer, accept: s.accept ?? [], sentinel: true });
    });
  }
  if (b.t === "debug") {
    const broken = b.code.replace(/input\([^)]*\)/g, '"21"');
    const fixed = b.fix.replace(/input\([^)]*\)/g, '"21"');
    if (runAsm) {
      // An assembly bug is a silent bug by definition — a processor has no
      // exceptions to raise. So there is only one shape to check: both halves
      // run, and they disagree about the state they leave the machine in.
      cases.push({ what: "debug: broken code runs (a silent bug, not a crash)", code: broken, claim: null, show: b.show });
      cases.push({ what: "debug: broken state differs from the fix", code: broken, claim: `__DIFFERS__${fixed}`, show: b.show });
      cases.push({ what: "debug: the fix runs clean", code: fixed, claim: null, show: b.show });
      continue;
    }
    // A bug does not have to crash. The most dangerous ones run perfectly and
    // return the wrong answer, so a symptom that isn't an exception is checked
    // differently: the broken code must run, and must disagree with the fix.
    if (/error|exception|traceback/i.test(b.symptom ?? "")) {
      cases.push({ what: "debug: broken code raises the claimed error", code: broken, claim: `__ERR__${b.symptom}` });
    } else {
      cases.push({ what: "debug: broken code runs (a silent bug, not a crash)", code: broken, claim: null });
      cases.push({ what: "debug: broken output differs from the fix", code: broken, claim: `__DIFFERS__${fixed}` });
    }
    cases.push({ what: "debug: the fix runs clean", code: fixed, claim: null });
  }
}

let bad = 0;
const fail = (c, msg) => { bad++; console.log(` FAIL  ${c.what}\n        ${msg}`); };
for (const c of cases) {
  const r = run(c.code, c.show);
  if (c.claim === null) {                       // must simply run without error
    r.ok ? console.log(`  ok   ${c.what} (runs clean)`) : fail(c, `crashed: ${r.out}`);
  } else if (String(c.claim).startsWith("__DIFFERS__")) {  // must run, and disagree with the fix
    const fixedRun = run(String(c.claim).slice("__DIFFERS__".length), c.show);
    if (!r.ok) fail(c, `the broken code crashed: ${r.out}`);
    else if (!fixedRun.ok) fail(c, `the fix crashed: ${fixedRun.out}`);
    else if (r.out === fixedRun.out) fail(c, `broken and fixed print the same thing (${JSON.stringify(r.out)}) — then there is no bug to find`);
    else console.log(`  ok   ${c.what}  (broken ${JSON.stringify(r.out)} vs fixed ${JSON.stringify(fixedRun.out)})`);
  } else if (String(c.claim).startsWith("__COLS__")) {  // how many columns came back
    const want = c.claim.slice("__COLS__".length);
    const got = r.ok ? String(r.out.split("\n")[0].split(" | ").length) : "";
    if (!r.ok) fail(c, `crashed: ${r.out}`);
    else if (got !== want) fail(c, `claimed ${want} columns, got ${got} (${JSON.stringify(r.out.split("\n")[0])})`);
    else console.log(`  ok   ${c.what}`);
  } else if (String(c.claim).startsWith("__ERR__")) {   // must fail with this error
    const want = c.claim.slice(7);
    if (r.ok) fail(c, `expected an error, but it ran and printed ${JSON.stringify(r.out)}`);
    else if (!r.out.includes(want)) fail(c, `claimed: ${JSON.stringify(want)}\n        actual : ${JSON.stringify(r.out)}`);
    else console.log(`  ok   ${c.what}`);
  } else {
    const norm = (x) => String(x).replace(/\r\n/g, "\n").trimEnd();
    // An 8085 trace asks for a value, not "C=00" — drop the label the formatter
    // adds, so the claimed answer is what a student would actually write down.
    if (c.strip && r.ok) r.out = r.out.replace(/^[A-Z]{1,2}=/, "");
    // Drop the traced program's own output; keep only what follows our marker.
    if (c.sentinel && r.ok && r.out.includes(SENTINEL)) {
      r.out = r.out.slice(r.out.lastIndexOf(SENTINEL) + SENTINEL.length).replace(/^\n/, "").trimEnd();
    }
    const want = norm(c.claim);
    const ok = [want, ...(c.accept ?? []).map(norm)].includes(r.out);
    if (!r.ok) fail(c, `crashed: ${r.out}`);
    else if (!ok) fail(c, `claimed: ${JSON.stringify(want)}\n        actual : ${JSON.stringify(r.out)}`);
    else console.log(`  ok   ${c.what}`);
  }
}
/* ---- syntax blocks: checked by reading, not by running ------------------
 *
 * A `form` is not runnable. It is the SHAPE of a statement, with placeholders
 * like `condition` and `body` standing where real code goes, so feeding it to
 * python would report a SyntaxError on a block that is perfectly correct.
 *
 * What can go wrong instead is the breakdown drifting from the form: naming a
 * part that is not in it, or leaving one of its parts unexplained. Both read as
 * plausible and neither shows up anywhere else — a student following a key to a
 * form that does not match it has no way to tell which of the two is wrong. */
let sxChecked = 0;
for (const b of lesson.content.filter((x) => x.t === "syntax")) {
  let broke = 0;
  const say = (msg) => { bad++; broke++; console.log(` FAIL  syntax block: ${msg}`); };
  sxChecked++;
  if (typeof b.form !== "string" || !b.form.trim()) { say("no `form`"); continue; }
  if (!Array.isArray(b.parts) || b.parts.length === 0) { say("no `parts` — a form with no key is a picture"); continue; }

  const form = b.form;
  for (const p of b.parts) {
    if (!p.bit || !String(p.says ?? "").trim()) { say(`part ${JSON.stringify(p.bit)} has no explanation`); continue; }
    // Punctuation-only bits ("(", ":") are matched literally; word-like bits
    // must appear as a whole word so `in` does not match inside `int`.
    const bit = String(p.bit);
    const hit = /^\w[\w.]*$/.test(bit)
      ? new RegExp(`\\b${bit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(form)
      : form.includes(bit);
    if (!hit) say(`the breakdown names \`${bit}\`, which does not appear in the form`);
  }

  // The reverse gap is quieter and just as bad: a form introducing a keyword the
  // breakdown never mentions is the part the beginner was going to ask about.
  // The keyword list is Python's, so the scan only runs for tracks whose forms
  // ARE Python — an HTML form annotates its lines in English prose, where
  // `as`, `from` and `is` are just words and every hit is a false alarm.
  if (!isHtml) {
    const named = new Set(b.parts.map((p) => String(p.bit)));
    const keywords = (form.match(/\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|raise|lambda|yield|global|nonlocal|assert|del|pass|break|continue|in|is|not|and|or)\b/g) ?? []);
    for (const k of new Set(keywords)) {
      if (!named.has(k)) say(`the form uses \`${k}\` but the breakdown never says what it does`);
    }
  }
  if (!broke) console.log(`  ok   syntax block: ${b.parts.length} parts, all present in the form`);
}

const total = cases.length + sxChecked;
if (skipped.length) console.log(`\n  --   skipped (no runner for this language): ${skipped.join(", ")}`);
console.log(`\n${total - bad}/${total} checks passed.`);
process.exit(bad ? 1 : 0);
