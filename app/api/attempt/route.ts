import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { readJson, idOf } from "@/lib/http";

// Autosave for the practice editor.
//
// The editor used to hold the student's work in React state and nowhere else,
// so closing the tab lost it and the only way to keep a solution was to finish
// in one sitting. This route is called on a debounce while they type.
//
// It is deliberately not a submission. Nothing here is graded, no XP moves, and
// the code is never re-run — it is the same idea as a draft in a text editor.
// The graded history stays in Submission, which this route does not touch.

// Monaco will happily hold a novel. A practice solution is tens of lines, so
// this is generous by two orders of magnitude and still bounds what one row can
// cost — an unbounded text column reachable by any logged-in user is a way to
// fill a database.
const MAX_CODE = 20_000;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  // A signed-out visitor can still use the editor; there is simply nowhere to
  // put the draft. Say so quietly rather than erroring — the workbench treats
  // this as "autosave unavailable", not as a failure worth interrupting anyone.
  if (!user) return NextResponse.json({ ok: false, reason: "guest" }, { status: 200 });

  const b = await readJson(req);
  const problemId = idOf(b.problemId);
  if (!problemId) return NextResponse.json({ error: "problemId required" }, { status: 400 });

  const draftCode = typeof b.code === "string" ? b.code.slice(0, MAX_CODE) : "";

  // A problemId that matches nothing is a foreign-key error and a 500, so check
  // first and answer honestly. Same guard as /api/progress.
  const problem = await prisma.problem.findUnique({ where: { id: problemId }, select: { id: true } });
  if (!problem) return NextResponse.json({ error: "problem not found" }, { status: 404 });

  // upsert, so the first keystroke on a problem also stamps startedAt. That
  // stamp is what the timer is measured from, and it must never be rewritten by
  // a later save — hence it appears only in `create`.
  const row = await prisma.problemAttempt.upsert({
    where: { userId_problemId: { userId: user.id, problemId } },
    update: { draftCode },
    create: { userId: user.id, problemId, draftCode },
    select: { startedAt: true, solvedSeconds: true },
  });

  return NextResponse.json({
    ok: true,
    startedAt: row.startedAt.toISOString(),
    solvedSeconds: row.solvedSeconds,
  });
}
