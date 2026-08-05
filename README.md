# Etudo 📊

A **multi-subject learning platform**. Read the topic, practise *that* topic in a
real in-browser compiler, then build with it.

Etudo is not a data science course and not a Python course — Python is simply the
first subject finished, and 8085 assembly is the second one under way. The engine
(lessons → visualisation → practice → quiz → progress) is subject-agnostic by
design; see [`AGENTS.md`](AGENTS.md).

Python and SQL run inside the browser — no paid API, no code-execution server,
and no per-student cost.

> **Naming:** the brand is **Etudo**. The repo, the Vercel project and the
> database are still called `dataquest` — that is deliberate, not a leftover.
> Renaming infrastructure buys nothing and breaks deploy history.

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind v4 + a custom design system (`app/globals.css`) |
| Database | Prisma + **PostgreSQL** (Neon, ap-southeast-1) |
| Python execution | **Pyodide** (CPython → WebAssembly, `public/pyodide`) |
| SQL execution | **sql.js** (SQLite → WebAssembly, `public/sqljs`) |
| Editor | Monaco |

Both runtimes are **vendored into `public/`**, so running a student's code never
depends on a CDN being up. Available to Python: `numpy`, `pandas`, `matplotlib`,
`seaborn`, `scipy`, `scikit-learn`. Pyodide loads each on demand, so a student on
the Python track never downloads the ML wheels.

Add a package with `node scripts/vendor-wheels.mjs <name>` — it resolves the
dependencies from `pyodide-lock.json` and sha256-checks every download. Commit
the wheels: `lib/verify.ts` re-verifies submissions server-side from that folder.

> **One CDN dependency remains:** Monaco loads from `cdn.jsdelivr.net`
> (`@monaco-editor/react`'s default). If jsDelivr is blocked, the editor does not
> appear. Self-hosting Monaco is the fix and has not been done.

---

## Running it

```bash
npm install
cp .env.example .env      # then fill in DATABASE_URL and AUTH_SECRET
npm run dev               # http://localhost:3000
```

`AUTH_SECRET` signs the session cookie. Production refuses to boot without one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Content commands

| Command | What it does |
|---|---|
| `npm run db:lessons` | Push lesson bodies from `seed.mjs` to the database. **Additive** — progress and XP are untouched. |
| `npm run db:content` | Push practice problems. Upserts by slug, also additive. |
| `npm run db:check` | Run **every** reference solution in real Pyodide, plus content guards. |
| `npm run syllabus` | Coverage scoreboard, measured against the live database. |
| `npm run verify:lesson -- <track> <slug>` | Run every snippet in one lesson as real Python. |
| `npm run test:errors` | Check the error explainer against errors real Python produces. |
| `npm run test:sklearn` | Prove scikit-learn still works in our Pyodide. |

> ⚠️ `npm run db:reset` **deletes every student's progress**. It is for local
> development only. To change content on a live database use `db:lessons` and
> `db:content`, which is what they exist for.

---

## Where the content stands

Measured by `npm run syllabus` against the live database.

| Subject | Lessons | At full standard | Problems |
|---|---:|---:|---:|
| Python | 47 | **47** | 146 |
| Microprocessor (8085/8086) | 19 | 18 | 73 |
| Statistics | 11 | **11** | 23 |
| Pandas / NumPy | 6 | **6** | 27 |
| SQL | 6 | **6** | 18 |
| Visualization | 5 | **5** | 20 |
| Business Intelligence | 3 | 0 | 0 |
| Machine Learning | 6 | 0 | 3 |
| Deep Learning | 3 | 0 | 0 |
| Deployment | 4 | 0 | 0 |
| **Total** | **110** | **93** | **310** |

**Python is complete** — 134 of 134 topics on the reference syllabus (W3Schools
core Python, plus DSA and the reference pages), and every one of its 47 lessons
clears the full standard.

**Sixteen lessons are still stubs** — BI, ML, DL and Deployment are 50–130 words
each with no quiz, no practice and no visual. They are not "nearly done"; they
are unwritten. ML is the one that matters most, and its runtime blocker is now
cleared: `scikit-learn` is vendored and verified.

### What "full standard" means

Enforced by `npm run syllabus`, so it cannot drift:

- ≥ 1,200 words
- ≥ 1 interactive visualisation
- ≥ 4 of 5 teaching blocks (`hook`, `def`, `mistakes`, `recap`, `interview`)
- a quiz, practice drills, and a debug task
- **≥ 2 practice problems**

That last line was added after the scoreboard reported "every lesson at the full
standard" while eight lessons had none. Everything else it measured lived inside
the lesson body, so a lesson could be flawless prose with nothing to practise and
still pass. A measure that cannot see the practice half cannot tell you the
platform's promise is being kept.

---

## How the teaching is built

Every lesson carries the same blocks, and the tooling verifies them:

- **`worked` → `faded` ladder** — a fully solved example with the *thinking*
  labelled, then the same shape with blanks to fill, then the drills as a blank
  page. Students freeze at an empty file because they lack a procedure, not
  knowledge. Present on 8 lessons so far.
- **`debug`** — code that runs clean and returns the *wrong* answer. Most
  teaching shows what works; these are the silent failures that survive review.
- **`mistakes`** — real beginner errors with why they happen. These also feed
  `lib/error-help.ts`, which turns a raw Python traceback into an explanation
  and a link to the lesson that teaches it.
- **`trace`, `drills`, `quiz`, `interview`** — retrieval practice at every step.

`npm run verify:lesson` executes every code block, drill, trace step and debug
snippet in real Python and compares against the claimed output. No output in any
lesson is a human's guess.

---

## Structure

```
app/
  (app)/page.tsx           Dashboard — streak, XP, roadmap, progress
  (app)/learn/[slug]/      Lesson view
  (app)/practice/[slug]/   Compiler — Python (Pyodide) or SQL (sql.js)
  book/                    Every lesson as printable written notes
components/
  PracticeWorkbench.tsx    Python: Monaco + test cases + error explanations
  SqlWorkbench.tsx         SQL: Monaco + schema browser + result grid
  ErrorHelp.tsx            Plain-English explanation under a raw error
  viz/                     91 files, 119 registered visualisations
lib/
  pyodide-runner.ts        Browser-side Python + test checking
  verify.ts                Server-side re-verification of submissions
  error-help.ts            Python error → explanation + lesson link
prisma/
  seed.mjs                 All lesson content
  dsa-problems.mjs         Practice problems (one module per batch)
  check-syllabus.mjs       The scoreboard
  verify-lesson.mjs        Runs a lesson's snippets as real Python
scripts/
  vendor-wheels.mjs        Add a Pyodide package, sha256-checked
```

---

## Known gaps

Kept honest on purpose — this list is the work, not a disclaimer.

- **16 stub lessons** in BI, ML, DL and Deployment
- **`mp-switches-and-numbers`** has 0 practice problems, the only finished-subject
  lesson below the bar
- The **worked → faded ladder** is on 8 of 47 Python lessons
- The **error explainer covers Python (24 rules) and SQLite (7)**, both checked
  against errors the real engines produce — but only the messages a learner
  commonly hits. Anything unmatched still shows the raw error, by design.
- Practice pages **ship each test's `expected` value to the browser**, so a
  determined student can read the answers. Hiding it costs the "expected 7, got
  6" feedback, which is real teaching — a product decision, not a bug to fix
  quietly.
- **Monaco loads from a CDN** (see above)
- `docs/` is still written in Hinglish while everything shipped is English

---

_Read it. Practise it. Build with it._
