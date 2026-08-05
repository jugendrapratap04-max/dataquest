import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SITE_URL, clamp } from "@/lib/seo";
import { subjectStyle, subjectName } from "@/lib/subjects";
import { lockStateFor } from "@/lib/unlock";
import { getCurrentUser } from "@/lib/session";
import { highlightPython } from "@/lib/highlight";
import { LessonComplete } from "@/components/LessonComplete";
import { LessonQuiz } from "@/components/LessonQuiz";
import { FadedExample, TraceCheck } from "@/components/LessonPractice";
// LessonToc is the scroll-spy contents for a single long page. With one topic
// on screen there is nothing to spy on, so LessonTopics replaces it here.
import { ReadingProgress } from "@/components/LessonProgress";
import { LessonTopics, TopicNav } from "@/components/LessonTopics";
import { lessonOutline } from "@/lib/lesson-outline";
import { Fragment } from "react";
import { RailControls } from "@/components/LayoutControls";
import { VizBlock } from "@/components/viz/VizBlock";
import { LiveCode } from "@/components/LiveCode";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* Subjects whose `code` blocks are plain Python printing to stdout, and are
 * therefore safe to hand to the student as editable examples.
 *
 * `viz` is left out deliberately: its examples draw with matplotlib, and the
 * result is a figure rather than printed text, so running one here would show an
 * empty output box and teach the wrong thing. It needs the figure path
 * (runPythonWithFigure) before it can join. `sql` and `microprocessor` are not
 * Python at all. */
const LIVE_TRACKS = new Set(["python", "statistics", "pandas"]);

