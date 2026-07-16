// Adds (or refreshes) just the SQL practice problems on an existing database.
//
// `db:reset` wipes every user's progress, which is too blunt for adding content
// to a database people are already using. This upserts by slug instead, so it is
// safe to re-run and touches nothing else.

import { PrismaClient } from "@prisma/client";
import { sqlProblems } from "./sql-problems.mjs";

const prisma = new PrismaClient();

async function main() {
  let added = 0;
  let updated = 0;
  const missing = [];

  for (const { lessonSlug, ...data } of sqlProblems) {
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

  const sqlCount = await prisma.problem.count({ where: { kind: "sql" } });
  const total = await prisma.problem.count();
  console.log(`✅ SQL problems — added: ${added}, updated: ${updated}`);
  console.log(`   kind=sql in db: ${sqlCount} | total problems: ${total}`);
  if (missing.length) {
    console.log("⚠  skipped:");
    for (const m of missing) console.log("   -", m);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
