import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifySession, SESSION_COOKIE } from "./auth";

// Returns the logged-in user, or null if there's no valid session.
export async function getCurrentUser() {
  const store = await cookies();
  const uid = verifySession(store.get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  return prisma.user.findUnique({ where: { id: uid } });
}
