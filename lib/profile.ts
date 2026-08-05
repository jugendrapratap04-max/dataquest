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

/* --------------------------------------------------------------- username -- */

/** Words a username may not be, because /u/<name> would then read as something
 *  the platform said rather than something a student chose — or would collide
 *  with a route we may want later. */
const RESERVED = new Set([
  "admin", "administrator", "etudo", "official", "support", "help", "root", "system",
  "api", "app", "www", "login", "signup", "logout", "profile", "settings", "account",
  "learn", "practice", "dashboard", "leaderboard", "certificates", "challenge", "book",
  "roadmap", "progress", "notes", "focus", "rooms", "resume", "projects", "feedback",
  "welcome", "privacy", "terms", "guidelines", "u", "user", "users", "me", "new", "null",
  "undefined", "moderator", "mod", "staff", "team",
]);

/** Lowercase letters, digits, hyphen and underscore; 3–20 characters; must start
 *  with a letter or digit.
 *
 *  Deliberately narrow. This is the only student-chosen value in the schema that
 *  ends up in a URL, so it stays inside a character set with no case-folding
 *  surprises, no lookalike Unicode, and nothing that needs escaping. */
export const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,19}$/;

export type UsernameCheck = { ok: true; value: string } | { ok: false; error: string };

/** Validate a claimed username. Uniqueness is the database's job — this is
 *  everything that can be decided without asking it. */
export function checkUsername(raw: unknown): UsernameCheck {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!value) return { ok: false, error: "Pick a username first." };
  if (value.length < 3) return { ok: false, error: "At least 3 characters." };
  if (value.length > 20) return { ok: false, error: "At most 20 characters." };
  if (!USERNAME_RE.test(value)) {
    return { ok: false, error: "Lowercase letters, numbers, - and _ only, starting with a letter or number." };
  }
  if (RESERVED.has(value)) return { ok: false, error: "That one is reserved. Try another." };
  return { ok: true, value };
}

/* ----------------------------------------------------------- achievements -- */

/** Bronze → legend. Purely how loud the badge looks; nothing depends on it
 *  except the styling, so a badge can be re-tiered without breaking anything. */
export type Tier = "bronze" | "silver" | "gold" | "legend";

export type BadgeGroup = "Practice" | "Difficulty" | "Topics" | "Consistency" | "Reading" | "Milestones";

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  /** What earns it — shown whether or not it is earned, so a locked one reads
   *  as a target rather than a mystery. */
  how: string;
  earned: boolean;
  tier: Tier;
  group: BadgeGroup;
  /** How far along a counted badge is, for the bar under a locked one. Absent on
   *  the yes/no ones, where a half-full bar would be a lie. */
  progress?: { at: number; of: number };
};

/** Everything a badge can be earned from. Assembled by the caller from queries
 *  that already exist, so this file stays free of prisma — see the note at the
 *  top about the sidebar being a client component. */
export type BadgeInput = {
  p: Progress;
  streak: Streak;
  certificates: number;
  /** Distinct problems solved, split by difficulty, plus topic coverage. Absent
   *  on callers that have not loaded it; those badges are then simply not
   *  earned rather than wrongly awarded. */
  solved?: {
    totalSolved: number;
    byDifficulty: { label: string; solved: number; total: number }[];
    topicsTouched: number;
    clearedTopics: number;
    fastest: { seconds: number } | null;
  };
};

/** Derived from work already recorded. No table, no event log, nothing written
 *  — which also means none of these can be awarded by accident and then be
 *  impossible to take back.
 *
 *  There used to be ten of these and all ten counted the same thing: how many
 *  problems you had solved. That is one axis, so every profile looked like every
 *  other profile a bit further along, and a student who had gone deep in one
 *  topic or cleared a Hard had nothing to show for it. These span six groups —
 *  volume, difficulty, topic coverage, consistency, reading and milestones — so
 *  two students with the same total can have visibly different profiles.
 *
 *  The page still shows every earned one and only the next few locked ones. A
 *  wall of locked badges on day one is the same mistake as printing "0%" against
 *  a subject nobody has written: it measures the distance to somewhere the
 *  student has not been told how to reach. */
