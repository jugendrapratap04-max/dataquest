/* The numbers a profile is actually made of.
 *
 * Everything here is DERIVED from submissions, never stored — the same rule the
 * rest of lib/profile.ts follows, and the reason the seeded streak and the
 * seeded Track.status were removed. A profile that shows a number nobody earned
 * stops being worth showing anyone.
 *
 * The platform already had all of this data and put none of it on the page. A
 * student saw "2 problems solved" and nothing else: not which difficulties, not
 * which topics, not how they were spread over the year. Those three breakdowns
 * are the whole difference between a counter and a profile.
 */
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { studyMoments } from "@/lib/progress";

/* ------------------------------------------------------------------ solved -- */

/** Hardest last. Also the order they are shown in, so the bars read as a ramp. */
export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Super Hard"] as const;

export type DiffRow = { label: string; solved: number; total: number };
export type TopicRow = { tag: string; solved: number; total: number };

export type SolvedStats = {
  totalSolved: number;
  totalProblems: number;
  byDifficulty: DiffRow[];
  /** Most-solved first, capped — see TOPIC_LIMIT. */
  byTopic: TopicRow[];
  /** How many distinct topics they have solved at least one problem in. */
  topicsTouched: number;
  /** Topics with nothing left in them. Counted over every tag, not just the
   *  twelve shown, and only for tags with enough problems to be worth clearing —
   *  otherwise a tag with one problem in it hands out a mastery badge. */
  clearedTopics: number;
  fastest: { title: string; slug: string; seconds: number } | null;
};

/** Below this many problems, a tag is not something you can "master". */
const MASTERY_MIN = 5;

/** 202 distinct tags exist. A profile showing all of them is a word cloud, not a
 *  summary; these are the ones the student has actually done work in. */
const TOPIC_LIMIT = 12;

/** Counted as DISTINCT problems, not submissions.
 *
 *  This matters more than it looks. Re-solving one problem five times used to
 *  read as five solves everywhere it was counted — which is how the recent
 *  activity list came to show "Add Two Numbers" five times in a row. A problem
 *  you have solved is solved once. */
export const getSolvedStats = cache(getSolvedStatsImpl);
async function getSolvedStatsImpl(userId: string): Promise<SolvedStats> {
  const [passed, allProblems, best] = await Promise.all([
    prisma.submission.findMany({
      where: { userId, passed: true },
      select: { problemId: true },
      distinct: ["problemId"],
    }),
    prisma.problem.findMany({ select: { id: true, difficulty: true, tagsCsv: true } }),
    prisma.problemAttempt.findFirst({
      where: { userId, solvedSeconds: { not: null } },
      orderBy: { solvedSeconds: "asc" },
      select: { solvedSeconds: true, problem: { select: { title: true, slug: true } } },
    }),
  ]);

  const solvedIds = new Set(passed.map((s) => s.problemId));

  const diff = new Map<string, { solved: number; total: number }>();
  for (const d of DIFFICULTIES) diff.set(d, { solved: 0, total: 0 });
  const topic = new Map<string, { solved: number; total: number }>();

  for (const p of allProblems) {
    const done = solvedIds.has(p.id);

    // A difficulty outside the known four is counted rather than dropped, so the
    // totals on this page always add up to the catalogue.
    if (!diff.has(p.difficulty)) diff.set(p.difficulty, { solved: 0, total: 0 });
    const d = diff.get(p.difficulty)!;
    d.total++;
    if (done) d.solved++;

    for (const raw of (p.tagsCsv || "").split(",")) {
      const tag = raw.trim();
      if (!tag) continue;
      const t = topic.get(tag) ?? { solved: 0, total: 0 };
      t.total++;
      if (done) t.solved++;
      topic.set(tag, t);
    }
  }

  const byTopic = [...topic.entries()]
    .map(([tag, v]) => ({ tag, ...v }))
    .filter((t) => t.solved > 0)
    .sort((a, b) => b.solved - a.solved || a.tag.localeCompare(b.tag));

  return {
    totalSolved: solvedIds.size,
    totalProblems: allProblems.length,
    byDifficulty: [...diff.entries()].map(([label, v]) => ({ label, ...v })),
    byTopic: byTopic.slice(0, TOPIC_LIMIT),
    topicsTouched: byTopic.length,
    clearedTopics: byTopic.filter((t) => t.total >= MASTERY_MIN && t.solved === t.total).length,
    fastest: best?.solvedSeconds
      ? { title: best.problem.title, slug: best.problem.slug, seconds: best.solvedSeconds }
      : null,
  };
}

/* ---------------------------------------------------------------- calendar -- */

export type YearActivity = {
  /** Oldest first, always starting on a Sunday so the grid columns are weeks. */
  days: { at: Date; n: number }[];
  /** Column index each month label sits above. */
  months: { label: string; col: number }[];
  total: number;
  activeDays: number;
  weeks: number;
};

/** A year of practice, laid out the way every contribution graph is.
 *
 *  The profile used to show four weeks. Four weeks of a beginner's practice is
 *  a handful of squares in a strip — it reads as "this person does nothing"
 *  whether or not that is true. A year has room for the shape of a habit. */
export const getYearActivity = cache(getYearActivityImpl);
async function getYearActivityImpl(userId: string, weeks = 53): Promise<YearActivity> {
  const DAY = 86_400_000;

  // Start on the Sunday on or before (today - weeks*7 + 1), so the last column
  // is the current, partial week and every column above it is a full one.
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - (weeks * 7 - 1) * DAY);
  start.setDate(start.getDate() - start.getDay());

  const total_days = Math.round((end.getTime() - start.getTime()) / DAY) + 1;

  // Same source as the streak and the dashboard's week — see studyMoments.
  // A square on this grid and a day on the streak have to mean one thing.
  const moments = await studyMoments(userId, start);

  const counts = new Array<number>(total_days).fill(0);
  for (const at of moments) {
    const d = new Date(at);
    d.setHours(0, 0, 0, 0);
    const i = Math.round((d.getTime() - start.getTime()) / DAY);
    if (i >= 0 && i < total_days) counts[i]++;
  }

  const days = counts.map((n, i) => ({ at: new Date(start.getTime() + i * DAY), n }));

  // One label per month, above the column its 1st falls in.
  //
  // The window starts mid-month, and that first partial month gets no label —
  // labelling it puts two names within a column or two of each other and the
  // second one, a real full month, is the one that then has to be dropped.
  // Every contribution graph handles the ragged left edge this way.
  const months: { label: string; col: number }[] = [];
  for (let i = 0; i < days.length; i++) {
    const at = days[i].at;
    if (at.getDate() !== 1) continue;
    const col = Math.floor(i / 7);
    const label = at.toLocaleDateString("en-GB", { month: "short" });
    if (months.length && col - months[months.length - 1].col < 3) continue;
    months.push({ label, col });
  }

  return {
    days,
    months,
    total: counts.reduce((a, b) => a + b, 0),
    activeDays: counts.filter((n) => n > 0).length,
    weeks: Math.ceil(total_days / 7),
  };
}
