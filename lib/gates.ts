/* Explore mode — every gate on the platform, off.
 *
 * Jugendra asked for this on 31 July 2026 so he could walk the whole platform
 * and find what is broken, rather than being stopped by rules that are working
 * exactly as designed. It is a review tool, not a product decision.
 *
 * THIS IS A GLOBAL SWITCH ON A LIVE DEPLOY. It is not per-account and there is
 * no way for it to be — the gates run on the server for whoever asks. While it
 * is true, anybody visiting dataquest-navy.vercel.app gets the same open
 * platform. That is fine for a beta with one reader and wrong the moment there
 * are students, so it is one line to turn back off.
 *
 * What it opens, and what it does NOT:
 *
 *   ✔ lib/unlock.ts       topic-by-topic progression — the only gate that
 *                         actually stops a signed-in reader opening a lesson
 *   ✔ lib/chapter-gate.ts the /book chapter download lock
 *   ✔ lib/progress.ts     the "coming soon" 🔒 on subjects whose lessons are
 *                         still stubs, so bi, ml, dl and deploy read as ordinary
 *                         subjects and can be inspected like any other
 *
 *   ✘ Signing in. /notes, /focus, /rooms, /welcome and /feedback hold one
 *     person's own data and still need an account — that is authentication, not
 *     a course lock.
 *   ✘ The challenge subject picker. A subject appears there once its lessons
 *     carry quiz blocks, which is a fact about content rather than a gate; the
 *     four stub subjects have no quizzes to offer.
 *
 * To put the platform back: set this to false. Nothing else has to change.
 */
export const EXPLORE_MODE = true;
