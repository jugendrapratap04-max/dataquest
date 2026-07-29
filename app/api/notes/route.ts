import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { readJson, idOf, textOf } from "@/lib/http";

// Create a note
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const b = await readJson(req);
  // Capped like the notebook and feedback routes already are — this one was the
  // odd endpoint out, accepting a title and body of any length at all.
  const title = textOf(b.title, 200);
  if (!title) return NextResponse.json({ error: "A title is required." }, { status: 400 });
  const note = await prisma.note.create({
    data: {
      userId: user.id,
      topic: textOf(b.topic, 60) || "General",
      title,
      body: textOf(b.body, 20000),
      code: textOf(b.code, 20000),
    },
  });
  return NextResponse.json({ ok: true, id: note.id });
}

// Delete a note
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  // idOf, not the raw value: {"id":{"not":""}} is a legal Prisma filter, and it
  // turned this single-note delete into "delete every note I own".
  const id = idOf((await readJson(req)).id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.note.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
