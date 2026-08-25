import { emitPetEvent } from "./pet-events";

/* Short synthesised cues for the moments that matter: a solve, a failed run, a
 * quiz answer, a finished lesson.
 *
 * WHY THERE ARE NO AUDIO FILES. Every cue is generated with the Web Audio API.
 * Zero bytes downloaded, nothing to host, no CDN, no licensing question, and it
 * works with the network off — the same bargain the platform already makes by
 * vendoring Pyodide and sql.js instead of fetching them. The reverb below is
 * generated too, from a noise burst, so even that costs nothing.
 *
 * WHY IT SOUNDS LIKE AN INSTRUMENT AND NOT A BEEP. A bare sine wave is thin and
 * reads as "error dialog". What makes a reward cue feel good is not the notes,
 * it is the TIMBRE: a fundamental plus a couple of quieter partials, one of them
 * deliberately not a whole-number multiple, which is what gives a struck bar or
 * bell its character. Add a very fast attack, a long exponential decay and a
 * little room, and the same two notes stop sounding like a beep.
 *
 * These are written in the style of a good mobile learning app. They are not
 * copies of anyone's audio — nothing here is sampled, it is all arithmetic.
 *
 * WHY THE FAILURE CUE IS NOT A BUZZER. This platform's whole argument is that
 * failing is ordinary and the real enemy is a wrong answer that stays quiet. A
 * harsh error sound punishes the exact behaviour we want — a student trying
 * something and finding out. So `fail` and `wrong` are lower, softer, quieter
 * and rolled off at the top. They mark the moment; they do not scold.
 *
 * WHY IT NEVER FIRES BY ITSELF. Every cue follows something the student did.
 * Nothing plays on page load — browsers block that anyway, and a page that makes
 * noise on arrival is a page people close, especially the ones studying in a
 * shared room at night.
 */

export type Cue = "solve" | "pass" | "fail" | "correct" | "wrong" | "complete";

const KEY = "etudo:sound";

/* Equal-tempered notes, so the arpeggios are actually in tune. */
const N = {
  D3: 146.83, F3: 174.61, A3: 220.0,
  D4: 293.66, Fs4: 369.99, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
  C6: 1046.5, E6: 1318.5,
};

/** One struck note: frequency, when it starts, how long it rings, how loud. */
type Note = { f: number; at: number; dur: number; gain: number };

type Voice = {
  notes: Note[];
  /** [ratio, gain] pairs added on top of the fundamental. A ratio like 3.01
   *  instead of 3 is what stops it sounding like a synthesiser. */
  partials: [number, number][];
  /** Low-pass corner. Lower = darker, which is how the failure cues stay soft. */
  cutoff: number;
  /** How much goes to the reverb send, 0–1. */
  space: number;
};

// Bright, struck, bell-like. Used for everything positive.
const BELL: [number, number][] = [[1, 1], [2, 0.22], [3.01, 0.09], [4.2, 0.04]];
// Darker and simpler — fewer overtones is most of what makes it feel gentle.
const SOFT: [number, number][] = [[1, 1], [2, 0.12]];

const CUES: Record<Cue, Voice> = {
  // A major third, rung twice. Short and bright: this fires on every correct
  // answer, so it has to be something you can hear fifty times without tiring.
  correct: {
    notes: [{ f: N.C5, at: 0, dur: 0.5, gain: 0.16 }, { f: N.E5, at: 0.055, dur: 0.6, gain: 0.14 }],
    partials: BELL, cutoff: 6000, space: 0.22,
  },

  // All tests green. One step further up the chord than `correct`.
  pass: {
    notes: [
      { f: N.C5, at: 0, dur: 0.45, gain: 0.15 },
      { f: N.E5, at: 0.06, dur: 0.5, gain: 0.13 },
      { f: N.G5, at: 0.12, dur: 0.75, gain: 0.13 },
    ],
    partials: BELL, cutoff: 6500, space: 0.28,
  },

  // The problem is solved. A full major arpeggio landing an octave up — the
  // biggest cue on the platform, and the only place that octave is used.
  solve: {
    notes: [
      { f: N.C5, at: 0, dur: 0.45, gain: 0.15 },
      { f: N.E5, at: 0.075, dur: 0.5, gain: 0.14 },
      { f: N.G5, at: 0.15, dur: 0.55, gain: 0.14 },
      { f: N.C6, at: 0.225, dur: 1.0, gain: 0.15 },
      { f: N.E6, at: 0.235, dur: 0.9, gain: 0.05 },   // a quiet third on top for shine
    ],
    partials: BELL, cutoff: 7500, space: 0.4,
  },

  // Lesson finished. Same shape as `solve` but wider and slower, so it reads as
  // a bigger moment rather than a louder one.
  complete: {
    notes: [
      { f: N.C5, at: 0, dur: 0.5, gain: 0.14 },
      { f: N.G5, at: 0.1, dur: 0.55, gain: 0.13 },
      { f: N.C6, at: 0.2, dur: 0.6, gain: 0.13 },
      { f: N.E6, at: 0.3, dur: 1.2, gain: 0.12 },
    ],
    partials: BELL, cutoff: 8000, space: 0.5,
  },

  // Wrong quiz answer. A gentle major-second fall — down, but not a minor
  // interval, because minor reads as "bad news" rather than "not that one".
  wrong: {
    notes: [{ f: N.A4, at: 0, dur: 0.28, gain: 0.09 }, { f: N.Fs4, at: 0.07, dur: 0.4, gain: 0.08 }],
    partials: SOFT, cutoff: 1400, space: 0.12,
  },

  // Tests failed. Lower and shorter still — the quietest cue here, on purpose.
  fail: {
    notes: [{ f: N.D4, at: 0, dur: 0.3, gain: 0.08 }, { f: N.A3, at: 0.06, dur: 0.42, gain: 0.07 }],
    partials: SOFT, cutoff: 1100, space: 0.1,
  },
};

