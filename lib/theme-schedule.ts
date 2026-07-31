/* The theme that follows the clock.
 *
 * Designed in docs/HANDOFF.md §4a and settled there — this file is only the
 * implementation. The three decisions it rests on, so nobody has to re-derive
 * them from the code:
 *
 *   1. Nobody is asked for anything. The hour comes from the browser's own
 *      clock, which needs no permission and cannot fail.
 *   2. Auto is the DEFAULT for anyone who has never picked a theme, because
 *      comfort should not have to be earned — a student reading at midnight
 *      gets the dark theme without unlocking it.
 *   3. Auto never overrules a choice. Picking any theme in the menu turns auto
 *      off, and the way back is choosing "Auto" again.
 *
 * The boundary hours live here and nowhere else. The pre-paint script in
 * app/layout.tsx cannot import a module, so it INTERPOLATES these numbers into
 * its source string — which is exactly why they must not be written out a second
 * time by hand. A drifted boundary would show as the page flashing one theme and
 * settling on another.
 */

export type ThemeId = "light" | "dark" | "focus" | "sunset";

/** Every theme the picker offers, in menu order. */
export const THEME_IDS: ThemeId[] = ["light", "dark", "focus", "sunset"];

/** localStorage keys. Two of them, because auto needs two pieces of state:
 *  what is applied right now, and what the student actually chose. */
export const THEME_KEY = "dq-theme";        // the applied theme id, always concrete
export const MODE_KEY = "dq-theme-mode";    // "manual" once a theme is picked; absent means auto

/** Hour boundaries, ascending. The hours before the first entry belong to the
 *  last one, because the night wraps: 20:00 dark runs until 06:00. */
export const SCHEDULE: { from: number; theme: ThemeId }[] = [
  { from: 6, theme: "light" },
  { from: 17, theme: "sunset" },
  { from: 20, theme: "dark" },
];

/**
 * The theme the clock asks for.
 *
 * `prefersDark` is a **veto, not a vote**: somebody who set their system to dark
 * mode has said something, so auto never puts them on the light theme. It has no
 * effect on the evening steps, because Sunset and Dark are both dark themes.
 */
export function themeForHour(hour: number, prefersDark: boolean): ThemeId {
  let picked = SCHEDULE[SCHEDULE.length - 1].theme;
  for (const s of SCHEDULE) if (hour >= s.from) picked = s.theme;
  return prefersDark && picked === "light" ? "dark" : picked;
}

/** Same answer, from the browser's own clock and media query. */
export function themeNow(): ThemeId {
  const prefersDark =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return themeForHour(new Date().getHours(), prefersDark);
}

/** A one-line "why it looks like this" for the menu. Derived from SCHEDULE so it
 *  cannot drift, and kept short because the menu is 250px wide. */
export function scheduleHint(): string {
  const clock = (h: number) => (h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`);
  return `Follows the clock — ${SCHEDULE.map((s) => clock(s.from)).join(" · ")}`;
}
