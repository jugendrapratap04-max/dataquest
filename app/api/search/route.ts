import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search-index";

// Lightweight search index: lessons, their TOPICS, and problems.
//
// Public on purpose. It used to 401 for signed-out visitors while the topbar
// still rendered the search box for them — so a guest browsing the lessons (which
// are public, and are our whole try-before-signup pitch) typed a query, got
// "Nothing found", and fired two 401s per page load. Nothing here is private:
// every title and slug it returns is reachable without an account.
//
// Topics are the reason this file grew a lib. Matching lesson titles alone made
// most of the course unfindable — "frozenset", "deque" and "popleft" are all
// taught and none of them appears in any lesson title — and a term that did
// match dropped the student on topic 1 of eighteen. See lib/search-index.ts for
// why it indexes code identifiers rather than the prose.
export async function GET() {
  const data = await buildSearchIndex();

  return NextResponse.json(data, {
    // The index changes only when db:lessons or db:content runs. Letting the
    // browser reuse it for a few minutes costs nothing and keeps the search box
    // instant on every page after the first.
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
  });
}
