import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Create a note
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { topic, title, body, code } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "A title is required." }, { status: 400 });
  const note = await prisma.note.create({
    data: {
      userId: user.id,
      topic: topic?.trim() || "General",
      title: title.trim(),
      body: body?.trim() || "",
      code: code?.trim() || "",
    },
  });
  return NextResponse.json({ ok: true, id: note.id });
}

// Delete a note
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await req.json();
  await prisma.note.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
