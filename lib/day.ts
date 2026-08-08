/* WHAT DAY IS IT — one answer, for the whole platform.
 *
 * Five places used to decide this independently, and every one of them called
 * `setHours(0,0,0,0)` or `getDay()` on the SERVER's clock. Vercel runs UTC.
 * The students are in India. So a problem solved at 01:00 IST was filed to the
 * previous day: it could break a streak the student had actually kept, light
 * the wrong square on the heatmap, and label the wrong weekday under the ticks.
 * Nothing on the page was wrong by a lot — it was wrong by five and a half
 * hours, every night, for exactly the people who study late.
 *
 * The fix is a declared platform timezone, not the server's. It is a decision
 * rather than a discovery: this product is single-region today (₹0 pricing, an
 * Indian audience, college-wifi notes in its own docs), and a per-user timezone
 * needs a stored field, onboarding to capture it and a backfill for everyone
 * already here — real work for a benefit nobody currently has. When a second
 * region turns up, this file is where that gets replaced.
 *
 * ⚠️ WHY A FIXED OFFSET IS SAFE HERE AND WOULD NOT BE ELSEWHERE: India has no
 * daylight saving, so +05:30 is exact all year. Do not copy this shape for a
 * zone that observes DST — that needs Intl, not arithmetic.
 *
 * ⚠️ These functions never read the server's local zone, so they behave
 * identically in dev (a laptop already in IST) and on Vercel (UTC). That
 * matters: the bug was invisible locally precisely because the machine that
 * found it was in the right timezone already.
 */

/** IST is UTC+05:30. One number, one place. */
export const PLATFORM_OFFSET_MINUTES = 330;
const OFFSET_MS = PLATFORM_OFFSET_MINUTES * 60_000;

/** The instant at which the platform's day containing `d` began.
 *  Safe to hand straight to Prisma as a `gte` bound. */
export function startOfDay(d: Date | number = new Date()): Date {
  const shifted = new Date((typeof d === "number" ? d : d.getTime()) + OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - OFFSET_MS);
}

/** Milliseconds in a day. Exported because the streak arithmetic needs it and
 *  a second copy of 86_400_000 is a second chance to typo it. */
export const DAY_MS = 86_400_000;

/** `YYYY-MM-DD` for the platform's day containing `d`. Used as the daily
 *  challenge's seed, so it must roll over with the streak — which it does,
 *  because both come from here. */
export function dayKey(d: Date | number = new Date()): string {
  const s = new Date((typeof d === "number" ? d : d.getTime()) + OFFSET_MS);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${s.getUTCFullYear()}-${p(s.getUTCMonth() + 1)}-${p(s.getUTCDate())}`;
}

/** 0 = Sunday … 6 = Saturday, in the platform's timezone. */
export function weekdayIndex(d: Date | number = new Date()): number {
  return new Date((typeof d === "number" ? d : d.getTime()) + OFFSET_MS).getUTCDay();
}

/** The single letter under an activity tick. */
export function weekdayLetter(d: Date | number = new Date()): string {
  return "SMTWTFS"[weekdayIndex(d)];
}

/** Weekday letters for the last `n` platform days, oldest first — the labels
 *  under the dashboard's tick row, in the same order `getActivity` returns.
 *
 *  It lives here rather than in the page because reading the clock during a
 *  render is an impure call and the linter says so. Same reason getActivity
 *  keeps its own `new Date()` in this layer. */
export function weekdayLettersBack(n: number): string[] {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => weekdayLetter(now - (n - 1 - i) * DAY_MS));
}
