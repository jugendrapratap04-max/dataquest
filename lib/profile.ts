/* Student identity — the PURE half.
 *
 * Nothing in this file touches the database or a React server API, because the
 * sidebar is a client component and needs the level and the avatar. Anything
 * that queries lives in lib/profile-server.ts; importing prisma from here would
 * drag the whole client into the browser bundle.
 *
 * The rule everything below follows: a profile is DERIVED from work the student
 * actually did, never stored. That is what removed the seeded streak, the
 * seeded Track.status and the five fake leaderboard accounts. A profile exists
 * to make somebody feel attached to their own progress, and a number they did
 * not earn does the opposite the moment they notice.
 */
import type { Progress, Streak } from "@/lib/progress";

/* ------------------------------------------------------------------ level -- */

/** XP at which each level starts: 0, 100, 300, 600, 1000, 1500, 2100, 2800…
 *
 *  Level n begins at 50 * n * (n - 1), so each level costs 100 XP more than the
 *  one before. Chosen so the first level-up lands inside a single sitting — one
 *  lesson's problems is roughly 100 XP — while level 10 is a few weeks of real
 *  work rather than an afternoon. */
const levelStart = (n: number) => 50 * n * (n - 1);

export type Level = {
  level: number;
  /** XP earned since this level began. */
  into: number;
  /** XP this level costs in total. */
  span: number;
  /** XP still needed for the next one. */
  toNext: number;
  pct: number;
};

export function levelFor(xp: number): Level {
  const safe = Math.max(0, Math.floor(xp || 0));
  // Closed form of the largest n with 50n(n-1) <= xp, rather than a loop, so
  // this is safe to call in any render on any value. Verified to land on the
  // right side of every boundary for levels 1..60.
  const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + safe / 12.5)) / 2));
  const start = levelStart(level);
  const end = levelStart(level + 1);
  const toNext = end - safe;
  // Capped at 99 while any XP is still owed. Rounding alone reports 100% at 999
  // of 1000, which is a full bar beside a label saying 1 XP to go — the bar gets
  // to be wrong or the number does, and the number is the one people act on.
  const raw = Math.round(((safe - start) / (end - start)) * 100);
  return { level, into: safe - start, span: end - start, toNext, pct: toNext > 0 ? Math.min(99, raw) : 100 };
}

/* ----------------------------------------------------------------- avatar -- */

/** A stable hue per person, derived from their name.
 *
 *  Same trick as lib/subjects.ts: a name always produces the same colour, on
 *  every device, with nothing stored and nothing uploaded. */
export function avatarHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** The emoji a student may pick instead of their initials. A fixed set, so there
 *  is nothing to moderate and nothing to store beyond one character — which is
 *  the whole reason there is no photo upload. */
export const AVATAR_EMOJI = [
  "🦊", "🐼", "🦉", "🐙", "🦁", "🐢", "🦋", "🐝",
  "🚀", "⚡", "🔥", "🌱", "🎯", "🧩", "📘", "☕",
];

/* ----------------------------------------------------------- achievements -- */

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  /** What earns it — shown whether or not it is earned, so a locked one reads
   *  as a target rather than a mystery. */
  how: string;
  earned: boolean;
};

/** Derived from work already recorded. No table, no event log, nothing written
 *  — which also means none of these can be awarded by accident and then be
 *  impossible to take back.
 *
 *  The page shows every earned one and only the NEXT few unearned ones. A wall
 *  of locked badges on day one is the same mistake as printing "0%" against a
 *  subject nobody has written: it measures the distance to somewhere the student
 *  has not been told how to reach. */
export function getAchievements(p: Progress, streak: Streak, certificates: number): Achievement[] {
  const subjectsDone = p.tracks.filter((t) => t.totalLessons > 0 && t.pct >= 100).length;
  return [
    { id: "first-lesson", icon: "📖", title: "First lesson read", how: "Finish any lesson", earned: p.lessonsDone >= 1 },
    { id: "first-solve", icon: "✅", title: "First problem solved", how: "Solve any practice problem", earned: p.problemsDone >= 1 },
    { id: "ten-solved", icon: "🔟", title: "Ten solved", how: "Solve 10 practice problems", earned: p.problemsDone >= 10 },
    { id: "week-streak", icon: "🔥", title: "A week in a row", how: "Practise 7 days running", earned: streak.bestStreak >= 7 },
    { id: "ten-lessons", icon: "📚", title: "Ten lessons read", how: "Finish 10 lessons", earned: p.lessonsDone >= 10 },
    { id: "fifty-solved", icon: "⚡", title: "Fifty solved", how: "Solve 50 practice problems", earned: p.problemsDone >= 50 },
    { id: "month-streak", icon: "🗓️", title: "A month in a row", how: "Practise 30 days running", earned: streak.bestStreak >= 30 },
    { id: "century", icon: "💯", title: "A hundred solved", how: "Solve 100 practice problems", earned: p.problemsDone >= 100 },
    { id: "subject-done", icon: "🏁", title: "A subject finished", how: "Reach 100% on any subject", earned: subjectsDone >= 1 },
    { id: "certified", icon: "🏆", title: "Certificate earned", how: "Finish a subject to be issued one", earned: certificates >= 1 },
  ];
}

/* --------------------------------------------------------------- timeline -- */

export type TimelineEntry = {
  at: Date;
  kind: "solved" | "lesson";
  title: string;
  detail: string;
  href: string;
};

/** "3 days ago". Relative, because an exact timestamp on your own history is
 *  noise — you know when you did it, you want to know how long ago. */
export function agoOf(at: Date, now = Date.now()): string {
  const mins = Math.max(0, Math.round((now - at.getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return hours === 1 ? "an hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? "a month ago" : `${months} months ago`;
}

/* ------------------------------------------------------------- descriptor -- */

/** "Python learner" — the subject they have gone furthest in, so the line under
 *  their name is a fact about their work rather than a label they typed. */
export function focusOf(p: Progress): string | null {
  const started = p.tracks.filter((t) => t.lessonsDone > 0 || t.problemsDone > 0);
  if (started.length === 0) return null;
  const best = started.reduce((a, b) => (b.pct > a.pct ? b : a));
  return `${best.shortTitle} learner`;
}
