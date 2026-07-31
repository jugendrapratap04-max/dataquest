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

export type SkillState = [name: string, done: boolean];
export type TrackStatus = "done" | "now" | "locked";

/**
 * Has this lesson actually been written, or is it still a stub?
 *
 * The five blocks below are the ones `prisma/check-syllabus.mjs` grades a lesson
 * on, and only a rebuilt lesson carries all of them — a stub has objectives, a
 * heading, a paragraph and a recap. Checked against the database when this
 * shipped: exactly 50 of 83 lessons pass, which is the same 50 the syllabus
 * report calls "at the FULL standard". One definition of finished, two readers.
 *
 * It tests the serialised string rather than parsing it. contentJson runs to
 * ~15KB per lesson and this is on the dashboard's path, so JSON.parse across 83
 * of them on every render would be real work to answer a yes/no question.
 */
function isTaught(contentJson: string | null): boolean {
  const s = contentJson ?? "";
  return TEACHING_BLOCKS.every((b) => s.includes(`"t":"${b}"`));
}
const TEACHING_BLOCKS = ["hook", "def", "analogy", "mistakes", "interview"];

export type TrackProgress = {
  id: string; slug: string; order: number;
  title: string; shortTitle: string; subtitle: string; icon: string;
  whyText: string; weeks: string; level: string; milestone: string;
  toolsCsv: string; checkpoint: string | null;
  firstLesson?: string;
  lessonsDone: number; totalLessons: number;
  problemsDone: number; totalProblems: number;
  pct: number;
  status: TrackStatus;
  skills: SkillState[];
  skillsDone: number;
};

export type Progress = {
  tracks: TrackProgress[];
  totalSkills: number; masteredSkills: number;
  inProgressSkills: number; lockedSkills: number;
  jobReady: number;
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
    const ready = totalLessons > 0 && t.lessons.every((l) => isTaught(l.contentJson));
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

    // Nothing in the data maps a skill to the lessons that teach it, so a skill counts
    // as mastered once the matching share of the track's lessons is done. Lessons are
    // taken in order, so this tracks reality closely -- and unlike the old hardcoded
    // flags it can never claim progress the student hasn't made.
    const names: string[] = (JSON.parse(r.t.skillsJson || "[]") as ([string, number] | string)[])
      .map((s) => (Array.isArray(s) ? s[0] : s));
    const skillsDone = r.totalLessons
      ? Math.floor((r.lessonsDone / r.totalLessons) * names.length)
      : 0;

    return {
      id: r.t.id, slug: r.t.slug, order: r.t.order,
      title: r.t.title, shortTitle: shortTitle(r.t.title), subtitle: r.t.subtitle,
      icon: r.t.icon, whyText: r.t.whyText, weeks: r.t.weeks, level: r.t.level,
      milestone: r.t.milestone, toolsCsv: r.t.toolsCsv, checkpoint: r.t.checkpoint,
      firstLesson: r.t.lessons[0]?.slug,
      lessonsDone: r.lessonsDone, totalLessons: r.totalLessons,
      problemsDone: r.problemsDone, totalProblems: r.totalProblems,
      pct: r.pct, status,
      skills: names.map((n, k): SkillState => [n, k < skillsDone]),
      skillsDone,
    };
  });

  const totalSkills = out.reduce((n, t) => n + t.skills.length, 0);
  const masteredSkills = out.reduce((n, t) => n + t.skillsDone, 0);
  const inProgressSkills = out
    .filter((t) => t.status === "now")
    .reduce((n, t) => n + (t.skills.length - t.skillsDone), 0);

  return {
    tracks: out,
    totalSkills,
    masteredSkills,
    inProgressSkills,
    lockedSkills: Math.max(0, totalSkills - masteredSkills - inProgressSkills),
    jobReady: totalSkills ? Math.round((masteredSkills / totalSkills) * 100) : 0,
    lessonsDone: out.reduce((n, t) => n + t.lessonsDone, 0),
    totalLessons: out.reduce((n, t) => n + t.totalLessons, 0),
    problemsDone: out.reduce((n, t) => n + t.problemsDone, 0),
    totalProblems: out.reduce((n, t) => n + t.totalProblems, 0),
    doneLessonIds,
    solvedProblemIds,
  };
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
  const subs = await prisma.submission.findMany({
    where: { userId, passed: true },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  if (subs.length === 0) return { streak: 0, bestStreak: 0 };

  const DAY = 86_400_000;
  const dayOf = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  };

  const days = [...new Set(subs.map((s) => dayOf(s.createdAt)))].sort((a, b) => a - b);

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] - days[i - 1] === DAY ? run + 1 : 1;
    if (run > best) best = run;
  }

  // The current run only counts if it reaches today or yesterday.
  const today = dayOf(new Date());
  const last = days[days.length - 1];
  const current = last === today || last === today - DAY ? run : 0;

  return { streak: current, bestStreak: best };
}

/** Solved problems per day for the last `days` days, oldest first.
 *
 *  Counts passing submissions only, and that matters: this used to count every
 *  submission while getStreak counted only passing ones, so the heatmap could
 *  light a day green while the streak stayed at zero — two numbers on the same
 *  page disagreeing about whether you studied. A green square now means the same
 *  thing everywhere: you solved something that day. */
export const getActivity = cache(getActivityImpl);
async function getActivityImpl(userId: string, days = 28): Promise<number[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const subs = await prisma.submission.findMany({
    where: { userId, passed: true, createdAt: { gte: start } },
    select: { createdAt: true },
  });

  const counts = new Array<number>(days).fill(0);
  for (const s of subs) {
    const d = new Date(s.createdAt);
    d.setHours(0, 0, 0, 0);
    const i = Math.round((d.getTime() - start.getTime()) / 86_400_000);
    if (i >= 0 && i < days) counts[i]++;
  }
  return counts;
}
