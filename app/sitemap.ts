import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

// /sitemap.xml used to 404, so nothing told a search engine that 83 lessons and
// 156 problems existed at all. Only genuinely public URLs go in here — the
// signed-in pages are listed in robots.ts as disallowed instead.
//
// lastModified is deliberately omitted: Lesson and Problem carry no updatedAt,
// and a made-up date is worse than none.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    // The page that explains what this is. It was `/` until the front door
    // moved to the dashboard; a redirect is not something to index, so the
    // prose it used to carry is listed here on its own.
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/book`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/learn`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/practice`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/roadmap`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/guidelines`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const [lessons, problems, tracks, chapters] = await Promise.all([
      prisma.lesson.findMany({ select: { slug: true } }),
      prisma.problem.findMany({ select: { slug: true } }),
      prisma.track.findMany({ select: { slug: true } }),
      // The notes moved from one page per subject to one page per chapter, so
      // the chapter URLs are where that content now lives. Same filter as the
      // subject page: a chapter plan names chapters whose lessons are not
      // written yet, and advertising those URLs sends searchers to a page that
      // says "no written topics yet". They join the sitemap when a lesson lands.
      prisma.chapter.findMany({
        where: { lessons: { some: {} } },
        select: { slug: true, track: { select: { slug: true } } },
      }),
    ]);

    return [
      ...staticPages,
      ...tracks.map((t) => ({
        url: `${SITE_URL}/book/${t.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...chapters.map((c) => ({
        url: `${SITE_URL}/book/${c.track.slug}/${c.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...lessons.map((l) => ({
        url: `${SITE_URL}/learn/${l.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.9,
      })),
      ...problems.map((p) => ({
        url: `${SITE_URL}/practice/${p.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    // A database blip must not make the sitemap a 500 — serve what we know.
    return staticPages;
  }
}
