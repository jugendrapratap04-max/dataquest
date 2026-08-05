import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getProgress, getStreak, getActivity } from "@/lib/progress";
import { levelFor, getAchievements, agoOf, focusOf } from "@/lib/profile";
import { getRank, getTimeline, earnedCertificates } from "@/lib/profile-server";
import { Avatar } from "@/components/Avatar";
import { ProfileEditor } from "@/components/ProfileEditor";
import { subjectStyle } from "@/lib/subjects";

// Member-only, like /notes and /focus. Everything on this page is one person's
// own — their bio, their history, their badges — so there is genuinely nothing
// here to show a stranger. Pages whose content is the same for everybody
// (dashboard, leaderboard, certificates) stay open with honest zeros instead;
// this one is the other category.
export const metadata = { title: "Your Profile" };

// Submission count -> heatmap intensity, the same scale /progress uses so a
// green square means the same thing on both pages.
const level = (n: number) => (n === 0 ? "" : n === 1 ? "l1" : n <= 3 ? "l2" : "l3");

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [p, streak, activity, rank, timeline] = await Promise.all([
    getProgress(user.id),
    getStreak(user.id),
    getActivity(user.id, 28),
    getRank(user.id),
    getTimeline(user.id, 12),
  ]);

  const lvl = levelFor(user.xp);
  const certificates = earnedCertificates(p.tracks);
  const achievements = getAchievements(p, streak, certificates);
  const earned = achievements.filter((a) => a.earned);
  // Only the next three to aim for. A wall of locked badges on day one measures
  // the distance to somewhere nobody has been told how to reach — the same
  // mistake as printing "0%" against a subject that has not been written.
  const next = achievements.filter((a) => !a.earned).slice(0, 3);

  const started = p.tracks.filter((t) => t.lessonsDone > 0 || t.problemsDone > 0);
  const focus = focusOf(p);
  const joined = user.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const activeDays = activity.filter((n) => n > 0).length;

  return (
    <>
      {/* ---------------------------------------------------------- header -- */}
      <section className="card pad prof-head">
        <Avatar name={user.name} emoji={user.avatarEmoji} size={84} ring />
        <div className="prof-id">
          <h2>{user.name}</h2>
          <div className="prof-role">{user.role}</div>
          <div className="prof-meta">
            <span className="prof-chip">Level {lvl.level}</span>
            {focus && <span className="prof-chip soft">{focus}</span>}
            <span className="prof-chip soft">Joined {joined}</span>
          </div>
          {user.goal && <p className="prof-goal"><span>🎯</span> {user.goal}</p>}
          {user.bio && <p className="prof-bio">{user.bio}</p>}
          {!user.bio && !user.goal && (
            <p className="prof-empty">
              Nothing written here yet. A line about what you are working towards makes this
              page yours rather than a scoreboard.
            </p>
          )}
        </div>
        <ProfileEditor
          name={user.name}
          initial={{ role: user.role, goal: user.goal, bio: user.bio, avatarEmoji: user.avatarEmoji }}
        />
      </section>

      {/* ----------------------------------------------------------- level -- */}
      <section className="card pad prof-level">
        <div className="sec-head">
          <h2>Level {lvl.level}<span className="sub">{user.xp.toLocaleString()} XP earned</span></h2>
          <span className="prof-next">{lvl.toNext.toLocaleString()} XP to level {lvl.level + 1}</span>
        </div>
        <div className="pbar"><i style={{ width: `${lvl.pct}%` }} /></div>
        <div className="prof-stats">
          <div><b className="num">{streak.streak}</b><span>day streak</span></div>
          <div><b className="num">{streak.bestStreak}</b><span>best streak</span></div>
          <div><b className="num">{p.problemsDone}</b><span>problems solved</span></div>
          <div><b className="num">{p.lessonsDone}</b><span>lessons finished</span></div>
          {/* Rank appears only when it means something — see getRank. Below ten
              ranked students it is left out entirely rather than shown as a
              flattering fraction of a tiny board. */}
          {rank && <div><b className="num">#{rank.rank}</b><span>of {rank.outOf} ranked</span></div>}
        </div>
      </section>

      <div className="prof-cols">
        <div className="col">
          {/* ------------------------------------------------------ courses -- */}
          <section className="card pad">
            <div className="sec-head">
              <h2>Courses<span className="sub">{started.length} started · {certificates} finished</span></h2>
              <Link className="link" href="/roadmap">Full path →</Link>
            </div>
            {started.length === 0 ? (
              <p className="prof-empty">
                No subject started yet. <Link className="link" href="/learn">Open the first lesson →</Link>
              </p>
            ) : (
              <div className="prof-courses">
                {started.map((t) => (
                  <div className="pc-row" key={t.id}>
                    <span className="ic tinted subject-tint" style={subjectStyle(t.slug)}>{t.icon}</span>
                    <div className="pc-body">
                      <div className="pc-t">{t.shortTitle}</div>
                      <div className="pbar sm"><i style={{ width: `${t.pct}%` }} /></div>
                    </div>
                    <span className="pc-v">{t.pct === 100 ? "✓" : `${t.pct}%`}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ------------------------------------------------- achievements -- */}
          <section className="card pad">
            <div className="sec-head">
              <h2>Achievements<span className="sub">{earned.length} of {achievements.length}</span></h2>
            </div>
            {earned.length === 0 ? (
              <p className="prof-empty">None yet — the first two are one lesson and one solved problem away.</p>
            ) : (
              <div className="prof-badges">
                {earned.map((a) => (
                  <div className="badge-card" key={a.id} title={a.how}>
                    <span className="bc-i">{a.icon}</span>
                    <span className="bc-t">{a.title}</span>
                  </div>
                ))}
              </div>
            )}
            {next.length > 0 && (
              <>
                <div className="prof-subhead">Next up</div>
                <ul className="prof-next-list">
                  {next.map((a) => (
                    <li key={a.id}><span>{a.icon}</span><b>{a.title}</b> — {a.how}</li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* -------------------------------------------------- certificates -- */}
          <section className="card pad">
            <div className="sec-head">
              <h2>Certificates<span className="sub">issued on a finished subject</span></h2>
              <Link className="link" href="/certificates">View all →</Link>
            </div>
            <p className="prof-empty" style={{ margin: 0 }}>
              {certificates > 0
                ? <><b>{certificates}</b> earned so far — collect them from the certificates page.</>
                : <>None yet. Finishing a subject issues one automatically, with your name on it.</>}
            </p>
          </section>
        </div>

        <div className="col">
          {/* ---------------------------------------------------- calendar -- */}
          <section className="card pad">
            <div className="sec-head">
              <h2>Last 4 weeks<span className="sub">{activeDays} active {activeDays === 1 ? "day" : "days"}</span></h2>
            </div>
            <div className="bigcal">
              {activity.map((n, i) => (
                <div key={i} className={`d ${level(n)}`} title={`${n} solved`} />
              ))}
            </div>
            {activeDays === 0 && (
              <p className="prof-empty" style={{ marginBottom: 0 }}>
                Solve one problem and this grid starts filling in.
              </p>
            )}
          </section>

          {/* ---------------------------------------------------- timeline -- */}
          <section className="card pad">
            <div className="sec-head"><h2>Recent activity</h2></div>
            {timeline.length === 0 ? (
              <p className="prof-empty" style={{ marginBottom: 0 }}>
                Nothing recorded yet. Finish a lesson or solve a problem and it appears here.
              </p>
            ) : (
              <ul className="prof-timeline">
                {timeline.map((e, i) => (
                  <li key={i}>
                    <span className={`tl-dot ${e.kind}`} />
                    <Link href={e.href} className="tl-t">{e.title}</Link>
                    <span className="tl-d">{e.detail}</span>
                    <span className="tl-a">{agoOf(e.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
