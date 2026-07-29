# Handoff — finishing the remaining subjects

Paste the prompt in §1 into a fresh session. Everything it needs to know is
either in this file or in the repo.

---

## 1. The prompt

> Continue building DataMarg at `F:\projects\dataquest`. Read `AGENTS.md`,
> `docs/ARCHITECTURE.md` and `docs/LEARNING-SPEC.md` first — they are the
> standing brief and they override any assumption you would otherwise make.
>
> **Job:** rebuild the remaining stub lessons to the full standard, one at a
> time, in the order listed in `docs/HANDOFF.md` §3. Python is finished (39/39).
> Statistics is 3 of 11 done.
>
> Work autonomously and do not stop to ask which lesson is next — the order is
> written down. For each lesson: write it, verify it, commit it, deploy it, then
> start the next one. Report only what you finished and what is left.
>
> The recipe, the verification gates and the traps that have already cost time
> are in `docs/HANDOFF.md` §2 and §4. Follow them exactly; every one of them is
> there because something went wrong without it.
>
> Never claim a lesson is done without `verify:lesson` passing, `db:check`
> passing, and the page read in a production build.

---

## 2. The recipe, per lesson

Roughly 1,800–2,000 words of source. Blocks, in this order:

`objectives` · `hook` · `def` · 💼 career `note` · 3–5 × `h2` each with a runnable
`code` block · the `viz` plus a paragraph telling the student what to do with it ·
`think` · `analogy` · `trace` (3 steps) · `drills` (~11) · `mistakes` (4) ·
`debug` · `recap` (5) · `interview` (5, levelled) · a 10-question `quiz`
(3 easy / 4 medium / 3 hard).

**Commands, in order:**

```
node prisma/splice-lesson.mjs <ARRAY> new-content.txt
node prisma/splice-lesson.mjs quiz:<lesson-slug> new-quiz.txt
npm run db:lessons
npm run verify:lesson -- <track-slug> <lesson-slug>     # must be N/N
npm run db:check                                        # must be clean
npm run build                                           # check the EXIT CODE
```

then read the page in a production build (`preview_start` with `dataquest-prod`),
drive the visual, `git commit`, `npx vercel deploy --prod --yes`, `git push`.

Write the content file with the **Write tool, never a shell heredoc** — heredocs
mangle the quotes and backslashes in this content.

`splice-lesson.mjs` replaces a quiz if one exists and inserts it if not, so the
same command works for a subject that has never had quizzes.

---

## 3. What is left, in order

### Statistics — 8 of 11 remaining

| Array | Slug | Existing visual |
|---|---|---|
| `S4` | normal-distribution | `bell-curve` ✅ |
| `S5` | percentiles-iqr | **needs a new one** |
| `S6` | correlation | `scatter-correlation` ✅ |
| `S7` | bayes | **needs a new one** |
| `S8` | distributions | **needs a new one** |
| `S9` | sampling-clt | **needs a new one** |
| `S10` | hypothesis-testing | **needs a new one** |
| `S11` | ab-testing | **needs a new one** |

Then: **problems**. Statistics has 19 across 11 topics; the unlock gate wants two
per topic, so top it up in `prisma/topic-problems.mjs` the same way Python's gap
was closed.

### After Statistics

`npm run syllabus` prints the honest state of every subject. The remaining stub
subjects are pandas (6), viz (5), sql (6), bi (3), ml (6), dl (3), deploy (4).
`docs/IMPROVEMENTS.md` §H has the recommended order and the reasoning.

Confirm an array name before editing it — **the number does not match the lesson
order** (`L3` is *conditionals*, not lesson 3):

```
grep -n 'slug: "<lesson-slug>"' prisma/seed.mjs
```

---

## 4. Traps that have already cost time

- **`npm run build` output contains the word "error"** in the route list
  (`error.tsx`). Grepping for it reports failures that are not there. Use the
  **exit code**.
- **Lesson content goes live the moment `npm run db:lessons` runs**, because it
  is served from the production database. Only new *components* need a Vercel
  deploy. Do not sit waiting on a build to see content.
- **`npm run build` fails with EPERM on the Prisma DLL while a preview server is
  running.** Stop the preview first. It is a Windows file lock, not a code error.
- **The `db:check` quiz guard rejects a quiz with more than half its answers on
  one option.** Spread them 3/3/2/2. When it fires, permute the option **order**
  only and leave every correct answer's text alone.
- **A new visual must be registered in `components/viz/VizBlock.tsx` AND
  referenced from the lesson** with `{ t: "viz", name: "..." }`. Registering
  alone is silent — `npm run syllabus` will report `viz:0`.
- Build visuals on the existing classes — `.viz`, `.viz-head`, `.viz-controls`,
  `.ss-stepper`, `.ss-step`, `.viz-code`. The last four needed **no new CSS**.
- **Trace answers are matched on trimmed lowercase text.** A list-shaped answer
  needs an `accept:` array of the spellings a student might type.
- **A `debug` block must be a silent bug**: the broken version has to run
  cleanly and produce **different output** from the fix.
- **Never `print()` an object with a default repr** (a generator, an instance) —
  the memory address changes every run and `verify:lesson` fails.
- **No em-dashes inside Python string literals.** The verifier runs on a Windows
  console that cannot encode them.
- **Everything ships in English.** The platform was converted; do not
  reintroduce Hinglish. Chat with Jugendra in Hinglish.

---

## 5. Two things only Jugendra decides

- **The AI Mentor is paused, by his instruction, because it costs money per
  student per message.** Do not start it.
- **The practice page still sends each test's expected value to the browser.**
  Hiding it is easy — send a hash and compare hashes — but the test panel's
  "expected 7, got 6" is real teaching feedback. Ask before trading it away.
