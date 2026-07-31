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
> time, in the order listed in `docs/HANDOFF.md` §3. Five subjects are already
> finished — Python (39/39), Statistics (11/11), Pandas (6/6), SQL (6/6) and
> Data Visualization (5/5). The platform is 67 of 83 lessons at the full standard.
>
> The four that remain are bi (3), ml (6), dl (3) and deploy (4). ml can run in
> the browser for one command's worth of work now that the wheel tooling exists;
> the other three have no runtime at all. Read §3 before choosing — this is a
> decision about what to teach, not about which is cheapest to verify. Ask
> Jugendra which subject he wants next rather than assuming.
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

### Pandas — done ✅

All 6 topics at the full standard, 27 practice problems (4–5 per topic, so the
unlock gate needs nothing). Five new visuals: `vectorize-lab`, `filter-lab`,
`missing-data-lab`, `groupby-lab`, `cleaning-lab`, alongside the
`dataframe-anatomy` that already existed.

Note for whoever writes the next runtime-backed subject: the verifier runs on
this machine's Python (pandas 3.0.3 / numpy 2.5.1) while the student runs
Pyodide (pandas 3.0.2 / numpy 2.4.3). Same print formatting at that distance,
but do not claim an output that depends on a repr you have not checked in both.

### SQL — done ✅

All 6 topics at the full standard, 18 practice problems. Five new visuals:
`select-lab`, `where-lab`, `order-limit-lab`, `join-lab`, `window-lab`, plus a
SQL dialect on the existing `groupby-lab` (`groupby-lab-sql`).

**verify-lesson.mjs now runs SQL lessons through sql.js**, so the track is
verified for the first time. A lesson counts as SQL if it carries a `sqlsetup`
block — the CREATE TABLE + INSERT its examples run against, rendered on the page
so the student can see the data and paste it into the compiler. Two SQL-only
differences from the Python trace:

- **a step may carry its own `sql`**, and usually must. A statement does not
  build up a line at a time — `SELECT name` alone is not a query — so for most
  lessons no prefix shorter than the whole thing runs.
- **`rows` or `columns`**, chosen by whether the question says "column". In a
  SELECT lesson the row count never moves; the width does.

Every lesson uses the shared schema from `prisma/sql-problems.mjs` (four
departments, ten employees, eight sales), so lessons and practice query the same
tables. **SQLite drops trailing zeros** — `ROUND(x, 2)` prints `12.3`, not
`12.30`, and a claimed output has to match.

### Data Visualization & EDA — done ✅

All 5 topics at the full standard, 20 practice problems (4 per topic).
`prisma/viz-problems.mjs` is a new module, wired into **both** apply-problems.mjs
and the seed. Five new visuals: `anscombe-lab`, `chart-lab`, `seaborn-lab`,
`chart-choice-lab`, `eda-walkthrough-lab`.

**matplotlib and seaborn now run in the browser.** This is the part that carries
over to ml, so read it before doing wheel work again:

- `node scripts/vendor-wheels.mjs <package>` resolves a package's dependencies
  out of `public/pyodide/pyodide-lock.json` — which ships the whole
  distribution's index, 354 packages, even though only a handful of wheels are
  kept — downloads the missing ones and checks each against the sha256 the lock
  already states. `matplotlib` meant eight wheels and 9.1 MB. `--list` shows
  what is vendored. **For ml, `scikit-learn` should be one command.**
- A package the distribution does not ship at all needs
  `--pypi <name>==<version> --depends a,b,c`, which vendors a **pure-Python**
  wheel from PyPI and splices an entry into our copy of the lock file. That is
  how seaborn works offline without micropip. Anything compiled cannot be added
  this way — it has to be built against this exact Emscripten ABI.
- **Commit the wheels.** Vercel needs them for `lib/verify.ts`, and `db:check`
  runs every python problem's reference solution through the same folder — which
  is the gate that proves a plotting problem agrees across runtimes.

Three things about writing a plotting lesson:

- **A chart is graded on its numbers, not its pixels.** Two PNGs cannot be
  diffed meaningfully, so a problem returns what the figure is *made of* —
  `ax.patches` heights, `ax.get_ylim()`, `ax.get_title()`, the bin counts. Those
  are exactly what a wrong chart gets wrong. The practice editor grew a **Chart
  tab** that shows whatever figure the run left behind, so the student still sees
  the picture.
- **Never `plt.show()`.** Pyodide's default backend is `webagg` and would try to
  serve a window. `verify:lesson` sets `MPLBACKEND=AGG` and runs snippets in its
  temp directory, so `fig.savefig("chart.png")` is safe in a lesson and does not
  land in the repo root.
