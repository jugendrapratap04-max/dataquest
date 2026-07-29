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
> Statistics is finished (11/11), including its practice problems.
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

### Statistics — done ✅

All 11 topics are at the full standard and all 11 have two or more practice
problems (23 across the track). Six new visuals were built for it: `box-plot`,
`bayes-grid`, `distribution-lab`, `sampling-lab`, `p-value-lab`, `ab-test-lab`.
`scatter-correlation` and `bell-curve` were corrected rather than replaced —
the scatter panel had been reporting r values that did not match its own points.

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
  reintroduce Hinglish. Chat with Jugendra in Hinglish. Two Hinglish strings
  were still hiding in **visual components** rather than lessons (`BellCurve`,
  `ScatterCorrelation`) — grep the components too, and grep for whole phrases,
  not just common words like "hai", which both of those slipped past.
- **`verify:lesson` never checks your prose.** It runs the code and confirms the
  code misbehaves; it does not read the sentences around it. Three lessons in
  this batch shipped a draft whose text quoted a number the code does not
  produce (claimed 30.5, real 8.25; claimed "about 22", real 9632.91; claimed
  12.4, real 7.25). **Every number you write in prose has to be run separately.**
- **A trace step cannot be hypothetical.** "If line 3 had been 0.99, `p_pos`
  would be…" gets parsed for `line (\d+)` and the first `<code>word</code>`,
  then evaluated against the *real* code — so it checks a question you never
  asked. Every step must be a genuine "after line N, `var` is". Cost time twice.
- **The `debug` symptom must not contain the word "error".** verify-lesson.mjs
  decides whether to expect an exception by testing the symptom against
  `/error|exception|traceback/i`. A lesson about the *standard error* therefore
  cannot use the term there, or the silent-bug check flips to demanding a crash.
- **New visuals need a `const` sweep.** `prefer-const` is an error, not a
  warning, and a `let` copied from an existing component will fail lint after
  the build has already passed.

---

## 5. Two things only Jugendra decides

- **The AI Mentor is paused, by his instruction, because it costs money per
  student per message.** Do not start it.
- **The practice page still sends each test's expected value to the browser.**
  Hiding it is easy — send a hash and compare hashes — but the test panel's
  "expected 7, got 6" is real teaching feedback. Ask before trading it away.
