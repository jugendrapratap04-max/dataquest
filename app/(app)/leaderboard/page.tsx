import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { GuestBanner } from "@/components/GuestBanner";

const medals = ["🥇", "🥈", "🥉"];
const colors = ["#5B4CD6", "#0C9384", "#DB3B3B", "#E8920C", "#2C5FC0", "#1FA85A"];

// First name + last initial, so a public board doesn't expose everyone's full
// name alongside their activity. "Ananya Sharma" -> "Ananya S."
function publicName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Learner";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export default async function LeaderboardPage() {
  // Open to guests. Everything on this board is already public — a first name,
  // a last initial and an XP total, of people who chose to compete on it. There
  // was never anything here to protect, and hiding it meant a visitor could not
  // see that the platform has other students on it at all.
  const me = await getCurrentUser();
  // Only people who have actually solved something appear here.
  //
  // This board used to be `findMany(orderBy: xp desc)` with no filter, so the
  // five seeded demo accounts — 1450 to 3940 XP, and not one submission between
  // them — sat on top of it. A real student with 20 honestly-earned XP opened
  // the leaderboard and found himself ranked below five people who do not
  // exist. Same trap as the seeded streak and the seeded Track.status, both
  // already removed for exactly this reason.
  //
  // The rule is deliberately about *evidence*, not about a list of fake emails:
  // XP with no passing submission behind it does not rank. Seeded accounts
  // vanish, and a new student appears the moment they solve their first problem.
  const users = await prisma.user.findMany({
    where: { submissions: { some: { passed: true } } },
    orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
    take: 25,
    select: { id: true, name: true, xp: true },
  });
  const myRank = me ? users.findIndex((u) => u.id === me.id) + 1 : 0;

  return (
    <>
      {!me && <GuestBanner what="These are real students, and none of them are you yet" />}
      {/* Topbar already explains the leaderboard — only add what it can't. */}
      {myRank > 0 ? (
        <p className="page-intro">
          You are currently ranked <b>#{myRank}</b> out of {users.length}. 🔥
        </p>
      ) : (
        // Without this, a student who hasn't solved anything just doesn't appear
        // and is never told why — which reads as a broken page, not a rule.
        <p className="page-intro">
          Solve your first practice problem and you will appear here. Only solved
          problems count towards the board.
        </p>
      )}
      <div className="card pad">
        <div className="sec-head"><h2>Top Learners<span className="sub">by XP · all-time</span></h2></div>
        <ul className="lb">
          {users.map((u, i) => {
            const isMe = me && u.id === me.id;
            return (
              <li key={u.id} className={isMe ? "me" : ""}>
                <span className="rk">{i + 1}</span>
                <span className="medal">{medals[i] || ""}</span>
                <span className="av" style={{ background: isMe ? "linear-gradient(150deg,var(--teal),#0A6B60)" : colors[i % colors.length] }}>
                  {u.name.charAt(0).toUpperCase()}
                </span>
                <span className="nm">{isMe ? "You" : publicName(u.name)}</span>
                <span className="xp">{u.xp.toLocaleString()} XP</span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
