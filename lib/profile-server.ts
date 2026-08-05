/* Student identity — the half that queries.
 *
 * Split from lib/profile.ts because the sidebar is a client component and needs
 * the level and the avatar from there; importing prisma into that file would put
 * the database client in the browser bundle.
 */
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { TimelineEntry } from "@/lib/profile";

/* ------------------------------------------------------------------- rank -- */

/** Below this many ranked students, no rank is shown at all.
 *
 *  "#2 of 3" is a true sentence that flatters nobody and reads as a toy. The
 *  point of a rank is that the board is worth being on. */
const MIN_RANKED = 10;

/** Real global rank, or null when a rank would not mean anything yet.
 *
 *  The leaderboard page computes its rank with `findIndex` over its own
 *  `take: 25` list. That is fine for painting that list and wrong as a number:
 *  everybody outside the top 25 comes out as 0. Putting that on a profile or a
 *  dashboard would be inventing a position, so this counts properly.
 *
 *  Two deliberate nulls. A student with no passing submission is not ranked —
 *  the same evidence rule the leaderboard already uses, which is what stopped
 *  seeded accounts outranking real ones. And a board with fewer than MIN_RANKED
 *  people on it does not produce a rank at all. */
export const getRank = cache(getRankImpl);
async function getRankImpl(userId: string): Promise<{ rank: number; outOf: number } | null> {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, submissions: { where: { passed: true }, take: 1, select: { id: true } } },
  });
  if (!me || me.submissions.length === 0) return null;

  const outOf = await prisma.user.count({ where: { submissions: { some: { passed: true } } } });
  if (outOf < MIN_RANKED) return null;

  const ahead = await prisma.user.count({
    where: { xp: { gt: me.xp }, submissions: { some: { passed: true } } },
  });
  return { rank: ahead + 1, outOf };
}

/* --------------------------------------------------------------- timeline -- */

/** The student's own recent history, from the two tables that record a time.
 *
 *  LessonProgress rows written before `completedAt` existed have NULL there and
 *  are skipped rather than dated — see the migration note. A short honest
 *  timeline beats a full one with invented dates on it.
 *
 *  ONE ENTRY PER PROBLEM. This read every passing submission, so a student who
 *  reopened one problem across a fortnight — which is exactly what practising
 *  looks like — got a profile whose entire recent history was "Add Two Numbers"
 *  five times over. Solving something you have already solved is not news; the
 *  first time you solved it is. `distinct` on problemId with the oldest row
 *  first is that first solve.
 *
 *  Unbounded on purpose: it returns one row per problem the student has ever
 *  solved, which is capped by the size of the catalogue, and the merge below
 *  needs them all before it can know which twelve are the most recent. */
export const getTimeline = cache(getTimelineImpl);
async function getTimelineImpl(userId: string, limit = 12): Promise<TimelineEntry[]> {
  const [subs, lessons] = await Promise.all([
    prisma.submission.findMany({
      where: { userId, passed: true },
      orderBy: [{ problemId: "asc" }, { createdAt: "asc" }],
      distinct: ["problemId"],
      select: { createdAt: true, problem: { select: { title: true, slug: true, difficulty: true } } },
    }),
    prisma.lessonProgress.findMany({
      where: { userId, status: "done", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: limit,
      select: { completedAt: true, lesson: { select: { title: true, slug: true, track: { select: { title: true } } } } },
    }),
  ]);

  const entries: TimelineEntry[] = [
    ...subs.map((s) => ({
      at: s.createdAt,
      kind: "solved" as const,
      title: s.problem.title,
      detail: `${s.problem.difficulty} problem solved`,
      href: `/practice/${s.problem.slug}`,
    })),
    ...lessons.map((l) => ({
      at: l.completedAt as Date,
      kind: "lesson" as const,
      title: l.lesson.title,
      detail: `${l.lesson.track.title} · lesson finished`,
      href: `/learn/${l.lesson.slug}`,
    })),
  ];

  entries.sort((a, b) => b.at.getTime() - a.at.getTime());
  return entries.slice(0, limit);
}

/** How many certificates this student has actually earned — a finished subject
 *  that has content in it. Mirrors the rule on /certificates, where a subject
 *  with no lessons written is "soon" rather than 100% done. */
export function earnedCertificates(tracks: { totalLessons: number; totalProblems: number; pct: number }[]): number {
  return tracks.filter((t) => t.totalLessons + t.totalProblems > 0 && t.pct >= 100).length;
}
