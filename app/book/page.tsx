import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "The DataMarg Book — free written notes for every topic",
  description: "Every DataMarg lesson as written notes you can read straight through, revise from, or print as a PDF. Free, no account needed.",
};

export default async function BookIndex() {
  const tracks = await prisma.track.findMany({
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } } },
  });
  const total = tracks.reduce((n, t) => n + t.lessons.length, 0);

  return (
    <div className="book-index">
      <header className="bki-head">
        <Link href="/" className="bki-back">← DataMarg</Link>
        <h1>The DataMarg Book</h1>
        <p>
          Every lesson, written out as notes you can read straight through — definitions, worked
          examples, common mistakes, exercises with answers, and interview questions. {total} chapters
          across {tracks.length} tracks. Free, no account needed, and it prints to a clean PDF.
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
                {t.lessons.length ? `${t.lessons.length} chapter${t.lessons.length === 1 ? "" : "s"}` : "coming soon"}
              </span>
            </div>
            <span className="bki-go">Read →</span>
          </Link>
        ))}
      </div>

      <footer className="bki-foot">
        <span className="mono">DataMarg</span> · <Link href="/guidelines">Guidelines</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