function Block({ b, pyLive = false }: { b: any; pyLive?: boolean }) {
  switch (b.t) {
    case "objectives":
      return (
        <div className="card obj">
          <h3>What you&apos;ll be able to do after this lesson</h3>
          <ul>
            {b.items.map((it: string, i: number) => (
              <li key={i}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                <span dangerouslySetInnerHTML={{ __html: it }} />
              </li>
            ))}
          </ul>
        </div>
      );
    // Opens the lesson with a question instead of a definition — the student
    // should want the answer before being handed one.
    case "hook":
      return (
        <div className="hook">
          <div className="hook-q" dangerouslySetInnerHTML={{ __html: b.q }} />
          {b.why && <p className="hook-why" dangerouslySetInnerHTML={{ __html: b.why }} />}
        </div>
      );

    // "What do you think?" only teaches if the answer is hidden. <details> makes
    // the student commit to a guess before revealing — active recall, no JS.
    case "think":
      return (
        <details className="think">
          <summary>
            🤔 <span dangerouslySetInnerHTML={{ __html: b.q }} />
            <span className="think-hint"> — make a guess first, then open</span>
          </summary>
          <div className="think-a" dangerouslySetInnerHTML={{ __html: b.a }} />
        </details>
      );

    // The gap this whole pass exists to fix: every concept now gets a crisp
    // professional definition BEFORE the Hinglish explanation, not instead of it.
    case "def":
      return (
        <div className="def">
          <div className="def-term">{b.term}</div>
          <div className="def-en">{b.en}</div>
          {b.hi && <div className="def-hi" dangerouslySetInnerHTML={{ __html: b.hi }} />}
        </div>
      );

    case "analogy":
      return (
        <div className="analogy">
          <div className="an-row">
            <span className="an-a">{b.concept}</span>
            <span className="an-arrow">→</span>
            <span className="an-b">{b.real}</span>
          </div>
          <p dangerouslySetInnerHTML={{ __html: b.html }} />
        </div>
      );

    case "mistakes":
      return (
        <div className="card mistakes">
          <h3>🚩 Where beginners get stuck</h3>
          {b.items.map((m: any, i: number) => (
            <div className="mk" key={i}>
              <div className="mk-bad"><span>Wrong</span><pre>{m.bad}</pre></div>
              <div className="mk-why" dangerouslySetInnerHTML={{ __html: m.why }} />
              <div className="mk-fix"><span>Right</span><pre>{m.fix}</pre></div>
            </div>
          ))}
        </div>
      );

    case "interview":
      return (
        <div className="card iv">
          <h3>🎤 How this is asked in interviews</h3>
          {b.items.map((q: any, i: number) => (
            <details className="iv-q" key={i}>
              {/* q.q carries inline <code> markup like the answer does — render it,
                  don't print the tags. */}
              <summary>
                <span className={`iv-lvl ${q.level}`}>{q.level}</span>
                <span dangerouslySetInnerHTML={{ __html: q.q }} />
              </summary>
              <div className="iv-a" dangerouslySetInnerHTML={{ __html: q.a }} />
            </details>
          ))}
        </div>
      );

    case "h2":
      return <h2><span className="n">{b.n}</span>{b.text}</h2>;
    case "p":
      return <p dangerouslySetInnerHTML={{ __html: b.html }} />;
    case "psoft":
      return <p className="soft" dangerouslySetInnerHTML={{ __html: b.html }} />;
    case "code":
      // Every code block is verified runnable by `npm run verify:lesson`, so on
      // a Python subject it can simply be handed over as an editable example.
      if (pyLive) return <LiveCode file={b.file} code={b.code} output={b.output} runnable />;
      return (
        <div className="code">
          <div className="bar">
            <span className="dot" style={{ background: "#FF5F57" }} />
            <span className="dot" style={{ background: "#FEBC2E" }} />
            <span className="dot" style={{ background: "#28C840" }} />
            <span className="fn">{b.file}</span>
          </div>
          <pre dangerouslySetInnerHTML={{ __html: highlightPython(b.code) }} />
          {b.output && <div className="out">Output:<br /><b>{b.output}</b></div>}
        </div>
      );
    // The tables a SQL lesson's examples run against.
    //
    // It is shown rather than hidden for two reasons: the student cannot check
    // a query's result without knowing what is in the table, and having the
    // setup on the page means they can paste it into the compiler and try their
    // own queries. verify:lesson runs every snippet in this lesson against
    // exactly this SQL, so what the page claims is what sql.js actually returns.
    case "sqlsetup":
      return (
        <div className="code">
          <div className="bar">
            <span className="dot" style={{ background: "#FF5F57" }} />
            <span className="dot" style={{ background: "#FEBC2E" }} />
            <span className="dot" style={{ background: "#28C840" }} />
            <span className="fn">the table these examples use</span>
          </div>
          <pre dangerouslySetInnerHTML={{ __html: highlightPython(b.sql) }} />
        </div>
      );
    // The bytes an 8085 lesson's examples read, and where they live.
    //
    // Shown rather than hidden for the same two reasons `sqlsetup` is: the student
    // cannot check a program's answer without knowing what was in memory, and
    // having the addresses on the page means they can key the same values into a
    // trainer kit in the lab. verify:lesson preloads exactly these bytes before
    // every snippet in the lesson, so what the page claims is what the processor
    // actually produced.
    case "memsetup":
      return (
        <div className="code">
          <div className="bar">
            <span className="dot" style={{ background: "#FF5F57" }} />
            <span className="dot" style={{ background: "#FEBC2E" }} />
            <span className="dot" style={{ background: "#28C840" }} />
            <span className="fn">memory these examples read</span>
          </div>
          <pre>
            {b.bytes.map((byte: number, i: number) =>
              `${(b.at + i).toString(16).toUpperCase().padStart(4, "0")}H:  ${byte.toString(16).toUpperCase().padStart(2, "0")}H`
            ).join("\n")}
          </pre>
          {b.note && <div className="out" dangerouslySetInnerHTML={{ __html: b.note }} />}
        </div>
      );
    case "note":
      return (
        <div className={`note ${b.variant}`}>
          <span className="i">{b.variant === "warn" ? "⚠️" : b.variant === "key" ? "📌" : "💡"}</span>
          <div dangerouslySetInnerHTML={{ __html: b.html }} />
        </div>
      );
    case "dtypes":
      return (
        <div className="dtypes">
          {b.items.map((d: any, i: number) => (
            <div className="dt" key={i}>
              <span className="dtag">{d.tag}</span>
              <h4>{d.name}</h4>
              <p>{d.desc}</p>
              <div className="ex">{d.ex}</div>
            </div>
          ))}
        </div>
      );
    // Rung 1 of the ladder: a fully solved example whose steps carry SUBGOAL
    // LABELS. Labelling the steps (rather than leaving one undivided block of
    // code) measurably improves learning, retention and transfer — students
    // learn the *shape* of the solution, not just this one answer.
    case "worked":
      return (
        <div className="card worked">
          <h3>🧩 Worked example — {b.title}</h3>
          {b.goal && <p className="wk-goal" dangerouslySetInnerHTML={{ __html: b.goal }} />}
          <ol className="wk-steps">
            {b.steps.map((s: any, i: number) => (
              <li key={i}>
                <div className="wk-label">{s.label}</div>
                <pre dangerouslySetInnerHTML={{ __html: highlightPython(s.code) }} />
                {s.why && <div className="wk-why" dangerouslySetInnerHTML={{ __html: s.why }} />}
              </li>
            ))}
          </ol>
          {b.full && (
            <div className="wk-full">
              <div className="wk-label">All together</div>
              <pre dangerouslySetInnerHTML={{ __html: highlightPython(b.full) }} />
              {b.output && <div className="wk-out">Output: <b>{b.output}</b></div>}
            </div>
          )}
        </div>
      );

    // Rung 2: the same solution with pieces removed. Less load than a blank
    // page, and it shows the student which piece they actually don't know.
    case "faded":
      return (
        <div className="card faded">
          <h3>🪜 Your turn — fill the blanks</h3>
          {b.intro && <p className="dr-intro" dangerouslySetInnerHTML={{ __html: b.intro }} />}
          <FadedExample code={b.code} blanks={b.blanks} output={b.output} />
        </div>
      );

    // A student who cannot say what a variable holds at line 5 cannot write
    // line 6. Tracing is the cheapest way to test the mental model directly.
    case "trace":
      return (
        <div className="card trace">
          <h3>🔍 Trace the code</h3>
          {b.intro && <p className="dr-intro" dangerouslySetInnerHTML={{ __html: b.intro }} />}
          <TraceCheck code={b.code} steps={b.steps} />
        </div>
      );

    // Broken code to repair. Research-backed, and it is literally the job —
    // most real programming time is spent reading code that misbehaves.
    case "debug":
      return (
        <div className="card debug">
          <h3>🐞 Find the bug</h3>
          {b.intro && <p className="dr-intro" dangerouslySetInnerHTML={{ __html: b.intro }} />}
          <pre className="dbg-code" dangerouslySetInnerHTML={{ __html: highlightPython(b.code) }} />
          {b.symptom && <div className="dbg-symptom"><span>What Python says</span><pre>{b.symptom}</pre></div>}
          <details className="dr">
            <summary>
              <span className="dr-n">?</span>
              <span dangerouslySetInnerHTML={{ __html: b.q || "Which line is wrong, and why?" }} />
              <span className="dr-hint">show the fix</span>
            </summary>
            <div className="dr-a">
              <pre dangerouslySetInnerHTML={{ __html: highlightPython(b.fix) }} />
              {b.why && <div className="wk-why" dangerouslySetInnerHTML={{ __html: b.why }} />}
            </div>
          </details>
        </div>
      );

    // One drill per operation, so no step of a topic gets skipped. Deliberately
    // ungraded self-checks (the graded version is the practice problems) — the
    // answer stays hidden until the student has committed to one, same active
    // recall as `think`.
    case "drills":
      return (
        <div className="card drills">
          <h3>✍️ Try these yourself</h3>
          {b.intro && <p className="dr-intro" dangerouslySetInnerHTML={{ __html: b.intro }} />}
          {b.items.map((d: any, i: number) => (
            <details className="dr" key={i}>
              <summary>
                <span className="dr-n">{i + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: d.task }} />
                <span className="dr-hint">show answer</span>
              </summary>
              <div className="dr-a">
                <pre dangerouslySetInnerHTML={{ __html: highlightPython(d.code) }} />
                {d.out && <div className="dr-out">Output: <b>{d.out}</b></div>}
              </div>
            </details>
          ))}
        </div>
      );
    case "viz":
      return <VizBlock name={b.name} />;
    case "quiz":
      return <LessonQuiz items={b.items} />;
    case "recap":
      return (
        <div className="card recap">
          <h3>⚡ Quick Recap</h3>
          <ul>{b.items.map((it: string, i: number) => <li key={i} dangerouslySetInnerHTML={{ __html: it }} />)}</ul>
        </div>
      );
    default:
      return null;
  }
}

