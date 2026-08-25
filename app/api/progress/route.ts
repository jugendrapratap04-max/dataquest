import { NextResponse } from "next/server";
import { resolveStatus, type LessonStatus } from "@/lib/lesson-status";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { readJson, idOf } from "@/lib/http";

/** Only these two mean anything to getProgress. Anything else used to be stored
 *  verbatim, so a client could invent a status the rest of the app can't read. */
const STATUSES = new Set(["in_progress", "done"]);

/* ⚠️ FINISHING A LESSON DOES NOT PAY XP, AND THAT IS A DECISION.
 *
 * Reading now counts for the streak and the activity squares (lib/progress.ts
 * studyMoments) — showing up is measured. XP stays the currency of code, for
 * two reasons that would both be lost by paying it here:
 *
 *   1. XP feeds the leaderboard and the levels, and it is the one number with
 *      an enforced invariant: `db:check` fails any account holding more XP than
 *      its passing submissions justify. That check exists because six seeded
 *      accounts once held 16,080 unearned XP for months.
 *   2. This endpoint takes the client's word for it. "I read this" is
 *      self-declared, so a loop over 160 lessonIds would mint XP. A passing
 *      submission is re-verified on the server before a single point is paid.
 *
 * So: the streak, the squares and four Reading badges reward reading; XP and
 * the leaderboard reward solving. The dashboard says which is which rather
 * than implying that everything feeds one number.
 */

// Mark a lesson as in_progress / done for the current user.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const b = await readJson(req);
  const lessonId = idOf(b.lessonId);
  const status = typeof b.status === "string" && STATUSES.has(b.status) ? b.status : "done";

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }

  // lessonId is a foreign key, so an unknown one used to surface as an
  // unhandled Prisma error and a 500. Check first and answer honestly.
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) {
    return NextResponse.json({ error: "lesson not found" }, { status: 404 });
  }

  // completedAt is stamped the FIRST time a lesson becomes done and never moved
  // afterwards — re-reading a finished lesson should not rewrite the day you
  // finished it, which is what the activity timeline reads.
  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    select: { completedAt: true, status: true },
  });

  // DONE IS A FLOOR. Opening a lesson marks it in_progress (that is what makes
  // the dashboard's "Read theory" step able to tick), and writing `status`
  // straight through would then walk a FINISHED lesson backwards every time a
  // student re-read it. doneLessonIds feeds the progress percentages, the
  // roadmap, the certificates and the gating — they would have watched their
  // own progress fall. The rule lives in lib/lesson-status.ts, tested by
  // scripts/test-lesson-status.mjs.
  const nextStatus = resolveStatus(
    (existing?.status as LessonStatus | undefined) ?? null,
    status as LessonStatus
  );
  const firstTimeDone = nextStatus === "done" && !existing?.completedAt;

  const record = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { status: nextStatus, ...(firstTimeDone ? { completedAt: new Date() } : {}) },
    create: { userId: user.id, lessonId, status: nextStatus, ...(nextStatus === "done" ? { completedAt: new Date() } : {}) },
  });

  return NextResponse.json({ ok: true, status: record.status });
}
