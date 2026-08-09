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
    // Do not confirm whether the address already has an account — that is how
    // an attacker enumerates who is on the platform, and login is already
    // careful about exactly this (see the DUMMY_HASH pattern there).
    //
    // But the wording matters as much as the status. Borrowing login's "email
    // or password is not right" tells a person signing UP that a password they
    // have just invented is wrong, which is both untrue and a dead end. This
    // says nothing about whether the account exists and still leaves somewhere
    // to go.
    return NextResponse.json(
      { error: "We couldn't create an account with those details. If you already have one, sign in instead." },
      { status: 400 }
    );
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