// Without this every lesson served the root layout's title, so search engines
// saw 83 pages all called "Etudo — Learn. Practice. Get Job-Ready." The
// description is taken from the lesson's own first paragraph rather than being
// generated, so it always matches what the page actually says.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: { track: { select: { title: true } } },
  });
  if (!lesson) return { title: "Lesson not found — Etudo" };

  let blocks: any[] = [];
  try { blocks = JSON.parse(lesson.contentJson || "[]"); } catch {}
  const intro =
    blocks.find((b) => b.t === "p")?.html ??
    blocks.find((b) => b.t === "def")?.en ??
    "";

  const track = lesson.track.title.split(" — ")[0];
  const title = `${lesson.title} — ${track} | Etudo`;
  const description =
    clamp(intro) || `Learn ${lesson.title} with an interactive lesson, worked examples and practice you can run in the browser.`;
  const url = `${SITE_URL}/learn/${lesson.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", siteName: "Etudo" },
    twitter: { card: "summary", title, description },
  };
}

export default async function LessonPage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug } = await params;
  const { t: topicParam } = await searchParams;
  // Open to everyone — a visitor reads the whole lesson. Only the progress
  // (which lessons are ticked) and the "mark complete" action need an account.
  const user = await getCurrentUser();

  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: { track: true, problems: { orderBy: { order: "asc" } } },
  });
  if (!lesson) notFound();

  const siblings = await prisma.lesson.findMany({
    where: { trackId: lesson.trackId },
    orderBy: { order: "asc" },
  });
  const doneRows = user
    ? await prisma.lessonProgress.findMany({ where: { userId: user.id, status: "done" } })
    : [];
  const doneIds = new Set(doneRows.map((d) => d.lessonId));
  const lock = await lockStateFor(lesson.id, user?.id ?? null);

  const blocks: any[] = JSON.parse(lesson.contentJson || "[]");
  const objectives = blocks.find((b) => b.t === "objectives");
  const rest = blocks.filter((b) => b.t !== "objectives");
  // Section map + per-section minutes, both derived from the content itself.
  // A short lesson does not need a table of contents.
  const { outline, anchors, total, readMinutes, workMinutes } = lessonOutline(rest);
  const showToc = outline.length >= 4;

  /* ONE TOPIC AT A TIME.
   *
   * A lesson used to render as a single page — eight sections plus a trace,
   * drills, mistakes, a debug task, a recap, an interview set and a quiz. That
   * reads as a lecture, and a beginner scrolling past six things they have not
   * learned yet to reach the one they came for does not feel like progress.
   *
   * The split needed no new data: `lessonOutline` has always divided a lesson
   * into exactly these entries — one per <h2>, plus one per practice landmark —
   * and `anchors` already marks the first block of each. Walking the blocks and
   * counting those marks gives every block its topic. The content did not move;
   * only what is on screen at once did.
   *
   * Which topic is open lives in the URL, so each one can be linked, shared and
   * found by search instead of hiding inside an anchor on a page of twelve.
   */
  const partOf: number[] = [];
  let seen = -1;
  rest.forEach((_, i) => {
    if (anchors.has(i)) seen++;
    partOf[i] = Math.max(0, seen);
  });

  const asked = Number.parseInt(topicParam ?? "1", 10);
  const topic = Number.isFinite(asked) ? Math.min(Math.max(asked, 1), outline.length) - 1 : 0;
  const lastTopic = topic === outline.length - 1;

  // A lesson too short to be worth splitting (`showToc` is false under four
  // entries) keeps rendering whole. Filtering it anyway would show only its
  // first topic with no navigation to reach the rest — which is what the stub
  // lessons in the unwritten subjects would have done.
  const visible = showToc ? rest.filter((_, i) => partOf[i] === topic) : rest;
  const concepts = (blocks.find((b) => b.t === "recap")?.items ?? []).length;

  // Send them to the first problem they have NOT solved, not to problem 1.
  //
  // This was the bug behind "I solved one, came back, and it gave me the same
  // one again". The button always pointed at problems[0], so a student who
  // solved it, left, and returned was handed it a second time — and since the
  // editor also reopened on the starter template, there was nothing on screen
  // to suggest they had ever been there. Two separate omissions producing one
  // very convincing illusion of repetition.
  //
  // If every problem in the topic is solved, fall back to the first: the button
  // still works, and the practice page now says "✓ Solved" on arrival.
  const solvedHere = user
    ? new Set(
        (
          await prisma.submission.findMany({
            where: { userId: user.id, passed: true, problemId: { in: lesson.problems.map((q) => q.id) } },
            distinct: ["problemId"],
            select: { problemId: true },
          })
        ).map((s) => s.problemId)
      )
    : new Set<string>();
  const firstOpen = lesson.problems.find((q) => !solvedHere.has(q.id)) ?? lesson.problems[0];
  const practiceHref = firstOpen ? `/practice/${firstOpen.slug}` : "/practice";
  const idx = siblings.findIndex((s) => s.id === lesson.id);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];

  return (
    <div className="learn-layout">
      <ReadingProgress />
      <article>
        {/* Clickable, because this breadcrumb was plain text and a lesson had no
            way out at all — and on mobile the sidebar is behind a hamburger, so
            the browser's own back button was the only exit. */}
        <div className="crumb">
          <Link href="/roadmap">← Roadmap</Link> / <Link href="/learn">{lesson.track.title.split(" — ")[0]}</Link> / <b>{lesson.title}</b>
        </div>
        {/* Each subject gets its own colour, carried as a hue on the wrapper.
            Python should not look like SQL — see docs/ARCHITECTURE.md. Adding a
            subject needs no code change: an unknown slug gets a stable hue of
            its own from lib/subjects.ts. */}
        <div className="lesson-head subject-tint" style={subjectStyle(lesson.track.slug)}>
          <div className="eyebrow">
            <span className="subject-pill">{subjectName(lesson.track.title, lesson.track.slug)}</span>{" "}
            Lesson {lesson.order} of {siblings.length}
          </div>
          <h1>{lesson.title}</h1>
          {/* Where you are in this subject, from the progress that already
              exists. The old header said "Lesson 6" with nothing to measure it
              against, so a student could not tell 6 of 39 from 6 of 6. */}
          <div className="subject-bar" title={`${doneIds.size} of ${siblings.length} lessons done in ${subjectName(lesson.track.title, lesson.track.slug)}`}>
            <span style={{ width: `${Math.round((doneIds.size / Math.max(siblings.length, 1)) * 100)}%` }} />
          </div>
          <div className="lh-meta">
            {/* Measured from the content, not typed in by hand — and split,
                because "39 min" reads as 39 minutes of reading and scares
                people off a lesson that is only ~10 minutes of text. */}
            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> ~{readMinutes} min read{workMinutes > 1 ? ` · ~${workMinutes} min practice` : ""}</span>
            {lesson.problems.length > 0 && (
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 6-5 6 5 6M16 6l5 6-5 6"/></svg>
                {" "}{user && solvedHere.size > 0
                  ? `${solvedHere.size} of ${lesson.problems.length} practice questions solved`
                  : `${lesson.problems.length} practice questions`}</span>
            )}
            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/></svg> {lesson.level}</span>
          </div>
        </div>

        {/* Topic-by-topic progression (docs/LEARNING-SPEC.md §3). A signed-in
            student reaches a topic only after reading the previous one and
            solving its practice problems. Signed-out readers are never gated —
            the lessons are the try-before-signup path and the only thing search
            can index, and a lock a reader escapes by logging out is worse than
            no lock at all. */}
        {lock.locked ? (
          <div className="card pad topic-lock">
            <div className="eyebrow">Locked topic</div>
            <h3>Finish the topic before this one first</h3>
            <p>
              This is how the course is meant to work: read, practise, then move on. You are one
              step away.
            </p>
            <ul className="lock-needs">
              {lock.needs.readNeeded && (
                <li>Read <b>{lock.needs.title}</b> and mark it complete</li>
              )}
              {lock.needs.problemsNeeded > 0 && (
                <li>
                  Solve <b>{lock.needs.problemsNeeded}</b> more practice{" "}
                  {lock.needs.problemsNeeded === 1 ? "problem" : "problems"} from{" "}
                  <b>{lock.needs.title}</b>
                </li>
              )}
            </ul>
            <Link className="btn btn-primary" href={`/learn/${lock.needs.slug}`}>
              Go to {lock.needs.title} →
            </Link>
          </div>
        ) : (
          <>
        {/* Objectives are the lesson's promise, not a topic — they belong on the
            way in and nowhere else. */}
        {objectives && topic === 0 && <Block b={objectives} />}
        {showToc && <LessonTopics slug={slug} outline={outline} current={topic} />}
        <div className="prose">
          {visible.map((b, i) => (
            <Fragment key={i}>
              <Block b={b} pyLive={LIVE_TRACKS.has(lesson.track.slug)} />
            </Fragment>
          ))}
        </div>
        {showToc && <TopicNav slug={slug} outline={outline} current={topic} />}

        {/* Closing summary. Every number here is real — key ideas counted from
            the recap, minutes from the outline, progress from the database. No
            invented XP: finishing a lesson does not pay XP, solving problems
            does, and saying otherwise would be a lie the dashboard exposes.
            Only on the last topic: "you have finished" under topic 3 of 12 is
            a lie the student can see. */}
        {(!showToc || lastTopic) && (<>
        <div className="card lsum">
          <h3>What you just covered</h3>
          <div className="lsum-stats">
            <div><b>{concepts}</b><span>key ideas</span></div>
            <div><b>~{total}</b><span>minutes</span></div>
            {/* "problems waiting" was true on the first visit and wrong on every
                one after it — a student who had solved both was still told two
                were waiting. It counts what is actually left now. */}
            {lesson.problems.length > 0 && (
              user
                ? <div><b>{solvedHere.size}/{lesson.problems.length}</b><span>problems solved</span></div>
                : <div><b>{lesson.problems.length}</b><span>problems waiting</span></div>
            )}
            {user && <div><b>{doneIds.size}/{siblings.length}</b><span>lessons done</span></div>}
          </div>
          {next && <p className="lsum-next">Up next: <b>{next.title}</b></p>}
        </div>

        <div className="cta">
          <div className="pad">
            {!user ? (
              <>
                <div className="eyebrow">You&apos;re reading as a guest</div>
                <h3>Keep this progress — it&apos;s free</h3>
                <p>
                  Reading stays free forever. An account saves which lessons you&apos;ve finished,
                  checks your code and pays XP, and unlocks certificates and study rooms.
                </p>
                <Link className="btn btn-primary" href="/signup">Create free account →</Link>
              </>
            ) : lesson.problems.length > 0 ? (
              <>
                <div className="eyebrow">The step that actually matters</div>
                <h3>Read it? Now write it 💪</h3>
                <p>Reading does not build the skill — writing code does. Solve the {lesson.problems.length} short questions for this lesson.</p>
                <LessonComplete lessonId={lesson.id} href={practiceHref} label="Start practice →" />
              </>
            ) : (
              <>
                <div className="eyebrow">Lesson complete</div>
                <h3>Nice — this topic is done ✅</h3>
                <p>{next ? "Mark it complete and move to the next lesson." : "That was the last lesson in this track — head back to the roadmap."}</p>
                <LessonComplete lessonId={lesson.id} href={next ? `/learn/${next.slug}` : "/roadmap"} label={next ? "Complete & next lesson →" : "Complete & roadmap →"} />
              </>
            )}
          </div>
        </div>
        </>)}
          </>
        )}

        <nav className="lnav">
          {prev
            ? <Link className="lnav-prev" href={`/learn/${prev.slug}`} style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 12, padding: "13px 16px", background: "var(--panel)" }}><div className="dir">← Previous</div><div className="ttl">{prev.title}</div></Link>
            : <a className="dis" style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 12, padding: "13px 16px", background: "var(--panel)" }}><div className="dir">← Previous</div><div className="ttl">Lesson start</div></a>}
          {next
            ? <Link className="next" href={`/learn/${next.slug}`} style={{ flex: 1, textAlign: "right", border: "1px solid var(--line)", borderRadius: 12, padding: "13px 16px", background: "var(--panel)" }}><div className="dir">Next →</div><div className="ttl">{next.title}</div></Link>
            : <a className="dis next" style={{ flex: 1, textAlign: "right", border: "1px solid var(--line)", borderRadius: 12, padding: "13px 16px", background: "var(--panel)" }}><div className="dir">Next →</div><div className="ttl">Module end</div></a>}
        </nav>
      </article>

      <aside className="learn-side">
        <RailControls />
        <div className="card pad">
          <h4 className="side-card">{lesson.track.title.split(" — ")[0]} — {doneIds.size} / {siblings.length}</h4>
          <div className="pbar"><i style={{ width: `${Math.round((doneIds.size / siblings.length) * 100)}%` }} /></div>
        </div>
        <div className="card pad">
          <h4 className="side-card" style={{ marginBottom: 14 }}>Lessons in this module</h4>
          <ul className="llist">
            {siblings.map((s) => {
              const cls = s.id === lesson.id ? "cur" : doneIds.has(s.id) ? "done" : "lock";
              return (
                <li key={s.id} className={cls}>
                  <Link href={`/learn/${s.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                    <span className="lic">{doneIds.has(s.id) ? "✓" : s.order}</span> {s.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
