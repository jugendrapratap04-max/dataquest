# Read this before designing anything

**Etudo is not a Python course and not a Data Science platform.** It is a
multi-subject learning ecosystem. Python is only the first subject — the one
that happens to be finished.

Before you design a schema, a service or a screen, read
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). The short version:

- The model is **Subject → Chapter → Topic → { lesson, visualization, quiz, problems }**.
  In the schema, `Track` is the Subject and `Lesson` is the Topic. **`Chapter`
  exists** (migration `20260729180000_add_chapter`) and is maintained by
  `npm run db:chapters`.
- Every subject uses the same engine: Learn → Visualize → Practice → Quiz →
  Revision → Projects → Career Path. AI guidance is designed but deliberately
  unbuilt — it is the only thing on the platform with a running cost.
- A subject may bring its own compiler or simulator, or none. Progress, XP and
  revision work identically across all of them.
- **Do not hardcode anything to Python or Data Science.** The four places that
  used to are fixed: language config lives in `lib/languages.ts`, subject
  identity in `lib/subjects.ts`. Adding a language should be one entry there.

## Never claim it works without running it

Each of these tools exists because the thing it checks had already shipped
broken at least once.

| Command | Catches |
|---|---|
| `npm run db:check` | A reference solution that fails its own tests; markup in a plain-text field; quiz answers clustered on one option |
| `npm run verify:lesson -- <track> <slug>` | Any code block, drill, trace step or debug snippet whose claimed output is not what Python actually prints |
| `npm run syllabus` | Lessons below the full standard — including **too few practice problems** |
| `npm run test:errors` / `npm run test:sql-help` | An error-explanation rule written against a message the engine does not actually produce |
| `npm run test:sklearn` | A vendored wheel that does not import or behave inside Pyodide |

**Content reaches students the moment `db:lessons` / `db:content` runs — that is
the live database.** Only component and library changes need a Vercel deploy.

## Traps that have cost real time

- **`upto` in `apply-chapters.mjs` is a lesson ORDER.** Inserting a lesson
  mid-track silently moves every later lesson into the wrong chapter, and
  anything past the final boundary gets no chapter at all and disappears from
  `/book` while looking correct in every other view.
- **Quiz `options` is a plain-text field.** Markup there renders literally.
- **Trace line numbers** are the most self-inflicted failure in this repo. Count
  the code string — blank and nested lines included — before writing "After line N".
- **A `worked` step's `code` is one incremental line.** The verifier concatenates
  the steps and runs the result, so repeating the whole function in each step
  parses fine alone and fails when joined.
- **Never return a dict from a practice problem.** It arrives in JS as a Map and
  `JSON.stringify(Map)` is `"{}"`, so grading silently passes every wrong answer.
  A set is unsafe too — no guaranteed order. Return scalars, strings, booleans
  or lists.
- **Nothing random, timed, or carrying a memory address** in a verifiable snippet.
- **`db:reset` wipes every student's progress.** Use `db:lessons` / `db:content`.

## Every content session pays down one platform problem

Content and platform work are not separate jobs here. A batch of lessons that
ships while the quality list sits untouched is how that list got long in the
first place — it was 12 categories deep before anyone looked at it, and the
things on it were not hard, only unowned.

**So: every time you write or edit lessons, finish by taking ONE item off the
list below.** One, not all of them. It is meant to be small enough that it
never competes with the content.

Rules that make this work rather than become theatre:

- **Measure, do not eyeball.** Every fix already made here came from a number —
  a 121px step between blocks, a 3.30:1 contrast ratio, a 232 KB chunk on a page
  that rendered none of it. If you cannot produce a before number, you cannot
  claim an after one.
- **Verify the fix, then re-check what it touched.** Making the topbar title a
  `<div>` fixed "two h1s" and gave four pages zero h1, which is worse. The
  second measurement is not optional.
- **Do not invent work.** `DataFrameAnatomy`'s clickable cells look like a
  keyboard trap and are not — real buttons for the same three selections sit
  under the table. Breaking something that works to pad a report is worse than
  skipping it.
