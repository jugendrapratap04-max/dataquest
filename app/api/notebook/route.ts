import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// The private notebook: doubts you write down mid-focus so you don't have to
// interrupt anyone (or yourself) to ask. In a room, an entry can be pushed to
// the discussion queue when the break starts — that's the `queued` flag, and the
// queue is just a filtered read of this table.

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const roomId = searchParams.get("roomId");

  const entries = await prisma.notebookEntry.findMany({
    where: {
      userId: user.id,
      ...(sessionId ? { sessionId } : {}),
      ...(roomId ? { roomId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const text = String(body.text ?? "").trim().slice(0, 500);
  if (!text) return NextResponse.json({ error: "Doubt likho pehle." }, { status: 400 });

  // Only attach to a session/room the user is actually in — otherwise anyone
  // could seed doubts into a stranger's queue.
  let sessionId: string | null = null;
  if (body.sessionId) {
    const s = await prisma.studySession.findFirst({
      where: { id: String(body.sessionId), userId: user.id },
      select: { id: true },
    });
    sessionId = s?.id ?? null;
  }
  let roomId: string | null = null;
  if (body.roomId) {
    const m = await prisma.roomMember.findFirst({
      where: { roomId: String(body.roomId), userId: user.id, status: { not: "left" } },
      select: { roomId: true },
    });
    roomId = m?.roomId ?? null;
  }

  const entry = await prisma.notebookEntry.create({
    data: { userId: user.id, text, sessionId, roomId },
  });
  return NextResponse.json({ ok: true, entry });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");

  const mine = await prisma.notebookEntry.findFirst({ where: { id, userId: user.id } });
  if (!mine) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: { resolved?: boolean; queued?: boolean; queuedAt?: Date | null } = {};
  if (typeof body.resolved === "boolean") data.resolved = body.resolved;
  if (typeof body.queued === "boolean") {
    if (body.queued && !mine.roomId) {
      return NextResponse.json({ error: "Ye doubt kisi room se juda nahi hai." }, { status: 400 });
    }
    data.queued = body.queued;
    data.queuedAt = body.queued ? new Date() : null; // queue order
  }

  const entry = await prisma.notebookEntry.update({ where: { id }, data });
  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await req.json().catch(() => ({ id: "" }));
  await prisma.notebookEntry.deleteMany({ where: { id: String(id ?? ""), userId: user.id } });
  return NextResponse.json({ ok: true });
}
