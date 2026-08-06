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

import { prisma, via } from "./db.mjs";
console.log(`db: ${via}`);
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
  // re-run `npm run db:chapters`. Boundaries below are correct for the 58-lesson
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
    // Split at 51/52 when the DSA block reached 16 lessons. The boundary is not
    // arbitrary: everything up to 51 is "here is a structure, and the operations
    // that live on it" (the sorts included — they run on a plain list), and
    // everything from 52 is a named algorithm that has to CHOOSE correctly.
    //
    // `py-dsa` keeps its slug deliberately. Chapter URLs are in the sitemap
    // (app/sitemap.ts reads them from the database), so renaming the slug would
    // break /book/python/py-dsa, which has been live and indexed.
    { slug: "py-dsa", title: "Data structures & sorting", upto: 51, summary: "Complexity, stacks and queues, linked lists in all three shapes, hash tables and hash sets, trees from binary search trees to balanced ones, graphs, the Python reference, and every sort from bubble up to radix — including the two that never compare anything." },
    { slug: "py-algorithms", title: "Graph algorithms & optimisation", upto: 58, summary: "Cycle detection, shortest paths with Dijkstra and Bellman-Ford, minimum spanning trees with Prim's and Kruskal's, and the ways to choose well — memoisation, dynamic programming and greedy — each one shown failing before it is shown working. It ends on max flow, where a wrong choice is made reversible rather than avoided, and the travelling salesman, where no fast answer exists at all." },
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

  // The HTML course was written in modules from the start; this makes those
  // modules real rather than a comment in the content file. They are what the
  // course navigation groups by, so a student can see "I am in Links, there are
  // two lessons in it" instead of reading a flat list of 23 titles.
  html: [
    { slug: "html-web-foundations", title: "How the web works", upto: 5, summary: "No markup at all yet, and that is the point: where a page goes, who asks for it, who answers, and what happens between pressing Enter and seeing the screen." },
    { slug: "html-setup", title: "Setting up", upto: 7, summary: "An editor, a live-reloading server, and the browser tools that show you what your file became." },
    { slug: "html-basics", title: "The basics", upto: 10, summary: "What HTML actually is, the skeleton every page starts from, and elements, attributes and nesting." },
    { slug: "html-text", title: "Text and content", upto: 12, summary: "Headings that describe structure rather than size, and the elements that mark what text means." },
    { slug: "html-links", title: "Links", upto: 14, summary: "The element the web is named after: absolute and relative addresses, fragments, new tabs, and the words inside the anchor." },
    { slug: "html-images", title: "Images", upto: 16, summary: "src and alt for the audience that never sees them, then size, captions and lazy loading." },
    { slug: "html-lists", title: "Lists", upto: 18, summary: "Ordered, unordered and description lists — and why a list announces its count before its contents." },
    { slug: "html-tables", title: "Tables", upto: 20, summary: "Rows, headers and scope for real tabular data, plus spanning cells and the decade tables were misused for layout." },
    { slug: "html-forms", title: "Forms", upto: 23, summary: "Where the web stops being read-only: names, labels, input types, and validation that is a courtesy rather than a defence." },
    // ⚠️ LAST ENTRY: bump this `upto` with every lesson appended to the track.
    // Anything past the final boundary gets no chapter at all, which drops it
    // out of /book AND now out of the course navigation's grouping.
    { slug: "html-semantic", title: "Semantic HTML", upto: 25, summary: "The argument the whole course has been making, given its name and its page-level elements: landmarks a reader can jump between, and the test that separates an article from a section from a plain div." },
    // ⚠️ LAST ENTRY: bump this `upto` with every lesson appended to the track.
    // Anything past the final boundary gets no chapter at all, which drops it
    // out of /book AND out of the course navigation's grouping.
    { slug: "html-metadata", title: "Metadata and the head", upto: 27, summary: "The content nobody sees on the page and everybody sees somewhere else: the line that makes a page work on a phone, the two lines a search result is built from, and the tags that decide what your link looks like when somebody shares it." },
    // ⚠️ LAST ENTRY: bump this `upto` with every lesson appended to the track.
    // Anything past the final boundary gets no chapter at all, which drops it
    // out of /book AND out of the course navigation's grouping.
    { slug: "html-entities", title: "Entities and special characters", upto: 29, summary: "How to write about HTML in HTML without the page eating it, the double-escape bug and its unmistakable symptom, and everything else you can simply type now that a page declares UTF-8." },
    // ⚠️ LAST ENTRY: bump this `upto` with every lesson appended to the track.
    // Anything past the final boundary gets no chapter at all, which drops it
    // out of /book AND out of the course navigation's grouping.
    { slug: "html-accessibility", title: "Accessibility", upto: 31, summary: "The argument every earlier module was already making, given its name — plus the part that was missing: the keyboard. Then ARIA, which is mostly a warning, because it changes what a page claims and never what it does." },
    // ⚠️ LAST ENTRY: bump this `upto` with every lesson appended to the track.
    // Anything past the final boundary gets no chapter at all, which drops it
    // out of /book AND out of the course navigation's grouping.
    { slug: "html-seo", title: "SEO", upto: 33, summary: "What a crawler actually reads, why blocking a page can leave it in search anyway, and structured data — the one modern SEO surface the rest of the course does not already cover by another name." },
    // ⚠️ LAST ENTRY: bump this `upto` with every lesson appended to the track.
    // Anything past the final boundary gets no chapter at all, which drops it
    // out of /book AND out of the course navigation's grouping.
    { slug: "html-media", title: "Media and embeds", upto: 35, summary: "Video and audio without a plugin, the reason autoplay usually does not work, captions for everyone watching without sound — and then somebody else's page inside yours, plus how to choose between an image, an inline SVG and a canvas." },
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
