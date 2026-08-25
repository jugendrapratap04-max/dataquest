/*
 * What Byte's face is doing, and why.
 *
 * Pure: no React, no timers, no window. Everything here is a function of its
 * arguments, so the rule "a drag beats a reaction beats a thought beats the
 * mood" can be read in one place and checked without rendering anything.
 *
 * The eight expressions were drawn and styled in globals.css and then sat
 * unreachable, because the component only ever wrote three of them. This is the
 * piece that was missing.
 */

export type PetState =
  | "idle"
  | "walking"
  | "happy"
  | "thinking"
  | "excited"
  | "focused"
  | "confused"
  | "sleepy";

/*
 * The cues lib/sound.ts already fires from fifteen places across six
 * components — every workbench, the quiz, the celebration. Byte reacts to the
 * same moments the sound does, which is why nothing else in the app has to
 * learn that Byte exists.
 */
export type PetCue =
  | "solve"
  | "pass"
  | "fail"
  | "correct"
  | "wrong"
  | "complete";

export type Reaction = {
  state: PetState;
  holdMs: number;
};

/*
 * A first solve and a finished lesson are the two moments worth more than a
 * nod, so they get the bigger face and a longer hold. Getting something wrong
 * gets a puzzled look rather than a sad one: Byte is a study partner, and the
 * answer to a wrong attempt is "hm, let's look again", not disappointment.
 */
export const REACTIONS: Record<PetCue, Reaction> = {
  solve: { state: "excited", holdMs: 2600 },
  complete: { state: "excited", holdMs: 2600 },
  pass: { state: "happy", holdMs: 1600 },
  correct: { state: "happy", holdMs: 1600 },
  fail: { state: "confused", holdMs: 1800 },
  wrong: { state: "confused", holdMs: 1800 },
};

/** Someone who touched the page this recently is working, not just present. */
export const FOCUSED_WITHIN_MS = 45_000;

/** Past this with no activity at all, Byte dozes off. */
export const SLEEPY_AFTER_MS = 5 * 60_000;

/**
 * The resting face, from how long ago the student last did anything.
 *
 * Three bands rather than two, because "not typing right now" and "walked
 * away" are different things and only the second one should put Byte to sleep.
 */
export function ambientState(
  activeMsAgo: number
): PetState {
  if (activeMsAgo < FOCUSED_WITHIN_MS) {
    return "focused";
  }

  if (activeMsAgo >= SLEEPY_AFTER_MS) {
    return "sleepy";
  }

  return "idle";
}

export type PetInput = {
  /** The student is holding Byte right now. */
  dragging: boolean;

  /** A cue reaction that has not expired yet. */
  reaction: PetState | null;

  /** Byte's chat is waiting on an answer. */
  thinking: boolean;

  /*
   * The resting face, already worked out from how long the student has been
   * quiet. Passed in rather than derived here so the hook can decide WHEN to
   * recompute it — a clock tick every few seconds must not re-render the pet
   * when the answer has not changed.
   */
  ambient: PetState;
};

/**
 * One state, from everything known at once.
 *
 * Order matters and is deliberate. Being dragged is the only thing the student
 * is doing TO Byte, so it wins outright. A reaction is short and is the whole
 * point of having reactions, so it beats a thought. Thinking beats the mood
 * because it is the one thing the student is waiting on.
 */
export function resolveState(
  input: PetInput
): PetState {
  if (input.dragging) {
    return "walking";
  }

  if (input.reaction) {
    return input.reaction;
  }

  if (input.thinking) {
    return "thinking";
  }

  return input.ambient;
}
