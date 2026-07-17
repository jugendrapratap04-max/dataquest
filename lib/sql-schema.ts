// Pull table names + columns out of a problem's setup SQL, so the workbench can
// show students what tables exist without running anything.
//
// It's a regex over CREATE TABLE, which is fine for the setups we actually ship
// (verified column-for-column against SQLite's own PRAGMA table_info) but would
// drift on genuinely gnarly DDL — nested parens in a CHECK, say. Rather than
// rewrite a parser that's correct for the real content, `npm run db:check`
// compares this function's output against what SQLite reports for every SQL
// problem, so the day a setup outgrows it, the check says so instead of the
// schema panel quietly lying to a student.
//
// It lives here rather than inside SqlWorkbench so the workbench and the checker
// read the same code — a copy in the checker would be a copy that drifts.

export type SqlTable = { name: string; cols: string[] };

export function readSchema(setup: string): SqlTable[] {
  const out: SqlTable[] = [];
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\)\s*;/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(setup))) {
    const cols = m[2]
      .split(/,(?![^(]*\))/)
      .map((c) => c.trim().split(/\s+/).slice(0, 2).join(" "))
      .filter((c) => c && !/^(primary|foreign|unique|check|constraint)\b/i.test(c));
    out.push({ name: m[1], cols });
  }
  return out;
}