export function getAchievements({ p, streak, certificates, solved }: BadgeInput): Achievement[] {
  const subjectsDone = p.tracks.filter((t) => t.totalLessons > 0 && t.pct >= 100).length;
  const nSolved = solved?.totalSolved ?? p.problemsDone;
  const byDiff = (label: string) => solved?.byDifficulty.find((d) => d.label === label)?.solved ?? 0;
  const medium = byDiff("Medium");
  const hard = byDiff("Hard");
  const superHard = byDiff("Super Hard");
  const topics = solved?.topicsTouched ?? 0;
  const cleared = solved?.clearedTopics ?? 0;
  const fastest = solved?.fastest?.seconds ?? null;

  const count = (at: number, of: number) => ({ at: Math.min(at, of), of });

  return [
    // ------------------------------------------------------------ practice --
    { id: "first-solve", icon: "🌱", title: "First problem solved", how: "Solve any practice problem", group: "Practice", tier: "bronze", earned: nSolved >= 1, progress: count(nSolved, 1) },
    { id: "ten-solved", icon: "🔟", title: "Ten solved", how: "Solve 10 problems", group: "Practice", tier: "bronze", earned: nSolved >= 10, progress: count(nSolved, 10) },
    { id: "fifty-solved", icon: "⚡", title: "Fifty solved", how: "Solve 50 problems", group: "Practice", tier: "silver", earned: nSolved >= 50, progress: count(nSolved, 50) },
    { id: "century", icon: "💯", title: "A hundred solved", how: "Solve 100 problems", group: "Practice", tier: "gold", earned: nSolved >= 100, progress: count(nSolved, 100) },
    { id: "two-fifty", icon: "🐉", title: "Two hundred fifty", how: "Solve 250 problems", group: "Practice", tier: "legend", earned: nSolved >= 250, progress: count(nSolved, 250) },

    // ---------------------------------------------------------- difficulty --
    { id: "first-medium", icon: "🥈", title: "First Medium", how: "Solve a Medium problem", group: "Difficulty", tier: "bronze", earned: medium >= 1, progress: count(medium, 1) },
    { id: "ten-medium", icon: "🎚️", title: "Ten Mediums", how: "Solve 10 Medium problems", group: "Difficulty", tier: "silver", earned: medium >= 10, progress: count(medium, 10) },
    { id: "first-hard", icon: "🥇", title: "First Hard", how: "Solve a Hard problem", group: "Difficulty", tier: "silver", earned: hard >= 1, progress: count(hard, 1) },
    { id: "ten-hard", icon: "🧗", title: "Ten Hards", how: "Solve 10 Hard problems", group: "Difficulty", tier: "gold", earned: hard >= 10, progress: count(hard, 10) },
    { id: "super-hard", icon: "🔱", title: "Super Hard cleared", how: "Solve a Super Hard problem", group: "Difficulty", tier: "legend", earned: superHard >= 1, progress: count(superHard, 1) },

    // -------------------------------------------------------------- topics --
    { id: "three-topics", icon: "🧩", title: "Three topics", how: "Solve something in 3 different topics", group: "Topics", tier: "bronze", earned: topics >= 3, progress: count(topics, 3) },
    { id: "ten-topics", icon: "🗺️", title: "Ten topics", how: "Solve something in 10 different topics", group: "Topics", tier: "silver", earned: topics >= 10, progress: count(topics, 10) },
    { id: "twentyfive-topics", icon: "🌐", title: "Twenty-five topics", how: "Solve something in 25 different topics", group: "Topics", tier: "gold", earned: topics >= 25, progress: count(topics, 25) },
    { id: "topic-cleared", icon: "🎯", title: "A topic cleared", how: "Solve every problem in one topic", group: "Topics", tier: "gold", earned: cleared >= 1, progress: count(cleared, 1) },
    { id: "three-topics-cleared", icon: "🏹", title: "Three topics cleared", how: "Clear every problem in 3 topics", group: "Topics", tier: "legend", earned: cleared >= 3, progress: count(cleared, 3) },

    // --------------------------------------------------------- consistency --
    { id: "week-streak", icon: "🔥", title: "A week in a row", how: "Practise 7 days running", group: "Consistency", tier: "bronze", earned: streak.bestStreak >= 7, progress: count(streak.bestStreak, 7) },
    { id: "month-streak", icon: "🗓️", title: "A month in a row", how: "Practise 30 days running", group: "Consistency", tier: "gold", earned: streak.bestStreak >= 30, progress: count(streak.bestStreak, 30) },
    { id: "hundred-streak", icon: "☄️", title: "A hundred days", how: "Practise 100 days running", group: "Consistency", tier: "legend", earned: streak.bestStreak >= 100, progress: count(streak.bestStreak, 100) },
    // Under two minutes from opening the problem to passing it. Only counted
    // when there is an honest start time — see ProblemAttempt.solvedSeconds.
    { id: "quick-draw", icon: "⏱️", title: "Under two minutes", how: "Solve a problem within 2 minutes of opening it", group: "Consistency", tier: "silver", earned: fastest !== null && fastest <= 120 },

    // ------------------------------------------------------------- reading --
    { id: "first-lesson", icon: "📖", title: "First lesson read", how: "Finish any lesson", group: "Reading", tier: "bronze", earned: p.lessonsDone >= 1, progress: count(p.lessonsDone, 1) },
    { id: "ten-lessons", icon: "📚", title: "Ten lessons read", how: "Finish 10 lessons", group: "Reading", tier: "bronze", earned: p.lessonsDone >= 10, progress: count(p.lessonsDone, 10) },
    { id: "fifty-lessons", icon: "🎓", title: "Fifty lessons read", how: "Finish 50 lessons", group: "Reading", tier: "silver", earned: p.lessonsDone >= 50, progress: count(p.lessonsDone, 50) },
    { id: "hundred-lessons", icon: "🏛️", title: "A hundred lessons", how: "Finish 100 lessons", group: "Reading", tier: "gold", earned: p.lessonsDone >= 100, progress: count(p.lessonsDone, 100) },

    // ---------------------------------------------------------- milestones --
    { id: "subject-done", icon: "🏁", title: "A subject finished", how: "Reach 100% on any subject", group: "Milestones", tier: "gold", earned: subjectsDone >= 1, progress: count(subjectsDone, 1) },
    { id: "certified", icon: "🏆", title: "Certificate earned", how: "Finish a subject to be issued one", group: "Milestones", tier: "gold", earned: certificates >= 1, progress: count(certificates, 1) },
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
