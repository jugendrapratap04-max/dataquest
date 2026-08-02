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
