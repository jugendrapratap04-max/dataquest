import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getStreak } from "@/lib/progress";
import { verifySolution } from "@/lib/verify";

// Record a submission. On the first passing submission for a problem, award XP.
//
// The browser runs the tests while you iterate — that's what makes the editor
// feel instant, and it should stay that way. But it used to be the browser that
// *decided* whether you'd passed: this route took `passed` straight off the
// request body. Posting {problemId, passed:true} with no code at all returned
// "awardedXp: 20", so anyone could loop the 156 problem ids and walk away with
// every point, the top of the leaderboard and a certificate. Meanwhile the
// practice editor blocks Ctrl+V so students have to type the answer themselves.
//
// So the client's verdict is now just a hint: the server re-runs the submitted
// code against the same tests before recording a pass or moving any XP. This
// only fires on Submit, never on the Run button you press twenty times a
// minute, and a warm runtime answers in ~30ms.
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

  const submittedCode = typeof code === "string" ? code : "";

  // Every claimed pass gets re-run, including on a problem already solved. The
  // first cut skipped the check once XP was settled, on the theory that nothing
  // downstream reads it — and promptly recorded `pass` as a passing solution in
  // the student's own history. A warm re-run costs ~30ms; a stored lie costs
  // more than that.
  let verified = false;
  let verifyNote: string | undefined;
  if (passed) {
    const result = await verifySolution(problem, submittedCode);
    verified = result.passed;
    if (!result.passed) verifyNote = result.reason;
  }

  // A submission the server couldn't confirm is still a submission — it belongs
  // in the history, it just isn't a pass. Progress reads `passed`, so writing the
  // client's claim here would hand back everything the check just stopped.
  await prisma.submission.create({
    data: { userId: user.id, problemId, code: submittedCode, passed: verified },
  });

  let awardedXp = 0;
  if (verified && !alreadySolved) {
    awardedXp = problem.xp;
    await prisma.user.update({
      where: { id: user.id },
      data: { xp: { increment: problem.xp } },
    });
  }

  const updated = await prisma.user.findUnique({ where: { id: user.id } });
  const { streak } = await getStreak(user.id);

  return NextResponse.json({
    ok: true,
    awardedXp,
    firstSolve: verified && !alreadySolved,
    xp: updated?.xp ?? user.xp,
    streak,
    // Set only when the client said "passed" and the server disagreed. The UI can
    // surface it; a silent no-XP would just look broken.
    ...(verifyNote ? { verifyNote } : {}),
  });
}
