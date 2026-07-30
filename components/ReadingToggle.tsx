"use client";

import { useSyncExternalStore } from "react";

/* Hide the two side panels and give the lesson the window.
 *
 * WHY THIS EXISTS. Jugendra, reading lesson 1 on a 1136px screen: the left nav is
 * 232px, the module rail on the right is 280px plus a 28px gap, and the page
 * padding takes 60 more — so the lesson itself was reading in about 536px, less
 * than half the screen. His words: "dono side se space ghira hua hai... jo hat te
 * nahi hai during study". He is right, and it is worst exactly where it matters
 * most, on the long explanations and the wide interactive panels.
 *
 * So this is a switch, not a redesign. The panels are useful — one shows how far
 * through the module you are, the other is how you get to the next lesson — they
 * are just not useful *while reading a paragraph*. Press it and they go; press it
 * again and they come back.
 *
 * Two decisions worth recording:
 *
 *   - The state lives on <html data-reading> and in localStorage, applied by the
 *     pre-paint script in app/layout.tsx. Doing it in an effect instead would
 *     render both sidebars and then remove them a frame later, which looks broken.
 *   - The button is FIXED, not in the page header. Someone who wants the panels
 *     back is usually halfway down a lesson, and a control they have to scroll up
 *     to find is a control they will not use. Bottom-left, because the feedback
 *     button already owns bottom-right. */

const KEY = "dq-reading";

/* The switch's real state is the attribute on <html>, which the pre-paint script
 * may already have set before React existed. That makes it EXTERNAL state, so it
 * is read with useSyncExternalStore rather than copied into a useState inside an
 * effect — which is both a cascading render the compiler rejects and a needless
 * second source of truth that can disagree with the DOM. */
let listeners: (() => void)[] = [];
const subscribe = (cb: () => void) => {
  listeners.push(cb);
  return () => { listeners = listeners.filter((l) => l !== cb); };
};
const isOn = () => document.documentElement.getAttribute("data-reading") === "1";
/* On the server there is no <html> to read, and false is the honest default. React
 * re-reads the real value straight after hydration, so nothing flashes. */
const serverSnapshot = () => false;

export function ReadingToggle() {
  const on = useSyncExternalStore(subscribe, isOn, serverSnapshot);

  const toggle = () => {
    const next = !on;
    if (next) document.documentElement.setAttribute("data-reading", "1");
    else document.documentElement.removeAttribute("data-reading");
    try {
      if (next) localStorage.setItem(KEY, "1");
      else localStorage.removeItem(KEY);
    } catch {
      // A blocked localStorage should not cost the reader the feature on this
      // page — the attribute is already set, it just will not persist.
    }
    listeners.forEach((l) => l());
  };

  return (
    <button
      className="read-fab"
      onClick={toggle}
      aria-pressed={on}
      title={on ? "Bring the side panels back" : "Hide the side panels and widen the lesson"}
    >
      {on ? (
        <>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 4v16M15 4v16M3 12h4M21 12h-4" />
          </svg>
          Show panels
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
          </svg>
          Wider reading
        </>
      )}
    </button>
  );
}
