// Refreshes lesson bodies on an existing database, without touching progress.
//
// Lesson content lives in seed.mjs. Re-running the full seed to publish an edited
// lesson would delete every user's progress along with it — so this updates
// contentJson (and title/minutes) by slug and leaves everything else alone.

import { PrismaClient } from "@prisma/client";
import { trackLessons, lessonContent } from "./seed.mjs";

const prisma = new PrismaClient();

// The teaching blocks this pass introduced. Reported per lesson so it's obvious
// which lessons still have no definition rather than having to guess.
const TAUGHT = ["hook", "think", "def", "analogy", "mistakes", "interview"];

async function main() {
  let updated = 0;
  const missing = [];
  const coverage = Object.fromEntries(TAUGHT.map((t) => [t, 0]));
  let total = 0;

  for (const lessons of Object.values(trackLessons)) {
    for (const l of lessons ?? []) {
      const existing = await prisma.lesson.findUnique({ where: { slug: l.slug } });
      if (!existing) {
        missing.push(l.slug);
        continue;
      }
      await prisma.lesson.update({
        where: { slug: l.slug },
        data: {
          title: l.title,
          minutes: l.minutes,
          level: l.level || "Beginner",
          contentJson: JSON.stringify(lessonContent(l)),
        },
      });
      updated++;
      total++;
      const types = new Set(l.content.map((b) => b.t));
      for (const t of TAUGHT) if (types.has(t)) coverage[t]++;
    }
  }

  console.log(`✅ lessons refreshed: ${updated}`);
  if (missing.length) console.log(`⚠  in seed but not in db: ${missing.join(", ")}`);

  console.log(`\n   Teaching-block coverage (of ${total} lessons):`);
  for (const t of TAUGHT) {
    const n = coverage[t];
    const bar = "█".repeat(Math.round((n / total) * 20)).padEnd(20, "·");
    console.log(`   ${t.padEnd(10)} ${bar} ${n}/${total}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
