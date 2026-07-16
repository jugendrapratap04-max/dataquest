import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { TodoList } from "@/components/TodoList";

const iconClass = (slug: string) =>
  slug === "python" ? "py" : slug === "sql" ? "sql" : slug === "pandas" ? "pd" : "st";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const tracks = await prisma.track.findMany({ orderBy: { order: "asc" } });
  const lessons = await prisma.lesson.findMany({
    include: { track: true },
    orderBy: [{ track: { order: "asc" } }, { order: "asc" }],
  });
  const done = await prisma.lessonProgress.findMany({
    where: { userId: user.id, status: "done" },
  });
  const doneIds = new Set(done.map((d) => d.lessonId));
  const solved = await prisma.submission.findMany({
    where: { userId: user.id, passed: true },
    distinct: ["problemId"],
  });

  let masteredSkills = 0, totalSkills = 0;
  for (const t of tracks) {
    const arr: [string, number][] = JSON.parse(t.skillsJson || "[]");
    totalSkills += arr.length;
    masteredSkills += arr.filter(([, d]) => d === 1).length;
  }
  const jobReady = totalSkills ? Math.round((masteredSkills / totalSkills) * 100) : 0;
  const inProgress = tracks.filter((t) => t.status === "now").length;
  const locked = Math.max(0, totalSkills - masteredSkills - inProgress);

  const nextLesson = lessons.find((l) => !doneIds.has(l.id)) ?? lessons[0];

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
              <span className="fstep done">✓ Read theory</span><span className="farrow">→</span>
              <span className="fstep now">Practice</span><span className="farrow">→</span>
              <span className="fstep">Mini quiz</span>
            </div>
            <div className="rfoot">
              {nextLesson && (
                <Link className="btn btn-primary" href={`/learn/${nextLesson.slug}`}>Resume learning →</Link>
              )}
              <Link className="btn btn-ghost" href="/practice">Practice now</Link>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="card stat"><div className="k">Day Streak</div><div className="v num">{user.streak} <small>best {user.bestStreak}</small></div>
            <svg className="spark" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" points="0,23 14,19 28,21 42,13 56,15 70,8 84,10 100,4"/></svg></div>
          <div className="card stat"><div className="k">Problems Solved</div><div className="v num">{solved.length}</div>
            <svg className="spark" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline fill="none" stroke="var(--teal)" strokeWidth="2.5" points="0,25 14,21 28,22 42,17 56,11 70,12 84,7 100,5"/></svg></div>
          <div className="card stat"><div className="k">Skills Mastered</div><div className="v num">{masteredSkills}<small style={{color:"var(--ink-faint)"}}>/{totalSkills}</small></div>
            <svg className="spark" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline fill="none" stroke="var(--good)" strokeWidth="2.5" points="0,26 14,24 28,23 42,19 56,18 70,13 84,11 100,8"/></svg></div>
          <div className="card stat"><div className="k">Total XP</div><div className="v num">{user.xp.toLocaleString()}</div>
            <svg className="spark" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" points="0,19 14,13 28,17 42,9 56,21 70,6 84,14 100,5"/></svg></div>
        </section>

        <section className="card pad">
          <div className="sec-head"><h2>Your Roadmap<span className="sub">zero to job-ready</span></h2><Link className="link" href="/roadmap">View full path →</Link></div>
          <div className="trackrow">
            {tracks.map((t) => (
              <Link key={t.id} href="/roadmap" className={`node ${t.status}`}>
                <div className={`ic ${iconClass(t.slug)}`}>{t.icon}</div>
                <div className="t">{t.title.split(" — ")[0].split(" (")[0].replace("Programming Foundations", "Python")}</div>
                <div className="m">{t.status === "done" ? "✓ done" : t.status === "now" ? "now" : "locked"}</div>
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
        <section className="card pad"><div className="sec-head"><h2>Today&apos;s Plan</h2></div><TodoList /></section>

        <section className="card pad"><div className="sec-head"><h2>Overall Progress</h2></div>
          <div className="ring-wrap">
            <div className="ring" style={{ background: `conic-gradient(var(--accent) 0turn ${jobReady/100}turn, var(--panel-2) ${jobReady/100}turn 1turn)` }}>
              <div className="inner"><div><b className="num">{jobReady}%</b><span>Job-ready</span></div></div>
            </div>
            <div className="ring-legend">
              <div className="row"><span className="dot" style={{background:"var(--good)"}}></span>Mastered <b>{masteredSkills}</b></div>
              <div className="row"><span className="dot" style={{background:"var(--accent)"}}></span>In progress <b>{inProgress}</b></div>
              <div className="row"><span className="dot" style={{background:"var(--panel-2)",border:"1px solid var(--line)"}}></span>Locked <b>{locked}</b></div>
            </div>
          </div>
        </section>

        <section className="card pad" style={{borderColor:"color-mix(in srgb,var(--accent) 40%,transparent)"}}>
          <div className="eyebrow" style={{color:"var(--accent-2)"}}>Daily Challenge</div>
          <h3 style={{fontSize:"15px",margin:"8px 0 6px"}}>Solve today&apos;s problem</h3>
          <p style={{fontSize:"12.5px",color:"var(--ink-soft)",margin:"0 0 14px"}}>+20 XP · keep your 🔥 {user.streak}-day streak alive</p>
          <Link className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} href="/practice">Solve now</Link>
        </section>
      </div>
    </div>
  );
}
