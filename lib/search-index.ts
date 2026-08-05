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

/* A topic, with every word it contains, kept on the SERVER only.
 *
 * The index used to be shipped whole to the browser and filtered there, which
 * is why it could only carry titles and code identifiers — anything more was
 * megabytes. That made "search everything" impossible by construction: a
 * student could only find a topic by a word someone had chosen to index.
 *
 * Searching on the server removes the ceiling. The full text never leaves this
 * process, the browser downloads nothing up front, and a query returns eight
 * small rows. It costs one round trip per search instead of one large download
 * per session — a better trade on a phone, and the only one that can honestly
 * be called searching everything.
 */
type Searchable = {
  title: string;
  slug: string;
  /** ?t= value; 0 for a whole lesson that is not split. */
  t: number;
  sub: string;
  kind: "topic" | "lesson" | "problem";
  /** Every word in the topic, lower-cased. Never serialised. */
  text: string;
};

export type SearchHit = { title: string; slug: string; sub: string; kind: string; t?: number };

type Index = { lessons: SearchLesson[]; rows: Searchable[]; problems: SearchProblem[] };

let cache: { at: number; data: Index } | null = null;
const TTL_MS = 10 * 60 * 1000;

const stripTags = (s: string) => s.replace(/<[^>]*>/g, " ");

/** Every human-readable string in a block, however deeply nested. */
function textOf(v: unknown): string {
  if (typeof v === "string") return stripTags(v) + " ";
  if (Array.isArray(v)) return v.map(textOf).join("");
  if (v && typeof v === "object") {
    return Object.entries(v as Record<string, unknown>)
      // `t` is the block type ("p", "code") — a word every block would match on.
      .filter(([k]) => k !== "t")
      .map(([, x]) => textOf(x))
      .join("");
  }
  return "";
}

/** Prose AND code, collapsed to lower-case words. This is the whole point:
 *  anything written in a topic can be searched for, not a curated subset. */
function searchableText(blocks: unknown[]): string {
  return blocks.map(textOf).join(" ").toLowerCase().replace(/\s+/g, " ").trim();
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
  const rows: Searchable[] = [];

  for (const l of lessons) {
    const sub = l.track.title.split(" — ")[0];
    outLessons.push({ title: l.title, slug: l.slug, sub });

    let blocks: { t: string; [k: string]: unknown }[] = [];
    try { blocks = JSON.parse(l.contentJson || "[]"); } catch { blocks = []; }
    const rest = blocks.filter((b) => b.t !== "objectives");
    const { outline, anchors } = lessonOutline(rest);

    // Under four entries the lesson renders whole and has no ?t= to link to, so
    // it is searchable as one row rather than as topics that go nowhere useful.
    if (outline.length < 4) {
      rows.push({
        title: l.title, slug: l.slug, t: 0, sub, kind: "lesson",
        text: `${l.title} ${sub} ${searchableText(rest)}`.toLowerCase(),
      });
      continue;
    }

    // Same walk the lesson page does: each anchor starts the next topic.
    const groups: (typeof rest)[] = outline.map(() => []);
    let seen = -1;
    rest.forEach((b, i) => {
      if (anchors.has(i)) seen++;
      groups[Math.max(0, seen)]?.push(b);
    });

    outline.forEach((o, i) => {
      rows.push({
        title: o.label,
        slug: l.slug,
        t: i + 1,
        sub: l.title,
        kind: "topic",
        // The lesson title goes in too, so "python strings" finds a topic of
        // the strings lesson even though neither word is in the topic's own
        // heading.
        text: `${o.label} ${l.title} ${sub} ${searchableText(groups[i] ?? [])}`.toLowerCase(),
      });
    });
  }

  for (const p of problems) {
    rows.push({
      title: p.title, slug: p.slug, t: 0, sub: p.difficulty, kind: "problem",
      text: `${p.title} ${p.difficulty}`.toLowerCase(),
    });
  }

  const data: Index = {
    lessons: outLessons,
    rows,
    problems: problems.map((p) => ({ title: p.title, slug: p.slug, sub: p.difficulty })),
  };
  cache = { at: Date.now(), data };
  return data;
}

/**
 * Rank rows against a query.
 *
 * A hit in the TITLE outranks a hit in the body, so typing "slicing" gives the
 * topic called Slicing before the twelve topics that mention it in passing.
 * Body matches still appear — that is the whole reason for full text — but
 * underneath, where they belong.
 */
export async function search(q: string, limit = 8): Promise<SearchHit[]> {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];

  const { rows } = await buildSearchIndex();
  const scored: { row: Searchable; rank: number }[] = [];

  for (const row of rows) {
    const title = row.title.toLowerCase();
    let rank: number;
    if (title.startsWith(needle)) rank = 0;
    else if (title.includes(needle)) rank = 1;
    else if (row.sub.toLowerCase().includes(needle)) rank = 2;
    else if (row.text.includes(needle)) rank = 3;
    else continue;

    // A topic is a more precise answer than the whole lesson or a problem, so
    // it wins a tie.
    scored.push({ row, rank: rank * 2 + (row.kind === "topic" ? 0 : 1) });
  }

  scored.sort((a, b) => a.rank - b.rank);
  return scored.slice(0, limit).map(({ row }) => ({
    title: row.title,
    slug: row.slug,
    sub: row.sub,
    kind: row.kind,
    ...(row.t > 1 ? { t: row.t } : {}),
  }));
}