- **Always cast out of numpy.** `p.get_height()` is a NumPy float and a list of
  them prints as `[np.float64(3.0)]`. `float()` / `int()` on the way out, or the
  claimed output is wrong on a repr you did not check.

### Microprocessor — in progress 🚧

The tenth subject, and the first that is not data science. Full plan:
**`docs/MICROPROCESSOR-SYLLABUS.md`** — 42 lessons, 11 chapters, decided in one go.
**10 written, 37 problems.** Read that file before touching this subject.

It brought its own runtime, and that is the part worth knowing about:

- **`lib/asm8085.ts`** is a real 8085 assembler, simulator and disassembler. It
  counts T-states, because "calculate the delay of this loop" is an exam question
  and counting them turns it into something checkable. `npm run test:8085` is
  **270 hand-derived checks**, including a round-trip that assembles every
  instruction form and decodes it back.
- **One engine, four consumers**: the browser, `verify:lesson`, `db:check` and
  `lib/verify.ts` all import that one file, so they cannot disagree. Node strips
  the types on import — no build step.
- **`Problem.kind = "asm8085"`** works end to end, graded by `grade()` in the same
  file. It diffs the student's machine against the problem's own reference on
  identical memory and compares only the state each test names, so a correct
  answer written with different registers passes. Same rule as the SQL verifier.
- A lesson declares itself 8085 by carrying a **`memsetup`** block (the memory
  equivalent of `sqlsetup`) or by marking a code block `lang: "asm8085"`. Snippets
  claim only what they teach, via a `show` list: `["C", "Z", "T"]`.

**Chapter 1 is the format the rest of the subject must match**, and it exists
because the first draft failed. Jugendra read it and said *"mera base hi sahi
nahi hai… it is like lot of theory so I am bored"*. Both true and measurable:
3,652 words against two visuals, with hex, bytes and registers all assumed. So
the course now starts one floor lower — bits, then memory, then what a program
is, then carrying — and the shape changed with it:

| | visible prose | visuals |
|---|---|---|
| Chapter 1 (lessons 1–4) | ~700–850 words | **3 each** |
| Lessons 5–6, before the rewrite | 1,683 and 1,549 | 2 and 1 |
| Lessons 5–6, now | ~985 and ~1,040 | **3 each** |

His instruction for everything here: *"ye soch kar concept likhna ki student es ke
baare mai pahele se kuch nahi janta hai"*, and lean hard on clickable panels
because that is what he found engaging.

