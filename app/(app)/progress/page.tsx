import { getCurrentUser } from "@/lib/session";
import { getProgress, getActivity } from "@/lib/progress";

const barColor = (i: number) => ["var(--good)", "var(--teal)", "var(--accent)", "var(--indigo)", "var(--ink-faint)"][i % 5];

// Submission count -> heatmap intensity class.
const level = (n: number) => (n === 0 ? "" : n === 1 ? "l1" : n <= 3 ? "l2" : "l3");

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const p = await getProgress(user.id);
  const activity = await getActivity(user.id, 28);
  const activeDays = activity.filter((n) => n > 0).length;
  const totalSubs = activity.reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="ov" style={{ marginBottom: 20 }}>
        <div className="card ovc"><div className="k">Total XP</div><div className="v">{user.xp.toLocaleString()}</div></div>
        <div className="card ovc"><div className="k">Day Streak</div><div className="v">{user.streak} 🔥</div></div>
        <div className="card ovc"><div className="k">Best Streak</div><div className="v">{user.bestStreak}</div></div>
        <div className="card ovc"><div className="k">Job-Ready</div><div className="v">{p.jobReady}%</div></div>
      </div>

      <div className="card pad" style={{ marginBottom: 20 }}>
        <div className="sec-head"><h2>Skill Mastery</h2></div>
        <div className="prog-bars">
          {p.tracks.map((t, i) => (
            <div className="pb-row" key={t.id}>
              <span className="nm">{t.shortTitle}</span>
              <div className="pbar"><i style={{ width: `${t.pct}%`, background: barColor(i) }} /></div>
              <span className="v">{t.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card pad">
        <div className="sec-head">
          <h2>Activity — Last 4 Weeks<span className="sub">{totalSubs} submissions · {activeDays} active din</span></h2>
        </div>
        <div className="bigcal">
          {activity.map((n, i) => (
            <div key={i} className={`d ${level(n)}`} title={`${n} submission${n === 1 ? "" : "s"}`} />
          ))}
        </div>
        {totalSubs === 0 && (
          <p style={{ fontSize: 12.5, color: "var(--ink-faint)", margin: "12px 0 0" }}>
            Abhi tak koi submission nahi — ek problem solve karo, ye grid bharna shuru ho jayega.
          </p>
        )}
      </div>
    </>
  );
}
