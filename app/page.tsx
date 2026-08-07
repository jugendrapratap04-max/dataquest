import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { highlightPython } from "@/lib/highlight";

// The public front door. Anyone who arrives without an account sees what's
// inside before being asked for anything — until now the link went straight to
// a login wall, so nobody could tell whether it was worth signing up for.
//
// No database work for a visitor: with no session cookie getCurrentUser()
// returns null on the signature check alone, and the numbers below are static.
// A cold database must never be the first thing a new student waits on.

// The headline numbers were typed in by hand and had already drifted — the page
// advertised 82 lessons while the database held 83, and every lesson written
// widens the gap. Counted for real now, but cached for an hour and wrapped in a
// fallback, because the rule above still holds: a visitor must never wait on a
// cold database, and a database hiccup must not take the front door down.
const FALLBACK_COUNTS = { lessons: 83, problems: 156, subjects: 9 };

const getLandingCounts = unstable_cache(
  async () => {
    // The subject count was typed into the page as "9" and stayed there while
    // two more subjects were finished and shipped, so the front door advertised
    // nine and the roadmap listed eleven. Counted like the other two now — only
    // subjects that actually have lessons, since an empty track is not a
    // subject anyone can start.
    const [lessons, problems, subjects] = await Promise.all([
      prisma.lesson.count(),
      prisma.problem.count(),
      prisma.track.count({ where: { lessons: { some: {} } } }),
    ]);
    return { lessons, problems, subjects };
  },
  ["landing-counts"],
  { revalidate: 3600 }
);

const SAMPLE = `# Real Python. Runs right here, in your browser.
marks = [72, 85, 91, 64]
average = sum(marks) / len(marks)

print(f"Class average: {average}")`;

const REASONS = [
  {
    k: "01",
    title: "You write the code",
    body: "No videos to sit through. You type real Python, run it, and tests check your answer the moment you submit — the way you actually learn to code.",
  },
  {
    k: "02",
    title: "Concepts you can see",
    body: "Slicing, loops, objects, exceptions — each one has a small interactive visual you can play with, so the idea clicks instead of being memorised.",
  },
  {
    k: "03",
    title: "The traps, before you fall in",
    body: "Every lesson shows the mistakes beginners actually make, why they happen, and the fix — plus the interview questions asked on that topic.",
  },
  {
    k: "04",
    title: "Pointed at a job",
    body: "Every topic says where it's used in real data work. The roadmap runs from your first variable to a deployed project, one subject at a time.",
  },
];

const FLOW = [
  { n: "Understand", d: "A question worth answering, a clear definition, and where it's used at work." },
  { n: "See it", d: "An interactive visual — change the input, watch what happens." },
  { n: "Practice", d: "Write real code. Tests check it instantly and pay you XP." },
  { n: "Prove it", d: "A three-level quiz that only clears if the concept truly landed." },
];

/* The list under "The full road, start to finish" — which was nine of eleven.
   HTML (35 lessons) and the microprocessor course (19) were both finished and
   both missing, so the page promised the full road and left two subjects off
   it. Hardcoded still, because the order is editorial rather than the `order`
   column — but it has to be COMPLETE. Add a subject here when you ship one. */
const TRACKS = [
  "Python", "Statistics", "Data Manipulation", "Data Visualization", "SQL",
  "BI Tools", "Machine Learning", "Deep Learning", "Deployment",
  "Microprocessor", "HTML",
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  let counts = FALLBACK_COUNTS;
  try {
    counts = await getLandingCounts();
  } catch {
    // Keep the last known-good numbers rather than rendering a broken hero.
  }

  return (
    <div className="lp">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="lp-nav">
        <div className="lp-brand">
          <div className="mark">D</div>
          <span className="wm">Etudo</span>
          <span className="beta">BETA</span>
        </div>
        <nav className="lp-navlinks">
          <Link href="/login" className="lp-link">Sign in</Link>
          <Link href="/signup" className="btn btn-primary lp-navcta">Start free</Link>
        </nav>
      </header>

      {/* The landing page had a header, sections and a footer, and no <main>.
          Assistive technology uses it to answer "where does the content start" —
          without one there is nothing to jump to, and the reader tabs through
          the whole nav on every visit. */}
      <main id="main" tabIndex={-1}>
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <div className="lp-eyebrow">Free · Nothing to install · Runs in your browser</div>
          <h1>Learn data science by <em>writing</em> the code.</h1>
          <p className="lp-sub">
            Python, statistics, SQL and pandas — taught with visuals that make concepts click,
            practice that&apos;s checked the second you submit, and the mistakes and interview
            questions nobody warns you about.
          </p>
          <div className="lp-cta">
            <Link href="/signup" className="btn btn-primary lp-big">Start learning free →</Link>
            <Link href="/login" className="btn btn-ghost lp-big">I have an account</Link>
          </div>
          <div className="lp-trust">No credit card. No installation. Your progress saves as you go.</div>
        </div>

        <div className="lp-hero-demo">
          <div className="code">
            <div className="bar">
              <span className="dot" style={{ background: "#FF5F57" }} />
              <span className="dot" style={{ background: "#FEBC2E" }} />
              <span className="dot" style={{ background: "#28C840" }} />
              <span className="fn">first_lesson.py</span>
            </div>
            <pre dangerouslySetInnerHTML={{ __html: highlightPython(SAMPLE) }} />
            <div className="out">Output:<br /><b>Class average: 78.0</b></div>
          </div>
          <div className="lp-demo-note">↑ This is the actual editor you&apos;ll use — no setup, no downloads.</div>
        </div>
      </section>

      <section className="lp-stats">
        <div><b className="num">{counts.lessons}</b><span>lessons</span></div>
        <div><b className="num">{counts.problems}</b><span>practice problems</span></div>
        <div><b className="num">{counts.subjects}</b><span>subjects on the path</span></div>
        <div><b className="num">₹0</b><span>to learn everything</span></div>
      </section>

      <section className="lp-sec">
        <h2 className="lp-h2">Why this works better than watching tutorials</h2>
        <div className="lp-reasons">
          {REASONS.map((r) => (
            <div className="lp-reason" key={r.k}>
              <div className="lp-rk">{r.k}</div>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-sec">
        <h2 className="lp-h2">How every lesson goes</h2>
        <div className="lp-flow">
          {FLOW.map((f, i) => (
            <div className="lp-step" key={f.n}>
              <div className="lp-stepn">{i + 1}</div>
              <div>
                <h3>{f.n}</h3>
                <p>{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-sec">
        <h2 className="lp-h2">The full road, start to finish</h2>
        <p className="lp-secsub">Nine tracks in order. Start at the very beginning — no prior coding needed.</p>
        <div className="lp-tracks">
          {TRACKS.map((t, i) => (
            <div className="lp-track" key={t}>
              <span className="lp-tn">{String(i + 1).padStart(2, "0")}</span>{t}
            </div>
          ))}
        </div>
      </section>

      <section className="lp-final">
        <h2>Your first program is five minutes away.</h2>
        <p>Make an account, open the first lesson, and write something that runs today.</p>
        <Link href="/signup" className="btn btn-primary lp-big">Start learning free →</Link>
      </section>
      </main>

      <footer className="lp-foot">
        <span className="mono">Etudo</span> — learn it, practise it, build with it.
        <br />
        <Link href="/book">Free written notes</Link> · <Link href="/guidelines">Community Guidelines</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
