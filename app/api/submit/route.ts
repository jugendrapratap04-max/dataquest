import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getStreak } from "@/lib/progress";
import { verifySolution } from "@/lib/verify";
import { readJson, idOf } from "@/lib/http";

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
  const b = await readJson(req);
  const problemId = idOf(b.problemId);
  const code = b.code;
  const passed = b.passed;

  if (!problemId) {
    return NextResponse.json({ error: "problemId required" }, { status: 400 });
  }

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) {
    return NextResponse.json({ error: "problem not found" }, { status: 404 });
  }

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

  // Recording the submission and paying for it have to happen together.
  //
  // They used to be a read ("have they solved this before?") followed by two
  // separate writes. Fire twenty concurrent submits of one genuinely correct
  // solution and all twenty read "not solved yet", so all twenty get paid — the
  // leaderboard for the price of one right answer. Serializable is what makes
  // the read part of the write; on a conflict Postgres aborts one side (P2034)
  // and the retry then sees the winner's row.
  //
  // A submission the server couldn't confirm is still a submission — it belongs
  // in the history, it just isn't a pass. Progress reads `passed`, so writing the
  // client's claim here would hand back everything the check just stopped.
  const settle = async () =>
    prisma.$transaction(
      async (tx) => {
        const alreadySolved = await tx.submission.findFirst({
          where: { userId: user.id, problemId, passed: true },
          select: { id: true },
        });
        await tx.submission.create({
          data: { userId: user.id, problemId, code: submittedCode, passed: verified },
        });
        if (!verified || alreadySolved) return { xp: 0, seconds: null as number | null };

        // Stop the clock, once. ProblemAttempt.startedAt was stamped the first
        // time the editor autosaved, so this is genuinely "from when you opened
        // it to when you solved it" — and it is written only on the first pass,
        // because re-solving a problem you already know is not a faster time.
        //
        // No attempt row means the student never typed a character we saw —
        // pasted from elsewhere, or autosave was unavailable. There is no honest
        // number to report then, so none is stored.
        const attempt = await tx.problemAttempt.findUnique({
          where: { userId_problemId: { userId: user.id, problemId } },
          select: { startedAt: true, solvedSeconds: true },
        });
        let seconds: number | null = null;
        if (attempt && attempt.solvedSeconds === null) {
          seconds = Math.max(1, Math.round((Date.now() - attempt.startedAt.getTime()) / 1000));
          await tx.problemAttempt.update({
            where: { userId_problemId: { userId: user.id, problemId } },
            data: { solvedSeconds: seconds },
          });
        } else if (attempt) {
          seconds = attempt.solvedSeconds;
        }

        await tx.user.update({
          where: { id: user.id },
          data: { xp: { increment: problem.xp } },
        });
        return { xp: problem.xp, seconds };
      },
      { isolationLevel: "Serializable" }
    );

  let settled: { xp: number; seconds: number | null } = { xp: 0, seconds: null };
  try {
    settled = await settle();
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2034") {
      settled = await settle();
    } else {
      throw e;
    }
  }
  const awardedXp = settled.xp;

  const updated = await prisma.user.findUnique({ where: { id: user.id } });
  const { streak } = await getStreak(user.id);

  return NextResponse.json({
    ok: true,
    awardedXp,
    firstSolve: awardedXp > 0,
    // How long this took, from opening the problem to solving it. Null when we
    // have no honest start time — see the note in the transaction.
    solvedSeconds: settled.seconds,
    xp: updated?.xp ?? user.xp,
    streak,
    // Set only when the client said "passed" and the server disagreed. The UI can
    // surface it; a silent no-XP would just look broken.
    ...(verifyNote ? { verifyNote } : {}),
  });
}
