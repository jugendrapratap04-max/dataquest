// Shared bits for page metadata and the sitemap.
//
// Every lesson page used to inherit the root layout's single title and
// description, so all 83 of them looked to a search engine like 83 copies of the
// homepage — and /robots.txt and /sitemap.xml both 404'd. For a free platform
// whose only realistic growth channel is search, that was the whole channel,
// switched off. The lessons were already public and server-rendered; they just
// weren't described.

/** Absolute origin, needed for canonical URLs and the sitemap. Vercel sets
 *  VERCEL_PROJECT_PRODUCTION_URL on every deployment of a production project. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://dataquest-navy.vercel.app");

/** Lesson bodies are HTML fragments. A description with markup in it is worse
 *  than no description, so strip tags and collapse whitespace. */
export function plainText(html: string): string {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Clamp to a length search engines will actually show, on a word boundary. */
export function clamp(s: string, max = 155): string {
  const t = plainText(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "") + "…";
}
