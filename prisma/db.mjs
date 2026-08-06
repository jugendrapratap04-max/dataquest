/* The Prisma client the command-line scripts use.
 *
 * WHY THIS IS NOT lib/prisma.ts. The app connects to Neon over TCP on port
 * 5432, and that is correct for it: /api/submit runs an interactive
 * $transaction at Serializable isolation, which Neon's HTTP driver cannot do,
 * and Vercel can reach 5432 without trouble.
 *
 * The scripts are in a different situation. They run wherever the author
 * happens to be, and a great many networks — university wifi, corporate
 * networks, several Indian ISPs — block outbound 5432 as policy. The symptom
 * is not an error you can act on: the connection times out after five seconds
 * with no reply, because the packets are dropped rather than refused. Measured
 * on a college network: port 443 to the same Neon IP opened in 91ms, port 5432
 * gave nothing in 8 seconds.
 *
 * Neon also serves SQL over HTTPS on 443, which is open essentially everywhere.
 * None of these scripts uses an interactive transaction, so the one thing the
 * HTTP driver cannot do is the one thing they do not need — which is what makes
 * this a clean split rather than a workaround.
 *
 * Set NEON_DIRECT=1 to force TCP if you are on a network where it works and
 * want the lower latency.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

export function makeClient() {
  if (process.env.NEON_DIRECT === "1") {
    return { prisma: new PrismaClient(), via: "TCP :5432" };
  }
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return { prisma: new PrismaClient({ adapter }), via: "HTTPS :443" };
}

/** One shared client, plus a line saying how it connected — worth printing,
 *  because "it worked on my machine" is usually a question about this. */
const { prisma, via } = makeClient();
export { prisma, via };
