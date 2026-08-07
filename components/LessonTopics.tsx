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
  const list = (
    <ol className="lt-list">
      {outline.map((o, i) => {
        const done = i < current;
        return (
          <li key={o.id} className={`lt-item${i === current ? " on" : ""}${done ? " past" : ""}`}>
            <Link href={i === 0 ? `/learn/${slug}` : `/learn/${slug}?t=${i + 1}`} scroll>
              <span className="lt-n">{o.n ?? (o.kind === "landmark" ? "•" : i + 1)}</span>
              <span className="lt-label">{o.label}</span>
              {o.minutes > 0 && <span className="lt-min">{o.minutes}m</span>}
            </Link>
          </li>
        );
      })}
    </ol>
  );

  /* Two renderings, one displayed — the same shape CourseNav uses, for the same
   * reason and now with a number behind it. MEASURED on a phone (375x812, real
   * layout): this block was 202px tall and the lesson's first sentence began at
   * y=1118, which is 306px BELOW the fold. A reader on a phone scrolled past
   * more than a screen and a half of furniture to reach the first word, and a
   * fifth of that furniture was this list — navigation, offered before there is
   * anything to navigate away from.
   *
   * So on a phone it becomes a closed disclosure that says where you are: one
   * tap to open, and roughly 158px given back to the thing the reader came for.
   * Desktop is untouched, because there the list sits in space the text was
   * never going to use. */
  return (
    <nav className="lt" aria-label="Topics in this lesson">
      <div className="lt-open">
        <div className="lt-head">
          Topics <span className="lt-count">{current + 1} / {outline.length}</span>
        </div>
        {list}
      </div>
      <details className="lt-fold">
        <summary>
          <span className="lt-fold-n">{current + 1} / {outline.length}</span>
          <span className="lt-fold-label">{outline[current]?.label ?? "Topics"}</span>
          <span className="lt-fold-hint">all topics</span>
        </summary>
        {list}
      </details>
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
