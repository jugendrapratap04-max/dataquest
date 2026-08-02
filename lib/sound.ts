/* Short synthesised cues for the moments that matter: a solve, a failed run, a
 * quiz answer, a finished lesson.
 *
 * WHY THERE ARE NO AUDIO FILES. Every cue here is generated with the Web Audio
 * API — a couple of oscillators and a gain envelope. That means zero bytes
 * downloaded, nothing to host, no CDN, no licensing question, and it works with
 * the network off. It is the same bargain the rest of this platform already
 * makes by vendoring Pyodide and sql.js instead of fetching them.
 *
 * WHY THE FAILURE CUE IS NOT A BUZZER. This platform's whole argument is that
 * failing is ordinary and the real enemy is a wrong answer that stays quiet. A
 * harsh error sound punishes the exact behaviour we want — a student trying
 * something and finding out. So `fail` and `wrong` are softer and quieter than
 * their positive counterparts, not louder. They mark the moment; they do not
 * scold.
 *
 * WHY IT NEVER FIRES BY ITSELF. Every cue is triggered by something the student
 * did. Nothing plays on page load — browsers block that anyway, and a page that
 * makes noise on arrival is a page people close, especially the ones studying in
 * a shared room at night.
 */

export type Cue = "solve" | "pass" | "fail" | "correct" | "wrong" | "complete";

const KEY = "etudo:sound";

/** One note: frequency in Hz, start offset and length in seconds. */
type Note = [freq: number, at: number, len: number];

// Kept deliberately short — nothing here runs past a third of a second. A cue
// that outlasts the click that caused it stops feeling like feedback and starts
// feeling like a jingle.
const CUES: Record<Cue, { notes: Note[]; gain: number; type: OscillatorType }> = {
  // A rising pair. Up means good, in every musical tradition anyone reading this
  // has grown up with.
  solve:    { notes: [[523.25, 0, 0.09], [659.25, 0.08, 0.14]], gain: 0.07, type: "sine" },
  pass:     { notes: [[587.33, 0, 0.07], [880.0, 0.06, 0.11]], gain: 0.06, type: "sine" },
  correct:  { notes: [[659.25, 0, 0.09]], gain: 0.05, type: "sine" },

  // Downward, low, and quieter than the positive cues. Enough to notice, not
  // enough to sting.
  fail:     { notes: [[220.0, 0, 0.12]], gain: 0.035, type: "sine" },
  wrong:    { notes: [[293.66, 0, 0.10]], gain: 0.035, type: "sine" },

  // The only cue with three notes, for the only moment that earns it.
  complete: { notes: [[523.25, 0, 0.09], [659.25, 0.08, 0.09], [783.99, 0.16, 0.18]], gain: 0.07, type: "sine" },
};

let ctx: AudioContext | null = null;

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
 * Play a cue. Silent when muted, when the browser has no Web Audio, or when
 * anything at all goes wrong — a missing sound is never worth an exception in
 * the middle of a student solving a problem.
 */
export function play(cue: Cue): void {
  if (typeof window === "undefined" || isMuted()) return;

  try {
    // Built on the first cue, which is always inside a user gesture, so the
    // context starts in the "running" state rather than suspended.
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();

    const spec = CUES[cue];
    const now = ctx.currentTime;

    for (const [freq, at, len] of spec.notes) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();

      osc.type = spec.type;
      osc.frequency.value = freq;

      // A ramp at both ends. A square-edged start or stop produces an audible
      // click that sounds like a fault rather than a note.
      const t0 = now + at;
      amp.gain.setValueAtTime(0, t0);
      amp.gain.linearRampToValueAtTime(spec.gain, t0 + 0.012);
      amp.gain.exponentialRampToValueAtTime(0.0001, t0 + len);

      osc.connect(amp).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + len + 0.02);
    }
  } catch {
    /* no sound is fine; a thrown error is not */
  }
}