let ctx: AudioContext | null = null;
let verb: ConvolverNode | null = null;
let dry: GainNode | null = null;

/** Muted state, read from localStorage. Defaults to ON. */
export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  try { return window.localStorage.getItem(KEY) === "off"; } catch { return false; }
}

export function setMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, muted ? "off" : "on"); } catch { /* private mode */ }
}

/**
 * A small room, generated rather than downloaded: decaying noise is a perfectly
 * good impulse response at this length, and it is what stops the cues sounding
 * like they were recorded inside a box.
 */
function makeReverb(ac: AudioContext): ConvolverNode {
  const len = Math.floor(ac.sampleRate * 1.1);
  const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      // Exponential decay, steep enough that the tail never smears the next cue.
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
    }
  }
  const node = ac.createConvolver();
  node.buffer = buf;
  return node;
}

/**
 * Play a cue. Silent when muted, when the browser has no Web Audio, or when
 * anything at all goes wrong — a missing sound is never worth an exception in
 * the middle of a student solving a problem.
 */
export function play(cue: Cue): void {
  // Byte hears this too — and ABOVE the mute check on purpose. Muting turns
  // the sound off, not the pet: a student who silences the tab should still
  // see Byte react when they get something right. One line below the guard
  // and the pet dies for everyone who studies quietly.
  //
  // emitPetEvent is a no-op without a window, so it is safe this early.
  emitPetEvent("pet:cue", cue);

  if (typeof window === "undefined" || isMuted()) return;

  try {
    // Built on the first cue, which is always inside a user gesture, so the
    // context starts running rather than suspended.
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!ctx) {
      ctx = new AC();
      verb = makeReverb(ctx);
      dry = ctx.createGain();
      dry.connect(ctx.destination);
      const wet = ctx.createGain();
      wet.gain.value = 0.9;
      verb.connect(wet).connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();

    const v = CUES[cue];
    const now = ctx.currentTime + 0.01;

    // One send per cue rather than per partial — cheaper, and the tail should be
    // of the whole chord anyway.
    const send = ctx.createGain();
    send.gain.value = v.space;
    send.connect(verb!);

    for (const note of v.notes) {
      const t0 = now + note.at;

      // A gentle roll-off. The top partials are what make a bright cue bright,
      // so darkening this is how the failure cues get their softer character.
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = v.cutoff;

      const out = ctx.createGain();
      out.gain.value = 1;
      lp.connect(out);
      out.connect(dry!);
      out.connect(send);

      for (const [ratio, mix] of v.partials) {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = note.f * ratio;

        // Struck, not blown: near-instant attack, then an exponential decay all
        // the way down. Higher partials fade faster, which is what real bars and
        // bells do and the main reason this reads as an instrument.
        const peak = note.gain * mix;
        const dur = note.dur / (1 + (ratio - 1) * 0.55);
        amp.gain.setValueAtTime(0.0001, t0);
        amp.gain.exponentialRampToValueAtTime(peak, t0 + 0.006);
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

        osc.connect(amp).connect(lp);
        osc.start(t0);
        osc.stop(t0 + dur + 0.03);
      }
    }
  } catch {
    /* no sound is fine; a thrown error is not */
  }
}
