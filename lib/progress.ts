// One source of truth for "how far along is this user".
//
// Track.status and Track.skillsJson's done-flags used to be seeded constants on a
// shared table, so every user -- including one who signed up ten seconds ago -- saw
// "Python done, 33% job-ready". Certificates computed the real numbers separately,
// so the two pages openly contradicted each other. Everything here is derived from
// the user's own LessonProgress + Submissions instead, and every page reads it.

import { cache } from "react";
import { prisma } from "./prisma";
import { EXPLORE_MODE } from "./gates";
import { startOfDay, DAY_MS } from "./day";

/* Was `[name, done]`. The `done` half was fabricated — see the note beside the
 * skills list below — so a subject's skills are now just what it covers. */
export type TrackStatus = "done" | "now" | "locked";

/* ⚠️ isTaught() REMOVED 2026-08-07, and the reasons are worth keeping.
 *
 * This probe was a second copy of check-syllabus.mjs's standard, used to decide
 * whether a SUBJECT counted as written. Both halves of that failed:
 *
 *   1. It drifted. The comment above claimed "exactly 50 of 83 lessons pass";
 *      measured against the live database that day it was 141 of 160. A second
 *      copy of a standard goes stale silently.
 *   2. As a gate it was all-or-nothing, so Python (56 of 58 lessons past the
 *      bar) and HTML (22 of 35) both read as UNWRITTEN subjects. The only thing
 *      keeping a padlock off the flagship course was EXPLORE_MODE.
 *
 * Per-lesson quality has one owner now: `npm run syllabus`. */

export type TrackProgress = {
  id: string; slug: string; order: number;
  title: string; shortTitle: string; subtitle: string; icon: string;
  whyText: string; weeks: string; level: string; milestone: string;
  toolsCsv: string; checkpoint: string | null;
  firstLesson?: string;
  /** Where a click on this subject should actually land: the first lesson the
   *  student has not finished, or lesson one if they have not started. Added
   *  because the dashboard's subject tiles all linked to /roadmap, so choosing
   *  a subject meant arriving at a page where you had to choose it again. */
  nextLesson?: string;
  lessonsDone: number; totalLessons: number;
  problemsDone: number; totalProblems: number;
  pct: number;
  status: TrackStatus;
  /** Does this subject have any lessons written at all?
   *
   *  Deliberately SEPARATE from `status`, and deliberately independent of
   *  EXPLORE_MODE: a surface that wants to say "coming soon" should ask about
   *  the content, not about a review switch. `status` still carries the gate
   *  and still feeds the skills legend — do not merge the two. */
  ready: boolean;
  /** What this subject covers — syllabus names, not per-student state. */
  skills: string[];
};

export type Progress = {
  tracks: TrackProgress[];
  /** How far through everything the platform records: (lessons + problems)
   *  done over (lessons + problems) that exist. Replaced `jobReady`, which was
   *  a percentage of skill ticks nothing measured. */
  overallPct: number;
  subjectsStarted: number;
  lessonsDone: number; totalLessons: number;
  problemsDone: number; totalProblems: number;
  doneLessonIds: Set<string>;
  solvedProblemIds: Set<string>;
};

export const shortTitle = (t: string) =>
  t.split(" — ")[0].split(" (")[0].replace("Programming Foundations", "Python");