- **Write down what you did NOT check.** A quality pass that reports only wins
  is a quality pass nobody can trust.

### The list (take one per session, cross it off, add what you find)

- [x] ~~Responsive sweep~~ — done on the lesson page at 320, 375, 425, 768,
      1024 and 1440: no page-level horizontal scroll at any of them, and one
      left edge throughout (30px on phones, 262px once the rail appears, with
      the 760px measure holding at 1440). 1280 was not measured directly; it
      sits between two widths that behave identically. **Only the lesson page** —
      practice, profile and the dashboard have not been swept
- [ ] Screen-reader pass. Lighthouse scores 100 on accessibility; that is not
      the same as NVDA or VoiceOver being usable
- [x] ~~Keyboard walk of one real flow~~ — done 2026-08-07 on the lesson page,
      with real Tab presses through Chrome over CDP, reading
      `document.activeElement` at every stop. **What passed, and it is worth
      recording as a pass**: over 26 stops, every focused element painted a
      visible ring, every one had an accessible name, and nothing focusable sat
      inside an `aria-hidden` subtree.
      **Two faults, both fixed.** (1) `id="main"` was on a `<main>` whose first
      child was the Topbar, so "Skip to content" landed the next Tab on the
      **search input** — the link worked and skipped nothing, and 26 stops in,
      the walk still had not reached the lesson. The topbar is now outside
      `<main>`, and both `<main>`s carry `tabIndex={-1}` so activating the link
      MOVES focus rather than only moving the sequential-focus starting point
      (before: focus went to the body, so nothing was announced at the moment
      the user acted). (2) The two `position:fixed` floating buttons rendered
      before the sidebar, putting "Focus reading" at tab stop 2 and causing a
      718px jump back up. Moved to the end: **backwards jumps 2 → 0.**
      **NOT checked:** focus return after a dialog, and Escape on overlays —
      the lesson page has neither. Whoever takes the modal/drawer flows next
      still owes those two.
- [ ] Animation and scroll jank — never once looked at
- [x] ~~Loading and error states on every page that fetches~~ — done 2026-08-07,
      prioritised by measurement rather than by taste.
      **ERROR:** there was exactly one `error.tsx` and it was the ROOT boundary,
      so a failure on any signed-in page replaced the whole document — sidebar
      and topbar included — making one broken query look like the site was down
      and removing the navigation needed to escape it. `app/(app)/error.tsx` now
      sits inside the layout: the shell survives, only the content area is
      replaced, nearest boundary wins.
      **LOADING:** seven pages call `getProgress()` — the query that loads every
      track with every lesson and problem, and the reason the dashboard felt
      broken before it had a skeleton. **Five of the seven had none**: profile,
      progress, certificates, one certificate, a public profile. All five now
      have one shaped like the page. **7 of 7 covered.** Verified live rather
      than assumed — the streamed first response carries 15, 9 and 8 skeleton
      blocks on /progress, /profile and /certificates.
      **STILL OPEN — the EMPTY half of this item.** There are already 14
      `*-empty` classes (`bk-empty`, `prof-empty`, `room-empty`, `search-empty`
      and so on), so empty states exist in places and were not audited one by
      one. Nobody has checked that each says what would be there and offers one
      action, which is what DESIGN-SYSTEM.md asks for
