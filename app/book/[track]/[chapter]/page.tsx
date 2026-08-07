import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { chapterGate } from "@/lib/chapter-gate";
import { subjectStyle, subjectName } from "@/lib/subjects";
import { SITE_URL, clamp } from "@/lib/seo";
import { BookChapter } from "@/components/BookChapter";
import { PrintButton } from "@/components/PrintButton";

// One chapter of the notes, with its topics inside it.
//
// docs/LEARNING-SPEC.md §2: "notes should no longer be presented as one long
// chapter". They used to be exactly that — every lesson of a subject rendered
// onto a single page. Each chapter now has its own page and its own URL, which
// also gives search something specific to index.

async function load(trackSlug: string, chapterSlug: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { slug: chapterSlug },
    include: {
      track: { select: { slug: true, title: true } },
      lessons: { orderBy: { order: "asc" }, select: { slug: true, title: true, contentJson: true } },
    },
  });
  if (!chapter || chapter.track.slug !== trackSlug) return null;
  return chapter;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; chapter: string }>;
}): Promise<Metadata> {
  const { track, chapter } = await params;
  const c = await load(track, chapter);
  if (!c) return { title: "Not found — Etudo" };
  const title = `${c.title} — ${subjectName(c.track.title, c.track.slug)} notes | Etudo`;
  const description =
    clamp(c.summary) ||
    `Free written notes for ${c.title}: definitions, worked examples, common mistakes and exercises with answers.`;
  const url = `${SITE_URL}/book/${track}/${chapter}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", siteName: "Etudo" },
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function BookChapterPage({
  params,
}: {
  params: Promise<{ track: string; chapter: string }>;
}) {
  const { track, chapter } = await params;
  const c = await load(track, chapter);
  if (!c) notFound();

  const user = await getCurrentUser();
  const gate = await chapterGate(c.id, user?.id ?? null);

  const topics = c.lessons.map((l) => {
    let blocks: any[] = [];
    try { blocks = JSON.parse(l.contentJson || "[]"); } catch {}
    return { slug: l.slug, title: l.title, blocks };
  });

  return (
    <div className="book subject-tint" style={subjectStyle(c.track.slug)}>
      <header className="bk-top">
        <Link href={`/book/${track}`} className="bk-back">← {subjectName(c.track.title, c.track.slug)} contents</Link>
        {gate.allowed ? (
          <PrintButton label="Download / Save as PDF" />
        ) : (
          <span className="bk-locked-pill">🔒 Download locked</span>
        )}
      </header>

      <div className="bk-cover">
        <div className="bk-brand mono">Etudo</div>
        <span className="subject-pill">{subjectName(c.track.title, c.track.slug)}</span>
        <h1>{c.title}</h1>
        {c.summary && <p className="bk-sub">{c.summary}</p>}
        <p className="bk-meta">
          {topics.length} topic{topics.length === 1 ? "" : "s"} · free to read
        </p>
      </div>

      {/* Reading is never gated — only the download is. The notes are public and
          are what search indexes; locking the reading would cost the platform its
          growth channel to enforce a rule about collecting PDFs. */}
      {!gate.allowed && (
        <div className="bk-gate">
          <h4>🔒 Read it here, download it once you have practised</h4>
          {gate.needsAccount ? (
            <>
              <p>
                Downloading is for students who are working through the material. Create a free
                account, finish this chapter&apos;s topics and solve their practice problems, and the
                PDF unlocks.
              </p>
              <Link className="btn btn-primary" href="/signup">Create free account →</Link>
            </>
          ) : (
            <>
              <p>
                You have read <b>{gate.topicsRead} of {gate.topicsTotal}</b> topics and solved{" "}
                <b>{gate.problemsSolved} of {gate.problemsRequired}</b> of the practice problems
                this chapter asks for. Finish those and the download opens.
              </p>
              <Link className="btn btn-primary" href={`/learn/${topics[0]?.slug ?? ""}`}>
                Continue the chapter →
              </Link>
            </>
          )}
        </div>
      )}

      {topics.length > 1 && (
        <nav className="bk-toc">
          <h4>Topics in this chapter</h4>
          <ol>
            {topics.map((t) => (
              <li key={t.slug}><a href={`#${t.slug}`}>{t.title}</a></li>
            ))}
          </ol>
        </nav>
      )}

      {topics.length === 0 ? (
        <p className="bk-empty">
          This chapter has no written topics yet — it fills in the moment the first one is written.{" "}
          <Link href={`/book/${c.track.slug}`}>Read the written chapters →</Link>
        </p>
      ) : (
        topics.map((t, i) => (
          <BookChapter key={t.slug} n={i + 1} title={t.title} blocks={t.blocks} slug={t.slug} track={c.track.slug} />
        ))
      )}

      <footer className="bk-foot">
        <p>
          Want to run this code and have it checked? The same material is interactive at{" "}
          <Link href={`/learn/${topics[0]?.slug ?? ""}`}>Etudo lessons</Link>.
        </p>
        <span className="mono">Etudo</span> · <Link href="/terms">Terms</Link> ·{" "}
        <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
