import { prisma } from "@/lib/prisma";
import { lessonOutline } from "@/lib/lesson-outline";

/* The search index, built once and kept in memory.
 *
 * WHY TOPICS AND NOT JUST LESSONS. Search used to match lesson TITLES only, so
 * anything taught inside a lesson was invisible: a student searching "frozenset"
 * or "deque" or "popleft" got nothing, even though all three are taught. And a
 * term that did match landed them on topic 1 of eighteen, still hunting.
 *
 * WHY IDENTIFIERS AND NOT THE PROSE. The whole index is sent to the browser once
 * and filtered there, which is what makes typing feel instant. Shipping every
 * lesson's text would be megabytes. Code identifiers are the opposite trade:
 * tiny, and they are what people actually search for — nobody types a sentence
 * from a paragraph, they type the name of the thing.
 *
 * WHY IT IS CACHED. Building this parses contentJson for every lesson and walks
 * each one's outline. Content only changes when `db:lessons` runs, so doing that
 * per request would be waste. A cold start rebuilds it.
 */

export type SearchLesson = { title: string; slug: string; sub: string };
export type SearchProblem = { title: string; slug: string; sub: string };

/* Topics are grouped by lesson, and the field names are one letter.
 *
 * Flat objects were the obvious shape and cost 170 KB: 1,184 of them, each
 * repeating its lesson's slug, its lesson's full title, and the JSON key names
 * "title"/"slug"/"sub"/"t"/"k". The key names alone were ~35 KB. Grouping emits
 * the slug and lesson title once each and turns every topic into a two-element
 * array, which more than halves the payload for identical information.
 *
 *   s = lesson slug   b = lesson title   t = [[topic title, identifiers?], ...]
 *
 * The ?t= value is the position in `t` plus one, so it does not need storing. */
export type SearchTopicGroup = { s: string; b: string; t: [string, string?][] };

type Index = { lessons: SearchLesson[]; topicGroups: SearchTopicGroup[]; problems: SearchProblem[] };

let cache: { at: number; data: Index } | null = null;
const TTL_MS = 10 * 60 * 1000;

/* Words that would match everything and help nobody. Python keywords and the
 * handful of builtins that appear in nearly every example. */
const NOISE = new Set([
  "def", "return", "print", "for", "in", "if", "else", "elif", "while", "import",
  "from", "class", "self", "true", "false", "none", "and", "or", "not", "is",
  "int", "str", "len", "range", "list", "dict", "set", "type", "pass", "try",
  "except", "with", "as", "the", "out", "res", "val", "tmp", "foo", "bar",
]);

/** Identifiers a student might plausibly search for, from a topic's code. */
function identifiers(blocks: { t: string; [k: string]: unknown }[]): string {
  const found = new Set<string>();
  for (const b of blocks) {
    const src = typeof b.code === "string" ? b.code : "";
    if (!src) continue;
    for (const w of src.match(/[A-Za-z_][A-Za-z0-9_]{2,}/g) ?? []) {
      const lower = w.toLowerCase();
      if (NOISE.has(lower)) continue;
      found.add(lower);
      if (found.size >= 10) break;      // a cap keeps the payload honest
    }
    if (found.size >= 10) break;
  }
  return [...found].join(" ");
}

export async function buildSearchIndex(): Promise<Index> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  const lessons = await prisma.lesson.findMany({
    select: { title: true, slug: true, contentJson: true, track: { select: { title: true } } },
    orderBy: [{ track: { order: "asc" } }, { order: "asc" }],
  });
  const problems = await prisma.problem.findMany({
    select: { title: true, slug: true, difficulty: true },
    orderBy: { order: "asc" },
  });

  const outLessons: SearchLesson[] = [];
  const topicGroups: SearchTopicGroup[] = [];

  for (const l of lessons) {
    const sub = l.track.title.split(" — ")[0];
    outLessons.push({ title: l.title, slug: l.slug, sub });

    let blocks: { t: string; [k: string]: unknown }[] = [];
    try { blocks = JSON.parse(l.contentJson || "[]"); } catch { continue; }
    const rest = blocks.filter((b) => b.t !== "objectives");
    const { outline, anchors } = lessonOutline(rest);

    // Under four entries the lesson renders whole and has no ?t= to link to,
    // so indexing its topics would produce links that go nowhere useful.
    if (outline.length < 4) continue;

    // Same walk the lesson page does: each anchor starts the next topic.
    const groups: (typeof rest)[] = outline.map(() => []);
    let seen = -1;
    rest.forEach((b, i) => {
      if (anchors.has(i)) seen++;
      groups[Math.max(0, seen)]?.push(b);
    });

    topicGroups.push({
      s: l.slug,
      b: l.title,
      t: outline.map((o, i) => {
        const k = identifiers(groups[i] ?? []);
        // Drop identifiers the title already carries — indexing "frozenset"
        // twice for "frozenset — a set that can be a key" buys nothing.
        const title = o.label.toLowerCase();
        const useful = k.split(" ").filter((w) => w && !title.includes(w)).join(" ");
        return useful ? [o.label, useful] : [o.label];
      }),
    });
  }

  const data: Index = {
    lessons: outLessons,
    topicGroups,
    problems: problems.map((p) => ({ title: p.title, slug: p.slug, sub: p.difficulty })),
  };
  cache = { at: Date.now(), data };
  return data;
}
