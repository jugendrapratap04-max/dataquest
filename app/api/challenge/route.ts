import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { readJson, textOf } from "@/lib/http";
import { questionPool, pickQuestions, newCode } from "@/lib/challenge";

// Create a challenge: freeze a set of questions and hand back a code.
//
// Creating requires an account because a challenge belongs to somebody — the
// whole point is "I scored 8/10, beat it". Taking one and reading the scoreboard
// do not, which is deliberate: the link is the growth loop and a login wall on
// it would close the loop before it starts.

const SIZES = [5, 10, 15];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const b = await readJson(req);
  const subject = textOf(b.subject, 40);          // "" means every subject
  const size = SIZES.includes(Number(b.size)) ? Number(b.size) : 10;

  const pool = await questionPool(subject || undefined);
  if (pool.length < size) {
    // Only subjects finished to the standard carry a quiz, so a stub subject
    // has no pool at all. Say which rather than failing vaguely.
    return NextResponse.json(
      { error: `That subject only has ${pool.length} questions — not enough for a ${size}-question challenge yet.` },
      { status: 400 }
    );
  }

  const questions = pickQuestions(pool, size);
  const label = subject
    ? (await prisma.track.findUnique({ where: { slug: subject }, select: { title: true } }))?.title ?? subject
    : "Everything";
  const title = `${label.split(" — ").pop()} · ${size} questions`;

  // A collision is a lost challenge for somebody, so retry rather than trust
  // 31^6. Three attempts is far more than enough at any realistic volume.
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = newCode();
    try {
      const row = await prisma.challenge.create({
        data: { code, creatorId: user.id, title, questions: JSON.stringify(questions) },
        select: { code: true },
      });
      return NextResponse.json({ ok: true, code: row.code });
    } catch (e: unknown) {
      if ((e as { code?: string })?.code !== "P2002") throw e;   // not a unique clash
    }
  }
  return NextResponse.json({ error: "Could not allocate a code, please try again" }, { status: 500 });
}
