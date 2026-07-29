import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "crypto";

// Password hashing via Node's built-in scrypt (no external deps).
export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const h = scryptSync(pw, salt, 64);
  const hb = Buffer.from(hash, "hex");
  return h.length === hb.length && timingSafeEqual(h, hb);
}

// Signed session cookie: "<userId>.<issuedAt>.<hmac>" — prevents forging
// arbitrary ids, and bounds how long a leaked cookie stays usable.

// A session is good for 30 days from issue, matching the cookie's maxAge. The
// old token signed only the uid, so a stolen cookie was valid forever (the
// browser maxAge is client-side and trivially ignored); now the signed payload
// carries the issue time and verifySession refuses anything past this age.
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const DEV_SECRET = "dq-dev-secret-change-in-prod";
let cachedSecret: string | null = null;

// This fallback is committed, so treating it as a secret in production would let
// anyone mint a valid cookie for any user id. Outside dev we refuse to run without
// a real AUTH_SECRET rather than silently signing with a public string.
function sessionSecret(): string {
  if (cachedSecret) return cachedSecret;
  const fromEnv = process.env.AUTH_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 32) {
    cachedSecret = fromEnv;
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is missing or under 32 chars — sessions would be forgeable. " +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  } else {
    cachedSecret = DEV_SECRET;
  }
  return cachedSecret;
}

export type SessionClaims = { uid: string; version: number };

// The token carries the account's session version as well as its id and issue
// time, which is what makes logging out mean something. Logout increments the
// number on the account; every cookie ever issued then fails the comparison in
// getCurrentUser at once. Before this, "log out" deleted the cookie in your
// browser and a copy taken beforehand stayed valid for its full 30 days.
//
// The uid is a cuid and the other two are integers, so a plain "." split gives
// back exactly three fields.
export function signSession(uid: string, version = 0): string {
  const payload = `${uid}.${version}.${Date.now()}`;
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySession(token?: string): SessionClaims | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const payload = token.slice(0, i); // "<uid>.<version>.<iat>"
  const sig = token.slice(i + 1);

  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  // Older two-field tokens are rejected rather than guessed at. Those users log
  // in once more, which is the correct outcome for tightening session security —
  // the same call that was made when the issue time was introduced.
  const parts = payload.split(".");
  if (parts.length !== 3) return null;
  const [uid, versionText, iatText] = parts;
  const version = Number(versionText);
  const iat = Number(iatText);
  if (!uid || !Number.isFinite(version) || !Number.isFinite(iat)) return null;
  if (Date.now() - iat > SESSION_MAX_AGE_MS) return null; // expired

  return { uid, version };
}

export const SESSION_COOKIE = "dq_session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30,
} as const;
