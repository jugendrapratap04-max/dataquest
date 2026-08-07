import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { readJson, textOf } from "@/lib/http";
import { clientIp, recordSignup, signupRetryAfter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const wait = signupRetryAfter(ip);
  if (wait > 0) {
    return NextResponse.json(
      { error: `Too many accounts created from here. Try again in ${Math.ceil(wait / 60)} minutes.` },
      { status: 429 }
    );
  }

  const body = await readJson(req);
  const name = textOf(body.name, 80);
  const email = textOf(body.email, 200);
  const password = typeof body.password === "string" ? body.password : "";
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are all required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Use a password of at least 6 characters." }, { status: 400 });
  }
  const mail = email.toLowerCase();
  recordSignup(ip);
  const existing = await prisma.user.findUnique({ where: { email: mail } });
  if (existing) {
    return NextResponse.json({ error: "That email is already registered. Sign in instead." }, { status: 409 });
  }
  // Every new account used to be stamped "Aspiring Data Analyst" — a job title
  // for one of eleven subjects, chosen before the student picked anything. The
  // neutral default is honest, and the profile editor lets them write their own.
  const user = await prisma.user.create({
    data: { name, email: mail, passwordHash: hashPassword(password), role: "Learner" },
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(user.id, user.sessionVersion), SESSION_COOKIE_OPTIONS);
  return NextResponse.json({ ok: true });
}
