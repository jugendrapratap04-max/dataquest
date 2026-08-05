// Adds (or refreshes) practice problems on an existing database.
//
// `db:reset` wipes every user's progress, which is too blunt for adding content
// to a database people are already using. This upserts by slug instead, so it is
// safe to re-run and touches nothing else.
//
// Add a new content module here and it flows into both this and the full seed.

import { PrismaClient } from "@prisma/client";
import { sqlProblems } from "./sql-problems.mjs";
import { pandasProblems } from "./pandas-problems.mjs";
import { vizProblems } from "./viz-problems.mjs";
import { mpProblems } from "./mp-problems.mjs";
import { topicProblems } from "./topic-problems.mjs";
import { dsaProblems, treeTraversalProblems } from "./dsa-problems.mjs";
import { trackLessons, extraProblems } from "./seed.mjs";

const prisma = new PrismaClient();

const SETS = [
  ["SQL", sqlProblems],
  ["pandas/numpy", pandasProblems],
  ["viz/EDA", vizProblems],
  ["microprocessor", mpProblems],
  ["topic gaps", topicProblems],
  ["DSA + new topics", dsaProblems],
  ["tree traversals", treeTraversalProblems],
];

// Push the seed's problem definitions onto rows that already exist in the
// database, additively.
//
// `db:reset` is the only other way to get an edited python problem onto a live
// database, and it wipes every student's progress — far too blunt for fixing the
// wording of a question. The SQL and pandas modules always had this path (the
// SETS above); the problems defined inside seed.mjs did not.
//
// It syncs the *content* columns only. Nothing about submissions, XP already
// earned, or lesson progress is touched, and a slug that does not exist yet is
// skipped rather than created — creation still belongs to the seed.
const CONTENT_FIELDS = [
  "title", "difficulty", "functionName", "descriptionMd", "tagsCsv",
  "examplesJson", "starterCode", "solutionCode", "testsJson", "hintsJson",
  "xp", "order",
];

async function syncSeedProblems() {
  const defs = [];
  for (const lessons of Object.values(trackLessons)) {
    for (const lesson of lessons) {
      for (const p of lesson.problems ?? []) defs.push(p);
    }
  }
  defs.push(...extraProblems);

  let changed = 0;
  for (const d of defs) {
    const row = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: Object.fromEntries(CONTENT_FIELDS.map((f) => [f, true])),
    });
    if (!row) continue;
    const data = {};
    for (const f of CONTENT_FIELDS) {
      if (d[f] !== undefined && row[f] !== d[f]) data[f] = d[f];
    }
    if (Object.keys(data).length === 0) continue;
    await prisma.problem.update({ where: { slug: d.slug }, data });
    changed++;
  }
  console.log(`\n   seed problems synced: ${changed} updated of ${defs.length} defined`);
}

async function apply(label, problems) {
  let added = 0;
  let updated = 0;
  const missing = [];

  for (const { lessonSlug, ...data } of problems) {
    const lesson = await prisma.lesson.findUnique({ where: { slug: lessonSlug } });
    if (!lesson) {
      missing.push(`${data.slug} -> no lesson "${lessonSlug}" in the database`);
      continue;
    }
    const existing = await prisma.problem.findUnique({ where: { slug: data.slug } });
    await prisma.problem.upsert({
      where: { slug: data.slug },
      create: { ...data, lessonId: lesson.id },
      update: { ...data, lessonId: lesson.id },
    });
    existing ? updated++ : added++;
  }

  console.log(`✅ ${label} — added: ${added}, updated: ${updated}`);
  if (missing.length) {
    console.log("⚠  skipped:");
    for (const m of missing) console.log("   -", m);
  }
}

// skillsJson used to be [name, doneFlag] pairs whose flags were seeded per-track and
// shown to every user. Progress is derived per-user now, so strip the dead flags and
// leave just the syllabus names.
async function normaliseSkills() {
  let fixed = 0;
  for (const t of await prisma.track.findMany({ select: { id: true, skillsJson: true } })) {
    const arr = JSON.parse(t.skillsJson || "[]");
    if (!arr.some(Array.isArray)) continue;
    const names = arr.map((s) => (Array.isArray(s) ? s[0] : s));
    await prisma.track.update({ where: { id: t.id }, data: { skillsJson: JSON.stringify(names) } });
    fixed++;
  }
  if (fixed) console.log(`✅ skillsJson — ${fixed} track(s) ke dead done-flags hata diye`);
}

async function main() {
  await normaliseSkills();
  for (const [label, problems] of SETS) await apply(label, problems);
  await syncSeedProblems();

  // Counted per kind rather than "everything that is not SQL", which quietly
  // reported the 8085 problems as Python the moment a third runtime existed.
  const total = await prisma.problem.count();
  const byKind = await prisma.problem.groupBy({ by: ["kind"], _count: { _all: true } });
  const parts = byKind
    .sort((a, b) => b._count._all - a._count._all)
    .map((k) => `${k.kind}: ${k._count._all}`)
    .join(", ");
  console.log(`\n   total problems: ${total} (${parts})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
