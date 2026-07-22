/* Turns a lesson's content blocks into an outline: one entry per section, each
 * with its own honest time estimate.
 *
 * "Honest" matters — a made-up "3 min" next to a section that takes ten is worse
 * than no number at all. Every figure here is derived from the actual content:
 * words are counted from the real text, and interactive blocks add the time they
 * actually take to work through, not to skim. */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Block = Record<string, any> & { t: string };

// Technical prose read by a beginner, not a skim of a blog post.
const WPM = 170;

// Seconds a block costs beyond reading its words — the thinking and typing.
const EFFORT: Record<string, number> = {
  code: 20, viz: 45, worked: 60, faded: 90, trace: 90, debug: 60, think: 15,
};
// Seconds per item for blocks that are lists of things to do.
const PER_ITEM: Record<string, number> = {
  drills: 25, quiz: 25, mistakes: 15, interview: 15, dtypes: 5, objectives: 0, recap: 3,
};

// Sections a student navigates to that are not <h2> headings — the practice and
// wrap-up blocks. Listing them in the outline is the point: a student can see
// there is a quiz waiting, and jump straight to it on a second visit.
const LANDMARKS: Record<string, string> = {
  worked: "Worked example",
  faded: "Fill the blanks",
  trace: "Trace the code",
  drills: "Try these yourself",
  mistakes: "Common mistakes",
  debug: "Find the bug",
  recap: "Recap",
  interview: "Interview questions",
  quiz: "Check your understanding",
};

const stripTags = (s: string) => s.replace(/<[^>]*>/g, " ");

/** Every human-readable string in a block, however deeply nested. */
function words(v: any): number {
  if (typeof v === "string") return stripTags(v).split(/\s+/).filter(Boolean).length;
  if (Array.isArray(v)) return v.reduce((n, x) => n + words(x), 0);
  if (v && typeof v === "object") return Object.entries(v).reduce((n, [k, x]) => (k === "t" ? n : n + words(x)), 0);
  return 0;
}

// Blocks a student reads straight through. Everything else — code, the ladder,
// drills, mistakes, interview answers, the quiz — is worked through, not read,
// so its words count towards practice time rather than reading time.
const PROSE = new Set(["h2", "p", "psoft", "note", "def", "hook", "think", "analogy", "recap", "dtypes", "objectives"]);

/** Split deliberately: reading time and doing time are different promises. A
 *  student who sees one big number assumes it is all reading and leaves. */
function seconds(b: Block): { read: number; work: number } {
  const items = Array.isArray(b.items) ? b.items.length : Array.isArray(b.steps) ? b.steps.length : 0;
  const text = words(b) / WPM * 60;
  const effort = (EFFORT[b.t] ?? 0) + (PER_ITEM[b.t] ?? 0) * items;
  return PROSE.has(b.t) ? { read: text + effort, work: 0 } : { read: 0, work: text + effort };
}

export type OutlineEntry = { id: string; label: string; n?: string; minutes: number; kind: "section" | "landmark" };

/** Outline entries plus the anchor id for each block index, so the renderer can
 *  stamp matching ids on the elements the outline links to. */
export function lessonOutline(blocks: Block[]) {
  const anchors = new Map<number, string>();
  const entries: (OutlineEntry & { read: number; work: number })[] = [];

  blocks.forEach((b, i) => {
    const isSection = b.t === "h2";
    const landmark = LANDMARKS[b.t];
    // Only the first block of a run counts as a landmark: a lesson with three
    // `code` blocks in a row should not sprout three outline entries.
    const isNew = isSection || (landmark && entries[entries.length - 1]?.label !== landmark);
    if (isNew) {
      const id = `sec-${entries.length + 1}`;
      anchors.set(i, id);
      entries.push({
        id,
        label: isSection ? b.text : landmark!,
        n: isSection ? b.n : undefined,
        kind: isSection ? "section" : "landmark",
        minutes: 0,
        read: 0,
        work: 0,
      });
    }
    if (!entries.length) {
      // Blocks before the first heading (hook, think, definition) are the warm-up.
      anchors.set(i, "sec-1");
      entries.push({ id: "sec-1", label: "Start here", kind: "section", minutes: 0, read: 0, work: 0 });
    }
    const s = seconds(b);
    const cur = entries[entries.length - 1];
    cur.read += s.read;
    cur.work += s.work;
  });

  const mins = (secs: number) => Math.max(1, Math.round(secs / 60));
  const outline: OutlineEntry[] = entries.map(({ read, work, ...e }) => ({ ...e, minutes: mins(read + work) }));
  const readMinutes = mins(entries.reduce((n, e) => n + e.read, 0));
  const workMinutes = Math.round(entries.reduce((n, e) => n + e.work, 0) / 60);
  return { outline, anchors, readMinutes, workMinutes, total: readMinutes + workMinutes };
}
