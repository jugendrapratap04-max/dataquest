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
import { trackLessons, extraProblems } from "./seed.mjs";

const prisma = new PrismaClient();

const SETS = [
  ["SQL", sqlProblems],
  ["pandas/numpy", pandasProblems],
];

// Push the seed's xp and order onto problems that already exist in the database.
//
// Two things were wrong and neither could be fixed by re-seeding a live database:
// every problem created through seed.mjs paid a flat 20 XP regardless of
// difficulty (so a Super Hard problem was worth the same as an Easy one, while
// SQL and pandas correctly paid 20/30/40), and every "extra" problem was created
// with order 50 — nine of them on the strings lesson alone, sorting arbitrarily.
//
// Only these two columns are touched. Nothing about the question, the tests or
// anybody's progress is rewritten.
async function syncXpAndOrder() {
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
      select: { xp: true, order: true },
    });
    if (!row) continue;
    if (row.xp === d.xp && row.order === d.order) continue;
    await prisma.problem.update({
      where: { slug: d.slug },
      data: { xp: d.xp, order: d.order },
    });
    changed++;
  }
  console.log(`\n   xp/order synced: ${changed} problem(s) updated of ${defs.length} defined`);
}

async function apply(label, problems) {
  let added = 0;
  let updated = 0;
  const missing = [];

  for (const { lessonSlug, ...data } of problems) {
    const lesson = await prisma.lesson.findUnique({ where: { slug: lessonSlug } });
    if (!lesson) {
      missing.push(`${data.slug} -> lesson "${lessonSlug}" nahi mila`);
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
  await syncXpAndOrder();

  const total = await prisma.problem.count();
  const sql = await prisma.problem.count({ where: { kind: "sql" } });
  console.log(`\n   total problems: ${total} (sql: ${sql}, python: ${total - sql})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
