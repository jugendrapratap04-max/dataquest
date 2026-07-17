import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { clientIp, loginRetryAfter, recordLoginFail, recordLoginSuccess } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Throttle repeated failures from one source before spending a scrypt verify on them.
  const key = "login:" + clientIp(req);
  const retry = loginRetryAfter(key);
  if (retry > 0) {
    const mins = Math.ceil(retry / 60);
    return NextResponse.json(
      { error: `Bahut zyada galat koshish. ${mins} minute baad dobara try karo.` },
      { status: 429 }
    );
  }

  const { email, password } = await req.json();
  const mail = (email ?? "").trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: mail } });
  if (!user || !verifyPassword(password ?? "", user.passwordHash)) {
    recordLoginFail(key);
    return NextResponse.json({ error: "Email ya password galat hai." }, { status: 401 });
  }

  recordLoginSuccess(key);
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(user.id), SESSION_COOKIE_OPTIONS);
  return NextResponse.json({ ok: true });
}
