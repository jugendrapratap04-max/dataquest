"use client";

import { useEffect, useState } from "react";
import type { OutlineEntry } from "@/lib/lesson-outline";

/** Thin bar across the top showing how far through the lesson the reader is.
 *  A long lesson with no sense of progress is a lesson people abandon. */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 8 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Runs after paint rather than during render, so a reload part-way down the
    // page still shows the right position.
    const t = setTimeout(onScroll, 0);
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  return (
    <div className="readbar" role="progressbar" aria-label="Lesson progress" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

/** "In this lesson" — the map. Breaks a long page into named, timed pieces and
 *  lets a returning student jump straight to the part they came back for. */
export function LessonToc({ outline }: { outline: OutlineEntry[] }) {
  const [active, setActive] = useState<string>("");
  const ids = outline.map((o) => o.id).join(",");

  useEffect(() => {
    // Scroll position rather than IntersectionObserver, for two reasons: the
    // anchors are zero-height (so they never shift the layout) and IO does not
    // report zero-area targets dependably, and this version is directly
    // testable — "scroll here, expect that heading" — where IO callbacks are
    // frame-driven and silently never arrive in a throttled/hidden tab.
    const list = ids.split(",");
    // Measure once and keep absolute offsets, so scrolling costs arithmetic
    // instead of 17 layout reads per event on a mid-range phone.
    let tops: { id: string; top: number }[] = [];
    let docH = 0;
    const measure = () => {
      docH = document.documentElement.scrollHeight;
      tops = list
        .map((id) => { const el = document.getElementById(id); return el ? { id, top: el.getBoundingClientRect().top + window.scrollY } : null; })
        .filter(Boolean) as { id: string; top: number }[];
    };
    const onScroll = () => {
      // Opening a <details> changes the page height and every offset below it.
      if (document.documentElement.scrollHeight !== docH) measure();
      // The active section is the last one to have passed the reading line —
      // just below the sticky topbar, where the eyes actually are.
      let current = tops[0]?.id ?? "";
      for (const t of tops) { if (t.top - 96 <= window.scrollY) current = t.id; else break; }
      setActive(current);
    };
    const onResize = () => { measure(); onScroll(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const t = setTimeout(onResize, 0);
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, [ids]);

  return (
    <nav className="card toc" aria-label="Lesson contents">
      <h3>In this lesson</h3>
      <ol>
        {outline.map((o) => (
          <li key={o.id} className={`${o.kind} ${active === o.id ? "on" : ""}`}>
            <a href={`#${o.id}`}>
              <span className="toc-n">{o.n ?? "•"}</span>
              <span className="toc-t">{o.label}</span>
              <span className="toc-m">{o.minutes} min</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

