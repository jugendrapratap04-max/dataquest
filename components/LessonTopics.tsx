import Link from "next/link";
import type { OutlineEntry } from "@/lib/lesson-outline";

/* The topic list for a lesson, and the lesson's only navigation.
 *
 * A lesson used to be one long page: eight sections, a trace, drills, mistakes,
 * a debug task, a recap, an interview set and a quiz, all stacked. That reads as
 * a lecture, and a beginner scrolling past six things they have not learned yet
 * to reach the one they came for does not feel like progress.
 *
 * So the lesson shows ONE topic at a time and this is how you move between them.
 * No client JavaScript: which topic is open is in the URL, so it is knowable at
 * render time — and that also means every topic can be linked, shared and found
 * by search rather than living inside an anchor on a page of twelve others.
 */
export function LessonTopics({
  slug, outline, current,
}: { slug: string; outline: OutlineEntry[]; current: number }) {
  /* ONE ROW OF PILLS, not a stacked list.
   *
   * MEASURED before changing it (1280x900, /learn/html-links): the boxed list
   * was 250px tall and the lesson's first paragraph began at y=761 — a quarter
   * of a screen spent on navigation offered before there is anything to
   * navigate away from. As a wrapped pill row the same twelve topics take
   * about 110px and every one of them is still visible.
   *
   * One rendering for both widths now (the phone disclosure is gone): the row
   * wraps on desktop so nothing hides, and becomes a single thumb-scrollable
   * line on phones, where it costs the same ~44px the closed disclosure did.
   * Still no client JavaScript — which topic is open is in the URL. */
  return (
    <nav className="lt" aria-label="Topics in this lesson">
      <div className="lt-head">
        Topics <span className="lt-count">{current + 1} / {outline.length}</span>
      </div>
      {/* ⚠️ `tpill-`, not `tp-` — `.tp-row` and `.tp-n` were already taken by
          the profile's Topics panel, and being later in the stylesheet they won:
          the row rendered as that panel's 3-column grid. Measured, not guessed —
          computed display came back `grid` with flex-wrap set to nowrap. */}
      <ol className="tpill-row">
        {outline.map((o, i) => {
          const done = i < current;
          return (
            <li key={o.id}>
              <Link
                className={`tpill${i === current ? " on" : ""}${done ? " past" : ""}`}
                href={i === 0 ? `/learn/${slug}` : `/learn/${slug}?t=${i + 1}`}
                aria-current={i === current ? "step" : undefined}
                scroll
              >
                <span className="tpill-n" aria-hidden="true">
                  {done ? "✓" : o.n ?? (o.kind === "landmark" ? "•" : i + 1)}
                </span>
                <span className="tpill-label">{o.label}</span>
                {o.minutes > 0 && <span className="tpill-min">{o.minutes}m</span>}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Previous / next topic, at the foot of the one being read. */
export function TopicNav({
  slug, outline, current,
}: { slug: string; outline: OutlineEntry[]; current: number }) {
  const prev = current > 0 ? outline[current - 1] : null;
  const next = current < outline.length - 1 ? outline[current + 1] : null;
  const href = (i: number) => (i === 0 ? `/learn/${slug}` : `/learn/${slug}?t=${i + 1}`);

  return (
    <div className="tnav">
      {prev ? (
        <Link className="tnav-btn prev" href={href(current - 1)}>
          <span className="tnav-dir">← Previous</span>
          <span className="tnav-label">{prev.label}</span>
        </Link>
      ) : <span />}
      {next && (
        <Link className="tnav-btn next" href={href(current + 1)}>
          <span className="tnav-dir">Next →</span>
          <span className="tnav-label">{next.label}</span>
        </Link>
      )}
    </div>
  );
}
