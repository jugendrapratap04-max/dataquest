import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/auth";

// Logging out revokes the session everywhere, not just in this browser.
//
// This used to delete the cookie and stop there, which is half a logout: the
// token itself stayed valid, so a copy taken beforehand — on a shared machine,
// in a screenshot, in a synced browser profile — kept working for the full 30
// days. Incrementing the account's session version invalidates every token ever
// issued for it, immediately and on every device.
export async function POST() {
  const user = await getCurrentUser();

  // The cookie goes first, so a database hiccup still logs this browser out.
  const store = await cookies();
  store.delete(SESSION_COOKIE);

  if (user) {
    await prisma.user
      .update({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } })
      .catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
