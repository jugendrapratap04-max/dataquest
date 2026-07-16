"use client";

import { useEffect } from "react";

// Studying isn't one tab.
//
// The focus room tells students to open Practice in a second tab — so if
// "active" meant "the room's own tab is in front", the room would mark you away
// the moment you did the thing it just asked you to do, and your focus score
// would drop for studying. Instead every authed page reports two things to
// localStorage, and the focus session reads them together:
//
//   dq-visible-at — some DataQuest tab was in the foreground
//   dq-active-at  — someone actually touched a DataQuest tab
//
// Switch to YouTube and both go stale within seconds. Sit reading a lesson
// without touching the mouse and you still count, which is the whole point.

export const VISIBLE_KEY = "dq-visible-at";
export const ACTIVE_KEY = "dq-active-at";

export function ActivityPing() {
  useEffect(() => {
    const stamp = (k: string) => {
      try { localStorage.setItem(k, String(Date.now())); } catch {}
    };
    const touch = () => { stamp(ACTIVE_KEY); if (document.visibilityState === "visible") stamp(VISIBLE_KEY); };

    touch();
    const evs = ["pointerdown", "keydown", "mousemove", "scroll", "wheel", "focus"] as const;
    evs.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    document.addEventListener("visibilitychange", touch);

    // Keep the visible stamp warm while the tab is merely being read.
    const t = setInterval(() => {
      if (document.visibilityState === "visible") stamp(VISIBLE_KEY);
    }, 5_000);

    return () => {
      evs.forEach((e) => window.removeEventListener(e, touch));
      document.removeEventListener("visibilitychange", touch);
      clearInterval(t);
    };
  }, []);

  return null;
}

/** Is the student studying right now — anywhere in DataQuest?
 *  `idleMs` is generous on purpose: reading is studying, and reading doesn't
 *  move the mouse. */
export function isStudying(idleMs = 5 * 60_000): boolean {
  try {
    const now = Date.now();
    const visible = Number(localStorage.getItem(VISIBLE_KEY) ?? 0);
    const active = Number(localStorage.getItem(ACTIVE_KEY) ?? 0);
    // A tab in the foreground restamps every 5s, so 12s of silence means every
    // DataQuest tab is behind something else.
    return now - visible < 12_000 && now - active < idleMs;
  } catch {
    return true; // no localStorage (private mode) — don't punish the student for it
  }
}
