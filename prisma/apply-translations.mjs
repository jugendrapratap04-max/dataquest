// Replace the Hinglish problem text inside prisma/seed.mjs with English.
//
// seed.mjs is over half a megabyte and every problem is a positional call, so
// hand-editing 121 of them is how you introduce a typo into a solution that the
// tests then reject. This does it by exact string match instead: take the
// ORIGINAL value straight from the loaded module, re-create the literal it must
// have come from, and require exactly one occurrence before touching anything.
//
//   node prisma/apply-translations.mjs --dry     report what would change
//   node prisma/apply-translations.mjs           write it
//
// Anything that does not match exactly once is left alone and listed, so a
// silent partial rewrite is impossible.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { trackLessons, extraProblems } from "./seed.mjs";

const DRY = process.argv.includes("--dry");
const SEED = "prisma/seed.mjs";
const EN_FILE = "scratchpad/problems-en.json";

const originals = new Map();
for (const lessons of Object.values(trackLessons))
  for (const l of lessons) for (const p of l.problems ?? []) originals.set(p.slug, p);
for (const e of extraProblems) originals.set(e.slug, e);

const english = JSON.parse(readFileSync(EN_FILE, "utf8"));
let src = readFileSync(SEED, "utf8");

// The pandas constant that ten descriptions are concatenated with, and the
// English it is being replaced by. Both are needed to split those descriptions
// back into the prefix that actually exists as a literal in the file.
const SHARED_SUFFIX =
  "records ek list of dicts hai (jaise database rows). `pd.DataFrame(records)` se DataFrame banao.";
const SHARED_SUFFIX_EN =
  "records is a list of dicts (like database rows). Build the DataFrame with `pd.DataFrame(records)`.";

const skipped = [];
let descChanged = 0;
let hintsChanged = 0;

// seed.mjs uses BOTH quoting styles: a string containing a double quote is
// written single-quoted ('Seedhe a + b karoge to "855" ban jayega'). Rebuilding
// the literal with JSON.stringify alone therefore misses those, so try both.
function singleQuoted(s) {
  const inner = JSON.stringify(s).slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'");
  return `'${inner}'`;
}

/** Every literal form the source could plausibly have used for this value. */
function literalsFor(s) {
  const out = [JSON.stringify(s)];
  const sq = singleQuoted(s);
  if (sq !== out[0]) out.push(sq);
  return out;
}

/** The literal to write: single-quoted only when that avoids escaping. */
function bestLiteral(s) {
  return s.includes('"') && !s.includes("'") ? singleQuoted(s) : JSON.stringify(s);
}

/** Replace a value's literal, which must appear exactly once in the file. */
function replaceOnce(oldValue, newValue, label) {
  if (oldValue === newValue) return false;
  const literalNew = bestLiteral(newValue);
  for (const literalOld of literalsFor(oldValue)) {
    const first = src.indexOf(literalOld);
    if (first < 0) continue;
    if (src.indexOf(literalOld, first + 1) >= 0) {
      skipped.push(`${label}: appears more than once, left alone`);
      return false;
    }
    src = src.slice(0, first) + literalNew + src.slice(first + literalOld.length);
    return true;
  }
  skipped.push(`${label}: original not found in either quoting style`);
  return false;
}

for (const en of english) {
  const orig = originals.get(en.slug);
  if (!orig) { skipped.push(`${en.slug}: no such problem in seed.mjs`); continue; }

  if (typeof en.descriptionMd === "string" && en.descriptionMd.trim()) {
    // Ten pandas problems build their description by concatenation —
    // `"Ek function ... kare. " + PDrec` — so the whole value never exists as a
    // literal. Rewrite the part before the shared constant and leave PDrec to
    // the single edit it needs (it is translated once, on its own line).
    // PDrec itself may already have been translated, so match either form.
    const suffix = [SHARED_SUFFIX, SHARED_SUFFIX_EN].find((s) => orig.descriptionMd.endsWith(s));
    if (suffix) {
      const oldPrefix = orig.descriptionMd.slice(0, -suffix.length);
      // The translated text must end with the translated shared sentence, or we
      // cannot know where the prefix stops. There used to be a regex fallback
      // that guessed by cutting at the word "records" — it cut inside
      // `count_missing(records, col)` and shipped a truncated question. Never
      // guess here: report it and leave the file alone.
      if (!en.descriptionMd.endsWith(SHARED_SUFFIX_EN)) {
        skipped.push(`${en.slug} description: translation does not end with the shared sentence`);
        continue;
      }
      const newPrefix = en.descriptionMd.slice(0, -SHARED_SUFFIX_EN.length);
      if (replaceOnce(oldPrefix, newPrefix, `${en.slug} description (prefix)`)) descChanged++;
    } else if (replaceOnce(orig.descriptionMd, en.descriptionMd, `${en.slug} description`)) {
      descChanged++;
    }
  }

  if (Array.isArray(en.hints)) {
    const oldHints = JSON.parse(orig.hintsJson || "[]");
    if (oldHints.length !== en.hints.length) {
      skipped.push(`${en.slug} hints: ${oldHints.length} in source but ${en.hints.length} translated`);
    } else {
      // One hint at a time. Replacing the whole array literal fails whenever any
      // single hint inside it was written with the other quote style.
      let any = false;
      for (let i = 0; i < oldHints.length; i++) {
        if (replaceOnce(oldHints[i], en.hints[i], `${en.slug} hint ${i + 1}`)) any = true;
      }
      if (any) hintsChanged++;
    }
  }
}

console.log(`descriptions rewritten: ${descChanged}/${english.length}`);
console.log(`hint sets rewritten:    ${hintsChanged}/${english.length}`);
if (skipped.length) {
  console.log(`\nleft untouched (${skipped.length}) — handle these by hand:`);
  for (const s of skipped) console.log("  -", s);
}

if (DRY) { console.log("\n(dry run — nothing written)"); process.exit(0); }

const tmp = `${SEED}.translate-check.mjs`;
writeFileSync(tmp, src);
try {
  execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" });
} catch (e) {
  console.error(`\n✗ result does not parse — ${SEED} left untouched`);
  console.error(String(e.stderr || e.message).split("\n").slice(0, 6).join("\n"));
  process.exit(1);
}
writeFileSync(SEED, src);
console.log(`\n✓ ${SEED} updated`);
