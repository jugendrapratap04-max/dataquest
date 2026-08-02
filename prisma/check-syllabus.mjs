/* Scoreboard: what every subject covers, measured against one bar.
 *
 * A topic is only "done" if the lesson claiming it is actually substantial —
 * a slug existing in the database proves nothing. Every lesson is measured
 * (words, visualisations, practice problems, teaching blocks) and a topic
 * pointing at a stub is reported as thin, not as covered.
 *
 * Usage: npm run syllabus            (summary)
 *        npm run syllabus -- --full  (every topic, including the done ones)
 */
import { PrismaClient } from "@prisma/client";
import { SYLLABUS } from "./syllabus.mjs";

const prisma = new PrismaClient();
const FULL = process.argv.includes("--full");

// A lesson has to clear all of these to count as taught rather than sketched.
const MIN_WORDS = 400;
// A rebuilt lesson runs about 1,800-2,300 words. This is the floor for the
// stricter 'full standard' measure below, not for the syllabus mapping.
const FULL_WORDS = 1200;
const TEACHING = ["hook", "def", "mistakes", "recap", "interview"];

const strip = (s) => s.replace(/<[^>]*>/g, " ");
function measure(lesson) {
  let blocks = [];
  try { blocks = JSON.parse(lesson.contentJson || "[]"); } catch {}
  const words = strip(JSON.stringify(blocks)).split(/\s+/).filter(Boolean).length;
  const types = new Set(blocks.map((b) => b.t));
  return {
    words,
    viz: blocks.filter((b) => b.t === "viz").length,
    problems: lesson._count.problems,
    teaching: TEACHING.filter((t) => types.has(t)).length,
    quiz: types.has("quiz"),
    solid: words >= MIN_WORDS && blocks.filter((b) => b.t === "viz").length >= 1 && TEACHING.filter((t) => types.has(t)).length >= 4,
    // The stricter bar, and the reason it exists: `solid` passed lessons that
    // were half-length and still in Hinglish. `loops` was 774 words with no
    // quiz, no drills and no debug task, and the scoreboard called it done —
    // because 400 words, one visual and four teaching blocks were all it asked
    // for. The written standard is more than that: a quiz, practice drills and
    // a debug task, on a lesson with real depth. This measures THAT.
    full:
      words >= FULL_WORDS &&
      blocks.filter((b) => b.t === "viz").length >= 1 &&
      TEACHING.filter((t) => types.has(t)).length >= 4 &&
      types.has("quiz") &&
      types.has("drills") &&
      types.has("debug"),
  };
}

// Every subject is measured, not just Python.
//
// This tool used to load the python track alone and report "4 lessons below
// standard", which read as "the platform is nearly done" while 44 stub lessons
// sat untouched across the other eight subjects. Etudo is a multi-subject
// platform (docs/ARCHITECTURE.md); a scoreboard that can only see one subject
// is a scoreboard that misleads.
//
// The syllabus mapping below is still Python's reference syllabus — that part is
// legitimately per-subject, and other subjects will get their own.
const subjects = await prisma.track.findMany({
  select: {
    id: true, slug: true, title: true, order: true,
    lessons: {
      select: { slug: true, title: true, order: true, contentJson: true, _count: { select: { problems: true } } },
      orderBy: { order: "asc" },
    },
  },
  orderBy: { order: "asc" },
});
if (!subjects.length) { console.error("no subjects in the database"); process.exit(1); }

const measured = subjects.map((s) => ({
  ...s,
  lessons: s.lessons.map((l) => ({ ...l, m: measure(l), subject: s.slug })),
}));

const pythonSubject = measured.find((s) => s.slug === "python");
if (!pythonSubject) { console.error("no python subject"); process.exit(1); }
const lessons = pythonSubject.lessons;
const bySlug = Object.fromEntries(lessons.map((l) => [l.slug, l]));

let done = 0, thin = 0, missing = 0, broken = 0;
const gaps = [];

