/*
 * What a lesson's progress status should become.
 *
 * One rule, and it exists because the obvious implementation is dangerous:
 * `/api/progress` writes `update: { status }` straight through, so the moment
 * anything started sending "in_progress" — which is what makes the dashboard's
 * "Read theory" step able to tick at all — re-opening a FINISHED lesson would
 * have walked it backwards to unfinished.
 *
 * `doneLessonIds` feeds the progress percentages, the roadmap, the certificates
 * and the lesson gating. A student re-reading something they had finished would
 * have watched their own progress fall.
 *
 * Pure and separate from the route so the rule can be tested without a database
 * or a session — scripts/test-lesson-status.mjs.
 */

export type LessonStatus = "in_progress" | "done";

/**
 * @param existing what is stored today, or null if there is no row yet
 * @param requested what the caller is asking for
 */
export function resolveStatus(
  existing: LessonStatus | null,
  requested: LessonStatus
): LessonStatus {
  // Done is a floor. Nothing walks a lesson back from it.
  if (existing === "done") {
    return "done";
  }

  return requested;
}
