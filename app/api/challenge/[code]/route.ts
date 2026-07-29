import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { readJson } from "@/lib/http";
import type { ChallengeQuestion } from "@/lib/challenge";

// Record one scored run of a challenge.
//
// The marking happens here, not in the browser. The client sends which options
// were picked; the server compares them against its own copy of the questions.
// Sending a score up from the page would make the whole thing a text box
// somebody can type 10/10 into — and unlike a practice problem, a challenge
// result is shown to another person, which is exactly what makes cheating it
// worth doing.

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const challenge = await prisma.challenge.findUnique({
    where: { code },
    select: { id: true, questions: true },
  });
  if (!challenge) return NextResponse.json({ error: "No such challenge" }, { status: 404 });

  const questions: ChallengeQuestion[] = JSON.parse(challenge.questions);
  const b = await readJson(req);
  const picked: unknown = b.answers;
  const answers: (number | null)[] = Array.isArray(picked)
    ? questions.map((_, i) => (typeof picked[i] === "number" ? (picked[i] as number) : null))
    : questions.map(() => null);

  const correct = questions.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0);

  // Clamp the clock. The browser reports elapsed time and a browser can report
  // anything, so a run cannot be faster than a second per question or longer
  // than an hour. It is a sanity bound, not a security control — the honest
  // limit of what a client-reported number is worth.
  const raw = typeof b.seconds === "number" && Number.isFinite(b.seconds) ? Math.round(b.seconds) : 3600;
  const seconds = Math.min(3600, Math.max(questions.length, raw));

  try {
    await prisma.challengeAttempt.create({
      data: {
        challengeId: challenge.id,
        userId: user.id,
        correct,
        total: questions.length,
        seconds,
        answersJson: JSON.stringify(answers),
      },
    });
  } catch (e: unknown) {
    // One scored attempt each. Without it the second player retries until they
    // win and the comparison stops meaning anything.
    if ((e as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "You have already taken this challenge" }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true, correct, total: questions.length, seconds });
}