**Chapter 2 is finished and Chapter 3 is two lessons in** — lessons 5 to 10 are
all at that standard, so the whole subject is in one shape and **lesson 11 ("Pins
and signals") is next**. Thirteen panels were built across those six lessons, and
what they teach is the part worth copying: each one carries an idea that prose
was previously asserting.

- **`programmable-lab`** (lesson 5) — the same three jobs done by a wired machine
  and by an 8085, side by side. The bytes are real, out of `assemble()`, so the
  point ("the job is in memory, not the wiring") is demonstrated rather than
  claimed.
- **`multi-byte-lab`** (lesson 6) — a 16-bit sum in two halves, with the
  instruction *and the numbers* both switchable. The second number pair is the
  whole point: with no carry out of the low byte, `ADI` and `ACI` agree, which is
  why this bug survives testing.
- **`micro-family-lab`** (lesson 6) — processor / controller / computer as one
  dashed chip boundary with the parts moving across it.
- **`alu-path-lab`** (lesson 7) — `ADD B` in four stages through the temp
  register and the ALU, with an `ADD`/`CMP` switch. Stage 4 is the whole lesson:
  same wires, same subtraction, and the only difference is whether the result is
  written back — which is also this lesson's debug task.
- **`memory-model-lab`** (lesson 7) — von Neumann against Harvard. The claim is
  about *simultaneity*, so a block diagram cannot make it; the timeline can.
- **`bus-lab`** (lesson 8) — five machine cycles over the same three rows, so
  what changes between them is visible: the data arrow's direction, and one
  control line. Memory write against I/O write is the pair that carries it.
- **`tristate-lab`** (lesson 8) — three devices on one data bus, each switchable.
  Two on at once is one click, and contention is the only idea here that a
  diagram genuinely cannot show.

- **`register-lab`** (lesson 9) — all eleven registers, with the two facts that
  are examined shown rather than listed: width, and whether a program may name it.
- **`pair-lab`** (lesson 9) — HL at 20FFH with an `INR L` button and an `INX H`
  button. One click is the entire difference between two bytes and one number,
  and it is where the classic pointer bug comes from.
- **`opcode-bits-lab`** (lesson 9) — builds a `MOV` byte from `01 ddd sss`, so
  "why seven registers" is counted rather than asserted. Setting both fields to
  M lands on 76H, which is `HLT` — the payoff, and the reason that slot was free.

Lesson 8 also reuses `address-width-lab` from lesson 2 — same 2ⁿ calculation, now
asked about the address bus rather than a street of boxes.

- **`flag-lab`** (lesson 10) — the five flags as a *byte*, with the three fixed
  bits in their gaps, computed live from a chosen operation. "What is the PSW
  after this" is a standard question and it needs the layout in front of you.
- **`flag-effects-lab`** (lesson 10) — which instruction writes which flag, as a
  list you press. All the value is in the exceptions, and they light up.
- **`daa-lab`** (lesson 10) — why AC exists at all. The `08 + 09` case is the
  one that earns the panel: the raw sum 11H looks like valid BCD, so nothing but
  AC reveals that the low digit overflowed.

`flag-lab` re-implements the ALU's flag rules in TypeScript rather than calling
the simulator, so the two could drift. They were checked against each other
before shipping — `3CH + 3CH` gives a flag byte of **16H** in the panel and in a
real `PUSH PSW`, which is the lesson's own code block. If you touch either, check
that pair again.

`opcode-bits-lab` is worth copying from when Chapter 4 gets to hand-assembly:
every byte it can produce was checked against `assemble()` in `lib/asm8085.ts`
before it shipped, so the panel and the compiler cannot disagree with the lesson.

Adding a lesson that does not exist yet needs four things, in this order:
an empty `const MP<n> = [\n];` in `seed.mjs` for `splice-lesson.mjs` to replace
(it replaces, it never creates), an entry in `mpLessons`, `npm run db:lessons`
(which reports `created: 1`), and `npm run db:chapters` to place it — the
chapter ranges in `apply-chapters.mjs` are by lesson order and already cover all
42. Problems go in `prisma/mp-problems.mjs` and ship with `npm run db:content`.

To keep a rewrite honest, measure it rather than eyeballing it: strip the tags
from `JSON.stringify` of each block and total the ones a student actually reads
(`objectives hook def note p h2 think analogy recap`). Chapter 1 sits at
1,035–1,185 on that scale; the two old lessons were 2,123 and 2,033.

### What is left

`npm run syllabus` prints the honest state of every subject. The remaining stub
subjects are bi (3), ml (6), dl (3), deploy (4).
`docs/IMPROVEMENTS.md` §H has the recommended order and the reasoning.

**ml is now the cheapest of the four to make runnable**, because the wheel
tooling and the "grade a figure on its numbers" pattern both exist: `scikit-learn`
is one `vendor-wheels.mjs` command, and matplotlib is already there for the
regression and evaluation lessons that need plots. bi, dl and deploy have no
runtime at all and are content-and-quiz subjects — which is a decision about what
to teach, not about what is cheapest to verify. All four still have **zero
practice problems** except ml's 3, which the unlock gate needs.

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
- **An HTML entity in a JSX text run eats the space in front of it.** Write
  `<b>3E</b> means &ldquo;load…&rdquo;` and the page renders **`3Emeans`** — the
  leading space of that text run is trimmed, but only when the run contains an
  entity (`&ldquo;`, `&quot;`, `&apos;`). The same sentence without one keeps its
  space, which is why it looks random and why three shipped lessons had it
  (`encapsulation`, `sql-advanced`, `hypothesis-testing`, plus `asm8085-lab`).
  Fix with an explicit `{" "}` after the closing tag — the idiom already in
  `Arch8085Lab`. **Sweep for it after any component edit**, because it survives
  lint, the build and a passing `db:check`:
  ```
  curl -s http://localhost:3000/learn/<slug> | grep -o '</b>[A-Za-z0-9]\{2,14\}\|</code>[A-Za-z0-9]\{2,14\}'
  ```
  Run it over every slug; a hit like `</b>attaches` is the bug, while
  `</b>nary` (from `<b>bi</b>nary`) is deliberate. **Include `0-9` in the class**
  — the first version of this sweep used `[a-zA-Z]` and silently missed
  `</b>08H` in lesson 10's DAA panel, because the next character was a digit.
  Sweeping all 93 pages takes several minutes; do it in two halves so the shell
  does not time out.
- **A component declared inside another component's body is a lint error.**
  `react-hooks/static-components` — a `const Cell = (...) => …` helper written
  during render is a new type every render, so React remounts its subtree. Move
  it to module scope. It fails lint, not the build, so run `npx eslint` on new
  components before you trust a green `npm run build`.
- **`def.en` and `def.hi` are plain-text fields.** Markup in them prints
  literally — `<code>` tags appear on the page as `<code>`. `db:check` catches
  it, but only after `db:lessons` has already pushed it to the live database.
  **A quiz option is the same kind of field**, and it is easier to forget because
  the question above it *does* take markup: `q` may carry `<code>` and `<b>`,
  `options[]` may not. Caught on lesson 8, after it was already live.
- **Never background a deploy with its output discarded.** `(npx vercel deploy
  --prod --yes >/dev/null 2>&1 &)` hides a failure completely: the push
  succeeds, nothing is live, and the next check says 404 with no explanation of
  why. Run it in the foreground, or tee the output somewhere you will read.
- **`npx prisma migrate dev` sometimes fails with P1017 "server has closed the
  connection"** against Neon. It is a dropped idle connection, not a schema
  problem — run the same command again and it applies.
- **Never import a plain function from a `"use client"` file into a server
  component.** You get a client reference, not the function, and calling it
  during a server render throws — the page shows `error.tsx` with a digest and
  no other clue. `formatDuration` lived in `PracticeWorkbench.tsx` and was
  called by the challenge pages; it is in `lib/duration.ts` now. Shared helpers
  belong in `lib/`, and the rule is worth applying before it bites, because
  **this class of bug needs data to appear**: the scoreboard only formats a
  duration once somebody has recorded one, so every signed-out check passed and
  it broke the first time a real student finished a challenge.
- **A Python dict answer used to fail every test.** `toJs()` turns a dict into a
  **Map**, and `JSON.stringify(new Map(...))` is `"{}"`, so the comparison was
  empty-object against expected. Fixed with `dict_converter` — in all **three**
  copies (`lib/pyodide-runner.ts`, `lib/verify.ts`, `prisma/check-content.mjs`),
  which have to agree or the browser accepts what the server rejects. Even so,
  prefer lists: a dict's **key order** survives the comparison, so a correct
  answer built in a different order is still marked wrong.
- **`loadPackagesFromImports` narrates to stderr** — "Loading pandas, numpy", "No
  new packages to load" — and both runners route stderr into the console pane.
  The streams are silenced for the package load now; if you add a third runner,
  do the same or the student's own output arrives under three lines of Pyodide
  bookkeeping.
- **`prefer-const` is not the only compiler rule.** A running accumulator inside
  a `.map()` in a component body fails with "Cannot reassign variable after
  render completes". Move the loop into a module-level helper.
- **A guest check is not a logged-in check.** Several features render different
  branches for a signed-in user, and those branches are the ones carrying real
  data. When you cannot log in, find a path that exercises the same branch —
  the challenge scoreboard renders for guests too, so loading a challenge that
  already has an attempt reproduces it exactly.

---

## 4a. The theme that follows the clock — time half built, weather half not

Jugendra's idea, and the design is settled. Do not re-litigate the decisions
below; he pushed back on the first sketch and these are the answers that
survived. **The free time-of-day half is now built and live**; the premium
weather half is still design only, and the warning at the end of this section is
the thing to read before starting it.

**It is platform-wide**, not per-subject. The theme system is already global
(`data-theme` on `<html>`, four themes, picker in the Topbar), so nothing extra is
needed to make it apply everywhere.

**Nobody is asked for anything.** The first sketch had a location prompt and he
killed it, correctly: *"user ko bahut boring lagega setup karna, why they will
effort"*. A student came to learn, not to configure a colour scheme, and the
reward is a colour. So:

| | how | who gets it |
|---|---|---|
| **Time of day** | `new Date().getHours()`. No permission, no API, cannot fail | **Free, and the DEFAULT** for anyone who has never picked a theme |
| **Weather** | City from the request IP (Vercel geo header), not a browser prompt. Open-Meteo needs no key; cache per city for ~30 min so the cost is ~0 | **Premium**, on the XP-unlock mechanism that already exists |

That split exists because he asked for both "apne aap change ho" and "premium
feature", and those cannot both be true of one thing. Comfort is free — a student
reading at midnight should get the dark theme without earning it. The decorative
half is what gets earned.

**Design already settled:**

- Schedule reuses the existing themes, so no new CSS: `06:00` light, `17:00`
  sunset, `20:00` dark. Sunset is a dark theme with warm accents, so it suits the
  evening for everybody.
- **The OS preference is a veto, not noise.** If `prefers-color-scheme: dark`,
  auto never goes light — somebody who set that has said something.
- **Auto must never overrule a choice.** Picking any theme turns auto off; the way
  back is choosing "Auto" in the menu. So the Topbar needs *two* pieces of state:
  what is applied, and what was chosen. They differ whenever the clock is driving.
- The pre-paint script in `app/layout.tsx` has to resolve it, or the page flashes
  the wrong theme. It cannot import, so **interpolate the boundary hours** from
  the shared module into the script string — the numbers are the part that would
  actually drift.
- A one-minute interval while auto is on, so somebody studying from 4pm to 9pm
  sees it change under them without a reload.

**Verify before building the weather half:** Vercel's `x-vercel-ip-city` may be
plan-gated (country is not). The whole design rests on it. And decide up front
what happens when the API is slow or down — the theme should simply stay as it is
and the page must never wait on it. This would be the platform's **first
dependency on an outside service**.

**What was built, and where it lives:**

- **`lib/theme-schedule.ts`** — the schedule, the two localStorage keys, and
  `themeForHour(hour, prefersDark)`. It is a plain module with no `"use client"`,
  which is what lets the server-rendered `app/layout.tsx` import it. The boundary
  hours are written **once**, here.
- **`app/layout.tsx`** builds the pre-paint script by interpolating
  `SCHEDULE`, so the numbers cannot drift out of step with the module. Auto is
  the default: no `dq-theme-mode` key means the clock decides, and the script
  resolves it before first paint.
- **`components/Topbar.tsx`** carries the two states — `theme` (applied) and
  `auto` (chosen) — an **Auto** entry at the top of the menu, a one-minute
  interval and a `prefers-color-scheme` listener while auto is on. Picking any
  theme writes `dq-theme-mode = "manual"` and the clock stops being consulted.
- The menu draws both states at once: the **✓** follows the choice, and a small
  **now** pill (`.theme-now`) marks whichever theme the clock has applied. They
  sit on different rows for the whole time auto is driving, which is the one
  thing this menu has to make obvious.

Two keys, not one, and the reason is migration: `dq-theme` still holds a concrete
theme id exactly as before, so nothing else that reads it had to change, and the
new `dq-theme-mode` is what distinguishes a real choice from a value the old code
wrote on somebody's first visit. Everybody who never opened the menu therefore
lands on auto, which is what the design asks for.

**One thing left unresolved on purpose.** All four themes are `xp: 0` today
(beta), so auto can apply Sunset to anybody. If the coin locks are restored — the
comment in `Topbar.tsx` says how — the 17:00 step would hand a locked theme to a
student who has not unlocked it, and the pre-paint script cannot know their XP
because that is a server fact. Decide it then: either auto stops at free themes,
or Sunset stops being locked.

**What could not be verified locally:** the live change-over. The harness cannot
move the clock, and Chrome's emulated `prefers-color-scheme` changes what
`matchMedia().matches` returns **without dispatching a `change` event** — a probe
listener recorded nothing across a light↔dark flip. So the resolution was proven
instead: `themeForHour` across all 24 hours and both preferences, and the applied
theme after a reload under each emulated scheme.

## 4b. Features shipped alongside the lessons

Not lesson work, but you will meet them and they change what "done" means.

- **The lock is content-driven.** `lib/progress.ts` marks a subject `locked`
  when any of its lessons is still a stub, judged by the five teaching blocks
  `check-syllabus.mjs` grades on. Finish a subject and it opens on the next page
  load — there is no flag to flip, and the roadmap, the dashboard tiles and the
  challenge subject-picker all follow it automatically.
- **Guests can see everything except their own data.** Dashboard, analytics,
  leaderboard, certificates and the resume builder render signed-out with honest
  zeros. Only `/notes`, `/focus`, `/rooms`, `/welcome` and `/feedback` redirect,
  because those hold one person's own data and there is nothing to show a
  stranger. Use `<GuestBanner>` rather than inventing another prompt.
- **`ProblemAttempt`** autosaves the practice editor, stamps `startedAt` on the
  first save and records `solvedSeconds` on the first pass. The lesson page's
  practice button points at the first **unsolved** problem, not `problems[0]`.
- **Challenges** (`/challenge`) are the async half of PRD chapter 5: a frozen
  set of quiz questions with a shareable code, marked server-side, one scored
  run per person. Questions come from the `{t:"quiz"}` blocks inside lesson
  content, so **a subject only appears in the picker once its lessons carry
  quizzes** — another thing that grows by itself as subjects are written.

## 5. Two things only Jugendra decides

- **The AI Mentor is paused, by his instruction, because it costs money per
  student per message.** Do not start it.
- **The practice page still sends each test's expected value to the browser.**
  Hiding it is easy — send a hash and compare hashes — but the test panel's
  "expected 7, got 6" is real teaching feedback. Ask before trading it away.
