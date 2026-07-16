import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Record a submission. On the first passing submission for a problem, award XP.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { problemId, code, passed } = await req.json();

  if (!problemId) {
    return NextResponse.json({ error: "problemId required" }, { status: 400 });
  }

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) {
    return NextResponse.json({ error: "problem not found" }, { status: 404 });
  }

  const alreadySolved = await prisma.submission.findFirst({
    where: { userId: user.id, problemId, passed: true },
  });

  await prisma.submission.create({
    data: { userId: user.id, problemId, code: code ?? "", passed: !!passed },
  });

  let awardedXp = 0;
  if (passed && !alreadySolved) {
    awardedXp = problem.xp;
    await prisma.user.update({
      where: { id: user.id },
      data: { xp: { increment: problem.xp } },
    });
  }

  const updated = await prisma.user.findUnique({ where: { id: user.id } });
  return NextResponse.json({
    ok: true,
    awardedXp,
    firstSolve: passed && !alreadySolved,
    xp: updated?.xp ?? user.xp,
    streak: updated?.streak ?? user.streak,
  });
}
