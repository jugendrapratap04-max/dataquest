import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { verifyPassword, hashPassword, signSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { clientIp, loginRetryAfter, recordLoginFail, recordLoginSuccess } from "@/lib/rate-limit";
import { readJson, textOf } from "@/lib/http";

// A real hash of a value nobody can log in with, used only to burn the same CPU
// on an unknown email as on a known one. Generated once per process.
const DUMMY_HASH = hashPassword(randomBytes(32).toString("hex"));

export async function POST(req: Request) {
  // Throttle repeated failures from one source before spending a scrypt verify on them.
  const key = "login:" + clientIp(req);
  const retry = loginRetryAfter(key);
  if (retry > 0) {
    const mins = Math.ceil(retry / 60);
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${mins} minutes.` },
      { status: 429 }
    );
  }

  const body = await readJson(req);
  const password = typeof body.password === "string" ? body.password : "";
  const mail = textOf(body.email, 200).toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: mail } });
  // Spend the same scrypt time whether or not the account exists. Without this,
  // an unknown email returns in a millisecond and a known one takes ~50-100ms,
  // so the response time answers "is this person registered here?" even though
  // the message is deliberately generic.
  if (!user) verifyPassword(password, DUMMY_HASH);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    recordLoginFail(key);
    return NextResponse.json({ error: "That email or password is not right." }, { status: 401 });
  }

  recordLoginSuccess(key);
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(user.id, user.sessionVersion), SESSION_COOKIE_OPTIONS);
  return NextResponse.json({ ok: true });
}
