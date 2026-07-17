// A small in-memory throttle for login attempts.
//
// Honest scope: this lives in the process's memory, so on serverless it's
// per-instance and resets on cold start — it is a speed bump, not a wall. The
// real fix is a shared store (Redis/DB), which we don't have on the free tier
// yet. But paired with scrypt (every password guess costs ~50-100ms of CPU,
// see lib/auth.ts), even a per-instance cap makes online brute-force
// impractical, and it costs nothing.
//
// Keyed by IP, not by email, on purpose: locking an account after N failures
// lets anyone lock a victim out by failing on their email (a denial-of-service).
// Throttling the source IP slows the attacker without touching the victim's
// account. The trade-off is that a shared NAT/office IP shares one bucket — the
// threshold below is generous enough that normal use won't hit it.

type Entry = { fails: number; windowStart: number; lockedUntil: number };

const attempts = new Map<string, Entry>();

const WINDOW_MS = 15 * 60 * 1000; // failures are counted within a rolling window
const MAX_FAILS = 10;             // this many failures in the window trips a lock
const LOCK_MS = 15 * 60 * 1000;   // how long the lock lasts
const MAX_KEYS = 5000;            // hard cap so the map can't grow without bound

/** Seconds remaining on a lock for this key, or 0 if it may proceed. */
export function loginRetryAfter(key: string, now = Date.now()): number {
  const e = attempts.get(key);
  if (!e) return 0;
  if (e.lockedUntil > now) return Math.ceil((e.lockedUntil - now) / 1000);
  return 0;
}

export function recordLoginFail(key: string, now = Date.now()): void {
  let e = attempts.get(key);
  if (!e || now - e.windowStart > WINDOW_MS) {
    e = { fails: 0, windowStart: now, lockedUntil: 0 };
  }
  e.fails += 1;
  if (e.fails >= MAX_FAILS) e.lockedUntil = now + LOCK_MS;
  attempts.set(key, e);

  if (attempts.size > MAX_KEYS) prune(now);
}

/** A successful login clears the key so honest users never accumulate toward a lock. */
export function recordLoginSuccess(key: string): void {
  attempts.delete(key);
}

function prune(now: number): void {
  for (const [k, e] of attempts) {
    if (e.lockedUntil <= now && now - e.windowStart > WINDOW_MS) attempts.delete(k);
  }
}

/** Best-effort client IP from proxy headers; falls back to a shared bucket. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
