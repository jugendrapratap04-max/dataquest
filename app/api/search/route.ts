import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight search index: all lessons + problems.
//
// Public on purpose. It used to 401 for signed-out visitors while the topbar
// still rendered the search box for them — so a guest browsing the lessons (which
// are public, and are our whole try-before-signup pitch) typed a query, got
// "Nothing found", and fired two 401s per page load. Nothing here is private:
// every title and slug it returns is reachable without an account.
export async function GET() {
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
