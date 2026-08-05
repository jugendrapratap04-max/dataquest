/* Check lib/error-help.ts against errors REAL Python actually produces.
 *
 * The whole risk in that file is the regexes. It is easy to write a pattern
 * against the error message you remember rather than the one Python prints —
 * and the wording changes between versions ("expected ':'" only exists from
 * 3.10, "can only concatenate str" replaced an older phrasing). A test built
 * from invented strings would pass while the feature silently did nothing.
 *
 * So every case here is produced by running broken code in the real
 * interpreter, taking the last line of the traceback exactly as
 * lib/pyodide-runner.ts does, and feeding that to explainError.
 *
 * Usage: npm run test:errors
 */
import { execFileSync } from "node:child_process";
import { explainError, RULE_COUNT, RULE_ID_LIST } from "../lib/error-help.ts";

/** Mirror of errLast() in lib/pyodide-runner.ts: the last non-empty line. */
const lastLine = (s) => {
  const lines = String(s).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return lines[lines.length - 1] || "";
};

// [ label, code that must fail, the lesson slug we expect to point at ]
const CASES = [
  ["undefined name", "print(total)", "variables-data-types"],
  ["None subscripted", "marks = [3, 1]\nmarks = marks.sort()\nprint(marks[0])", "lists-tuples"],
  ["None attribute", "def f():\n    pass\nf().strip()", "functions"],
  ["empty block", "def f():\nprint(1)", "conditionals"],
  ["missing colon", "if True\n    print(1)", "conditionals"],
  ["unclosed quote", 'print("hello)', "strings"],
  ["str + int", 'print("85" + 5)', "variables-data-types"],
  ["int of decimal text", 'print(int("12.5"))', "variables-data-types"],
  ["loop over an int", "for x in 5:\n    print(x)", "loops"],
  ["string indexed by key", 'print("abc"["name"])', "strings"],
  ["list as dict key", "d = {}\nd[[1, 2]] = 3", "dicts-sets"],
  ["tuple append", "t = (1, 2)\nt.append(3)", "lists-tuples"],
  ["missing attribute", "class A:\n    pass\nA().missing", "oop"],
  ["index past end", "print([1, 2, 3][3])", "lists-tuples"],
  ["missing key", 'd = {"a": 1}\nprint(d["b"])', "dicts-sets"],
  ["too many arguments", "def f(a):\n    return a\nf(1, 2)", "functions"],
  ["missing argument", "def f(a, b):\n    return a\nf(1)", "functions"],
  ["runaway recursion", "def f():\n    return f()\nf()", "advanced-functions"],
  ["divide by zero", "print(1 / 0)", "numbers-math"],
  ["no such module", "import nosuchmodule", "modules"],
  ["bad unpack", "a, b = [1, 2, 3]", "lists-tuples"],
  ["local before global", "x = 1\ndef f():\n    print(x)\n    x = 2\nf()", "scope"],
];

let pass = 0;
const fails = [];

for (const [label, code, expectedLesson] of CASES) {
  let stderr = "";
  try {
    execFileSync("python", ["-c", code], { stdio: ["ignore", "ignore", "pipe"] });
    fails.push(`${label}: the snippet did NOT fail — the test case is wrong, not the rule`);
    continue;
  } catch (e) {
    stderr = String(e.stderr ?? "");
  }

  const raw = lastLine(stderr);
  const help = explainError(raw);

  if (!help) {
    fails.push(`${label}: no rule matched\n        python said: ${raw}`);
    continue;
  }
  if (help.lesson !== expectedLesson) {
    fails.push(`${label}: matched a rule but pointed at "${help.lesson}", expected "${expectedLesson}"\n        python said: ${raw}\n        title: ${help.title}`);
    continue;
  }
  pass++;
  console.log(`  ok   ${label.padEnd(24)} → ${help.title}`);
}

// Rule ids are written to ErrorEvent.rule and counted across months, so a
// duplicate silently merges two different mistakes into one statistic and a
// missing one writes an empty string. Neither shows up as a failure anywhere
// else — the explanation still renders correctly — so it is checked here.
const dupes = RULE_ID_LIST.filter((id, i) => RULE_ID_LIST.indexOf(id) !== i);
if (dupes.length) fails.push(`duplicate rule ids: ${[...new Set(dupes)].join(", ")}`);
const blank = RULE_ID_LIST.filter((id) => !id || !/^[a-z0-9-]+$/.test(id));
if (blank.length) fails.push(`rule ids must be lowercase kebab-case: ${blank.join(", ")}`);

console.log("");
for (const f of fails) console.log(` FAIL  ${f}`);
console.log(`\n${pass}/${CASES.length} real Python errors explained (${RULE_COUNT} rules).`);
console.log(`${RULE_ID_LIST.length} rule ids, all unique.`);

// An unmatched error is not a crash — explainError returns null and the student
// still sees the raw message. But a case listed here is one we claimed to
// handle, so failing it is a real regression.
if (fails.length) process.exit(1);
