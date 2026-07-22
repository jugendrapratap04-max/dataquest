import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

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
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  // Same guard as every other authed page. The layout already redirects, so this
  // is belt-and-braces — but leaving one page out is how the next page copied
  // from it ends up without one.
  if (!me) return null;
  const users = await prisma.user.findMany({
    orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
    take: 25,
  });
  const myRank = me ? users.findIndex((u) => u.id === me.id) + 1 : 0;

  return (
    <>
      {/* Topbar already explains the leaderboard — only add what it can't. */}
      {myRank > 0 && (
        <p className="page-intro">
          Tumhari rank abhi <b>#{myRank}</b> hai — {users.length} logon me. 🔥
        </p>
      )}
      <div className="card pad">
        <div className="sec-head"><h2>Top Learners<span className="sub">XP ke hisaab se · all-time</span></h2></div>
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
