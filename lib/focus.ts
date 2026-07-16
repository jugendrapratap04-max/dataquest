// Study Together — the timer, presence and scoring rules.
//
// Nothing here ticks. A session/room records which phase it entered and when;
// everything else is arithmetic against the wall clock. That's what lets this
// run without a socket server or a cron: the browser polls, derives the same
// numbers the server would, and a sleeping tab wakes up in sync instead of
// drifting. Server and client both import this file, so there is exactly one
// definition of "how much time is left".

export type Phase = "focus" | "discussion" | "ended";

export type PhaseConfig = {
  phase: string;
  phaseStartedAt: Date | string;
  focusMinutes: number;
  breakMinutes: number;
  cycle: number;
};

export type PhaseState = {
  phase: Phase;
  cycle: number;
  /** Seconds remaining in the current phase (never negative). */
  secondsLeft: number;
  /** Seconds elapsed within the current phase. */
  secondsIn: number;
  /** Total length of the current phase, in seconds. */
  phaseSeconds: number;
  /** When the current phase actually began, after fast-forwarding. */
  phaseStartedAt: Date;
  /** True if the stored row is stale and the caller should persist this state. */
  changed: boolean;
};

// A tab left open overnight would otherwise spin through thousands of cycles.
// Past this many, the room is simply over.
const MAX_CATCHUP_CYCLES = 200;

/**
 * Derives the phase a room/session is *actually* in right now.
 *
 * The stored phase can be arbitrarily stale — nobody polled for an hour, the
 * host's laptop slept — so this fast-forwards through however many phases have
 * elapsed rather than assuming only one did. `changed` tells the caller whether
 * the database row needs catching up.
 */
export function derivePhase(cfg: PhaseConfig, now: Date = new Date()): PhaseState {
  const focusSeconds = Math.max(1, Math.round(cfg.focusMinutes * 60));
  const breakSeconds = Math.max(1, Math.round(cfg.breakMinutes * 60));

  let phase: Phase = cfg.phase === "discussion" ? "discussion" : cfg.phase === "ended" ? "ended" : "focus";
  let cycle = Math.max(1, cfg.cycle);
  let startedAt = new Date(cfg.phaseStartedAt);
  let changed = false;

  if (phase === "ended") {
    return { phase, cycle, secondsLeft: 0, secondsIn: 0, phaseSeconds: 0, phaseStartedAt: startedAt, changed: false };
  }

  let remaining = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
  if (remaining < 0) remaining = 0; // clock skew: treat the future as "just started"

  let guard = 0;
  for (;;) {
    const phaseSeconds = phase === "focus" ? focusSeconds : breakSeconds;
    if (remaining < phaseSeconds) {
      return {
        phase,
        cycle,
        secondsIn: remaining,
        secondsLeft: phaseSeconds - remaining,
        phaseSeconds,
        phaseStartedAt: startedAt,
        changed,
      };
    }
    // This phase is over — roll into the next one.
    remaining -= phaseSeconds;
    startedAt = new Date(startedAt.getTime() + phaseSeconds * 1000);
    changed = true;
    if (phase === "focus") {
      phase = "discussion";
    } else {
      phase = "focus";
      cycle += 1; // a cycle = one focus + one discussion
    }
    if (++guard > MAX_CATCHUP_CYCLES) {
      return { phase: "ended", cycle, secondsIn: 0, secondsLeft: 0, phaseSeconds: 0, phaseStartedAt: startedAt, changed: true };
    }
  }
}

/** Presence thresholds. A heartbeat stops the moment a tab closes, so "away"
 *  and "dropped" both fall out of one timestamp — no leave event required. */
export const AWAY_AFTER_SECONDS = 90;
export const DROP_AFTER_SECONDS = 15 * 60;

export function presenceOf(lastSeenAt: Date | string, now: Date = new Date()): "studying" | "away" | "left" {
  const idle = (now.getTime() - new Date(lastSeenAt).getTime()) / 1000;
  if (idle > DROP_AFTER_SECONDS) return "left";
  if (idle > AWAY_AFTER_SECONDS) return "away";
  return "studying";
}

/**
 * Focus % = the share of the session you were actually present for.
 *
 * Deliberately just this ratio. A weighted score mixing in messages and
 * problems would look more impressive and mean less — the student couldn't tell
 * what moved it, and any number they can't act on is decoration. Problems
 * solved and messages used are reported alongside it, unmixed.
 */
export function focusPct(activeSeconds: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((activeSeconds / elapsedSeconds) * 100)));
}

/** A session counts as completed if at least one full focus block was finished. */
export function isComplete(cyclesDone: number, activeSeconds: number, focusMinutes: number): boolean {
  return cyclesDone >= 1 || activeSeconds >= focusMinutes * 60;
}

// The chat budget, per focus+discussion cycle. The point of the room is that
// you can't talk your way through it.
export const MESSAGES_PER_CYCLE = 8;

// Preset replies — the whole chat vocabulary. No free text field anywhere.
export const QUICK_REPLIES = [
  "Need help",
  "Done",
  "Wait",
  "Check question",
  "Good job",
  "Explain again",
  "Got it",
  "Almost there",
] as const;

export const EMOJIS = ["👍", "✅", "💡", "🤔", "👏", "🎉"] as const;

export function isAllowedMessage(kind: string, text: string): boolean {
  if (kind === "emoji") return (EMOJIS as readonly string[]).includes(text);
  if (kind === "quick") return (QUICK_REPLIES as readonly string[]).includes(text);
  return false;
}

export const MIN_PARTICIPANTS = 2;
export const MAX_PARTICIPANTS = 6;

export function clampParticipants(n: unknown): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 4;
  return Math.max(MIN_PARTICIPANTS, Math.min(MAX_PARTICIPANTS, v));
}

export function clampMinutes(n: unknown, fallback: number, min: number, max: number): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return fallback;
  return Math.max(min, Math.min(max, v));
}

/** Invite codes: no vowels and no 0/O/1/I, so they can't spell anything and
 *  can't be misread aloud. */
const CODE_ALPHABET = "BCDFGHJKLMNPQRSTVWXYZ23456789";

export function makeRoomCode(rand: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    if (i === 3) out += "-";
    out += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
  }
  return out;
}

export function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/** "1h 24m" / "24m" / "40s" — for summaries and history. */
export function humanDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
