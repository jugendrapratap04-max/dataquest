// Small guards for reading a request body.
//
// Two bugs kept recurring in the API routes and both are fixed here rather than
// route by route:
//
// 1. `await req.json()` throws on a malformed body, and an unhandled throw in a
//    route handler is a 500. `curl -X POST /api/auth/login -d 'x'` was enough.
// 2. A JSON body can carry an *object* where a route expects an id, and Prisma
//    happily reads that object as a filter. `{"id":{"not":""}}` on the notes
//    DELETE route turned "delete this note" into "delete all my notes".

/** Parse a JSON body, or an empty object if it isn't one. Never throws. */
export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const v: unknown = await req.json();
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** A client-supplied id, coerced to a string. Anything that isn't a string
 *  becomes "" — which matches no row — instead of reaching Prisma as a filter. */
export function idOf(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** A client-supplied string, trimmed and length-capped. */
export function textOf(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
