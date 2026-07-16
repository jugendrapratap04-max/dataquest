import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { derivePhase, focusPct, isComplete, clampMinutes } from "@/lib/focus";

// A heartbeat lands every ~15s while the tab is visible. Credit at most this
// much per beat: a gap longer than the interval means the student wasn't there,
// and we must not pay them for it.
const MAX_BEAT_CREDIT_SECONDS = 25;

// Problems solved *during* this sitting, read from real submissions rather than
// taken from the client. The number on the summary card is then the same number
// the rest of the platform would give.
async function solvedDuring(userId: string, from: Date, to: Date) {
  return prisma.submission.count({
    where: { userId, passed: true, createdAt: { gte: from, lte: to } },
  });
}

async function liveState(sessionId: string, userId: string) {
  const s = await prisma.studySession.findFirst({ where: { id: sessionId, userId } });
  if (!s) return null;
  const now = new Date();
  const phase = derivePhase(
    {
      phase: s.endedAt ? "ended" : "focus",
      phaseStartedAt: s.startedAt,
      focusMinutes: s.focusMinutes,
      breakMinutes: s.breakMinutes,
      cycle: 1,
    },
    now
  );
  const elapsed = Math.floor(((s.endedAt ?? now).getTime() - s.startedAt.getTime()) / 1000);
  return {
    id: s.id,
    topic: s.topic,
    goal: s.goal,
    focusMinutes: s.focusMinutes,
    breakMinutes: s.breakMinutes,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt?.toISOString() ?? null,
    phase: phase.phase,
    cycle: phase.cycle,
    secondsLeft: phase.secondsLeft,
    phaseSeconds: phase.phaseSeconds,
    elapsedSeconds: elapsed,
    activeSeconds: s.activeSeconds,
    focusPct: focusPct(s.activeSeconds, elapsed),
    problemsSolved: s.problemsSolved,
  };
}

// The session still running, if any.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const open = await prisma.studySession.findFirst({
    where: { userId: user.id, endedAt: null, roomId: null },
    orderBy: { startedAt: "desc" },
  });
  if (!open) return NextResponse.json({ session: null });
  return NextResponse.json({ session: await liveState(open.id, user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");
  const now = new Date();

  if (action === "start") {
    // One solo session at a time — close any orphan first (a tab that was closed
    // without ending cleanly), so history never shows two overlapping sittings.
    const orphans = await prisma.studySession.findMany({
      where: { userId: user.id, endedAt: null, roomId: null },
    });
    for (const o of orphans) {
      const elapsed = Math.floor((now.getTime() - o.startedAt.getTime()) / 1000);
      await prisma.studySession.update({
        where: { id: o.id },
        data: { endedAt: now, elapsedSeconds: elapsed },
      });
    }

    const focusMinutes = clampMinutes(body.focusMinutes, 30, 5, 120);
    const breakMinutes = clampMinutes(body.breakMinutes, 5, 1, 30);
    const s = await prisma.studySession.create({
      data: {
        userId: user.id,
        topic: String(body.topic ?? "").trim().slice(0, 80) || "General",
        goal: String(body.goal ?? "").trim().slice(0, 200),
        focusMinutes,
        breakMinutes,
        startedAt: now,
        lastBeatAt: now,
      },
    });
    return NextResponse.json({ ok: true, session: await liveState(s.id, user.id) });
  }

  if (action === "beat") {
    const s = await prisma.studySession.findFirst({
      where: { id: String(body.id ?? ""), userId: user.id, endedAt: null },
    });
    if (!s) return NextResponse.json({ error: "No active session" }, { status: 404 });

    // Accrue from the server's own clock, capped. `active` is the only thing the
    // client gets a say in, and the worst it can do is lie about being present
    // for the length of one beat.
    const gap = (now.getTime() - s.lastBeatAt.getTime()) / 1000;
    const credit = body.active === false ? 0 : Math.max(0, Math.min(gap, MAX_BEAT_CREDIT_SECONDS));

    const phase = derivePhase(
      { phase: "focus", phaseStartedAt: s.startedAt, focusMinutes: s.focusMinutes, breakMinutes: s.breakMinutes, cycle: 1 },
      now
    );
    const solved = await solvedDuring(user.id, s.startedAt, now);

    await prisma.studySession.update({
      where: { id: s.id },
      data: {
        lastBeatAt: now,
        activeSeconds: { increment: Math.round(credit) },
        cyclesDone: Math.max(0, phase.cycle - 1) + (phase.phase === "discussion" ? 1 : 0),
        problemsSolved: solved,
      },
    });
    return NextResponse.json({ ok: true, session: await liveState(s.id, user.id) });
  }

  if (action === "end") {
    const s = await prisma.studySession.findFirst({
      where: { id: String(body.id ?? ""), userId: user.id, endedAt: null },
    });
    if (!s) return NextResponse.json({ error: "No active session" }, { status: 404 });

    const elapsed = Math.floor((now.getTime() - s.startedAt.getTime()) / 1000);
    const solved = await solvedDuring(user.id, s.startedAt, now);
    const done = await prisma.studySession.update({
      where: { id: s.id },
      data: { endedAt: now, elapsedSeconds: elapsed, problemsSolved: solved },
    });
    const noteCount = await prisma.notebookEntry.count({ where: { sessionId: s.id } });

    return NextResponse.json({
      ok: true,
      summary: {
        topic: done.topic,
        goal: done.goal,
        elapsedSeconds: elapsed,
        activeSeconds: done.activeSeconds,
        focusPct: focusPct(done.activeSeconds, elapsed),
        cyclesDone: done.cyclesDone,
        problemsSolved: solved,
        doubtsWritten: noteCount,
        completed: isComplete(done.cyclesDone, done.activeSeconds, done.focusMinutes),
      },
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
