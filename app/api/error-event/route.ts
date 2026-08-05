import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { readJson, idOf, textOf } from "@/lib/http";
import { RULE_IDS } from "@/lib/error-help";

// Record that a student hit an error we could explain.
//
// lib/error-help.ts already does the hard part — it turns a raw traceback into
// one of 31 named beginner mistakes. That classification happened in the browser,
// was shown to the student, and was then thrown away. This keeps it, so
// "you have hit indentation errors twelve times this week" becomes answerable.
//
// What is NOT stored is the traceback. It contains the student's own variable
// names and values, it is unbounded in length, and this route is reachable by
// anyone with an account. The rule id carries everything a teaching feature
// needs and none of what it does not.

/** Rule ids come from a fixed set, so an unknown one is either a stale client or
 *  someone typing into curl. Rejected rather than stored: a text column that any
 *  logged-in user can write arbitrary values into stops being a statistic and
 *  becomes a cleanup job. */
function known(v: unknown): string {
  const s = typeof v === "string" ? v : "";
  return RULE_IDS.has(s) ? s : "";
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  // Guests can run code and see the explanation; there is just nowhere to file
  // the event. Quiet 200, same as /api/quiz and /api/attempt.
  if (!user) return NextResponse.json({ ok: false, reason: "guest" }, { status: 200 });

  const b = await readJson(req);
  const rule = known(b.rule);
  if (!rule) return NextResponse.json({ error: "unknown rule" }, { status: 400 });

  const dialect = b.dialect === "sql" ? "sql" : "python";
  const lessonSlug = textOf(b.lessonSlug, 80) || null;

  // Optional, and verified when present: an id that matches no row is a foreign
  // key violation and therefore a 500. A runnable example inside a lesson has no
  // problem at all, so a missing one is normal and not an error.
  let problemId = idOf(b.problemId) || null;
  if (problemId) {
    const hit = await prisma.problem.findUnique({ where: { id: problemId }, select: { id: true } });
    if (!hit) problemId = null;
  }

  await prisma.errorEvent.create({
    data: { userId: user.id, rule, dialect, problemId, lessonSlug },
  });

  return NextResponse.json({ ok: true });
}
