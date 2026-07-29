import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// /robots.txt used to 404. Crawlers are pointed at the sitemap and kept off the
// pages that are personal (a dashboard, someone's notes) or useless to index (a
// room that exists for an hour, the API).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/progress",
        "/notes",
        "/resume",
        "/certificates",
        "/leaderboard",
        "/focus",
        "/rooms",
        "/feedback",
        "/login",
        "/signup",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
