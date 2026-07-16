import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const barColor = (i: number) => ["var(--good)", "var(--teal)", "var(--accent)", "var(--indigo)", "var(--ink-faint)"][i % 5];

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const tracks = await prisma.track.findMany({ orderBy: { order: "asc" } });

  const skillRows = tracks.map((t) => {
    const arr: [string, number][] = JSON.parse(t.skillsJson || "[]");
    const pct = arr.length ? Math.round((arr.filter(([, d]) => d === 1).length / arr.length) * 100) : 0;
    return { name: t.title.split(" — ")[0].replace("Programming Foundations", "Python"), pct };
  });

  let mastered = 0, total = 0;
  for (const t of tracks) {
    const arr: [string, number][] = JSON.parse(t.skillsJson || "[]");
    total += arr.length; mastered += arr.filter(([, d]) => d === 1).length;
  }
  const jobReady = total ? Math.round((mastered / total) * 100) : 0;

  // deterministic activity heatmap (28 days)
  const cells = Array.from({ length: 28 }, (_, i) => ["", "l1", "l2", "l3"][(i * 7 + 3) % 4]);

  return (
    <>
      <p className="page-intro">Apni growth track karo — kahan mazboot ho, kahan mehnat chahiye.</p>

      <div className="ov" style={{ marginBottom: 20 }}>
        <div className="card ovc"><div className="k">Total XP</div><div className="v">{user.xp.toLocaleString()}</div></div>
        <div className="card ovc"><div className="k">Day Streak</div><div className="v">{user.streak} 🔥</div></div>
        <div className="card ovc"><div className="k">Best Streak</div><div className="v">{user.bestStreak}</div></div>
        <div className="card ovc"><div className="k">Job-Ready</div><div className="v">{jobReady}%</div></div>
      </div>

      <div className="card pad" style={{ marginBottom: 20 }}>
        <div className="sec-head"><h2>Skill Mastery</h2></div>
        <div className="prog-bars">
          {skillRows.map((s, i) => (
            <div className="pb-row" key={s.name}>
              <span className="nm">{s.name}</span>
              <div className="pbar"><i style={{ width: `${s.pct}%`, background: barColor(i) }} /></div>
              <span className="v">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card pad">
        <div className="sec-head"><h2>Activity — Last 4 Weeks</h2></div>
        <div className="bigcal">
          {cells.map((c, i) => <div key={i} className={`d ${c}`} />)}
        </div>
      </div>
    </>
  );
}
