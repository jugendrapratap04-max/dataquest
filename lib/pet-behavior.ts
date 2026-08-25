"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { onPetEvent } from "./pet-events";
import {
  ambientState,
  REACTIONS,
  resolveState,
  type PetCue,
  type PetState,
} from "./pet-state";

/*
 * Byte's inner life.
 *
 * Everything that decides the face lives here: study cues arriving from the
 * sound bus, the chat raising its hand, and how long the student has been
 * quiet. The component keeps drag and position; this keeps mood.
 *
 * Not one line of it costs an API call. That was the rule from the start — the
 * pet reacts to things that have already happened in the browser, and never
 * asks anyone anything.
 */

/*
 * The activity stamp ActivityPing already writes on every pointerdown, keydown,
 * scroll and focus. Imported rather than re-typed: a second copy of the key is
 * a second thing to get wrong, and a second set of global listeners would be
 * worse still.
 */
import { ACTIVE_KEY } from "@/components/ActivityPing";

/*
 * How often the resting mood is re-checked.
 *
 * Five seconds so Byte perks up soon after the student starts working, and
 * cheap enough not to matter: one localStorage read and one comparison. The
 * result is only pushed into state when the BAND changes — focused to idle,
 * idle to sleepy — so a tick that changes nothing costs no render at all.
 */
const MOOD_TICK_MS = 5_000;

/** A pleased little bounce when Byte is put back down. */
const DROP_REACTION_MS = 900;

function msSinceActive(): number {
  try {
    const at = Number(
      localStorage.getItem(ACTIVE_KEY) ?? 0
    );

    /*
     * No stamp at all means the page just loaded and nothing has been touched.
     * Treat that as "just active" rather than "asleep for ever", or Byte greets
     * every first-time visitor by dozing off.
     */
    if (!at) {
      return 0;
    }

    return Math.max(0, Date.now() - at);
  } catch {
    return 0;
  }
}

export type PetBehavior = {
  state: PetState;

  /** Tell the hook the student picked Byte up, or put it down. */
  setDragging: (dragging: boolean) => void;

  /** Show a face for a moment, then go back to whatever the mood was. */
  react: (state: PetState, holdMs?: number) => void;
};

export function usePetBehavior(): PetBehavior {
  const [dragging, setDraggingState] =
    useState(false);

  const [reaction, setReaction] =
    useState<PetState | null>(null);

  const [thinking, setThinking] =
    useState(false);

  const [ambient, setAmbient] =
    useState<PetState>("idle");

  const holdTimer = useRef(0);

  /* Mirrors `dragging` so the release edge can be seen without a stale closure. */
  const draggingRef = useRef(false);

  const react = useCallback(
    (next: PetState, holdMs = 1600) => {
      window.clearTimeout(holdTimer.current);

      setReaction(next);

      holdTimer.current = window.setTimeout(
        () => setReaction(null),
        holdMs
      );
    },
    []
  );

  const setDragging = useCallback(
    (next: boolean) => {
      const was = draggingRef.current;
      draggingRef.current = next;

      setDraggingState(next);

      /*
       * Only on the release edge. Setting it on every pointerup regardless
       * would make Byte look pleased about being clicked and not moved, which
       * is a different event with a different meaning.
       */
      if (was && !next) {
        react("happy", DROP_REACTION_MS);
      }
    },
    [react]
  );

  /*
   * Study cues. lib/sound.ts fires one at every moment worth reacting to and
   * has done since long before the pet existed — this listens to that instead
   * of teaching six components about Byte.
   */
  useEffect(
    () =>
      onPetEvent("pet:cue", (detail) => {
        const cue = detail as PetCue;
        const answer = REACTIONS[cue];

        if (!answer) {
          return;
        }

        react(answer.state, answer.holdMs);
      }),
    [react]
  );

  /* The chat, waiting on an answer. */
  useEffect(
    () =>
      onPetEvent("pet:thinking", (detail) => {
        setThinking(Boolean(detail));
      }),
    []
  );

  /*
   * The mood clock.
   *
   * setAmbient is called with the value rather than unconditionally, and React
   * bails out when it matches, so four ticks out of five cost nothing.
   */
  useEffect(() => {
    const tick = () => {
      setAmbient(
        ambientState(msSinceActive())
      );
    };

    tick();

    const id = window.setInterval(
      tick,
      MOOD_TICK_MS
    );

    return () => {
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(holdTimer.current);
    };
  }, []);

  return {
    state: resolveState({
      dragging,
      reaction,
      thinking,
      ambient,
    }),
    setDragging,
    react,
  };
}
