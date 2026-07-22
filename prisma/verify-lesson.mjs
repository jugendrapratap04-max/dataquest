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

const [track, slug] = process.argv.slice(2);
const lesson = (trackLessons[track] ?? []).find((l) => l.slug === slug);
if (!lesson) { console.error(`no lesson ${track}/${slug}`); process.exit(1); }

const dir = mkdtempSync(join(tmpdir(), "lesson-"));
const run = (code) => {
  const f = join(dir, "s.py");
  writeFileSync(f, code, "utf8");
  try {
    return { ok: true, out: execFileSync("python", [f], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).replace(/\r\n/g, "\n").trimEnd() };
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
      cases.push({ what: `trace: after line ${m[1]}, ${v[1]}`, code: `${upto}\nprint(${v[1]})`, claim: s.answer });
    });
  }
  if (b.t === "debug") {
    cases.push({ what: "debug: broken code raises the claimed error", code: b.code.replace(/input\([^)]*\)/g, '"21"'), claim: `__ERR__${b.symptom}` });
    cases.push({ what: "debug: the fix runs clean", code: b.fix.replace(/input\([^)]*\)/g, '"21"'), claim: null });
  }
}

let bad = 0;
const fail = (c, msg) => { bad++; console.log(` FAIL  ${c.what}\n        ${msg}`); };
for (const c of cases) {
  const r = run(c.code);
  if (c.claim === null) {                       // must simply run without error
    r.ok ? console.log(`  ok   ${c.what} (runs clean)`) : fail(c, `crashed: ${r.out}`);
  } else if (String(c.claim).startsWith("__ERR__")) {   // must fail with this error
    const want = c.claim.slice(7);
    if (r.ok) fail(c, `expected an error, but it ran and printed ${JSON.stringify(r.out)}`);
    else if (!r.out.includes(want)) fail(c, `claimed: ${JSON.stringify(want)}\n        actual : ${JSON.stringify(r.out)}`);
    else console.log(`  ok   ${c.what}`);
  } else {
    const want = String(c.claim).replace(/\r\n/g, "\n").trimEnd();
    if (!r.ok) fail(c, `crashed: ${r.out}`);
    else if (r.out !== want) fail(c, `claimed: ${JSON.stringify(want)}\n        actual : ${JSON.stringify(r.out)}`);
    else console.log(`  ok   ${c.what}`);
  }
}
console.log(`\n${cases.length - bad}/${cases.length} checks passed.`);
process.exit(bad ? 1 : 0);
