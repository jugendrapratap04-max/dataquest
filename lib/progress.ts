// One source of truth for "how far along is this user".
//
// Track.status and Track.skillsJson's done-flags used to be seeded constants on a
// shared table, so every user -- including one who signed up ten seconds ago -- saw
// "Python done, 33% job-ready". Certificates computed the real numbers separately,
// so the two pages openly contradicted each other. Everything here is derived from
// the user's own LessonProgress + Submissions instead, and every page reads it.

import { prisma } from "./prisma";

export type SkillState = [name: string, done: boolean];
export type TrackStatus = "done" | "now" | "locked";

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

export async function getProgress(userId: string): Promise<Progress> {
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
    return { t, totalLessons, totalProblems, lessonsDone, problemsDone, pct };
  });

  // The track you're on is the first unfinished one; everything past it is locked
  // until you actually get there.
  const firstUnfinished = raw.findIndex((r) => r.pct < 100);

  const out: TrackProgress[] = raw.map((r, i) => {
    const status: TrackStatus =
      r.pct === 100 ? "done" : r.pct > 0 || i === firstUnfinished ? "now" : "locked";

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

/** Submissions per day for the last `days` days, oldest first. */
export async function getActivity(userId: string, days = 28): Promise<number[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const subs = await prisma.submission.findMany({
    where: { userId, createdAt: { gte: start } },
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
