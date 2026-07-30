"use client";

import { useEffect, useSyncExternalStore } from "react";

/* Collapsing the two side panels, VS Code / Notion style.
 *
 * WHY. On a 1351px screen the lesson page spends 232px on the left nav and 308px
 * on the right module rail, and the reader gets what is left. Jugendra asked for
 * the panels to be foldable rather than fixed, and specifically for three
 * separate controls rather than the single on/off switch that shipped first:
 *
 *   - the left nav collapses to ICONS ONLY, keeping navigation reachable
 *   - the right rail collapses to a thin tab on the edge
 *   - a focus mode hides both and gives the lesson nearly the whole window
 *
 * Focus mode deliberately does NOT clear the other two. It is a temporary
 * override, so leaving it puts back exactly the layout you had — which is the
 * behaviour every editor with a zen mode has, and the reason Esc feels safe.
 *
 * DESKTOP ONLY. Every rule is inside `@media (min-width: 1001px)`, because below
 * that the nav is already a drawer and the rail is already hidden. A preference
 * saved on a laptop must not follow the reader onto a phone and hide things there.
 *
 * The state lives on <html> and in localStorage, applied by the pre-paint script
 * in app/layout.tsx — an effect would render the panels and remove them a frame
 * later, which reads as a bug. */

type Pref = "nav" | "rail" | "focus";

const KEY: Record<Pref, string> = { nav: "dq-nav", rail: "dq-rail", focus: "dq-focus" };
const ATTR: Record<Pref, string> = { nav: "data-nav", rail: "data-rail", focus: "data-focus" };
/** The attribute value that means "collapsed" for each. */
const ON: Record<Pref, string> = { nav: "mini", rail: "off", focus: "1" };

let listeners: (() => void)[] = [];
const subscribe = (cb: () => void) => {
  listeners.push(cb);
  return () => { listeners = listeners.filter((l) => l !== cb); };
};
const notify = () => listeners.forEach((l) => l());
const read = (p: Pref) => () => document.documentElement.getAttribute(ATTR[p]) === ON[p];
const serverOff = () => false;

function set(p: Pref, on: boolean) {
  if (on) document.documentElement.setAttribute(ATTR[p], ON[p]);
  else document.documentElement.removeAttribute(ATTR[p]);
  try {
    if (on) localStorage.setItem(KEY[p], ON[p]);
    else localStorage.removeItem(KEY[p]);
  } catch {
    // A blocked localStorage costs persistence, not the feature.
  }
  notify();
}

/** Reads the live attribute, so the pre-paint script and React never disagree. */
function usePref(p: Pref) {
  return useSyncExternalStore(subscribe, read(p), serverOff);
}

/* ------------------------------------------------- left nav, icons only --- */

export function NavCollapse() {
  const mini = usePref("nav");
  return (
    <button
      className="nav-collapse"
      onClick={() => set("nav", !mini)}
      aria-pressed={mini}
      title={mini ? "Expand the menu" : "Collapse the menu to icons"}
    >
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
        {mini ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
      </svg>
    </button>
  );
}

/* ----------------------------------------- right rail, collapsed to a tab --- */

/** The chevron that lives at the top of the module rail, plus the tab that
 *  brings it back. The tab is fixed, so it works from anywhere down the page —
 *  a reader who wants the rail back is rarely at the top. */
export function RailControls() {
  const off = usePref("rail");
  const focus = usePref("focus");

  return (
    <>
      {!off && (
        <button className="rail-collapse" onClick={() => set("rail", true)} title="Hide this panel">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      )}
      {off && !focus && (
        <button className="rail-tab" onClick={() => set("rail", false)} title="Show the module panel">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 6-6 6 6 6" />
          </svg>
        </button>
      )}
    </>
  );
}

/* --------------------------------------------------------- focus reading --- */

export function FocusButton() {
  const focus = usePref("focus");

  // Escape leaves focus mode. Bound only while it is on, so it never competes
  // with the mobile drawer's own Escape handler.
  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") set("focus", false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focus]);

  return (
    <button
      className="focus-fab"
      onClick={() => set("focus", !focus)}
      aria-pressed={focus}
      title={focus ? "Leave focus reading (Esc)" : "Hide both panels and fill the window"}
    >
      {focus ? (
        <>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
          </svg>
          Exit focus <kbd className="fab-kbd">Esc</kbd>
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
          Focus reading
        </>
      )}
    </button>
  );
}
