// A subject's visual identity.
//
// Jugendra's vision doc asks for every subject to look like its own place, so
// that moving from Python to Java feels like moving rooms rather than swapping
// text. This is the cheap, safe half of that: one hue per subject, applied as a
// CSS variable, with light and dark handled by CSS rather than by us.
//
// It is deliberately a HUE and not a colour pair. A colour pair would need a
// dark-mode twin written by hand for every subject, and a new subject would mean
// new CSS. A hue is one number, the stylesheet derives the rest, and an unknown
// slug still gets a stable colour of its own — so adding a subject needs no code
// change at all, which is the rule in docs/ARCHITECTURE.md.

const HUES: Record<string, number> = {
  python: 38, // amber — the brand colour, since Python is the first subject
  statistics: 172, // teal
  pandas: 258, // violet
  viz: 322, // pink
  sql: 214, // blue
  bi: 18, // orange
  ml: 148, // green
  dl: 284, // purple
  deploy: 196, // cyan
  microprocessor: 88, // lime — the first subject that is not data science
};

/** A stable hue (0-359) for any subject slug, pinned for the ones that exist. */
export function subjectHue(slug: string): number {
  const pinned = HUES[slug];
  if (pinned !== undefined) return pinned;
  // Deterministic, so the same new subject always gets the same colour, and two
  // different ones are unlikely to collide.
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

/** Inline style carrying the subject's hue to the CSS. Spread onto an element
 *  that also has the `subject-tint` class. */
export function subjectStyle(slug: string): React.CSSProperties {
  return { ["--sub-h" as string]: String(subjectHue(slug)) };
}

// Short display labels. A pill has room for one or two words, and several track
// titles are a sentence — "Business Intelligence & Dashboards", "Deployment,
// Portfolio & Job Prep". This is display text only, not behaviour, and anything
// not listed still gets a sensible label from the rules below, so a new subject
// works without touching this.
//
// When subjects become editable, this belongs in a column on the subject rather
// than in code.
const SHORT: Record<string, string> = {
  python: "Python",
  statistics: "Statistics",
  pandas: "Pandas",
  viz: "Visualization",
  sql: "SQL",
  bi: "BI",
  ml: "Machine Learning",
  dl: "Deep Learning",
  deploy: "Deployment",
  microprocessor: "Microprocessor",
};

/** A short label for a subject: the pinned one, else derived from the title.
 *  "Programming Foundations — Python" -> "Python";
 *  "Deployment, Portfolio & Job Prep" -> "Deployment". */
export function subjectName(title: string, slug?: string): string {
  if (slug && SHORT[slug]) return SHORT[slug];
  const afterDash = title.split(" — ").pop() ?? title;
  // Titles that list several things are cut at the first separator.
  const head = afterDash.split(/\s+&\s+|,\s*/)[0].trim();
  return head || afterDash;
}