// Deduped per request: the app layout and the page both call these, so without
// cache() every dashboard/progress load ran the same queries twice. cache()
// memoizes on the arguments for the life of one server render.
export const getProgress = cache(getProgressImpl);
async function getProgressImpl(userId: string): Promise<Progress> {
  const tracks = await prisma.track.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" }, include: { problems: { select: { id: true } } } },
    },
  });

  const doneLessonIds = new Set(
    (await prisma.lessonProgress.findMany({
      where: { userId, status: "done" }, select: { lessonId: true },
    })).map((d) => d.lessonId)
  );
  const solvedProblemIds = new Set(
    (await prisma.submission.findMany({
      where: { userId, passed: true }, distinct: ["problemId"], select: { problemId: true },
    })).map((s) => s.problemId)
  );

  const raw = tracks.map((t) => {
    const totalLessons = t.lessons.length;
    const totalProblems = t.lessons.reduce((n, l) => n + l.problems.length, 0);
    const lessonsDone = t.lessons.filter((l) => doneLessonIds.has(l.id)).length;
    const problemsDone = t.lessons.reduce(
      (n, l) => n + l.problems.filter((p) => solvedProblemIds.has(p.id)).length, 0
    );
    const total = totalLessons + totalProblems;
    const pct = total ? Math.round(((lessonsDone + problemsDone) / total) * 100) : 0;
    /* "Written yet?" is a question about the SUBJECT, not about every lesson
     * in it being at the FULL standard.
     *
     * This used to be `t.lessons.every(isTaught)`, and measured against the
     * live database on 2026-08-07 that was a loaded gun: 141 of 160 lessons
     * pass isTaught, but the two biggest finished courses each carry a few
     * that do not — **Python 56/58 and HTML 22/35 both counted as NOT ready**.
     * The only thing standing between that and a padlock on the flagship
     * course was EXPLORE_MODE being on, and lib/gates.ts says that switch is a
     * review tool meant to be turned off once there are students. Turning it
     * off would have hidden Python behind "coming soon".
     *
     * Per-lesson quality already has an owner — `npm run syllabus` grades it
     * and reports which lessons are short. It does not belong in a gate. */
    const ready = totalLessons > 0;
    return { t, totalLessons, totalProblems, lessonsDone, problemsDone, pct, ready };
  });

  const out: TrackProgress[] = raw.map((r) => {
    // A locked subject is one we have not written yet — not one the student has
    // failed to earn.
    //
    // This used to lock everything past the first unfinished track, so a student
    // on lesson 2 of Python saw a padlock on Statistics. Statistics is finished:
    // eleven topics at the full standard, twenty-three practice problems, six
    // interactive panels. Hiding it behind 39 Python lessons meant the best
    // finished work on the platform was unreachable for months, and the padlock
    // told the student it was their fault.
    //
    // It also flattered the seven subjects that really are 48-129 word stubs.
    // They looked like a reward waiting to be unlocked rather than a page nobody
    // has written, which is the same dishonesty as the seeded streak and the
    // fake leaderboard, both already removed for exactly this reason.
    //
    // So the lock now reports content readiness, and it updates itself: finish a
    // subject to the standard and it opens on the next page load, with no flag
    // to remember to flip.
    //
    // Explore mode (lib/gates.ts) suspends the readiness half of this so every
    // subject can be walked, stubs included — which is the point, since the
    // stubs are exactly what a review is looking for.
    const status: TrackStatus =
      !r.ready && !EXPLORE_MODE ? "locked" : r.pct === 100 ? "done" : "now";

    /* ⚠️ A SKILL IS NOT MEASURED BY ANYTHING, so nothing here claims one is.
     *
     * skillsJson is a list of names — "Loops", "Comprehensions" — and no row in
     * the schema says which lesson teaches which. This used to fill that gap by
     * ticking skills in LIST ORDER against a ratio of lessons done: at 10 of 39
     * Python lessons the first 2 names went green, whichever two they happened
     * to be, and the same arithmetic drove a "Skills mastered" percentage on
     * two pages. It disagreed with the lesson count beside it (2% against 12%),
     * and Math.floor erased real work — 3 of 39 lessons rounded to zero skills.
     *
     * The names are still worth showing: they are what a subject COVERS, which
     * is a fact about the syllabus. What is gone is the claim that you have
     * personally mastered a given one. If per-skill progress is ever wanted it
     * needs a real lesson↔skill mapping in the schema, not a ratio. */
    const names: string[] = (JSON.parse(r.t.skillsJson || "[]") as ([string, number] | string)[])
      .map((s) => (Array.isArray(s) ? s[0] : s));

    return {
      id: r.t.id, slug: r.t.slug, order: r.t.order,
      title: r.t.title, shortTitle: shortTitle(r.t.title), subtitle: r.t.subtitle,
      icon: r.t.icon, whyText: r.t.whyText, weeks: r.t.weeks, level: r.t.level,
      milestone: r.t.milestone, toolsCsv: r.t.toolsCsv, checkpoint: r.t.checkpoint,
      firstLesson: r.t.lessons[0]?.slug,
      // Lessons come back ordered, so the first unfinished one IS where they
      // stopped. Falls back to lesson one for a subject not yet started.
      nextLesson: (r.t.lessons.find((l) => !doneLessonIds.has(l.id)) ?? r.t.lessons[0])?.slug,
      ready: r.ready,
      lessonsDone: r.lessonsDone, totalLessons: r.totalLessons,
      problemsDone: r.problemsDone, totalProblems: r.totalProblems,
      pct: r.pct, status,
      skills: names,
    };
  });

  const lessonsDone = out.reduce((n, t) => n + t.lessonsDone, 0);
  const totalLessons = out.reduce((n, t) => n + t.totalLessons, 0);
  const problemsDone = out.reduce((n, t) => n + t.problemsDone, 0);
  const totalProblems = out.reduce((n, t) => n + t.totalProblems, 0);
  const totalWork = totalLessons + totalProblems;

  return {
    tracks: out,
    /* One number for "how far through Etudo am I" — the two things the platform
     * actually records, over everything there is. It replaces `jobReady`, which
     * was a share of invented skill ticks and disagreed with the lesson count
     * on the same screen. This one cannot disagree with the tiles: it is their
     * sum. */
    overallPct: totalWork ? Math.round(((lessonsDone + problemsDone) / totalWork) * 100) : 0,
    /** Subjects the student has actually opened — at least one lesson finished
     *  or one problem solved in them. */
    subjectsStarted: out.filter((t) => t.lessonsDone + t.problemsDone > 0).length,
    lessonsDone,
    totalLessons,
    problemsDone,
    totalProblems,
    doneLessonIds,
    solvedProblemIds,
  };
}

