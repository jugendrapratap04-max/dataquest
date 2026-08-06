import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { subjectStyle, subjectName } from "@/lib/subjects";

/* The subject picker.
 *
 * WHY THIS PAGE EXISTS. It used to be four lines that redirected to the first
 * lesson of the first track — which is Python. Walking the site as a signed-out
 * student showed what that actually did:
 *
 *   - "Lessons" in the sidebar dropped you into Python, whatever you came for
 *   - the subject name in a lesson's breadcrumb links here, so clicking "HTML"
 *     from inside the HTML course dropped you into Python
 *   - CourseNav's course title links here too, with the same result
 *
 * Three paths, one destination, all wrong. The HTML course — 35 lessons — had
 * no entrance at all except scrolling to 91% of the roadmap page. One real
 * page fixes all three, because all three were already pointing at /learn and
 * only the answer was missing.
 *
 * It lists every subject rather than a curated few, for the reason in
 * AGENTS.md: this is a multi-subject platform, and a screen that quietly knows
 * about nine of eleven subjects is how a course becomes invisible.
 */

export const metadata: Metadata = {
  title: "All subjects — Etudo",
  description:
    "Every subject on Etudo: Python, statistics, SQL, pandas, machine learning, the 8085 microprocessor and HTML. Free, in your browser.",
};

export default async function LearnIndex() {
  const user = await getCurrentUser();

  const tracks = await prisma.track.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" }, select: { id: true, slug: true } },
      _count: { select: { lessons: true } },
    },
  });

  const doneRows = user
    ? await prisma.lessonProgress.findMany({ where: { userId: user.id, status: "done" }, select: { lessonId: true } })
    : [];
  const done = new Set(doneRows.map((d) => d.lessonId));

  const withLessons = tracks.filter((t) => t.lessons.length > 0);
  const totalLessons = withLessons.reduce((n, t) => n + t.lessons.length, 0);

  return (
    <>
      <h1 className="subj-h1">Every subject</h1>
      <p className="page-intro">
        {withLessons.length} subjects, {totalLessons} lessons, free to read without an account.
        Start anywhere — each one begins at the beginning.
      </p>

      <div className="subj-grid">
        {withLessons.map((t) => {
          const doneHere = t.lessons.filter((l) => done.has(l.id)).length;
          const pct = Math.round((doneHere / t.lessons.length) * 100);
          // Continue where they stopped, rather than always at lesson one.
          const nextUp = t.lessons.find((l) => !done.has(l.id)) ?? t.lessons[0];
          return (
            <Link
              key={t.id}
              className="subj-card subject-tint"
              style={subjectStyle(t.slug)}
              href={`/learn/${nextUp.slug}`}
            >
              <div className="subj-top">
                <span className="subject-pill">{subjectName(t.title, t.slug)}</span>
                {t.level && <span className="subj-level">{t.level}</span>}
              </div>
              <h2>{t.title.split(" — ").pop()}</h2>
              {t.subtitle && <p className="subj-sub">{t.subtitle}</p>}
              <div className="subj-meta">
                <span>{t.lessons.length} lessons</span>
                {t.weeks && <span>{t.weeks}</span>}
              </div>
              {doneHere > 0 && (
                <div className="subj-bar" title={`${doneHere} of ${t.lessons.length} done`}>
                  <i style={{ width: `${pct}%` }} />
                </div>
              )}
              <span className="subj-go">
                {doneHere === 0 ? "Start" : doneHere === t.lessons.length ? "Review" : `Continue — ${doneHere}/${t.lessons.length}`} →
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
