/* The one rule that keeps re-reading a finished lesson from un-finishing it.
 *
 * Pure, so it runs without a database, a session or a server — which matters,
 * because the failing case is a WRITE against real progress and is not
 * something to discover in production.
 *
 *   node --experimental-strip-types scripts/test-lesson-status.mjs
 */
import { resolveStatus } from "../lib/lesson-status.ts";

let pass = 0;
let fail = 0;

const is = (label, got, want) => {
  const ok = got === want;
  if (ok) pass++;
  else fail++;
  console.log(
    `${ok ? "ok  " : "FAIL"}  ${label.padEnd(52)} ${got}${ok ? "" : "   (wanted " + want + ")"}`
  );
};

console.log("-- the floor: done never walks backwards --");
is("done, asked for in_progress", resolveStatus("done", "in_progress"), "done");
is("done, asked for done", resolveStatus("done", "done"), "done");

console.log("-- everything else is the caller's to decide --");
is("no row yet, opening the lesson", resolveStatus(null, "in_progress"), "in_progress");
is("no row yet, finishing it outright", resolveStatus(null, "done"), "done");
is("in_progress, opened again", resolveStatus("in_progress", "in_progress"), "in_progress");
is("in_progress, now finished", resolveStatus("in_progress", "done"), "done");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
