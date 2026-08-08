import { cache } from "react";
import { prisma } from "@/lib/prisma";

/* THE PROBLEM OF THE DAY.
 *
 * The dashboard card said "Solve today's problem" and its button opened the
 * whole catalogue of 450. There was no problem of the day anywhere in the
 * codebase — the card was a link wearing a promise.
 *
 * This is the promise, kept, with no schema and no cost: the day itself is the
 * seed, so everybody gets the same problem on the same day and it can be talked
 * about, compared and shared, and tomorrow's is decided by arithmetic rather
 * than by anybody remembering to pick one.
 *
 * ⚠️ THE DAY BOUNDARY IS THE SERVER'S, which on Vercel is UTC — the same basis
 * getStreak and getActivity use (lib/progress.ts). That is deliberate: a daily
 * problem that rolls over at a different hour than the streak would be two
 * calendars in one product. Worklist item D8 moves them to a real timezone
 * together; until then nothing here promises a rollover time, because for an
 * Indian student "midnight" would be a lie by five and a half hours.
 */

/** `YYYY-MM-DD` for the server's today. Must roll over with the streak's day —
 *  see the note above before changing it here alone. */
export function dayKey(d: Date = new Date()): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

/** FNV-1a. Any stable hash would do; this one is four lines and has no deps. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type DailyProblem = {
  /** Carried so a caller can test it against getProgress's solvedProblemIds
   *  without a second query. */
  id: string;
  slug: string; title: string; difficulty: string; xp: number; kind: string;
  /** The subject it belongs to, for the card's one line of context. */
  track: string;
};

/* Easy and Medium only. A "Super Hard" landing on a beginner's dashboard as
 * the one thing to do today is a reason to close the tab, and the point of a
 * daily is that it is finishable in a sitting. Measured: 401 of the 450
 * problems qualify, across all four engines, and every one has a lesson. */
export const getDailyProblem = cache(getDailyProblemImpl);
async function getDailyProblemImpl(): Promise<DailyProblem | null> {
  const pool = await prisma.problem.findMany({
    where: { difficulty: { in: ["Easy", "Medium"] } },
    // Ordered so the pick is reproducible: the same day must give the same
    // problem on every render and every server.
    orderBy: { slug: "asc" },
    select: {
      id: true, slug: true, title: true, difficulty: true, xp: true, kind: true,
      lesson: { select: { track: { select: { title: true } } } },
    },
  });
  if (pool.length === 0) return null;

  const p = pool[hash(dayKey()) % pool.length];
  return {
    id: p.id, slug: p.slug, title: p.title, difficulty: p.difficulty, xp: p.xp, kind: p.kind,
    track: p.lesson?.track.title ?? "",
  };
}
