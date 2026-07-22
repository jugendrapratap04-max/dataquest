import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BookChapter } from "@/components/BookChapter";
import { PrintButton } from "@/components/PrintButton";

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> {
  const { track } = await params;
  const t = await prisma.track.findUnique({ where: { slug: track }, select: { title: true, subtitle: true } });
  if (!t) return { title: "Not found — DataMarg" };
  return {
    title: `${t.title} — written notes | The DataMarg Book`,
    description: `Free written notes for ${t.title}: ${t.subtitle}. Definitions, worked examples, mistakes, exercises with answers.`,
  };
}

export default async function BookTrack({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  const t = await prisma.track.findUnique({
    where: { slug: track },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (!t) notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const chapters = t.lessons.map((l) => {
    let blocks: any[] = [];
    try { blocks = JSON.parse(l.contentJson || "[]"); } catch { blocks = []; }
    return { slug: l.slug, title: l.title, blocks };
  });

  return (
    <div className="book">
      <header className="bk-top">
        <Link href="/book" className="bk-back">← All books</Link>
        <PrintButton label="Print / Save as PDF" />
      </header>

      <div className="bk-cover">
        <div className="bk-brand mono">DataMarg</div>
        <h1>{t.title}</h1>
        <p className="bk-sub">{t.subtitle}</p>
        <p className="bk-meta">{chapters.length} chapters · written notes · free to read and print</p>
      </div>

      {chapters.length > 1 && (
        <nav className="bk-toc">
          <h4>Contents</h4>
          <ol>
            {chapters.map((c) => (
              <li key={c.slug}><a href={`#${c.slug}`}>{c.title}</a></li>
            ))}
          </ol>
        </nav>
      )}

      {chapters.length === 0 ? (
        <p className="bk-empty">This track has no written chapters yet.</p>
      ) : (
        chapters.map((c, i) => (
          <BookChapter key={c.slug} n={i + 1} title={c.title} blocks={c.blocks} slug={c.slug} />
        ))
      )}

      <footer className="bk-foot">
        <p>
          Want to run this code and get it checked? The same material is interactive at{" "}
          <Link href={`/learn`}>DataMarg lessons</Link>.
        </p>
        <span className="mono">DataMarg</span> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
