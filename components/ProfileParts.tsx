import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { subjectStyle } from "@/lib/subjects";
import { agoOf } from "@/lib/profile";
import type { Achievement, Level, TimelineEntry } from "@/lib/profile";
import type { SolvedStats, YearActivity } from "@/lib/profile-stats";

/* The read-only pieces of a profile.
 *
 * Split out of app/(app)/profile/page.tsx so /u/<username> renders exactly the
 * same profile a student sees of themselves. Two hand-kept copies would drift,
 * and the copy that drifts is the one strangers look at.
 *
 * Server components on purpose — none of this is interactive, so none of it
 * needs to reach the browser as JavaScript.
 */

/* ----------------------------------------------------------------- header -- */

export function ProfileHeader({
  name, role, avatarEmoji, bio, goal, joined, focus, level, username, isPublic, own, children,
}: {
  name: string; role: string; avatarEmoji: string | null;
  bio: string | null; goal: string | null; joined: string; focus: string | null;
  level: Level; username: string | null; isPublic: boolean;
  /** Whether the person reading is the person described. */
  own: boolean;
  /** The edit form, on your own page only. */
  children?: React.ReactNode;
}) {
  return (
    <section className="card pad prof-head">
      <Avatar name={name} emoji={avatarEmoji} size={84} ring />
      <div className="prof-id">
        <h2>{name}</h2>
        <div className="prof-role">{role}</div>
        <div className="prof-meta">
          <span className="prof-chip">Level {level.level}</span>
          {focus && <span className="prof-chip soft">{focus}</span>}
          <span className="prof-chip soft">Joined {joined}</span>
          {/* The link is shown only to its owner, and only once it works. A
              "share this" affordance on a page nobody else can open is a
              promise the app does not keep. */}
          {own && username && isPublic && (
            <Link className="prof-chip link-chip" href={`/u/${username}`}>/u/{username} ↗</Link>
          )}
        </div>
        {goal && <p className="prof-goal"><span>🎯</span> {goal}</p>}
        {bio && <p className="prof-bio">{bio}</p>}
        {own && !bio && !goal && (
          <p className="prof-empty">
            Nothing written here yet. A line about what you are working towards makes this
            page yours rather than a scoreboard.
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ solved -- */

/** The difficulty split, which is the one number every competitor shows and this
 *  profile did not. "2 problems solved" says nothing about whether they were two
 *  warm-ups or two Hards. */
export function SolvedPanel({ stats }: { stats: SolvedStats }) {
  const cls: Record<string, string> = {
    Easy: "easy", Medium: "medium", Hard: "hard", "Super Hard": "super",
  };
  return (
    <section className="card pad">
      <div className="sec-head">
        <h2>Problems solved<span className="sub">{stats.totalSolved} of {stats.totalProblems}</span></h2>
        <Link className="link" href="/practice">Practice →</Link>
      </div>
      <div className="solved-grid">
        {stats.byDifficulty.map((d) => {
          const pct = d.total ? Math.round((d.solved / d.total) * 100) : 0;
          return (
            <div className={`sv-cell ${cls[d.label] ?? "easy"}`} key={d.label}>
              <div className="sv-top">
                <span className="sv-lbl">{d.label}</span>
                <span className="sv-n"><b>{d.solved}</b>/{d.total}</span>
              </div>
              <div className="sv-bar"><i style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>
      {stats.fastest && (
        <p className="sv-foot">
          Fastest solve: <Link className="link" href={`/practice/${stats.fastest.slug}`}>{stats.fastest.title}</Link>
          {" "}in {formatSeconds(stats.fastest.seconds)}.
        </p>
      )}
    </section>
  );
}

function formatSeconds(s: number) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

/** Where the work actually went. 202 tags exist; these are the ones they have
 *  put time into, which is the closest thing this platform has to GitHub's
 *  language bar. */
export function TopicPanel({ stats }: { stats: SolvedStats }) {
  if (stats.byTopic.length === 0) return null;
  return (
    <section className="card pad">
      <div className="sec-head">
        <h2>Topics<span className="sub">{stats.topicsTouched} touched · {stats.clearedTopics} cleared</span></h2>
      </div>
      <div className="topic-list">
        {stats.byTopic.map((t) => (
          <div className="tp-row" key={t.tag}>
            <span className="tp-name">{t.tag}</span>
            {/* ⚠️ Scaled to the topic's OWN total, not to the busiest topic.
                It used to divide by `top` — the highest solved count on the
                page — so a row reading "1/13" drew a FULL bar whenever that 1
                was the best you had done anywhere. The number said one in
                thirteen and the bar said finished. A progress bar beside a
                fraction has to mean that fraction. */}
            <span className="tp-bar"><i style={{ width: `${t.total ? Math.round((t.solved / t.total) * 100) : 0}%` }} /></span>
            <span className="tp-n">{t.solved}<span className="tp-of">/{t.total}</span></span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- calendar -- */

const heat = (n: number) => (n === 0 ? "" : n === 1 ? "l1" : n <= 3 ? "l2" : "l3");

/** A year of practice. The page used to show four weeks, which for a beginner is
 *  a short strip of mostly-empty squares — it reads as "nothing here" whether or
 *  not that is true. */
export function YearHeatmap({ year, own }: { year: YearActivity; own: boolean }) {
  return (
    <section className="card pad">
      <div className="sec-head">
        <h2>
          {year.total} {year.total === 1 ? "solve" : "solves"} this year
          <span className="sub">{year.activeDays} active {year.activeDays === 1 ? "day" : "days"}</span>
        </h2>
      </div>
      <div className="cal-wrap">
        <div className="cal-months" style={{ gridTemplateColumns: `repeat(${year.weeks}, 11px)` }}>
          {year.months.map((m) => (
            <span key={`${m.label}-${m.col}`} style={{ gridColumnStart: m.col + 1 }}>{m.label}</span>
          ))}
        </div>
        <div className="yearcal">
          {year.days.map((d, i) => (
            <div
              key={i}
              className={`d ${heat(d.n)}`}
              title={`${d.n} solved on ${d.at.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
            />
          ))}
        </div>
      </div>
      <div className="cal-key">
        <span>Less</span>
        <i className="d" /><i className="d l1" /><i className="d l2" /><i className="d l3" />
        <span>More</span>
      </div>
      {year.activeDays === 0 && own && (
        <p className="prof-empty" style={{ marginBottom: 0 }}>
          Solve one problem and this grid starts filling in.{" "}
          <Link className="link" href="/practice">Open practice →</Link>
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ badges -- */

/** Earned badges, then the next few to aim for.
 *
 *  Locked ones carry a progress bar where the badge is a count, which is the
 *  difference between "you have not got this" and "you are 6 of 10 of the way
 *  there". Yes/no badges get no bar rather than a made-up one. */
export function BadgeWall({ achievements, own }: { achievements: Achievement[]; own: boolean }) {
  const earned = achievements.filter((a) => a.earned);
  // Closest first, so the list reads as the next thing to do rather than a
  // catalogue of everything not yet done.
  const next = achievements
    .filter((a) => !a.earned)
    .sort((a, b) => share(b) - share(a))
    .slice(0, own ? 4 : 0);

  return (
    <section className="card pad">
      <div className="sec-head">
        <h2>Badges<span className="sub">{earned.length} of {achievements.length}</span></h2>
      </div>
      {earned.length === 0 ? (
        <p className="prof-empty">
          {own
            ? <>None yet — the first two are one lesson and one solved problem away.{" "}
                <Link className="link" href="/learn">Open a lesson →</Link></>
            : "No badges yet."}
        </p>
      ) : (
        <div className="badge-wall">
          {earned.map((a) => (
            <div className={`bw ${a.tier}`} key={a.id} title={a.how}>
              <span className="bw-i">{a.icon}</span>
              <span className="bw-t">{a.title}</span>
              <span className="bw-g">{a.group}</span>
            </div>
          ))}
        </div>
      )}
      {next.length > 0 && (
        <>
          <div className="prof-subhead">Next up</div>
          <div className="badge-next">
            {next.map((a) => (
              <div className="bn" key={a.id}>
                <span className="bn-i">{a.icon}</span>
                <div className="bn-body">
                  <div className="bn-t">{a.title}</div>
                  <div className="bn-h">{a.how}</div>
                  {a.progress && a.progress.of > 1 && (
                    <div className="bn-bar">
                      <i style={{ width: `${Math.round((a.progress.at / a.progress.of) * 100)}%` }} />
                    </div>
                  )}
                </div>
                {a.progress && a.progress.of > 1 && (
                  <span className="bn-n">{a.progress.at}/{a.progress.of}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/** How close a locked badge is, 0..1. Yes/no badges sort last — there is no
 *  meaningful "almost" for them. */
function share(a: Achievement) {
  return a.progress && a.progress.of > 0 ? a.progress.at / a.progress.of : 0;
}

/* ----------------------------------------------------------------- courses -- */

export function CoursePanel({
  tracks, certificates, own,
}: {
  tracks: { id: string; slug: string; icon: string; shortTitle: string; pct: number; nextLesson?: string }[];
  certificates: number;
  own: boolean;
}) {
  return (
    <section className="card pad">
      <div className="sec-head">
        <h2>Courses<span className="sub">{tracks.length} started · {certificates} finished</span></h2>
        {own && <Link className="link" href="/roadmap">Full path →</Link>}
      </div>
      {tracks.length === 0 ? (
        <p className="prof-empty">
          {own
            ? <>No subject started yet. <Link className="link" href="/learn">Open the first lesson →</Link></>
            : "No subject started yet."}
        </p>
      ) : (
        <div className="prof-courses">
          {/* On your own profile these rows are the obvious thing to click to
              get back into a subject, and they were plain divs — a course, a
              progress bar, and nothing happens. Same complaint as the dashboard
              tiles: the subject is shown and cannot be opened. Somebody else's
              profile keeps them inert, because "continue where you stopped" is
              not a sentence about their progress. */}
          {tracks.map((t) => {
            const row = (
              <>
                <span className="ic tinted subject-tint" style={subjectStyle(t.slug)}>{t.icon}</span>
                <div className="pc-body">
                  <div className="pc-t">{t.shortTitle}</div>
                  <div className="pbar sm"><i style={{ width: `${t.pct}%` }} /></div>
                </div>
                <span className="pc-v">{t.pct === 100 ? "✓" : `${t.pct}%`}</span>
              </>
            );
            return own && t.nextLesson ? (
              <Link className="pc-row" key={t.id} href={`/learn/${t.nextLesson}`}>{row}</Link>
            ) : (
              <div className="pc-row" key={t.id}>{row}</div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- timeline -- */

export function TimelinePanel({ timeline, own }: { timeline: TimelineEntry[]; own: boolean }) {
  return (
    <section className="card pad">
      <div className="sec-head"><h2>Recent activity</h2></div>
      {timeline.length === 0 ? (
        <p className="prof-empty" style={{ marginBottom: 0 }}>
          {own
            ? <>Nothing recorded yet. Finish a lesson or solve a problem and it appears here.{" "}
                <Link className="link" href="/learn">Open a lesson →</Link></>
            : "Nothing recorded yet."}
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
  );
}

/* -------------------------------------------------------------------- level -- */

export function LevelPanel({
  level, xp, streak, bestStreak, solved, lessonsDone, rank,
}: {
  level: Level; xp: number; streak: number; bestStreak: number;
  solved: number; lessonsDone: number;
  rank: { rank: number; outOf: number } | null;
}) {
  return (
    <section className="card pad prof-level">
      <div className="sec-head">
        <h2>Level {level.level}<span className="sub">{xp.toLocaleString()} XP earned</span></h2>
        <span className="prof-next">{level.toNext.toLocaleString()} XP to level {level.level + 1}</span>
      </div>
      <div className="pbar"><i style={{ width: `${level.pct}%` }} /></div>
      <div className="prof-stats">
        <div><b className="num">{streak}</b><span>day streak</span></div>
        <div><b className="num">{bestStreak}</b><span>best streak</span></div>
        <div><b className="num">{solved}</b><span>problems solved</span></div>
        <div><b className="num">{lessonsDone}</b><span>lessons finished</span></div>
        {/* Rank appears only when it means something — see getRank. Below ten
            ranked students it is left out entirely rather than shown as a
            flattering fraction of a tiny board. */}
        {rank && <div><b className="num">#{rank.rank}</b><span>of {rank.outOf} ranked</span></div>}
      </div>
    </section>
  );
}
