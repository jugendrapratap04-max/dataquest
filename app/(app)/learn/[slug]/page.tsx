import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { highlightPython } from "@/lib/highlight";
import { LessonComplete } from "@/components/LessonComplete";
import { LessonQuiz } from "@/components/LessonQuiz";
import { VizBlock } from "@/components/viz/VizBlock";

/* eslint-disable @typescript-eslint/no-explicit-any */
function Block({ b }: { b: any }) {
  switch (b.t) {
    case "objectives":
      return (
        <div className="card obj">
          <h3>Is lesson ke baad tum kya kar paoge</h3>
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
            <span className="think-hint"> — pehle khud socho, phir kholo</span>
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
          <h3>🚩 Yahan beginners phaste hain</h3>
          {b.items.map((m: any, i: number) => (
            <div className="mk" key={i}>
              <div className="mk-bad"><span>Galat</span><pre>{m.bad}</pre></div>
              <div className="mk-why" dangerouslySetInnerHTML={{ __html: m.why }} />
              <div className="mk-fix"><span>Sahi</span><pre>{m.fix}</pre></div>
            </div>
          ))}
        </div>
      );

    case "interview":
      return (
        <div className="card iv">
          <h3>🎤 Interview me aisa poochha jaata hai</h3>
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

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  const blocks: any[] = JSON.parse(lesson.contentJson || "[]");
  const objectives = blocks.find((b) => b.t === "objectives");
  const rest = blocks.filter((b) => b.t !== "objectives");

  const practiceHref = lesson.problems[0] ? `/practice/${lesson.problems[0].slug}` : "/practice";
  const idx = siblings.findIndex((s) => s.id === lesson.id);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];

  return (
    <div className="learn-layout">
      <article>
        <div className="crumb">Roadmap / {lesson.track.title.split(" — ")[0]} / <b>{lesson.title}</b></div>
        <div className="lesson-head">
          <div className="eyebrow">Lesson {lesson.order} · {lesson.track.title.split(" — ").pop()}</div>
          <h1>{lesson.title}</h1>
          <div className="lh-meta">
            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> {lesson.minutes} min read</span>
            {lesson.problems.length > 0 && (
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 6-5 6 5 6M16 6l5 6-5 6"/></svg> {lesson.problems.length} practice questions</span>
            )}
            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/></svg> {lesson.level}</span>
          </div>
        </div>

        {objectives && <Block b={objectives} />}
        <div className="prose">
          {rest.map((b, i) => <Block key={i} b={b} />)}
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
                <div className="eyebrow">Ab sabse zaroori step</div>
                <h3>Padh liya? Ab practice karo 💪</h3>
                <p>Sirf padhne se skill nahi aati — likhne se aati hai. {lesson.problems.length} chhote questions solve karo.</p>
                <LessonComplete lessonId={lesson.id} href={practiceHref} label="Start practice →" />
              </>
            ) : (
              <>
                <div className="eyebrow">Lesson complete</div>
                <h3>Shabaash — ye topic clear! ✅</h3>
                <p>{next ? "Mark complete karke agle lesson pe badho." : "Ye module ka aakhri lesson tha — roadmap pe wapas jao."}</p>
                <LessonComplete lessonId={lesson.id} href={next ? `/learn/${next.slug}` : "/roadmap"} label={next ? "Complete & agla lesson →" : "Complete & roadmap →"} />
              </>
            )}
          </div>
        </div>

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
