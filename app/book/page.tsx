import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "The Etudo Book — free written notes for every topic",
  description: "Every Etudo lesson as written notes you can read straight through, revise from, or print as a PDF. Free, no account needed.",
};

export default async function BookIndex() {
  const tracks = await prisma.track.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } },
      // Count only chapters that have a lesson in them, so this number matches
      // what /book/<track> actually lists — a plan names chapters whose lessons
      // are not written yet, and counting those made the index promise more
      // than the page behind it could show.
      chapters: { where: { lessons: { some: {} } }, select: { id: true } },
    },
  });
  const total = tracks.reduce((n, t) => n + t.lessons.length, 0);

  return (
    <div className="book-index">
      <header className="bki-head">
        <Link href="/" className="bki-back">← Etudo</Link>
        <h1>The Etudo Book</h1>
        <p>
          Every lesson, written out as notes you can read straight through — definitions, worked
          examples, common mistakes, exercises with answers, and interview questions. {total} topics
          across {tracks.length} subjects. Free to read, no account needed.
        </p>
      </header>

      <div className="bki-list">
        {tracks.map((t) => (
          <Link key={t.slug} href={`/book/${t.slug}`} className="bki-card">
            <div className="bki-ic">{t.icon}</div>
            <div className="bki-body">
              <h2>{t.title}</h2>
              <p>{t.subtitle}</p>
              <span className="bki-count">
                {t.lessons.length ? `${t.chapters.length} chapter${t.chapters.length === 1 ? "" : "s"} · ${t.lessons.length} topic${t.lessons.length === 1 ? "" : "s"}` : "coming soon"}
              </span>
            </div>
            <span className="bki-go">Read →</span>
          </Link>
        ))}
      </div>

      <footer className="bki-foot">
        <span className="mono">Etudo</span> · <Link href="/guidelines">Guidelines</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
