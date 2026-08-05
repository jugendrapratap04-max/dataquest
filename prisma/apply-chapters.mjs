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
  // ⚠️ `upto` is a lesson ORDER, so INSERTING a lesson mid-track silently
  // changes which chapter every later lesson belongs to, and anything past the
  // last `upto` gets no chapter at all — which means it vanishes from /book
  // while still looking fine everywhere else. That is exactly what happened
  // when the track went 39 → 47: two lessons were inserted mid-track and six
  // appended, and all eight ended up chapterless.
  //
  // So: after inserting or appending a lesson, re-check these boundaries and
  // re-run `npm run db:chapters`. Boundaries below are correct for the 50-lesson
  // track — verify with the order list before trusting them again.
  //
  // Re-running it is not optional and is easy to skip, because every other check
  // passes without it: `db:lessons` creates the lesson, `db:check` and
  // `syllabus` both read it happily, and the only symptom is that it is absent
  // from /book. Lessons 48, 49 and 50 shipped chapterless for exactly that
  // reason — two of them were live and invisible for a full release before this
  // was noticed. `db:chapters` belongs in the per-lesson recipe, not in a
  // once-in-a-while cleanup.
  python: [
    { slug: "py-foundations", title: "Foundations", upto: 8, summary: "Running code, variables, operators, conditionals, loops and the core collections." },
    { slug: "py-working-with-data", title: "Working with data", upto: 18, summary: "Functions, strings, comprehensions, objects, errors, files, modules and booleans." },
    { slug: "py-everyday-python", title: "Everyday Python", upto: 24, summary: "Numbers, formatting, lambdas, scope, JSON, dates, the wider operator set and match-case." },
    { slug: "py-objects-and-flow", title: "Objects and control", upto: 32, summary: "Recursion, inheritance, encapsulation, dunder methods, class attributes and the MRO, generators, decorators and regex." },
    { slug: "py-standard-library", title: "The standard library", upto: 37, summary: "Concurrency, async, collections, itertools, functools, system modules and persistence." },
    { slug: "py-shipping-code", title: "Shipping code", upto: 41, summary: "Testing, debugging and logging, clean code, project structure and git." },
    { slug: "py-dsa", title: "Data structures & algorithms", upto: 57, summary: "Big-O, stacks and queues, linked lists and hash tables, trees and graphs, searching and sorting, the Python reference, the three tree traversals, balanced trees, sorting without comparing, the three linked-list shapes with hash sets, cycle detection, shortest paths, minimum spanning trees, memoisation, dynamic programming, and greedy algorithms." },
  ],
  // The full plan is docs/MICROPROCESSOR-SYLLABUS.md — 42 lessons, decided in one
  // go so nothing has to be guessed lesson by lesson. `upto` values point at
  // lesson orders that mostly do not exist yet; the applier finds no lessons for
  // them, which is why they are safe to declare ahead and gives the roadmap the
  // real shape of the course from the first lesson.
  microprocessor: [
    { slug: "mp-before-the-processor", title: "Before the processor", upto: 4, summary: "The ground floor, assuming no background at all: switches and bits, hex, memory as numbered boxes, and what a program actually is." },
    { slug: "mp-foundations", title: "Foundations", upto: 8, summary: "What a microprocessor is, how it evolved, what is inside the chip, and the three buses that connect it to everything else." },
    { slug: "mp-architecture", title: "8085 architecture", upto: 13, summary: "The register set, the flags, the 40 pins, memory decoding, and the instruction cycle measured in T-states." },
    { slug: "mp-instruction-set", title: "Instruction set and addressing", upto: 19, summary: "All five instruction groups, the addressing modes, and the stack and subroutine mechanism." },
    { slug: "mp-programming", title: "Assembly programming", upto: 24, summary: "Delay loops, block operations, sorting, code conversion and subroutines that pass parameters properly." },
    { slug: "mp-interrupts", title: "Interrupts and DMA", upto: 27, summary: "The 8085's five interrupts, masking and priority, writing an ISR, and how DMA moves data without the processor." },
    { slug: "mp-interfacing", title: "Interfacing", upto: 33, summary: "Memory-mapped versus I/O-mapped, the 8255, the 8253 timer, the 8259 controller, ADC/DAC, and real devices." },
    { slug: "mp-communication", title: "Communication", upto: 35, summary: "Serial and parallel communication, framing and baud rate, the 8251, and handshaking." },
    { slug: "mp-8086-and-modern", title: "8086 and modern processors", upto: 39, summary: "BIU and EU, segmentation, the 8086 instruction set, and what became cache, pipelining and multicore." },
    { slug: "mp-microcontrollers", title: "Microcontrollers", upto: 41, summary: "Where a microcontroller belongs instead of a microprocessor, and the 8051." },
    { slug: "mp-exam-prep", title: "Exam and interview preparation", upto: 42, summary: "The question patterns that repeat every year, each worked end to end, plus a one-page revision per chapter." },
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
