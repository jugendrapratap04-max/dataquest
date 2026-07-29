import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { subjectStyle, subjectName } from "@/lib/subjects";
import { SITE_URL } from "@/lib/seo";

// A subject's table of contents.
//
// This page used to render EVERY lesson of the subject onto one enormous page —
// exactly the "one long chapter" the product doc asks us to stop doing
// (docs/LEARNING-SPEC.md §2). It now lists the subject's chapters, and each
// chapter has its own page and its own URL.

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> {
  const { track } = await params;
  const t = await prisma.track.findUnique({ where: { slug: track }, select: { title: true, subtitle: true } });
  if (!t) return { title: "Not found — DataMarg" };
  const title = `${t.title} — written notes | The DataMarg Book`;
  const description = `Free written notes for ${t.title}: ${t.subtitle}. Definitions, worked examples, mistakes and exercises with answers.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/book/${track}` },
  };
}

export default async function BookTrack({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  const t = await prisma.track.findUnique({
    where: { slug: track },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" }, select: { slug: true, title: true } } },
      },
    },
  });
  if (!t) notFound();

  const totalTopics = t.chapters.reduce((n, c) => n + c.lessons.length, 0);

  return (
    <div className="book subject-tint" style={subjectStyle(t.slug)}>
      <header className="bk-top">
        <Link href="/book" className="bk-back">← All books</Link>
      </header>

      <div className="bk-cover">
        <div className="bk-brand mono">DataMarg</div>
        <span className="subject-pill">{subjectName(t.title, t.slug)}</span>
        <h1>{t.title}</h1>
        <p className="bk-sub">{t.subtitle}</p>
        <p className="bk-meta">
          {t.chapters.length} chapter{t.chapters.length === 1 ? "" : "s"} · {totalTopics} topic
          {totalTopics === 1 ? "" : "s"} · free to read
        </p>
      </div>

      {t.chapters.length === 0 ? (
        <p className="bk-empty">This subject has no written chapters yet.</p>
      ) : (
        <div className="bk-chapters">
          {t.chapters.map((c, i) => (
            <Link key={c.slug} href={`/book/${track}/${c.slug}`} className="bk-chapter-card">
              <div className="bk-cn">Chapter {i + 1}</div>
              <h3>{c.title}</h3>
              {c.summary && <p className="bk-csum">{c.summary}</p>}
              <p className="bk-ctopics">
                {c.lessons.length} topic{c.lessons.length === 1 ? "" : "s"}
                {c.lessons.length > 0 && <> · {c.lessons.slice(0, 3).map((l) => l.title).join(" · ")}{c.lessons.length > 3 ? " …" : ""}</>}
              </p>
            </Link>
          ))}
        </div>
      )}

      <footer className="bk-foot">
        <p>
          Want to run this code and have it checked? The same material is interactive at{" "}
          <Link href="/learn">DataMarg lessons</Link>.
        </p>
        <span className="mono">DataMarg</span> · <Link href="/terms">Terms</Link> ·{" "}
        <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
