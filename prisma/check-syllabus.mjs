/* Scoreboard: what the Python track covers, against the reference syllabus.
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
  };
}

const track = await prisma.track.findUnique({ where: { slug: "python" }, select: { id: true } });
if (!track) { console.error("no python track"); process.exit(1); }
const lessons = await prisma.lesson.findMany({
  where: { trackId: track.id },
  select: { slug: true, title: true, order: true, contentJson: true, _count: { select: { problems: true } } },
  orderBy: { order: "asc" },
});
const bySlug = Object.fromEntries(lessons.map((l) => [l.slug, { ...l, m: measure(l) }]));

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

const stubs = Object.values(bySlug).filter((l) => !l.m.solid).sort((a, b) => a.order - b.order);
console.log(`\nLESSONS NOT YET AT STANDARD: ${stubs.length}/${lessons.length}`);
for (const l of stubs.slice(0, FULL ? 99 : 12)) {
  console.log(`  ${String(l.order).padStart(2)}. ${l.slug.padEnd(24)} ${String(l.m.words).padStart(5)}w  viz:${l.m.viz}  probs:${String(l.m.problems).padStart(2)}  teaching:${l.m.teaching}/5  quiz:${l.m.quiz ? "y" : "n"}`);
}
if (!FULL && stubs.length > 12) console.log(`  … and ${stubs.length - 12} more (run with --full)`);

await prisma.$disconnect();
process.exit(broken ? 1 : 0);
