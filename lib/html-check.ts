/* Grading for HTML practice problems.
 *
 * WHY THIS EXISTS AT ALL. Every other track on this platform grades by running
 * code and comparing a value: python calls a function and diffs the return,
 * sql diffs a result set, 8085 reads registers. HTML has no return value. What
 * a student writes produces a *rendered document*, so the only honest question
 * to ask of it is "is the right thing in the page?" — which means asserting
 * against the parsed DOM.
 *
 * WHY THE ASSERTIONS ARE DATA AND NOT CODE. A test is a small object, not a
 * function, so the same list runs in two places that cannot share a runtime:
 * the browser workbench (native DOMParser) and `npm run db:check` (linkedom,
 * a devDependency). Both hand this file a Document and get the same verdict.
 * A test written as a closure could only ever run in one of them.
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It does not check whitespace, attribute
 * order, indentation, or how the markup was spelt. Two students who both put a
 * heading and three list items on the page have both solved the problem, and a
 * grader that disagrees is teaching them to copy rather than to build.
 */

/** One assertion against the student's rendered document. */
export type HtmlTest = {
  /** CSS selector the assertion is about. */
  find: string;
  /** Plain-English description shown in the results panel. Required: an
   *  assertion a student cannot read is a failure they cannot act on. */
  says: string;

  /** Must match at least once. Default when nothing else is given. */
  exists?: boolean;
  /** Must match exactly this many times. */
  count?: number;
  /** Must match at least this many times — for "add some list items". */
  atLeast?: number;

  /** Read this attribute rather than the element itself. */
  attr?: string;
  /** The attribute (or text) must equal this, trimmed, case-insensitively. */
  equals?: string;
  /** The attribute (or text) must contain this, trimmed, case-insensitively. */
  contains?: string;
  /** The attribute (or text) must be present and not blank. */
  notEmpty?: boolean;

  /** Compare the element's visible text instead of an attribute. */
  text?: boolean;
};

export type HtmlResult = { pass: boolean; says: string; detail: string };

/** The subset of Document this file needs. Typed structurally so linkedom's
 *  document and the browser's both satisfy it without either being imported. */
type Queryable = {
  querySelectorAll: (sel: string) => ArrayLike<{
    getAttribute: (name: string) => string | null;
    textContent: string | null;
  }>;
};

const norm = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
const same = (a: string, b: string) => norm(a).toLowerCase() === norm(b).toLowerCase();

/** Run one assertion. Never throws: a malformed selector is a failed test with
 *  a readable reason, not a crash that takes the whole panel down. */
export function runHtmlTest(doc: Queryable, t: HtmlTest): HtmlResult {
  let nodes: ArrayLike<{ getAttribute: (n: string) => string | null; textContent: string | null }>;
  try {
    nodes = doc.querySelectorAll(t.find);
  } catch {
    return { pass: false, says: t.says, detail: `"${t.find}" is not a valid selector` };
  }
  const n = nodes.length;
  const found = `found ${n} \`${t.find}\``;

  if (typeof t.count === "number") {
    return { pass: n === t.count, says: t.says, detail: n === t.count ? found : `${found}, expected ${t.count}` };
  }
  if (typeof t.atLeast === "number") {
    return { pass: n >= t.atLeast, says: t.says, detail: n >= t.atLeast ? found : `${found}, expected at least ${t.atLeast}` };
  }

  if (n === 0) return { pass: false, says: t.says, detail: `no \`${t.find}\` in the page` };

  // Value assertions pass when ANY matching element satisfies them — a page
  // with three links only needs one of them to be the mailto: link.
  if (t.attr || t.text || t.equals || t.contains || t.notEmpty) {
    const values = Array.from({ length: n }, (_, i) => {
      const el = nodes[i];
      return t.attr ? el.getAttribute(t.attr) : el.textContent;
    });
    const what = t.attr ? `\`${t.attr}\`` : "text";

    if (t.notEmpty) {
      const ok = values.some((v) => norm(v).length > 0);
      return { pass: ok, says: t.says, detail: ok ? `${what} is filled in` : `${what} is empty on every \`${t.find}\`` };
    }
    if (t.equals !== undefined) {
      const ok = values.some((v) => same(v ?? "", t.equals!));
      return { pass: ok, says: t.says, detail: ok ? `${what} matches` : `${what} is ${JSON.stringify(values.map(norm))}, expected "${t.equals}"` };
    }
    if (t.contains !== undefined) {
      const needle = norm(t.contains).toLowerCase();
      const ok = values.some((v) => norm(v).toLowerCase().includes(needle));
      return { pass: ok, says: t.says, detail: ok ? `${what} contains it` : `no \`${t.find}\` has "${t.contains}" in its ${what}` };
    }
  }

  return { pass: true, says: t.says, detail: found };
}

export function gradeHtml(doc: Queryable, tests: HtmlTest[]): { results: HtmlResult[]; passed: number; total: number } {
  const results = tests.map((t) => runHtmlTest(doc, t));
  return { results, passed: results.filter((r) => r.pass).length, total: results.length };
}

/** Every test must name a selector and say what it is checking in words. A test
 *  with no `says` produces a red cross a student cannot learn anything from. */
export function validateHtmlTests(tests: unknown): string | null {
  if (!Array.isArray(tests) || tests.length === 0) return "no test cases";
  for (const [i, t] of tests.entries()) {
    const x = t as HtmlTest;
    if (!x || typeof x.find !== "string" || !x.find.trim()) return `test ${i + 1} has no \`find\` selector`;
    if (typeof x.says !== "string" || !x.says.trim()) return `test ${i + 1} has no \`says\` — a failed check must be readable`;
  }
  return null;
}
