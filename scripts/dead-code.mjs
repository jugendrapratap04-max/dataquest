/* Dead-code sweep. `npm run dead-code`
 *
 * AGENTS.md carried "nobody has done a full one" for a long time. This is it,
 * scripted so it can be re-run instead of remembered.
 *
 * Four questions, highest-signal first:
 *   1. custom properties USED but never DEFINED   <- finds real, invisible bugs
 *   2. custom properties DEFINED but never used
 *   3. component files never referenced anywhere
 *   4. CSS classes never referenced by any source
 *
 * ⚠️ FALSE POSITIVES ARE THE WHOLE DIFFICULTY, and the first run of this
 * produced ten of them out of nineteen. Everything below exists because of one:
 *
 *   - the corpus includes prisma/*.mjs and docs, not just tsx — lesson bodies
 *     are real markup and carry class names
 *   - boundaries are "not a class-name character" on BOTH sides, because the app
 *     writes `nav-item${...}`, where the next character is a dollar sign
 *   - DYNAMIC_PREFIXES below is scanned out of the source: `t-${v.type}` in a
 *     template literal means every `.t-*` rule is potentially live, and the
 *     first version of this script confidently reported `.t-bool`, `.t-float`,
 *     five `.ef-*` and three `.fa-*` as dead. They were all in use
 *   - a custom property can be set from JS — `subjectStyle()` sets `--sub-h` as
 *     an inline style — so JS-set names are collected too
 *
 * Anything it prints is a CANDIDATE to go and look at. It is not a delete list.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename, relative } from "node:path";

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".next", "ui-shots", ".git", "pyodide", "sqljs", "out"]);
const CSS = join(ROOT, "app/globals.css");

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p);
    else if ([".tsx", ".ts", ".mjs", ".js", ".css", ".md"].includes(extname(p))) files.push(p);
  }
})(ROOT);

const css = readFileSync(CSS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const read = (f) => { try { return readFileSync(f, "utf8"); } catch { return ""; } };
const corpus = files.filter((f) => f !== CSS).map(read).join("\n");
const bounded = (name) =>
  new RegExp(`(^|[^\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\w-]|$)`);

let problems = 0;

// ------------------------------------------------------------------ 1 & 2 ---
const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
const used = new Set([
  ...[...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]),
  ...[...corpus.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]),
]);
/* A property can also be set from JS as an inline style — subjectStyle() sets
   --sub-h that way, so it is defined without ever appearing in the stylesheet.
   ⚠️ ONLY COUNT ONE IF SOMETHING ACTUALLY READS IT. The first version matched
   any `"--name"` string and duly reported --help, --full, --dry and --pypi as
   unused CSS variables; they are command-line flags in the scripts. */
for (const m of corpus.matchAll(/["'\[]\s*(--[\w-]+)\s*["'\]]/g))
  if (used.has(m[1])) defined.add(m[1]);
// a var() with a fallback still renders, so it is phantom rather than broken
const hasFallback = new Set([...css.matchAll(/var\((--[\w-]+)\s*,/g)].map((m) => m[1]));

const undef = [...used].filter((v) => !defined.has(v)).sort();
console.log("=== 1. CUSTOM PROPERTIES USED BUT NEVER DEFINED");
if (!undef.length) console.log("    none");
for (const v of undef) {
  const n = (css.match(new RegExp(`var\\(${v}[,)]`, "g")) || []).length;
  const fb = hasFallback.has(v);
  console.log(`    ${v.padEnd(20)} used ${String(n).padStart(2)}x  ${fb ? "(has a fallback — phantom, not broken)" : "<- SILENTLY DOES NOTHING"}`);
  if (!fb) problems++;
}

const unusedVars = [...defined].filter((v) => !used.has(v)).sort();
console.log(`\n=== 2. CUSTOM PROPERTIES DEFINED BUT NEVER USED  (${unusedVars.length} of ${defined.size})`);
for (const v of unusedVars) console.log("    " + v);

// ---------------------------------------------------------------------- 3 ---
const comps = files.filter((f) => /[\\/]components[\\/]/.test(f) && f.endsWith(".tsx"));
const orphans = comps.filter((f) => {
  const others = files.filter((o) => o !== f).map(read).join("\n");
  return !bounded(basename(f, ".tsx")).test(others);
});
console.log(`\n=== 3. COMPONENT FILES NEVER REFERENCED  (${orphans.length} of ${comps.length})`);
for (const f of orphans) console.log("    " + relative(ROOT, f).replace(/\\/g, "/"));
problems += orphans.length;

// ---------------------------------------------------------------------- 4 ---
/* Any `foo-${...}` in the source means every `.foo-*` rule may be built at
   runtime and cannot be judged by searching for its literal name. */
const DYNAMIC_PREFIXES = new Set(
  [...corpus.matchAll(/([a-zA-Z][\w]*)-\$\{/g)].map((m) => m[1] + "-")
);
const classes = new Set([...css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]));
const unusedClasses = [...classes]
  .filter((c) => !bounded(c).test(corpus))
  .filter((c) => ![...DYNAMIC_PREFIXES].some((p) => c.startsWith(p)))
  .sort();
console.log(`\n=== 4. CSS CLASSES NEVER REFERENCED  (${unusedClasses.length} of ${classes.size})`);
console.log(`    dynamic prefixes excluded: ${[...DYNAMIC_PREFIXES].sort().join(" ") || "(none found)"}`);
for (const c of unusedClasses) console.log("    ." + c);

console.log(`\n${problems ? `${problems} thing(s) worth looking at.` : "nothing broken found."}`);
