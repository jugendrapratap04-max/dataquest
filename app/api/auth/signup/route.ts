import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Name, email and password are all required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Use a password of at least 6 characters." }, { status: 400 });
  }
  const mail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: mail } });
  if (existing) {
    return NextResponse.json({ error: "That email is already registered. Sign in instead." }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: { name: name.trim(), email: mail, passwordHash: hashPassword(password), role: "Aspiring Data Analyst" },
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(user.id), SESSION_COOKIE_OPTIONS);
  return NextResponse.json({ ok: true });
}
