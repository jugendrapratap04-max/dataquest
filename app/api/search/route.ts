import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Lightweight search index: all lessons + problems.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ lessons: [], problems: [] }, { status: 401 });

  const lessons = await prisma.lesson.findMany({
    select: { title: true, slug: true, track: { select: { title: true } } },
    orderBy: [{ track: { order: "asc" } }, { order: "asc" }],
  });
  const problems = await prisma.problem.findMany({
    select: { title: true, slug: true, difficulty: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({
    lessons: lessons.map((l) => ({ title: l.title, slug: l.slug, sub: l.track.title.split(" — ")[0] })),
    problems: problems.map((p) => ({ title: p.title, slug: p.slug, sub: p.difficulty })),
  });
}
