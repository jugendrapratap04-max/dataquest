/**
 * Seconds as "4m 12s", or "37s" under a minute.
 *
 * This lives in lib/ rather than beside the workbench that first needed it,
 * and that is not tidiness — it is a bug fix.
 *
 * It used to be exported from components/PracticeWorkbench.tsx, which carries
 * "use client". A server component that imports a plain function from a client
 * module does not get the function: it gets a client reference, and calling it
 * during a server render throws. The challenge pages are server components and
 * they call this to render the scoreboard.
 *
 * What made it slip through testing is that the crash needed data. With no
 * attempts recorded, the scoreboard maps over an empty array and never calls
 * this at all — so every signed-out check passed, and the page only broke the
 * moment somebody finished a challenge and gave it a duration to format.
 */
export function formatDuration(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}
