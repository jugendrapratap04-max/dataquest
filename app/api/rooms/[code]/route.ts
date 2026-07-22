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
      host: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

// Voice is closed while it is still being tested: it only works in rooms opened
// by the ADMIN_EMAIL account, so a room code that leaks cannot be turned into a
// free voice channel by strangers. Same shape as the feedback gate — no default,
// so an unset ADMIN_EMAIL means voice is off for everybody rather than open to
// everybody. Remove this once voice is ready to be public.
function voiceAllowedIn(room: { host: { email: string } }) {
  const admin = process.env.ADMIN_EMAIL;
  return !!admin && room.host.email === admin;
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
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const me = room.members.find((m) => m.userId === user.id);
  if (!me || me.status === "left") {
    return NextResponse.json({ error: "You are not in this room", needJoin: true }, { status: 403 });
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
        inVoice: m.inVoice,
        micMuted: m.micMuted,
      };
    })
    .filter((m) => m.status !== "left");

  // Collect the WebRTC messages addressed to me and delete them in the same
  // breath — they are single-use, and a replayed offer would rebuild a
  // connection the browser has already torn down. Read-then-delete is safe
  // because only this user ever reads this user's rows.
  const inbox = await prisma.roomSignal.findMany({
    where: { roomId: room.id, toId: user.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  if (inbox.length) {
    await prisma.roomSignal.deleteMany({ where: { id: { in: inbox.map((s) => s.id) } } });
  }

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
      // Both have to be true: the host's switch, and the test-phase gate.
      voiceEnabled: room.voiceEnabled && voiceAllowedIn(room),
      // So the panel can say which of the two is the reason, instead of blaming
      // the host for a lock the host cannot lift.
      voiceLocked: !voiceAllowedIn(room),
      endedAt: room.endedAt?.toISOString() ?? null,
    },
    signals: inbox.map((s) => ({ from: s.fromId, kind: s.kind, payload: s.payload })),
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
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  const me = room.members.find((m) => m.userId === user.id);
  if (!me || me.status === "left") return NextResponse.json({ error: "You are not in this room" }, { status: 403 });

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
      return NextResponse.json({ error: "That message is not allowed." }, { status: 400 });
    }
    // Focus means focus: during a focus block only emoji get through. This is
    // the rule that keeps the room from turning into a chat app with a timer.
    if (st.phase === "focus" && kind !== "emoji") {
      return NextResponse.json({ error: "Emoji only during focus — write doubts in your notebook." }, { status: 403 });
    }
    if (kind === "quick") {
      const used = await prisma.roomMessage.count({
        where: { roomId: room.id, userId: user.id, cycle: st.cycle, kind: "quick" },
      });
      if (used >= MESSAGES_PER_CYCLE) {
        return NextResponse.json({ error: "No messages left this cycle." }, { status: 429 });
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

  // ---- voice call ----------------------------------------------------------
  // Signalling only. No audio ever touches the server: once two browsers have
  // swapped an offer and an answer through here, the sound goes peer to peer.
  // That is what makes voice cost nothing to run.

  if (action === "voice") {
    const on = body.on === true;
    // The host's switch is enforced here, not just hidden in the UI — with it
    // off, nobody can obtain the offers needed to build a connection.
    if (on && !voiceAllowedIn(room)) return NextResponse.json({ error: "Voice is still in testing and is limited to invited sessions" }, { status: 403 });
    if (on && !room.voiceEnabled) return NextResponse.json({ error: "Voice is off in this room" }, { status: 403 });
    await prisma.roomMember.update({
      where: { id: me.id },
      data: { inVoice: on, micMuted: on ? me.micMuted : false, lastSeenAt: now },
    });
    if (!on) {
      // Drop anything queued for or from this member; a stale offer would try
      // to reconnect someone who has just hung up.
      await prisma.roomSignal.deleteMany({
        where: { roomId: room.id, OR: [{ toId: user.id }, { fromId: user.id }] },
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "mic") {
    await prisma.roomMember.update({
      where: { id: me.id },
      data: { micMuted: body.muted === true, lastSeenAt: now },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "signal") {
    // Enforced here, not just in the UI: without an offer no connection can be
    // built, so blocking the relay is what actually closes voice off.
    if (!voiceAllowedIn(room)) return NextResponse.json({ error: "Voice is still in testing and is limited to invited sessions" }, { status: 403 });
    if (!room.voiceEnabled) return NextResponse.json({ error: "Voice is off in this room" }, { status: 403 });
    const to = String(body.to ?? "");
    const kind = String(body.kind ?? "");
    const payload = String(body.payload ?? "");
    if (!["offer", "answer", "bye"].includes(kind)) return NextResponse.json({ error: "Bad kind" }, { status: 400 });
    // An SDP with candidates embedded is a few KB; anything much larger is not
    // one of ours.
    if (payload.length > 64_000) return NextResponse.json({ error: "Payload too large" }, { status: 400 });
    // You can only signal someone who is actually in this room — otherwise the
    // endpoint would be a way to push data at any user id you can guess.
    const peer = room.members.find((m) => m.userId === to && m.status !== "left");
    if (!peer) return NextResponse.json({ error: "Peer not in room" }, { status: 404 });

    await prisma.roomSignal.create({
      data: { roomId: room.id, fromId: user.id, toId: to, kind, payload },
    });
    return NextResponse.json({ ok: true });
  }

  // ---- host controls -------------------------------------------------------

  if (action === "roomVoice") {
    if (room.hostId !== user.id) return NextResponse.json({ error: "Host only" }, { status: 403 });
    const on = body.on === true;
    await prisma.room.update({ where: { id: room.id }, data: { voiceEnabled: on } });
    if (!on) {
      // Turning it off has to actually clear the call, not just grey the button.
      await prisma.roomMember.updateMany({ where: { roomId: room.id }, data: { inVoice: false, micMuted: false } });
      await prisma.roomSignal.deleteMany({ where: { roomId: room.id } });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "skip") {
    if (room.hostId !== user.id) return NextResponse.json({ error: "Host only" }, { status: 403 });
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
    if (room.hostId !== user.id) return NextResponse.json({ error: "Host only" }, { status: 403 });
    const id = String(body.id ?? "");
    const updated = await prisma.notebookEntry.updateMany({
      where: { id, roomId: room.id, queued: true },
      data: { resolved: true },
    });
    if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (action === "end") {
    if (room.hostId !== user.id) return NextResponse.json({ error: "Host only" }, { status: 403 });
    await prisma.room.update({
      where: { id: room.id },
      data: { phase: "ended", endedAt: now },
    });
    await closeSessionsFor(room.id, now);
    return NextResponse.json({ ok: true });
  }

  if (action === "leave") {
    await prisma.roomMember.update({ where: { id: me.id }, data: { status: "left", inVoice: false, micMuted: false, lastSeenAt: now } });
    await prisma.roomSignal.deleteMany({ where: { roomId: room.id, OR: [{ toId: user.id }, { fromId: user.id }] } });
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
