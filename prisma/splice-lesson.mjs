// Replace one lesson's content array, or one quiz, inside prisma/seed.mjs.
//
// seed.mjs is over half a megabyte, so a lesson rewrite cannot be an ordinary
// edit — and passing this much JS through a shell heredoc mangles the quotes.
// Write the replacement to a file and splice it in.
//
// This lived in an untracked scratchpad folder before and was lost to a cleanup.
// It is in the repo now so the next rewrite still has it.
//
//   node prisma/splice-lesson.mjs L2 new-L2.txt          -> const L2 = [ ... ];
//   node prisma/splice-lesson.mjs quiz:operators q.txt   -> QUIZZES["operators"]
//
// The replacement file holds ONLY the array items, without the surrounding
// `const L2 = [` and `];`. Nothing is written unless the result still parses.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const [target, file] = process.argv.slice(2);
if (!target || !file) {
  console.error("usage: node prisma/splice-lesson.mjs <L2|quiz:slug> <file>");
  process.exit(1);
}

const SEED = "prisma/seed.mjs";
const src = readFileSync(SEED, "utf8");
const body = readFileSync(file, "utf8").replace(/\s+$/, "");

let startMarker, endMarker, open, close;
if (target.startsWith("quiz:")) {
  const slug = target.slice(5);
  startMarker = `\n  "${slug}": [\n`;
  endMarker = "\n  ],\n";
  open = `\n  "${slug}": [\n`;
  close = "\n  ],\n";
} else {
  startMarker = `\nconst ${target} = [\n`;
  endMarker = "\n];\n";
  open = `\nconst ${target} = [\n`;
  close = "\n];\n";
}

// A subject whose lessons were stubs has no quiz for them yet, so "replace" has
// nothing to replace. Insert a new entry at the top of QUIZZES instead — the
// alternative was a second throwaway script living in a temp folder, which is
// exactly how the previous splice helper got lost.
if (target.startsWith("quiz:") && src.indexOf(startMarker) < 0) {
  const slug = target.slice(5);
  const anchor = "export const QUIZZES = {\n";
  const at = src.indexOf(anchor);
  if (at < 0) {
    console.error("✗ could not find the QUIZZES object");
    process.exit(1);
  }
  const out = src.slice(0, at + anchor.length) + `  "${slug}": [\n${body}\n  ],\n` + src.slice(at + anchor.length);
  writeFileSync(SEED, out);
  console.log(`✓ quiz added for "${slug}" (it had none)`);
  process.exit(0);
}

const at = src.indexOf(startMarker);
if (at < 0) {
  console.error(`✗ could not find ${target} in ${SEED}`);
  process.exit(1);
}
const from = at + startMarker.length;
const to = src.indexOf(endMarker, from);
if (to < 0) {
  console.error(`✗ could not find the end of ${target}`);
  process.exit(1);
}

const before = src.slice(0, at);
const after = src.slice(to + endMarker.length);
const out = before + open + body + "\n" + close.slice(1) + after;

// Never leave seed.mjs broken: parse the result before it touches disk.
const tmp = `${SEED}.splice-check.mjs`;
writeFileSync(tmp, out);
try {
  execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" });
} catch (e) {
  console.error(`✗ the spliced file does not parse — ${SEED} left untouched`);
  console.error(String(e.stderr || e.message).split("\n").slice(0, 6).join("\n"));
  process.exit(1);
} finally {
  try { execFileSync(process.platform === "win32" ? "cmd" : "rm", process.platform === "win32" ? ["/c", "del", tmp.replace(/\//g, "\\")] : ["-f", tmp], { stdio: "pipe" }); } catch {}
}

writeFileSync(SEED, out);
const oldLines = src.slice(from, to).split("\n").length;
const newLines = body.split("\n").length;
console.log(`✓ ${target} replaced in ${SEED}: ${oldLines} lines -> ${newLines} lines`);
