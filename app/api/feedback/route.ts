import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const CATEGORIES = new Set(["bug", "idea", "other"]);

// Only this account may read/triage feedback. No default on purpose: if
// ADMIN_EMAIL isn't set, nobody is admin — better than silently trusting the
// shared demo login, whose password testers may know.
function isAdmin(email: string) {
  const admin = process.env.ADMIN_EMAIL;
  return !!admin && email === admin;
}

// A tester files feedback. Logged-in only, so we know who to follow up with.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { category, message, path } = await req.json();
  const msg = typeof message === "string" ? message.trim() : "";
  if (msg.length < 3) {
    return NextResponse.json({ error: "Add a little detail — what happened, or what you would like." }, { status: 400 });
  }
  if (msg.length > 2000) {
    return NextResponse.json({ error: "That is too long (2000 characters max)." }, { status: 400 });
  }

  await prisma.feedback.create({
    data: {
      userId: user.id,
      category: CATEGORIES.has(category) ? category : "other",
      message: msg,
      path: typeof path === "string" ? path.slice(0, 200) : "",
    },
  });
  return NextResponse.json({ ok: true });
}

// Admin marks an item triaged.
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  if (!isAdmin(user.email)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const { id, status } = await req.json();
  if (!id || (status !== "new" && status !== "seen")) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }
  await prisma.feedback.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
