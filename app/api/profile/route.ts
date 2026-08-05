import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { AVATAR_EMOJI } from "@/lib/profile";

// The parts of a profile a student writes themselves.
//
// Your title was the first of these — it was stamped "Aspiring Data Analyst" at
// signup with no way to change it, so the sidebar showed everyone the same
// borrowed role forever. Bio, goal and avatar joined it when the profile page
// was built.
//
// Everything ELSE on a profile — level, rank, streak, achievements, timeline —
// is derived from work the student actually did and deliberately has no
// endpoint at all. There is nothing here that can award you a badge.
//
// The resume builder has always sent `{ role }` alone and expects `{ ok, role }`
// back, including the 400 on an empty title. That contract is unchanged: the
// role rules below are exactly what they were, and the new fields are only
// looked at when they are actually sent.
const MAX_BIO = 280;
const MAX_GOAL = 80;
const MAX_ROLE = 60;

/** Trim, collapse whitespace, cut to length. An emptied field is stored as NULL
 *  rather than "", so "cleared" and "never written" read the same everywhere
 *  instead of being two states that look identical and compare differently. */
function clean(v: unknown, max: number): string | null | undefined {
  if (typeof v !== "string") return undefined; // absent or wrong type — leave alone
  const s = v.replace(/\s+/g, " ").trim().slice(0, max);
  return s.length ? s : null;
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, string | null> = {};

  // Role keeps its original contract: sent but empty is an error, not a clear.
  // `role` is NOT NULL in the schema, so there is no null to fall back to.
  if (body.role !== undefined) {
    const role = String(body.role ?? "").trim().slice(0, MAX_ROLE);
    if (!role) return NextResponse.json({ error: "The title cannot be empty." }, { status: 400 });
    data.role = role;
  }

  const bio = clean(body.bio, MAX_BIO);
  if (bio !== undefined) data.bio = bio;

  const goal = clean(body.goal, MAX_GOAL);
  if (goal !== undefined) data.goal = goal;

  // Checked against the fixed list rather than length-limited. Free text here
  // would be an avatar anyone could put anything into — which is the moderation
  // problem photo upload was avoided for, arriving by the back door.
  if (body.avatarEmoji !== undefined) {
    data.avatarEmoji =
      typeof body.avatarEmoji === "string" && AVATAR_EMOJI.includes(body.avatarEmoji)
        ? body.avatarEmoji
        : null; // anything unrecognised clears it, back to initials
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const saved = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { role: true, bio: true, goal: true, avatarEmoji: true },
  });
  return NextResponse.json({ ok: true, ...saved });
}
