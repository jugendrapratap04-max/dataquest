import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const mail = (email ?? "").trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: mail } });
  if (!user || !verifyPassword(password ?? "", user.passwordHash)) {
    return NextResponse.json({ error: "Email ya password galat hai." }, { status: 401 });
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(user.id), { httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return NextResponse.json({ ok: true });
}
