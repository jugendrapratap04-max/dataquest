/* Runs every checkable snippet of a lesson in real Python and diffs the actual
 * behaviour against what the content claims:
 *   code   -> output              worked -> full/output
 *   drills -> code/out            faded  -> blanks filled in must produce output
 *   trace  -> first N lines + print(var) must equal the claimed answer
 *   debug  -> broken code must raise the claimed symptom; the fix must run clean
 * Usage: npm run verify:lesson -- <track> <lesson-slug> */
import { trackLessons } from "./seed.mjs";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Marks where our own probe output begins, so a traced program is free to print.
const SENTINEL = "__TRACE_VALUE__";

const [track, slug] = process.argv.slice(2);
const lesson = (trackLessons[track] ?? []).find((l) => l.slug === slug);
if (!lesson) { console.error(`no lesson ${track}/${slug}`); process.exit(1); }

const dir = mkdtempSync(join(tmpdir(), "lesson-"));
const run = (code) => {
  const f = join(dir, "s.py");
  writeFileSync(f, code, "utf8");
  try {
    // Canned stdin so snippets that demonstrate input() actually run instead of
    // dying on EOF. Anything claiming output must match what these lines produce.
    return { ok: true, out: execFileSync("python", [f], { encoding: "utf8", input: "Aarav\n21\n85\n", stdio: ["pipe", "pipe", "pipe"] }).replace(/\r\n/g, "\n").trimEnd() };
  } catch (e) {
    const err = (e.stderr || "").replace(/\r\n/g, "\n").trimEnd();
    return { ok: false, out: err.split("\n").filter(Boolean).pop() ?? "" };
  }
};

const cases = [];
for (const b of lesson.content) {
  if (b.t === "code") cases.push({ what: `code ${b.file}`, code: b.code, claim: b.output ?? null });
  if (b.t === "drills") b.items.forEach((d, i) => cases.push({ what: `drill ${i + 1}`, code: d.code, claim: d.out ?? null }));
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
  if (b.t === "trace") {
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
  const r = run(c.code);
  if (c.claim === null) {                       // must simply run without error
    r.ok ? console.log(`  ok   ${c.what} (runs clean)`) : fail(c, `crashed: ${r.out}`);
  } else if (String(c.claim).startsWith("__DIFFERS__")) {  // must run, and disagree with the fix
    const fixedRun = run(String(c.claim).slice("__DIFFERS__".length));
    if (!r.ok) fail(c, `the broken code crashed: ${r.out}`);
    else if (!fixedRun.ok) fail(c, `the fix crashed: ${fixedRun.out}`);
    else if (r.out === fixedRun.out) fail(c, `broken and fixed print the same thing (${JSON.stringify(r.out)}) — then there is no bug to find`);
    else console.log(`  ok   ${c.what}  (broken ${JSON.stringify(r.out)} vs fixed ${JSON.stringify(fixedRun.out)})`);
  } else if (String(c.claim).startsWith("__ERR__")) {   // must fail with this error
    const want = c.claim.slice(7);
    if (r.ok) fail(c, `expected an error, but it ran and printed ${JSON.stringify(r.out)}`);
    else if (!r.out.includes(want)) fail(c, `claimed: ${JSON.stringify(want)}\n        actual : ${JSON.stringify(r.out)}`);
    else console.log(`  ok   ${c.what}`);
  } else {
    const norm = (x) => String(x).replace(/\r\n/g, "\n").trimEnd();
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
console.log(`\n${cases.length - bad}/${cases.length} checks passed.`);
process.exit(bad ? 1 : 0);
