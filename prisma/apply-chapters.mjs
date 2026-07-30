// Give every subject its chapters, and put every lesson in one.
//
// The vision requires Subject -> Chapter -> Topic (docs/ARCHITECTURE.md). The
// chapter level now exists in the schema; this fills it in without moving a
// single lesson between subjects and without touching anyone's progress.
//
// Where a subject has a real chapter plan, it is listed below and lessons are
// assigned by their order. Where it does not, the subject gets ONE chapter
// holding all of its lessons — which is honest: it says "not split yet" rather
// than inventing structure that does not exist.
//
//   npm run db:chapters
//
// Safe to re-run: chapters are upserted by slug and a lesson is only moved if
// its chapter is wrong.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Chapter plans, by subject slug. `upto` is the last lesson order in that
// chapter. Only Python is split for real so far — it is the only subject whose
// 39 lessons are all written.
const PLANS = {
  python: [
    { slug: "py-foundations", title: "Foundations", upto: 8, summary: "Running code, variables, operators, conditionals, loops and the core collections." },
    { slug: "py-working-with-data", title: "Working with data", upto: 17, summary: "Functions, strings, comprehensions, objects, errors, files, modules and booleans." },
    { slug: "py-everyday-python", title: "Everyday Python", upto: 23, summary: "Numbers, formatting, lambdas, scope, JSON, dates and the wider operator set." },
    { slug: "py-objects-and-flow", title: "Objects and control", upto: 30, summary: "Match-case, recursion, inheritance, encapsulation, dunder methods, generators, decorators and regex." },
    { slug: "py-standard-library", title: "The standard library", upto: 35, summary: "Concurrency, async, collections, itertools, functools, system modules and persistence." },
    { slug: "py-shipping-code", title: "Shipping code", upto: 39, summary: "Testing, debugging and logging, clean code, project structure and git." },
  ],
  // Being written now, chapter by chapter, so the plan grows with it. `upto` is a
  // lesson order that does not exist yet for the later chapters — the applier
  // simply finds no lessons for them, which is why they are safe to declare
  // ahead of time and gives the roadmap the real shape of the course.
  microprocessor: [
    { slug: "mp-foundations", title: "Foundations", upto: 4, summary: "What a microprocessor is, how it evolved, what is inside the chip, and the three buses that connect it to everything else." },
    { slug: "mp-architecture", title: "8085 architecture", upto: 9, summary: "The register set, the flags, the pins and signals, memory organization, and the instruction cycle measured in T-states." },
    { slug: "mp-instruction-set", title: "Instruction set and addressing", upto: 15, summary: "Every instruction group, the addressing modes, and the stack and subroutine mechanism." },
    { slug: "mp-programming", title: "Assembly programming", upto: 18, summary: "Real programs: blocks, sorting, counters, delay loops and code conversion." },
    { slug: "mp-interrupts", title: "Interrupts and DMA", upto: 21, summary: "How a processor is interrupted, how it prioritises, and how data moves without it." },
    { slug: "mp-interfacing", title: "Interfacing peripherals", upto: 26, summary: "Memory and I/O interfacing, the 8255, the 8253 timer, the 8259 controller, and ADC/DAC." },
    { slug: "mp-communication", title: "Communication", upto: 28, summary: "Serial and parallel communication, and the 8251." },
    { slug: "mp-8086-and-modern", title: "8086 and modern processors", upto: 31, summary: "BIU and EU, segmentation, pipelining, and what changed on the way to the chip in your laptop." },
    { slug: "mp-exam-prep", title: "Exam and interview preparation", upto: 33, summary: "The question patterns that repeat, worked numericals, and a final revision pass." },
  ],
};

const titleOf = (t) => t.title.split(" — ").pop() ?? t.title;

async function main() {
  const subjects = await prisma.track.findMany({
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" }, select: { id: true, order: true, chapterId: true } } },
  });

  let created = 0;
  let moved = 0;

  for (const subject of subjects) {
    if (!subject.lessons.length) continue;

    const plan =
      PLANS[subject.slug] ??
      // No plan yet: one chapter for the whole subject. Says "not split yet"
      // rather than inventing chapter boundaries nobody decided on.
      [{ slug: `${subject.slug}-all`, title: titleOf(subject), upto: Infinity, summary: "Not split into chapters yet." }];

    const chapters = [];
    for (const [i, c] of plan.entries()) {
      const row = await prisma.chapter.upsert({
        where: { slug: c.slug },
        create: { slug: c.slug, order: i + 1, title: c.title, summary: c.summary, trackId: subject.id },
        update: { order: i + 1, title: c.title, summary: c.summary, trackId: subject.id },
      });
      chapters.push({ ...c, id: row.id });
      created++;
    }

    for (const lesson of subject.lessons) {
      const target = chapters.find((c) => lesson.order <= c.upto) ?? chapters[chapters.length - 1];
      if (lesson.chapterId === target.id) continue;
      await prisma.lesson.update({ where: { id: lesson.id }, data: { chapterId: target.id } });
      moved++;
    }
  }

  const unplaced = await prisma.lesson.count({ where: { chapterId: null } });
  console.log(`\n   chapters written: ${created}`);
  console.log(`   lessons placed:   ${moved}`);
  console.log(`   lessons still without a chapter: ${unplaced}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
