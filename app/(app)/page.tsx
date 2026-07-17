import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getProgress, getStreak, shortTitle } from "@/lib/progress";
import { TodoList } from "@/components/TodoList";

const iconClass = (slug: string) =>
  slug === "python" ? "py" : slug === "sql" ? "sql" : slug === "pandas" ? "pd" : "st";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const p = await getProgress(user.id);
  const { streak, bestStreak } = await getStreak(user.id);
  const lessons = await prisma.lesson.findMany({
    include: { track: true, problems: { select: { id: true } } },
    orderBy: [{ track: { order: "asc" } }, { order: "asc" }],
  });

  const nextLesson = lessons.find((l) => !p.doneLessonIds.has(l.id)) ?? lessons[0];
  const theoryDone = nextLesson ? p.doneLessonIds.has(nextLesson.id) : false;
  const practiceDone =
    !!nextLesson &&
    nextLesson.problems.length > 0 &&
    nextLesson.problems.every((q) => p.solvedProblemIds.has(q.id));

  return (
    <div className="grid">
      {/* left */}
      <div className="col">
        <section className="card resume">
          <div className="pad">
            <div className="eyebrow">Continue where you left off</div>
            <h2>{nextLesson ? nextLesson.title : "Start your journey"}</h2>
            <div className="sub">
              {nextLesson ? `${nextLesson.track.title} · Lesson ${nextLesson.order}` : "Python se shuru karo"}
            </div>
            <div className="flow">
              <span className={`fstep ${theoryDone ? "done" : "now"}`}>
                {theoryDone ? "✓ " : ""}Read theory
              </span>
              <span className="farrow">→</span>
              <span className={`fstep ${practiceDone ? "done" : theoryDone ? "now" : ""}`}>
                {practiceDone ? "✓ " : ""}Practice
              </span>
            </div>
            <div className="rfoot">
              {nextLesson && (
                <Link className="btn btn-primary" href={`/learn/${nextLesson.slug}`}>Resume learning →</Link>
              )}
              <Link className="btn btn-ghost" href="/practice">Practice now</Link>
            </div>
          </div>
        </section>

        {/* No sparklines: we don't store XP/streak history, so the old ones were fixed
            decorative polylines that sloped upward even on a brand-new account.
            The streak next to them was the same lie until it was derived. */}
        <section className="stats">
          <div className="card stat"><div className="k">Day Streak</div>
            <div className="v num">{streak} <small>best {bestStreak}</small></div></div>
          <div className="card stat"><div className="k">Problems Solved</div>
            <div className="v num">{p.problemsDone}<small style={{color:"var(--ink-faint)"}}>/{p.totalProblems}</small></div></div>
          <div className="card stat"><div className="k">Lessons Done</div>
            <div className="v num">{p.lessonsDone}<small style={{color:"var(--ink-faint)"}}>/{p.totalLessons}</small></div></div>
          <div className="card stat"><div className="k">Total XP</div>
            <div className="v num">{user.xp.toLocaleString()}</div></div>
        </section>

        <section className="card pad">
          <div className="sec-head"><h2>Your Roadmap<span className="sub">zero to job-ready</span></h2><Link className="link" href="/roadmap">View full path →</Link></div>
          <div className="trackrow">
            {p.tracks.map((t) => (
              <Link key={t.id} href="/roadmap" className={`node ${t.status}`}>
                <div className={`ic ${iconClass(t.slug)}`}>{t.icon}</div>
                <div className="t">{t.shortTitle}</div>
                <div className="m">{t.status === "done" ? "✓ done" : `${t.pct}%`}</div>
                <span className="badge">{t.status === "done" ? "✓" : t.status === "locked" ? "🔒" : ""}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="card pad">
          <div className="sec-head"><h2>Practice Arena<span className="sub">learn, then master by doing</span></h2><Link className="link" href="/practice">All playgrounds →</Link></div>
          <div className="arena">
            <Link href="/practice" className="pcard"><div className="top"><div className="ic py"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 6-5 6 5 6M16 6l5 6-5 6"/></svg></div><h3>Python Compiler<small>real, in-browser</small></h3></div><div className="d">Code likho, run karo, output turant dekho — asli Python.</div></Link>
            <Link href="/practice" className="pcard"><div className="top"><div className="ic pd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 4v16"/></svg></div><h3>Problem Sets<small>test-case checked</small></h3></div><div className="d">Har topic ke chhote problems, auto-checker ke saath.</div></Link>
          </div>
        </section>
      </div>

      {/* right */}
      <div className="col">
        <section className="card pad"><div className="sec-head"><h2>Today&apos;s Plan</h2></div>
          <TodoList nextLesson={nextLesson ? { title: nextLesson.title, track: shortTitle(nextLesson.track.title) } : null} />
        </section>

        <section className="card pad"><div className="sec-head"><h2>Overall Progress</h2></div>
          <div className="ring-wrap">
            <div className="ring" style={{ background: `conic-gradient(var(--accent) 0turn ${p.jobReady/100}turn, var(--panel-2) ${p.jobReady/100}turn 1turn)` }}>
              <div className="inner"><div><b className="num">{p.jobReady}%</b><span>Job-ready</span></div></div>
            </div>
            {/* All three count skills, so they add up to totalSkills. The old legend
                mixed skill counts with track counts and the numbers meant nothing. */}
            <div className="ring-legend">
              <div className="row"><span className="dot" style={{background:"var(--good)"}}></span>Mastered <b>{p.masteredSkills}</b></div>
              <div className="row"><span className="dot" style={{background:"var(--accent)"}}></span>In progress <b>{p.inProgressSkills}</b></div>
              <div className="row"><span className="dot" style={{background:"var(--panel-2)",border:"1px solid var(--line)"}}></span>Locked <b>{p.lockedSkills}</b></div>
            </div>
          </div>
        </section>

        <section className="card pad" style={{borderColor:"color-mix(in srgb,var(--accent) 40%,transparent)"}}>
          <div className="eyebrow" style={{color:"var(--accent-2)"}}>Daily Challenge</div>
          <h3 style={{fontSize:"15px",margin:"8px 0 6px"}}>Solve today&apos;s problem</h3>
          {/* "Keep your 0-day streak alive" is not a thing you can say to someone. */}
          <p style={{fontSize:"12.5px",color:"var(--ink-soft)",margin:"0 0 14px"}}>
            {streak > 0 ? <>+20 XP · keep your 🔥 {streak}-day streak alive</> : <>+20 XP · aaj solve karo, streak yahin se shuru</>}
          </p>
          <Link className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} href="/practice">Solve now</Link>
        </section>
      </div>
    </div>
  );
}
