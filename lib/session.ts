import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifySession, SESSION_COOKIE } from "./auth";

// Returns the logged-in user, or null if there's no valid session.
//
// A correct signature is not enough: a cookie can be signed properly and still
// belong to a session that has since been logged out. The account carries a
// `sessionVersion`, logout increments it, and a token minted before that stops
// matching — so every cookie issued for the account dies at once, on every
// device. Until this existed, logging out only removed the cookie from the
// browser doing the logging out, and a copy taken on a shared machine stayed
// usable for its full 30 days.
export async function getCurrentUser() {
  const store = await cookies();
  const claims = verifySession(store.get(SESSION_COOKIE)?.value);
  if (!claims) return null;

  const user = await prisma.user.findUnique({ where: { id: claims.uid } });
  if (!user) return null;
  if (user.sessionVersion !== claims.version) return null;

  return user;
}
