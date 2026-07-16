import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Mark a lesson as in_progress / done for the current user.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { lessonId, status } = await req.json();

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }

  const record = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { status: status ?? "done" },
    create: { userId: user.id, lessonId, status: status ?? "done" },
  });

  return NextResponse.json({ ok: true, status: record.status });
}
