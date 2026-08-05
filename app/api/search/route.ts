import { NextResponse } from "next/server";
import { search } from "@/lib/search-index";

// Search: lesson topics, whole lessons, and problems.
//
// Public on purpose. It used to 401 for signed-out visitors while the topbar
// still rendered the search box for them — so a guest browsing the lessons (which
// are public, and are our whole try-before-signup pitch) typed a query, got
// "Nothing found", and fired two 401s per page load. Nothing here is private:
// every title and slug it returns is reachable without an account.
//
// This used to hand the browser the entire index to filter locally, which capped
// what could be searched at whatever fitted in a download — titles, then titles
// plus a few code identifiers. Anything a student typed that nobody had thought
// to index simply did not exist. Searching here instead removes that ceiling:
// the full text of every topic stays in this process, the browser downloads
// nothing up front, and a query comes back with eight small rows.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const results = await search(q);

  return NextResponse.json(
    { results },
    // Same query, same answer until content changes. Worth caching: a student
    // backspacing over a word re-sends queries they have already made.
    { headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=600" } },
  );
}
