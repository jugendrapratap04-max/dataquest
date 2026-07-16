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

// Signed session cookie: "<userId>.<hmac>" — prevents forging arbitrary ids.

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

export function signSession(uid: string): string {
  const sig = createHmac("sha256", sessionSecret()).update(uid).digest("hex");
  return `${uid}.${sig}`;
}

export function verifySession(token?: string): string | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const uid = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac("sha256", sessionSecret()).update(uid).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length === b.length && timingSafeEqual(a, b)) return uid;
  return null;
}

export const SESSION_COOKIE = "dq_session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30,
} as const;
