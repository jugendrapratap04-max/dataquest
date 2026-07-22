import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
  makeRoomCode,
  clampParticipants,
  clampMinutes,
  presenceOf,
  derivePhase,
} from "@/lib/focus";

// Room list + create + join. Per-room state lives in ./[code].

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const rooms = await prisma.room.findMany({
    where: {
      endedAt: null,
      OR: [{ isPublic: true }, { members: { some: { userId: user.id, status: { not: "left" } } } }],
    },
    include: {
      host: { select: { name: true } },
      members: { where: { status: { not: "left" } }, select: { userId: true, lastSeenAt: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return NextResponse.json({
    rooms: rooms.map((r) => {
      const live = r.members.filter((m) => presenceOf(m.lastSeenAt) !== "left");
      const st = derivePhase(r);
      return {
        code: r.code,
        name: r.name,
        subject: r.subject,
        topic: r.topic,
        hostName: r.host.name,
        isPublic: r.isPublic,
        maxParticipants: r.maxParticipants,
        focusMinutes: r.focusMinutes,
        breakMinutes: r.breakMinutes,
        phase: st.phase,
        cycle: st.cycle,
        secondsLeft: st.secondsLeft,
        count: live.length,
        full: live.length >= r.maxParticipants,
        joined: r.members.some((m) => m.userId === user.id),
      };
    }),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");

  if (action === "create") {
    const name = String(body.name ?? "").trim().slice(0, 60);
    if (!name) return NextResponse.json({ error: "The room needs a name." }, { status: 400 });

    // Retry on the astronomically unlikely code collision rather than trusting luck.
    let code = makeRoomCode();
    for (let i = 0; i < 5; i++) {
      const clash = await prisma.room.findUnique({ where: { code }, select: { id: true } });
      if (!clash) break;
      code = makeRoomCode();
    }

    const now = new Date();
    const room = await prisma.room.create({
      data: {
        code,
        name,
        subject: String(body.subject ?? "").trim().slice(0, 40) || "Python",
        topic: String(body.topic ?? "").trim().slice(0, 80),
        maxParticipants: clampParticipants(body.maxParticipants),
        isPublic: body.isPublic === true,
        hostId: user.id,
        focusMinutes: clampMinutes(body.focusMinutes, 30, 5, 120),
        breakMinutes: clampMinutes(body.breakMinutes, 5, 1, 30),
        phase: "focus",
        phaseStartedAt: now,
        members: { create: { userId: user.id, joinedAt: now, lastSeenAt: now } },
      },
    });
    return NextResponse.json({ ok: true, code: room.code });
  }

  if (action === "join") {
    const code = String(body.code ?? "").trim().toUpperCase();
    const room = await prisma.room.findUnique({
      where: { code },
      include: { members: true },
    });
    if (!room || room.endedAt) {
      return NextResponse.json({ error: "No such room (or it has already ended)." }, { status: 404 });
    }

    const now = new Date();
    const existing = room.members.find((m) => m.userId === user.id);
    if (existing) {
      // Rejoin: an old member coming back doesn't consume a new seat.
      await prisma.roomMember.update({
        where: { id: existing.id },
        data: { status: "studying", lastSeenAt: now },
      });
      return NextResponse.json({ ok: true, code: room.code });
    }

    // Seats are counted against people actually present — a member whose tab
    // died an hour ago shouldn't hold the room shut.
    const live = room.members.filter((m) => m.status !== "left" && presenceOf(m.lastSeenAt) !== "left");
    if (live.length >= room.maxParticipants) {
      return NextResponse.json({ error: "Room full hai." }, { status: 409 });
    }

    await prisma.roomMember.create({
      data: { roomId: room.id, userId: user.id, joinedAt: now, lastSeenAt: now },
    });
    return NextResponse.json({ ok: true, code: room.code });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
