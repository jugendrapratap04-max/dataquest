import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
  derivePhase,
  presenceOf,
  focusPct,
  isAllowedMessage,
  MESSAGES_PER_CYCLE,
} from "@/lib/focus";

// The room's whole realtime story, over plain polling.
//
// Clients GET this every couple of seconds. There's no socket server because
// there's nothing here that needs sub-second sync: the timer is derived from
// the wall clock (so it's identical on every client without being pushed), and
// presence, the queue and the message list are all small reads. This runs on
// Vercel's serverless runtime as-is, and costs nothing.

const MAX_BEAT_CREDIT_SECONDS = 25;

async function loadRoom(code: string) {
  return prisma.room.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      host: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

/** Fast-forward the stored phase if the wall clock has moved past it. Called on
 *  every poll, so the first person to look after a phase ends is the one who
 *  advances it — no scheduler required. */
async function syncPhase(room: { id: string; phase: string; phaseStartedAt: Date; focusMinutes: number; breakMinutes: number; cycle: number }) {
  const st = derivePhase(room);
  if (st.changed) {
    await prisma.room.update({
      where: { id: room.id },
      data: {
        phase: st.phase,
        phaseStartedAt: st.phaseStartedAt,
        cycle: st.cycle,
        ...(st.phase === "ended" ? { endedAt: new Date() } : {}),
      },
    });
  }
  return st;
}

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { code } = await params;

  const room = await loadRoom(code);
  if (!room) return NextResponse.json({ error: "Room nahi mila" }, { status: 404 });

  const me = room.members.find((m) => m.userId === user.id);
  if (!me || me.status === "left") {
    return NextResponse.json({ error: "Tum is room me nahi ho", needJoin: true }, { status: 403 });
  }

  const st = await syncPhase(room);
  const now = new Date();

  const members = room.members
    .filter((m) => m.status !== "left")
    .map((m) => {
      const presence = presenceOf(m.lastSeenAt, now);
      const elapsed = Math.max(1, Math.floor((now.getTime() - m.joinedAt.getTime()) / 1000));
      return {
        userId: m.userId,
        name: m.user.name,
        isHost: m.userId === room.hostId,
        isMe: m.userId === user.id,
        status: presence,
        activeSeconds: m.activeSeconds,
        focusPct: focusPct(m.activeSeconds, elapsed),
        handRaised: m.handRaised,
        needsHelp: m.needsHelp,
      };
    })
    .filter((m) => m.status !== "left");

  // The discussion queue: everyone's queued doubts, oldest first. The text is
  // shared only once its author queues it — until then the notebook is private,
  // which is the whole reason students are willing to write "I don't get this".
  const queue = await prisma.notebookEntry.findMany({
    where: { roomId: room.id, queued: true, resolved: false },
    include: { user: { select: { name: true } } },
    orderBy: { queuedAt: "asc" },
    take: 30,
  });

  const messages = await prisma.roomMessage.findMany({
    where: { roomId: room.id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const usedThisCycle = await prisma.roomMessage.count({
    where: { roomId: room.id, userId: user.id, cycle: st.cycle, kind: "quick" },
  });

  return NextResponse.json({
    room: {
      id: room.id, // the notebook attaches by id; the code is just the public handle
      code: room.code,
      name: room.name,
      subject: room.subject,
      topic: room.topic,
      maxParticipants: room.maxParticipants,
      isPublic: room.isPublic,
      focusMinutes: room.focusMinutes,
      breakMinutes: room.breakMinutes,
      hostName: room.host.name,
      iAmHost: room.hostId === user.id,
      endedAt: room.endedAt?.toISOString() ?? null,
    },
    phase: st.phase,
    cycle: st.cycle,
    secondsLeft: st.secondsLeft,
    phaseSeconds: st.phaseSeconds,
    members,
    queue: queue.map((q) => ({ id: q.id, text: q.text, name: q.user.name, mine: q.userId === user.id })),
    messages: messages
      .reverse()
      .map((m) => ({ id: m.id, name: m.user.name, kind: m.kind, text: m.text, mine: m.userId === user.id })),
    messagesLeft: Math.max(0, MESSAGES_PER_CYCLE - usedThisCycle),
    serverNow: now.toISOString(),
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { code } = await params;
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");

  const room = await loadRoom(code);
  if (!room) return NextResponse.json({ error: "Room nahi mila" }, { status: 404 });
  const me = room.members.find((m) => m.userId === user.id);
  if (!me || me.status === "left") return NextResponse.json({ error: "Tum is room me nahi ho" }, { status: 403 });

  const now = new Date();
  const st = await syncPhase(room);

  if (action === "beat") {
    // Same rule as solo: time is credited from the server's clock, never from
    // whatever the client claims it did.
    const gap = (now.getTime() - me.lastSeenAt.getTime()) / 1000;
    const credit = body.active === false ? 0 : Math.max(0, Math.min(gap, MAX_BEAT_CREDIT_SECONDS));
    await prisma.roomMember.update({
      where: { id: me.id },
      data: { lastSeenAt: now, status: "studying", activeSeconds: { increment: Math.round(credit) } },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "hand") {
    await prisma.roomMember.update({
      where: { id: me.id },
      data: { handRaised: body.on === true, lastSeenAt: now },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "help") {
    await prisma.roomMember.update({
      where: { id: me.id },
      data: { needsHelp: body.on === true, lastSeenAt: now },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "message") {
    const kind = String(body.kind ?? "quick");
    const text = String(body.text ?? "");
    if (!isAllowedMessage(kind, text)) {
      return NextResponse.json({ error: "Ye message allowed nahi hai." }, { status: 400 });
    }
    // Focus means focus: during a focus block only emoji get through. This is
    // the rule that keeps the room from turning into a chat app with a timer.
    if (st.phase === "focus" && kind !== "emoji") {
      return NextResponse.json({ error: "Focus ke dauraan sirf emoji. Doubt notebook me likho." }, { status: 403 });
    }
    if (kind === "quick") {
      const used = await prisma.roomMessage.count({
        where: { roomId: room.id, userId: user.id, cycle: st.cycle, kind: "quick" },
      });
      if (used >= MESSAGES_PER_CYCLE) {
        return NextResponse.json({ error: "Is cycle ke messages khatam." }, { status: 429 });
      }
    }
    await prisma.roomMessage.create({
      data: { roomId: room.id, userId: user.id, kind, text, cycle: st.cycle },
    });
    await prisma.roomMember.update({
      where: { id: me.id },
      data: { lastSeenAt: now, messagesUsed: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  }

  // ---- host controls -------------------------------------------------------

  if (action === "skip") {
    if (room.hostId !== user.id) return NextResponse.json({ error: "Sirf host" }, { status: 403 });
    const next = st.phase === "focus" ? "discussion" : "focus";
    await prisma.room.update({
      where: { id: room.id },
      data: {
        phase: next,
        phaseStartedAt: now,
        cycle: next === "focus" ? st.cycle + 1 : st.cycle,
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "resolveQueue") {
    // The host runs the discussion, so the host can tick items off — but only
    // items in their own room.
    if (room.hostId !== user.id) return NextResponse.json({ error: "Sirf host" }, { status: 403 });
    const id = String(body.id ?? "");
    const updated = await prisma.notebookEntry.updateMany({
      where: { id, roomId: room.id, queued: true },
      data: { resolved: true },
    });
    if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (action === "end") {
    if (room.hostId !== user.id) return NextResponse.json({ error: "Sirf host" }, { status: 403 });
    await prisma.room.update({
      where: { id: room.id },
      data: { phase: "ended", endedAt: now },
    });
    await closeSessionsFor(room.id, now);
    return NextResponse.json({ ok: true });
  }

  if (action === "leave") {
    await prisma.roomMember.update({ where: { id: me.id }, data: { status: "left", lastSeenAt: now } });
    const summary = await closeSessionFor(room.id, user.id, now);
    return NextResponse.json({ ok: true, summary });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// A room sitting becomes a StudySession row so it shows up in Study History
// next to the solo ones. Active seconds live on RoomMember while the room is
// running (that's what the participant list renders); they're copied here once,
// at the end, so there's only ever one place doing the counting.
async function closeSessionFor(roomId: string, userId: string, now: Date) {
  const member = await prisma.roomMember.findFirst({ where: { roomId, userId } });
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!member || !room) return null;

  const open = await prisma.studySession.findFirst({
    where: { userId, roomId, endedAt: null },
  });
  const startedAt = open?.startedAt ?? member.joinedAt;
  const elapsed = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));
  const solved = await prisma.submission.count({
    where: { userId, passed: true, createdAt: { gte: startedAt, lte: now } },
  });
  const st = derivePhase(room, now);

  const data = {
    userId,
    roomId,
    topic: room.topic || room.subject,
    goal: room.name,
    focusMinutes: room.focusMinutes,
    breakMinutes: room.breakMinutes,
    startedAt,
    endedAt: now,
    lastBeatAt: now,
    elapsedSeconds: elapsed,
    activeSeconds: member.activeSeconds,
    cyclesDone: Math.max(0, st.cycle - 1),
    problemsSolved: solved,
    messagesUsed: member.messagesUsed,
  };
  const session = open
    ? await prisma.studySession.update({ where: { id: open.id }, data })
    : await prisma.studySession.create({ data });

  return {
    topic: session.topic,
    goal: session.goal,
    elapsedSeconds: elapsed,
    activeSeconds: session.activeSeconds,
    focusPct: focusPct(session.activeSeconds, elapsed),
    cyclesDone: session.cyclesDone,
    problemsSolved: solved,
    messagesUsed: session.messagesUsed,
  };
}

async function closeSessionsFor(roomId: string, now: Date) {
  const members = await prisma.roomMember.findMany({ where: { roomId, status: { not: "left" } } });
  for (const m of members) await closeSessionFor(roomId, m.userId, now);
}
