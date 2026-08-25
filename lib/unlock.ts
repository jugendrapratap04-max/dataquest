// Topic-by-topic progression.
//
// The rule, from docs/LEARNING-SPEC.md §3: a topic opens once the topic before
// it has been read AND at least two of its practice problems are solved. A topic
// carrying fewer than two problems asks for all of them, so a topic with none
// never blocks anybody — which matters, because 33 of 83 lessons still have no
// problems at all and a gate that cannot be passed is not a gate, it is a wall.
//
// Two deliberate limits, both worth stating rather than discovering:
//
// 1. **Signed-out readers are never gated.** The lessons are public on purpose:
//    they are the entire try-before-signup path and the only thing search can
//    index. Locking them would trade the platform's only growth channel for a
//    rule that a reader can escape by logging out.
// 2. Enforcement is per subject. Topic 1 of every subject is always open, so a
//    student can start any subject without finishing another first.

import { prisma } from "@/lib/prisma";
import { EXPLORE_MODE } from "@/lib/gates";

export type LockState =
  | { locked: false }
  | { locked: true; needs: { slug: string; title: string; readNeeded: boolean; problemsNeeded: number } };

const REQUIRED_PROBLEMS = 2;

/** How many problems of a topic a student must solve before the next one opens. */
export function requiredFor(problemCount: number): number {
  return Math.min(REQUIRED_PROBLEMS, problemCount);
}

/**
 * Is this topic open for this student?
 *
 * `userId` null means a signed-out reader — never locked, see note 1 above.
 */
export async function lockStateFor(
  lessonId: string,
  userId: string | null
): Promise<LockState> {
  // Explore mode (lib/gates.ts) — every topic open, for reviewing the platform.
  if (EXPLORE_MODE) return { locked: false };
  if (!userId) return { locked: false };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { order: true, trackId: true },
  });
  if (!lesson) return { locked: false };

  // Never take back a topic the student has already reached.
  //
  // Found by testing the rule against the real database before shipping it: a
  // student who had already read three lessons and solved four problems would
  // have opened the app to find lessons 3 onwards locked. Gating is meant to
  // pace what comes next, not to confiscate what someone already did. Any
  // existing progress row on THIS topic keeps it open, whatever its status.
  const alreadyOpened = await prisma.lessonProgress.findFirst({
    where: { userId, lessonId },
    select: { id: true },
  });
  if (alreadyOpened) return { locked: false };

  // The topic immediately before this one, inside the same subject.
  const previous = await prisma.lesson.findFirst({
    where: { trackId: lesson.trackId, order: { lt: lesson.order } },
    orderBy: { order: "desc" },
    select: { id: true, slug: true, title: true, problems: { select: { id: true } } },
  });
  if (!previous) return { locked: false }; // first topic of the subject

  const [read, solved] = await Promise.all([
    prisma.lessonProgress.findFirst({
      where: { userId, lessonId: previous.id, status: "done" },
      select: { id: true },
    }),
    previous.problems.length
      ? prisma.submission.findMany({
          where: { userId, passed: true, problemId: { in: previous.problems.map((p) => p.id) } },
          distinct: ["problemId"],
          select: { problemId: true },
        })
      : Promise.resolve([]),
  ]);

  const need = requiredFor(previous.problems.length);
  const short = Math.max(0, need - solved.length);

  if (read && short === 0) return { locked: false };

  return {
    locked: true,
    needs: {
      slug: previous.slug,
      title: previous.title,
      readNeeded: !read,
      problemsNeeded: short,
    },
  };
}
