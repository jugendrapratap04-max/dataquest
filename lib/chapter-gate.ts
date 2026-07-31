// Whether a chapter's notes may be downloaded yet.
//
// docs/LEARNING-SPEC.md §4: a chapter opens for download once its topics have
// been read and their practice problems solved. The point is stated plainly in
// the product doc — students should not be able to collect every note without
// practising.
//
// Reading is NOT gated, only downloading. The notes are public and are what
// search indexes; locking the reading would cost the platform its growth channel
// to enforce a rule about collecting PDFs.

import { prisma } from "@/lib/prisma";
import { requiredFor } from "@/lib/unlock";
import { EXPLORE_MODE } from "@/lib/gates";

export type ChapterGate = {
  allowed: boolean;
  /** Signed out — the student has no progress to demonstrate yet. */
  needsAccount: boolean;
  topicsTotal: number;
  topicsRead: number;
  problemsRequired: number;
  problemsSolved: number;
};

export async function chapterGate(chapterId: string, userId: string | null): Promise<ChapterGate> {
  const lessons = await prisma.lesson.findMany({
    where: { chapterId },
    select: { id: true, problems: { select: { id: true } } },
  });

  const problemsRequired = lessons.reduce((n, l) => n + requiredFor(l.problems.length), 0);
  const base = {
    topicsTotal: lessons.length,
    topicsRead: 0,
    problemsRequired,
    problemsSolved: 0,
  };

  // Explore mode (lib/gates.ts) — every chapter downloadable, for reviewing the
  // notes as a student would receive them. The counts below stay honest, so the
  // page still reports how much has actually been read.
  if (EXPLORE_MODE) return { ...base, allowed: true, needsAccount: false };
  if (!userId) return { ...base, allowed: false, needsAccount: true };
  if (!lessons.length) return { ...base, allowed: true, needsAccount: false };

  const lessonIds = lessons.map((l) => l.id);
  const problemIds = lessons.flatMap((l) => l.problems.map((p) => p.id));

  const [read, solved] = await Promise.all([
    prisma.lessonProgress.count({ where: { userId, status: "done", lessonId: { in: lessonIds } } }),
    problemIds.length
      ? prisma.submission
          .findMany({
            where: { userId, passed: true, problemId: { in: problemIds } },
            distinct: ["problemId"],
            select: { problemId: true },
          })
          .then((r) => r.length)
      : Promise.resolve(0),
  ]);

  return {
    ...base,
    topicsRead: read,
    problemsSolved: solved,
    needsAccount: false,
    // Every topic read, and as many problems solved as the topics between them
    // require — two each, or all of them where a topic has fewer than two.
    allowed: read >= lessons.length && solved >= problemsRequired,
  };
}
