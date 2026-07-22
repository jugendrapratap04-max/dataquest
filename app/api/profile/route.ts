import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Your title — the one bit of the profile that's yours to write.
//
// It was stamped "Aspiring Data Analyst" at signup and there was no way to
// change it, so the sidebar showed every user the same borrowed role forever
// and the resume builder ignored the stored value entirely. Now the resume's
// Title field can save back here, and the sidebar reflects it.
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const role = String(body.role ?? "").trim().slice(0, 60);
  if (!role) return NextResponse.json({ error: "The title cannot be empty." }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { role } });
  return NextResponse.json({ ok: true, role });
}
