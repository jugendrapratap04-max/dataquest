import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getProgress, getStreak, getActivity, shortTitle } from "@/lib/progress";
import { TodoList } from "@/components/TodoList";
import { GuestBanner } from "@/components/GuestBanner";
import { Avatar } from "@/components/Avatar";
import { Illo } from "@/components/Illo";
import { Tilt } from "@/components/Tilt";
import { subjectStyle } from "@/lib/subjects";
import { levelFor, focusOf } from "@/lib/profile";
import { getRank } from "@/lib/profile-server";

// Subject tiles are coloured from lib/subjects.ts, the same hue as the lesson
// header and the roadmap card, so a subject looks like itself everywhere. The
// local accent map that used to live here is gone with it — one source, and a
// new subject needs no code change anywhere.

// A guest sees the real dashboard with every number at zero, not a redirect to
// a login form. Nothing here is anyone else's data — the roadmap, the lesson
// count and the subject tiles are the same for everybody, and a visitor who can
// see what the finished thing looks like has a reason to sign up. The reverse
// order, which is what this page did before, asks for the commitment first.
//
// getProgress and getStreak both take a userId that matches nobody, and return
// honest zeros. Same call the roadmap has always made for guests.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  const uid = user?.id ?? "__guest__";

  const p = await getProgress(uid);
  const { streak, bestStreak } = await getStreak(uid);
  // Last seven days of real activity for the streak tile's tick row — same
  // query the /progress heatmap uses, so a lit tick means the same thing
  // everywhere: you solved something that day. Index 6 is today.
  const week = await getActivity(uid, 7);
  const dayLetter = (offsetFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetFromToday);
    return "SMTWTFS"[d.getDay()];
  };
  const lessons = await prisma.lesson.findMany({
    include: { track: true, problems: { select: { id: true } } },
    orderBy: [{ track: { order: "asc" } }, { order: "asc" }],
  });

  // Identity strip inputs. A guest has none of this and does not get the strip,
  // so the rank query is skipped rather than run against "__guest__".
  const lvl = user ? levelFor(user.xp) : null;
  const focus = user ? focusOf(p) : null;
  const rank = user ? await getRank(user.id) : null;

  /* CONTINUE MEANS THE SUBJECT YOU WERE IN — not the first one in the catalogue.
   *
   * This used to be `lessons.find(l => !done.has(l.id))` over a list ordered by
   * track.order then lesson.order, so the answer was "the earliest unfinished
   * lesson anywhere". Since Python is track 1 and nobody finishes 58 lessons
   * quickly, EVERY student was told to continue with Python lesson 1 — while
   * the identity strip 40px above said their focus was HTML. Jugendra put it
   * plainly: "har user ko us jagah Python hi milti hai".
   *
   * Nothing records "last opened", so the most recent thing the student
   * FINISHED is the honest signal: a completed lesson or a solved problem,
   * whichever happened later. Two indexed lookups of one row each.
   */
  const [lastLesson, lastSolve] = user
    ? await Promise.all([
        prisma.lessonProgress.findFirst({
          where: { userId: user.id, status: "done", completedAt: { not: null } },
          orderBy: { completedAt: "desc" },
          select: { completedAt: true, lesson: { select: { trackId: true } } },
        }),
        prisma.submission.findFirst({
          where: { userId: user.id, passed: true },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true, problem: { select: { lesson: { select: { trackId: true } } } } },
        }),
      ])
    : [null, null];

  const lessonAt = lastLesson?.completedAt?.getTime() ?? 0;
  const solveAt = lastSolve?.createdAt?.getTime() ?? 0;
  const activeTrackId =
    (solveAt > lessonAt ? lastSolve?.problem?.lesson?.trackId : lastLesson?.lesson.trackId) ??
    lastLesson?.lesson.trackId ?? lastSolve?.problem?.lesson?.trackId ?? null;
  /** Has this student done anything at all? Drives the hero's wording, so a
   *  signed-in account that has never opened a lesson is not told to "continue
   *  where you left off" — it has no left off. */
  const started = lessonAt > 0 || solveAt > 0;

  const unfinished = (trackId?: string | null) =>
    lessons.find((l) => (!trackId || l.trackId === trackId) && !p.doneLessonIds.has(l.id));
  // Their subject first; if they have finished it, the next unfinished anywhere;
  // if they have finished everything, lesson one.
  const nextLesson = unfinished(activeTrackId) ?? unfinished(null) ?? lessons[0];
  const theoryDone = nextLesson ? p.doneLessonIds.has(nextLesson.id) : false;
  const practiceDone =
    !!nextLesson &&
    nextLesson.problems.length > 0 &&
    nextLesson.problems.every((q) => p.solvedProblemIds.has(q.id));

  return (
    <div className="grid">
      {/* left */}
      <div className="col">
        {!user && <GuestBanner what="This is your dashboard, once you have one" />}

        {/* Identity strip. The page was a wall of cards about a person who was
            never on it — every number here existed already, and none of them
            was attached to a face or a name. The Topbar greets you; this says
            who is being greeted, and links to the profile that holds the rest. */}
        {user && (
          <Link href="/profile" className="card pad idstrip">
            <Avatar name={user.name} emoji={user.avatarEmoji} size={52} />
            <div className="ids-id">
              <div className="ids-name">{user.name}</div>
              <div className="ids-sub">
                Level {lvl!.level}{focus ? ` · ${focus}` : ""}
              </div>
            </div>
            <div className="ids-stats">
              <span title={`${streak} day streak`}>🔥 {streak}</span>
              <span title={`${user.xp.toLocaleString()} XP`}>⭐ {user.xp.toLocaleString()}</span>
              {/* Rank is shown only once there are enough ranked students for a
                  position to mean anything — see getRank. Nothing takes its
                  place when it is absent; an empty slot is better than a
                  flattering fraction of a three-person board. */}
              {rank && <span title={`Ranked ${rank.rank} of ${rank.outOf}`}>🏆 #{rank.rank}</span>}
            </div>
            <span className="ids-go" aria-hidden="true">→</span>
          </Link>
        )}

        <section className="card resume">
          <div className="pad">
            {/* "Continue where you left off" is a lie to somebody who has never
                been here. Same card, honest label. */}
            {/* "Continue where you left off" to somebody who has never opened a
                lesson is the activation cohort being told a story about a past
                they do not have. It now follows real activity, not sign-in. */}
            <div className="eyebrow">{started ? "Continue where you left off" : "Start here"}</div>
            <h2>{nextLesson ? nextLesson.title : "Start your journey"}</h2>
            <div className="sub">
              {nextLesson ? `${nextLesson.track.title} · Lesson ${nextLesson.order}` : "Start with Python"}
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
                <Link className="btn btn-primary" href={`/learn/${nextLesson.slug}`}>
                  {started ? "Resume learning →" : "Start the first lesson →"}
                </Link>
              )}
              <Link className="btn btn-ghost" href="/practice">Practice now</Link>
            </div>
            <div className="r-illo" aria-hidden="true">
              <Tilt max={9}><Illo name="code" size={152} /></Tilt>
            </div>
          </div>
          {/* Ambient glyphs drifting behind the hero's right half — pointer-
              transparent, hidden on phones with the illustration. */}
          <div className="float-field" aria-hidden="true">
            <span className="ff-a" style={{ top: "14%", right: "218px", width: 30, height: 30, fontSize: 12, animationDelay: ".8s" }}>{"</>"}</span>
            <span className="ff-t" style={{ bottom: "16%", right: "196px", width: 26, height: 26, fontSize: 11, animationDuration: "6s" }}>py</span>
            <span className="ff-s" style={{ top: "58%", right: "34px", width: 24, height: 24, fontSize: 12, animationDelay: "1.6s", animationDuration: "4.2s" }}>⚡</span>
          </div>
        </section>

        {/* No sparklines: we don't store XP/streak history, so the old ones were fixed
            decorative polylines that sloped upward even on a brand-new account.
            The streak next to them was the same lie until it was derived. */}
        <section className="stats">
          <div className="card stat"><div className="k">Day Streak</div>
            {/* At zero the tile offers the first action instead of printing a
                zero — the invitation IS the stat until there is one. The tick
                row shows the real last seven days either way (getActivity). */}
            {streak > 0
              ? <div className="v">{streak} <small>best {bestStreak}</small></div>
              : <Link className="invite" href="/practice">Solve one problem today and your streak begins →</Link>}
            <div className="week" aria-label="Last 7 days of activity">
              {week.map((n, i) => (
                <i key={i} className={n > 0 ? "on" : ""} title={`${dayLetter(6 - i)} · ${n} solved`}>{n > 0 ? "✓" : ""}</i>
              ))}
            </div></div>
          <div className="card stat"><div className="k">Problems Solved</div>
            <div className="v num">{p.problemsDone}<small style={{color:"var(--ink-faint)"}}>/{p.totalProblems}</small></div></div>
          <div className="card stat"><div className="k">Lessons Done</div>
            <div className="v num">{p.lessonsDone}<small style={{color:"var(--ink-faint)"}}>/{p.totalLessons}</small></div></div>
          <div className="card stat"><div className="k">Total XP</div>
            <div className="v num">{(user?.xp ?? 0).toLocaleString()}</div></div>
        </section>

        <section className="card pad">
          <div className="sec-head"><h2>Your Roadmap<span className="sub">{p.tracks.length} subjects, in order</span></h2><Link className="link" href="/roadmap">View full path →</Link></div>
          <div className="trackrow">
            {/* A SUBJECT TILE OPENS THE SUBJECT.
                Every one of these linked to /roadmap, so picking a subject
                landed you on a page where you had to find and pick it again —
                two clicks and a scroll to reach what you had already chosen.
                Jugendra put it plainly: "fir se course select karna padta hai,
                kya fayda".
                A ready subject now goes straight to where you stopped. A locked
                one still goes to the roadmap, because it has no lessons to open
                and the roadmap is where it explains itself. */}
              {p.tracks.map((t) => (
              <Link
                key={t.id}
                href={t.status !== "locked" && t.nextLesson ? `/learn/${t.nextLesson}` : "/roadmap"}
                className={`node subject-tint ${t.status}`}
                style={subjectStyle(t.slug)}
              >
                {/* The tint sits on the whole tile now (--sub-h on the Link),
                    so the wash, border and progress bar all derive from the
                    subject's own hue — the icon keeps working unchanged. */}
                <div className={`ic tinted subject-tint`} style={subjectStyle(t.slug)}>{t.icon}</div>
                <div className="t">{t.shortTitle}</div>
                {/* Three states, and none of them prints a zero at the reader.
                    "0%" on a subject you have never opened is not progress you
                    failed to make — it is a subject you have not met. Eleven
                    tiles all reading 0% with eleven empty rails is also the
                    least useful thing this row could say to a new student.
                    A "coming soon" subject is one with no lessons written at
                    all (lib/progress.ts `ready`); there are none today, and the
                    branch stays so the next new subject is honest on arrival. */}
                {t.status === "done" ? (
                  <div className="m">✓ done</div>
                ) : !t.ready ? (
                  <div className="m">coming soon</div>
                ) : t.pct === 0 ? (
                  <div className="m soft">Not started</div>
                ) : (
                  <>
                    <div className="m">{t.pct}%</div>
                    <div className="bar"><i style={{ width: `${t.pct}%` }} /></div>
                  </>
                )}
                <span className="badge">{t.status === "done" ? "✓" : t.status === "locked" ? "🔒" : ""}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="card pad">
          <div className="sec-head"><h2>Practice Arena<span className="sub">learn, then master by doing</span></h2><Link className="link" href="/practice">All playgrounds →</Link></div>
          <div className="arena">
            <Link href="/practice" className="pcard"><div className="top"><div className="ic py"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 6-5 6 5 6M16 6l5 6-5 6"/></svg></div><h3>Python Compiler<small>real, in-browser</small></h3></div><div className="d">Write code, run it, see the output instantly — real Python.</div></Link>
            <Link href="/practice" className="pcard"><div className="top"><div className="ic pd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 4v16"/></svg></div><h3>Problem Sets<small>test-case checked</small></h3></div><div className="d">Short problems for every topic, with an auto-checker.</div></Link>
          </div>
        </section>
      </div>

      {/* right */}
      <div className="col">
        <section className="card pad"><div className="sec-head"><h2>Today&apos;s Plan</h2></div>
          <TodoList nextLesson={nextLesson ? { title: nextLesson.title, track: shortTitle(nextLesson.track.title) } : null} />
        </section>

        {/* THE CARD NOW SHOWS WHAT ITS OWN TITLE SAYS.
            It used to read "Skills mastered" off a ratio nothing measured, and
            contradicted the tiles two cards up: 10 of 39 Python lessons drew 2%
            here and 12% there. This number is the sum of the two things the
            platform records, so it cannot disagree with them. */}
        <section className="card pad"><div className="sec-head"><h2>Overall Progress</h2></div>
          <div className="ring-wrap">
            <div
              className="ring"
              style={{ background: `conic-gradient(var(--accent) 0turn ${p.overallPct / 100}turn, var(--panel-2) ${p.overallPct / 100}turn 1turn)` }}
              role="img"
              aria-label={`${p.overallPct}% of Etudo complete: ${p.lessonsDone} of ${p.totalLessons} lessons and ${p.problemsDone} of ${p.totalProblems} problems`}
            >
              <div className="inner"><div><b className="num">{p.overallPct}%</b><span>of Etudo</span></div></div>
            </div>
            <div className="ring-legend">
              <div className="row"><span className="dot" style={{background:"var(--accent)"}}></span>Lessons <b>{p.lessonsDone}<span className="of">/{p.totalLessons}</span></b></div>
              <div className="row"><span className="dot" style={{background:"var(--teal)"}}></span>Problems <b>{p.problemsDone}<span className="of">/{p.totalProblems}</span></b></div>
              <div className="row"><span className="dot" style={{background:"var(--good)"}}></span>Subjects opened <b>{p.subjectsStarted}<span className="of">/{p.tracks.length}</span></b></div>
            </div>
          </div>
          {/* Three zeros is not a status report. At the very start the card says
              what would move it instead of printing them. */}
          {p.overallPct === 0 && nextLesson && (
            <p className="ring-invite">
              Nothing here yet — finishing{" "}
              <Link className="link" href={`/learn/${nextLesson.slug}`}>one lesson</Link>{" "}
              moves every number on this card.
            </p>
          )}
        </section>

        <section className="card pad" style={{borderColor:"color-mix(in srgb,var(--accent) 40%,transparent)"}}>
          <div className="eyebrow" style={{color:"var(--accent-2)"}}>Daily Challenge</div>
          <h3 style={{fontSize:"15px",margin:"8px 0 6px"}}>Solve today&apos;s problem</h3>
          {/* "Keep your 0-day streak alive" is not a thing you can say to someone. */}
          {/* No typed XP promise here — the real award is per problem and the
              server decides it. The streak is the honest stake. */}
          <p style={{fontSize:"12.5px",color:"var(--ink-soft)",margin:"0 0 14px"}}>
            {streak > 0 ? <>Keep your 🔥 {streak}-day streak alive — one problem does it.</> : <>Solve one today and your streak starts here.</>}
          </p>
          {/* Secondary, not primary. There were two orange buttons on this
              screen — "Resume learning" in the hero and this one — and two
              primary actions is the same as none: the eye has to choose, which
              is the decision fatigue the dashboard exists to remove. The card
              keeps its accent border, so the daily challenge still stands out
              as the second thing without competing to be the first. */}
          <Link className="btn btn-ghost" style={{width:"100%",justifyContent:"center"}} href="/practice">Solve now</Link>
        </section>
      </div>
    </div>
  );
}
