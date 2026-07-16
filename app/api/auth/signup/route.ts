import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Naam, email aur password — sab bharo." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password kam se kam 6 characters ka rakho." }, { status: 400 });
  }
  const mail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: mail } });
  if (existing) {
    return NextResponse.json({ error: "Ye email pehle se registered hai. Login karo." }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: { name: name.trim(), email: mail, passwordHash: hashPassword(password), role: "Aspiring Data Analyst" },
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(user.id), { httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return NextResponse.json({ ok: true });
}
