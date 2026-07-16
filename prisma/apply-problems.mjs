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

const prisma = new PrismaClient();

const SETS = [
  ["SQL", sqlProblems],
  ["pandas/numpy", pandasProblems],
];

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

async function main() {
  for (const [label, problems] of SETS) await apply(label, problems);

  const total = await prisma.problem.count();
  const sql = await prisma.problem.count({ where: { kind: "sql" } });
  console.log(`\n   total problems: ${total} (sql: ${sql}, python: ${total - sql})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