- [x] ~~Dead-code sweep~~ — done 2026-08-07, and it is now **`npm run dead-code`**
      so it can be re-run instead of remembered. Four checks: custom properties
      used-but-undefined, defined-but-unused, orphan components, unreferenced
      classes.
      **The real finds were the variables, not the classes.** `--fg` (17 uses),
      `--card` (6) and `--muted` (18) were used across the stylesheet and
      **defined nowhere**, so every one of those declarations was invalid and
      the element silently inherited. Measured in a browser: `.lt` asked for
      `background:var(--card)` and computed to `rgba(0,0,0,0)` — the topic-list
      card had no background at all. All three are now defined beside the token
      they alias, in **all six theme blocks**. `--code-fg` was a rename leftover
      for `--code-ink`; it had a fallback so it was phantom rather than broken.
      **Removed:** 18 lines — the old `.cal` week-grid calendar (the profile
      uses `.yearcal` now), `.mrow`/`.mcard`, `.ppane`, `.respane`, `.spark`,
      and `.side-card` **together with the careful comment above it about a bug
      in a class that is on no element at all** — the sidebar labels are
      `.nav-lbl`, and they are styled correctly.
      ⚠️ **THE LESSON, and it is written into the script: ten of the first
      nineteen "unused" classes were LIVE.** `.t-bool`, `.t-float`, five
      `.ef-*` and three `.fa-*` are built as `` `t-${v.type}` `` and friends, so
      no literal search can see them. The script now scans the source for
      `foo-${` and excludes those prefixes. A checker that cries wolf gets
      ignored, so it is worth keeping honest.
      **Left alone deliberately:** `--ease` is defined and used zero times.
      Adopting it changes the curve of every transition in the product and that
      curve has never been looked at — a design decision with eyes on it, not a
      find-and-replace. Recorded in DESIGN-SYSTEM.md, which used to claim it was
      used "for everything"
- [x] ~~**Quizzes and drills for the HTML course**~~ — done 2026-08-07. It was
      the largest single quality debt on the platform and it read **26/35 at the
      bar, 0/35 at FULL**. Now **29/35 and 28/35**, with a ten-question quiz on
      **all 35** lessons (was 5), plus drills, debug tasks, and the three `code`
      blocks whose absence was failing the minimum bar outright.
      **The seven that remain are Modules 0 and 1, and they are a ceiling rather
      than a gap**: FULL wants two practice problems and a `code` block, and this
      file's own course notes decline both — "there is nothing to practise yet"
      and "no HTML is written in this module, and that is the point". Exempting
      Module 0 in `check-syllabus.mjs` was considered and rejected: only one of
      the two blockers would move, so the number would not change anyway, and
      exempting both would launder a deliberate design choice into a passing
      score. **If 35/35 is ever wanted, it is a content decision — never a
      criterion edit.**
      Same pass finished `bi` (3/3 at FULL) and took `deploy` to its own ceiling.
      Platform went **118/160 → 150/160 at FULL (74% → 94%)**
- [ ] Split `prisma/seed.mjs`. 1.9 MB in one file is why two sessions collide on
      it, and it is the biggest maintainability problem in the repo
- [x] ~~Seeded XP on the demo accounts~~ — six accounts held 16,080 XP between
      them against zero passing submissions. Every real account was already
      exactly right, which is what made the correction safe to run. XP is now
      recomputed from earned, the seed no longer writes any, and `db:check`
      reports any account holding more than its submissions justify
- [x] ~~Read a lesson end to end as a beginner would~~ — done for all 12 HTML
      lessons (2026-08-06), read in course order as a first-timer. Two things a
      beginner would trip on, both fixed: lesson 2's hook referred to "the HTML
      file you wrote in the last module" when the first file is only written in
      Module 2, and lesson 8 called a local file "a website" six lessons after
      lesson 2's own mistake block said that exact phrase is wrong. NOT checked:
      the other 127 lessons — this pass judged one course, not the platform

## Where the rest is written down

- What the learning experience is meant to be: [`docs/LEARNING-SPEC.md`](docs/LEARNING-SPEC.md)
- Per-lesson recipe, what is left and in what order: [`docs/HANDOFF.md`](docs/HANDOFF.md)
- Current state and open work: [`docs/IMPROVEMENTS.md`](docs/IMPROVEMENTS.md)
- Findings from the full technical review: [`docs/REVIEW-2026-07-29.md`](docs/REVIEW-2026-07-29.md)
- What is built, what is not, and the honest numbers: [`README.md`](README.md)

> ⚠️ `docs/` is still written in Hinglish while everything shipped is English,
> and its facts are older than the README's. **When they disagree, the README
> and `npm run syllabus` are right** — the scoreboard reads the live database.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
