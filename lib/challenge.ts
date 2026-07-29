import { prisma } from "@/lib/prisma";

// Quiz questions live inside each lesson's contentJson, in a { t: "quiz" }
// block — they were merged there when the lesson was applied. There is no Quiz
// table to select from, so a challenge is built by reading the lessons and
// pulling the blocks out.
//
// That is fine at this size (83 lessons) and would not be at ten thousand. The
// day it stops being fine, the fix is a Question table populated by
// apply-lessons.mjs — not a cache in front of this.

export type ChallengeQuestion = {
  q: string;
  options: string[];
  correct: number;
  why: string;
  /** Which lesson it came from, so the review screen can link back to it. */
  from: string;
  fromSlug: string;
};

type QuizBlock = { t: string; items?: { q: string; options: string[]; correct: number; why?: string; level?: string }[] };

/** Every quiz question the platform has, optionally narrowed to one subject. */
export async function questionPool(trackSlug?: string): Promise<ChallengeQuestion[]> {
  const lessons = await prisma.lesson.findMany({
    where: trackSlug ? { track: { slug: trackSlug } } : undefined,
    orderBy: [{ track: { order: "asc" } }, { order: "asc" }],
    select: { slug: true, title: true, contentJson: true },
  });

  const out: ChallengeQuestion[] = [];
  for (const l of lessons) {
    let blocks: QuizBlock[] = [];
    try { blocks = JSON.parse(l.contentJson || "[]"); } catch { continue; }
    const quiz = blocks.find((b) => b.t === "quiz");
    for (const item of quiz?.items ?? []) {
      if (!item?.q || !Array.isArray(item.options) || typeof item.correct !== "number") continue;
      out.push({
        q: item.q,
        options: item.options,
        correct: item.correct,
        why: item.why ?? "",
        from: l.title,
        fromSlug: l.slug,
      });
    }
  }
  return out;
}

/** Subjects with enough questions to build a challenge from, and how many. */
export async function challengeableSubjects(min: number): Promise<{ slug: string; title: string; count: number }[]> {
  const tracks = await prisma.track.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, title: true, lessons: { select: { contentJson: true } } },
  });

  return tracks
    .map((t) => {
      let count = 0;
      for (const l of t.lessons) {
        try {
          const blocks: QuizBlock[] = JSON.parse(l.contentJson || "[]");
          count += blocks.find((b) => b.t === "quiz")?.items?.length ?? 0;
        } catch { /* a lesson with unreadable content contributes nothing */ }
      }
      return { slug: t.slug, title: t.title.split(" — ").pop() ?? t.title, count };
    })
    .filter((t) => t.count >= min);
}

/**
 * Pick `n` questions at random, without repeats.
 *
 * Fisher-Yates on a copy. Not seeded and not meant to be: the questions are
 * snapshotted into the Challenge row the moment it is created, so both players
 * get the identical set regardless of what this returns next time.
 */
export function pickQuestions(pool: ChallengeQuestion[], n: number): ChallengeQuestion[] {
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

/**
 * The score. Correct answers first, time only as a tiebreaker.
 *
 * The PRD asks for correctness, accuracy and speed together. Weighing speed
 * into the score itself would reward guessing quickly over thinking, which is
 * the opposite of what this is for — so a faster player never beats a more
 * accurate one, and time decides only when the answers are level.
 */
export function beats(a: { correct: number; seconds: number }, b: { correct: number; seconds: number }): boolean {
  if (a.correct !== b.correct) return a.correct > b.correct;
  return a.seconds < b.seconds;
}

/** A short, unambiguous code for the URL. No 0/O/1/I/l. */
export function newCode(): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}