/* WHAT COUNTS AS STUDYING — one answer, used by all three day-counters.
 *
 * Until 2026-08-07 the streak, the dashboard's week of ticks and the profile's
 * year heatmap each ran their own query and each counted passing submissions
 * ONLY. So a student who read ten lessons — the exact behaviour this platform
 * is trying to cause, and the only behaviour available in the seven HTML
 * Module 0/1 lessons and the deploy track, which carry no problems by design —
 * saw a zero streak, seven blank squares, and "your streak begins here".
 * The page counted the work in one tile and denied it in the next.
 *
 * Finishing a lesson now counts as a day studied, exactly like solving.
 *
 * ⚠️ ALL THREE CALLERS MUST USE THIS. They were separately correct before and
 * that is how they stayed in step; a green square and a live streak have to
 * keep meaning the same thing, which is the bug this file was written to kill
 * once already (see getActivity's note).
 *
 * XP is deliberately NOT paid for reading — see app/api/progress/route.ts.
 */
export const studyMoments = cache(studyMomentsImpl);
async function studyMomentsImpl(userId: string, since?: Date): Promise<Date[]> {
  const [subs, read] = await Promise.all([
    prisma.submission.findMany({
      where: { userId, passed: true, ...(since ? { createdAt: { gte: since } } : {}) },
      select: { createdAt: true },
    }),
    prisma.lessonProgress.findMany({
      // A row from before completedAt existed carries NULL and is skipped rather
      // than dated by guesswork — the same rule the column's own comment sets.
      where: { userId, status: "done", completedAt: since ? { gte: since } : { not: null } },
      select: { completedAt: true },
    }),
  ]);
  return [...subs.map((s) => s.createdAt), ...read.map((l) => l.completedAt!)];
}

export type Streak = { streak: number; bestStreak: number };

/**
 * How many days in a row the user has actually practised.
 *
 * This used to be a seeded column on User: the demo account showed a 12-day
 * streak against three submissions ever, and every real signup showed 0 forever
 * because nothing ever wrote to it — the dashboard cheerfully told new students
 * to "keep your 0-day streak alive". Same shape as the seeded Track.status this
 * file was written to kill, so it's derived here for the same reason.
 *
 * Today only breaks the streak once it's over: if you studied yesterday but not
 * yet today, the streak still stands — you have until midnight.
 */
export const getStreak = cache(getStreakImpl);
async function getStreakImpl(userId: string): Promise<Streak> {
  const moments = await studyMoments(userId);
  if (moments.length === 0) return { streak: 0, bestStreak: 0 };

  // Days are the PLATFORM's, not the server's — see lib/day.ts. On Vercel the
  // server is UTC, so a solve at 01:00 IST used to land on the previous day and
  // could break a streak the student had actually kept.
  const dayOf = (d: Date) => startOfDay(d).getTime();

  const days = [...new Set(moments.map(dayOf))].sort((a, b) => a - b);

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] - days[i - 1] === DAY_MS ? run + 1 : 1;
    if (run > best) best = run;
  }

  // The current run only counts if it reaches today or yesterday.
  const today = dayOf(new Date());
  const last = days[days.length - 1];
  const current = last === today || last === today - DAY_MS ? run : 0;

  return { streak: current, bestStreak: best };
}

/** Things finished per day for the last `days` days, oldest first — lessons and
 *  solved problems together.
 *
 *  It reads the same source as the streak, and that matters: this once counted
 *  every submission while getStreak counted only passing ones, so the heatmap
 *  could light a day green while the streak stayed at zero — two numbers on the
 *  same page disagreeing about whether you studied. A green square means the
 *  same thing everywhere: you finished something that day. */
export const getActivity = cache(getActivityImpl);
async function getActivityImpl(userId: string, days = 28): Promise<number[]> {
  // Both bounds in platform days, so the last bucket is genuinely "today" for
  // the student rather than for the datacentre.
  const start = new Date(startOfDay().getTime() - (days - 1) * DAY_MS);

  const moments = await studyMoments(userId, start);
  const counts = new Array<number>(days).fill(0);
  for (const at of moments) {
    const i = Math.round((startOfDay(at).getTime() - start.getTime()) / DAY_MS);
    if (i >= 0 && i < days) counts[i]++;
  }
  return counts;
}