for (const g of SYLLABUS) {
  const rows = [];
  for (const topic of g.topics) {
    const hits = topic.covers.map((s) => bySlug[s]).filter(Boolean);
    const badRef = topic.covers.filter((s) => !bySlug[s]);
    let mark, note;
    if (badRef.length) { mark = "  !!  "; note = `syllabus points at a lesson that does not exist: ${badRef.join(", ")}`; broken++; }
    else if (!hits.length) { mark = "  --  "; note = "nothing covers this"; missing++; gaps.push(`${g.group} → ${topic.t}`); }
    else if (hits.some((h) => h.m.solid)) { mark = "  ok  "; note = hits.map((h) => h.slug).join(", "); done++; }
    else { mark = "  ~   "; const h = hits[0]; note = `${h.slug} is thin (${h.m.words}w, ${h.m.viz} viz, ${h.m.teaching}/5 teaching blocks)`; thin++; gaps.push(`${g.group} → ${topic.t}  [thin: ${h.slug}]`); }
    if (FULL || mark !== "  ok  ") rows.push(`${mark} ${topic.t.padEnd(46)} ${note}`);
  }
  if (rows.length) { console.log(`\n### ${g.group}`); rows.forEach((r) => console.log(r)); }
}

const total = done + thin + missing + broken;
console.log(`\n${"=".repeat(74)}`);
console.log(`SYLLABUS COVERAGE (vs W3Schools core Python + DSA + Reference)`);
console.log(`  ok  taught properly      ${String(done).padStart(3)} / ${total}`);
console.log(`  ~   covered but thin     ${String(thin).padStart(3)} / ${total}`);
console.log(`  --  nothing covers it    ${String(missing).padStart(3)} / ${total}`);
if (broken) console.log(`  !!  broken mapping      ${String(broken).padStart(3)} / ${total}   <- fix prisma/syllabus.mjs`);
console.log(`\n  a lesson counts as taught at >=${MIN_WORDS} words, >=1 visualisation and >=4/5 teaching blocks`);

// ---------------------------------------------------------------------------
// Platform scoreboard — every subject, against the same bar.
// ---------------------------------------------------------------------------
const allLessons = measured.flatMap((s) => s.lessons);
const atStandard = allLessons.filter((l) => l.m.solid).length;
const atFull = allLessons.filter((l) => l.m.full).length;

console.log(`\n${"=".repeat(74)}`);
console.log("PLATFORM — every subject against the same bar\n");
console.log(`  ${"subject".padEnd(16)} ${"lessons".padStart(7)} ${"passes bar".padStart(10)} ${"FULL".padStart(6)} ${"problems".padStart(8)} ${"quizzes".padStart(7)}`);
for (const s of measured) {
  const solid = s.lessons.filter((l) => l.m.solid).length;
  const full = s.lessons.filter((l) => l.m.full).length;
  const probs = s.lessons.reduce((n, l) => n + l.m.problems, 0);
  const quizzes = s.lessons.filter((l) => l.m.quiz).length;
  const flag = s.lessons.length && solid === 0 ? "  <- nothing at standard" : "";
  console.log(`  ${s.slug.padEnd(16)} ${String(s.lessons.length).padStart(7)} ${String(solid).padStart(10)} ${String(full).padStart(6)} ${String(probs).padStart(8)} ${String(quizzes).padStart(7)}${flag}`);
}
console.log(`\n  ${"TOTAL".padEnd(16)} ${String(allLessons.length).padStart(7)} ${String(atStandard).padStart(11)}`);
console.log(`  ${atStandard} of ${allLessons.length} pass the minimum bar (${Math.round((atStandard / allLessons.length) * 100)}%).`);
console.log(`  ${atFull} of ${allLessons.length} are at the FULL standard (${Math.round((atFull / allLessons.length) * 100)}%) - quiz, drills and a debug task, on a lesson with real depth.`);

// Listed against the FULL standard, because that is the actual work list.
const stubs = allLessons.filter((l) => !l.m.full).sort(
  (a, b) => (a.subject > b.subject ? 1 : a.subject < b.subject ? -1 : a.order - b.order)
);
console.log(`\nLESSONS NOT YET AT STANDARD: ${stubs.length}/${allLessons.length}`);
for (const l of stubs.slice(0, FULL ? 999 : 12)) {
  console.log(`  ${l.subject.padEnd(12)} ${String(l.order).padStart(2)}. ${l.slug.padEnd(24)} ${String(l.m.words).padStart(5)}w  viz:${l.m.viz}  probs:${String(l.m.problems).padStart(2)}  teaching:${l.m.teaching}/5  quiz:${l.m.quiz ? "y" : "n"}`);
}
if (!FULL && stubs.length > 12) console.log(`  … and ${stubs.length - 12} more (run with --full)`);

await prisma.$disconnect();
process.exit(broken ? 1 : 0);
