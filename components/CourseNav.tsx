"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { RailControls } from "@/components/LayoutControls";

/* The course's table of contents, beside the lesson.
 *
 * WHY THIS REPLACED THE RIGHT RAIL. Jugendra's report was that students cannot
 * find the topics in a course, with W3Schools as the counter-example. Measuring
 * the old page said the same thing three different ways:
 *
 *   - at 1280x720 the lesson's own text began at y=860 — BELOW the fold. The
 *     first screen was breadcrumb, title, objectives and a 350px topic box.
 *   - the course list sat on the RIGHT, 946px tall in a 720px viewport, so
 *     lessons 12-18 of 18 were below the fold on the widest screen tested.
 *   - on a phone it was WORSE THAN HIDDEN: a dead CSS rule (see globals.css)
 *     meant the rail stacked at the very bottom instead of being suppressed, so
 *     the contents list sat at y=2339 of a 3310px page — 1527px below the first
 *     screen, after the entire lesson.
 *
 * So: left, sticky, its own scrollbar, and present on every width. The eye
 * starts on the left and the list is the first thing on the page, which is the
 * whole of why the W3Schools layout feels easy.
 *
 * GROUPED BY CHAPTER, NOT FLAT. Eighteen titles in a column is a wall. The
 * course was written in modules and the schema has had `Chapter` since July —
 * it just never reached this screen. Tracks with no chapters fall back to a
 * flat list, which is exactly what they render today.
 *
 * WHY IT IS A CLIENT COMPONENT. One reason only: a student on lesson 17 must
 * not be handed a scrollbox showing lesson 1. The active item is scrolled into
 * view inside the nav's own scroller on mount, WITHOUT scrolling the page —
 * `scrollIntoView` would drag the article too, so the offset is computed and
 * assigned directly.
 */

export type CourseNavLesson = {
  id: string;
  slug: string;
  title: string;
  order: number;
  chapterTitle: string | null;
  chapterOrder: number | null;
};

type Group = { title: string | null; lessons: CourseNavLesson[] };

function groupByChapter(lessons: CourseNavLesson[]): Group[] {
  const groups: Group[] = [];
  for (const l of lessons) {
    const last = groups[groups.length - 1];
    // Lessons arrive in `order`, and a chapter is a contiguous run of them, so
    // comparing with the previous lesson is enough — no map, no sort.
    if (last && last.title === l.chapterTitle) last.lessons.push(l);
    else groups.push({ title: l.chapterTitle, lessons: [l] });
  }
  return groups;
}

export function CourseNav({
  courseTitle, courseHref, lessons, currentId, doneIds, doneCount,
}: {
  courseTitle: string;
  courseHref: string;
  lessons: CourseNavLesson[];
  currentId: string;
  doneIds: string[];
  doneCount: number;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const active = useRef<HTMLAnchorElement>(null);
  const done = new Set(doneIds);
  const groups = groupByChapter(lessons);
  const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;

  useEffect(() => {
    const box = scroller.current, item = active.current;
    if (!box || !item) return;
    // Centre it in the scroller if the list is long enough to scroll at all.
    // Assigning scrollTop rather than calling scrollIntoView, which would also
    // scroll the page and land the reader halfway down the lesson.
    const wanted = item.offsetTop - box.clientHeight / 2 + item.clientHeight / 2;
    box.scrollTop = Math.max(0, wanted);
  }, [currentId]);

  const list = (
    <div className="cnav-scroll" ref={scroller}>
      {groups.map((g, gi) => (
        <div className="cnav-group" key={gi}>
          {g.title && <div className="cnav-gtitle">{g.title}</div>}
          <ul>
            {g.lessons.map((l) => {
              const isCurrent = l.id === currentId;
              const cls = isCurrent ? "on" : done.has(l.id) ? "done" : "";
              return (
                <li key={l.id} className={cls}>
                  <Link
                    href={`/learn/${l.slug}`}
                    ref={isCurrent ? active : undefined}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    <span className="cnav-n">{done.has(l.id) && !isCurrent ? "✓" : l.order}</span>
                    <span className="cnav-t">{l.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <nav className="cnav" aria-label={`Lessons in ${courseTitle}`}>
      {/* Inside the nav on purpose: `.rail-collapse` is absolutely positioned,
          so it needs a positioned ancestor, and `.cnav` is sticky. Left in the
          article it would have anchored to the layout and floated over the
          lesson text. */}
      <RailControls />
      <div className="cnav-head">
        <Link className="cnav-course" href={courseHref}>{courseTitle}</Link>
        <span className="cnav-count">{doneCount} / {lessons.length}</span>
      </div>
      <div className="cnav-bar" title={`${doneCount} of ${lessons.length} lessons done`}>
        <i style={{ width: `${pct}%` }} />
      </div>

      {/* Two renderings of one list, and only one is ever displayed.
          Desktop gets it open beside the lesson; a phone gets a closed
          disclosure ABOVE the content — findable in one tap, and costing no
          vertical space until it is wanted. The old layout put it after the
          entire lesson, which is the bug this whole component exists to fix. */}
      <div className="cnav-open">{list}</div>
      <details className="cnav-fold">
        <summary>
          All {lessons.length} lessons in this course
        </summary>
        {list}
      </details>
    </nav>
  );
}
