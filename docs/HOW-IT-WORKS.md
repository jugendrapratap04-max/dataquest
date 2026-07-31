# How DataMarg works

Written for Jugendra, 31 July 2026, and for anyone else who has to work on this
without a web-development background. It assumes **nothing**. If a sentence uses
a word you do not know, that word is defined in Part 1.

Read it in parts. Part 1 and Part 4 are the two that matter most — Part 1 gives
you the vocabulary, and Part 4 is the whole system explained as one journey.

---

## Part 1 — The words, in plain language

You need about twelve. Everything else in this file is built from them.

**Web app.** A program you use through a browser instead of installing it.
DataMarg is one.

**Browser and server.** Two computers, always. The **browser** is the student's
phone or laptop — it draws what they see. The **server** is a computer somewhere
else that holds the data and sends pages out. Almost every question about how a
web app works is really "does this happen in the browser or on the server?"

**Front end and back end.** Front end is what happens in the browser. Back end is
what happens on the server. One person doing both is called "full stack".

**Framework.** A framework is a set of ready-made parts and rules so you are not
building a web app from nothing. DataMarg uses **Next.js**, which is a framework
built on top of **React**.

**React.** The tool that draws the screen. You write small pieces called
**components** — a button, a chart, a lesson panel — and React puts them together
and redraws them when something changes.

**Component.** One reusable piece of screen, written in one file. Our interactive
panels are components. There are 91 of them in `components/viz/`.

**Database.** A place on the server where information is kept permanently — who
signed up, which lessons they finished, which problems they solved. Ours is
**PostgreSQL** (usually written Postgres), hosted by a company called **Neon**.

**Prisma.** A translator between our code and the database. Instead of writing
database language by hand, we write `prisma.lesson.findMany(...)` and Prisma turns
it into the real query. The list of what the database holds lives in
`prisma/schema.prisma`.

**Deploy.** Copying the finished app onto a public server so anyone can reach it.
We deploy to **Vercel**, and the live address is `dataquest-navy.vercel.app`.

**Repository (repo).** The project folder, with its full history. `git` records
every change; **GitHub** stores a copy online.

**WebAssembly (WASM).** A way to run real programs *inside the browser*, fast.
It is how DataMarg runs Python and SQL on the student's own device with no server
involved. You will see this again in Part 5 — it is the single most unusual thing
about this platform.

**API route.** A small program on the server that answers a specific question —
"log this user in", "mark this lesson done". Ours live in `app/api/`. There are 17.

---

## Part 2 — What DataMarg is made of

Eight real dependencies. That is deliberately few.

| Piece | Version | What it does here |
|---|---|---|
| **Next.js** | 16.2.10 | The framework. Pages, routing, server rendering |
| **React** | 19.2.4 | Draws the screen |
| **Prisma** | 6.19.3 | Talks to the database |
| **Postgres** (Neon) | — | Stores users, progress, lessons, problems |
| **Pyodide** | 314 | Runs **Python** inside the browser |
| **sql.js** | 1.14 | Runs **SQL** inside the browser |
| **Monaco** | 4.7 | The code editor students type in — the same one VS Code uses |
| **Vercel** | — | Hosts the live site |

Two things are worth noticing about that list.

**There is no separate back end.** Next.js does both jobs, which is why one small
project can have a login system, a database and 28 pages without a second server.

**There is no paid service in it.** Neon and Vercel both have free tiers that this
project fits inside. The only thing that would ever cost money per student is the
AI Mentor, which is why it is deliberately not built — see Part 6.

---

## Part 3 — Where everything lives

```
app/          the pages. One folder per URL
  (app)/      the signed-in app: dashboard, learn, practice, challenge…
  book/       the printable notes
  api/        17 server endpoints
components/   32 shared pieces of screen (Topbar, Sidebar, PracticeWorkbench…)
  viz/        91 interactive teaching panels
lib/          24 files of logic shared by everything
prisma/       the database shape, plus all the lesson content and the tools
docs/         the written decisions — including this file
public/       files served as-is, including the Python runtime
scripts/      one-off maintenance tools
```

The four files in `lib/` worth knowing by name:

- **`lib/progress.ts`** — the single answer to "how far along is this student".
- **`lib/asm8085.ts`** — a complete 8085 microprocessor, in software. Part 5.
- **`lib/verify.ts`** — marks a student's submitted code.
- **`lib/unlock.ts`** — decides whether the next topic is open yet.

And the odd one: **`prisma/seed.mjs`** is 1.9 MB, because **every lesson on the
platform is written inside it** — the text, the code examples, the quizzes. It is content, not code, which is why there is a special tool
(`prisma/splice-lesson.mjs`) for editing one lesson without touching the rest.

---

## Part 4 — What happens when a student opens a lesson

This is the whole system in one journey. Follow it once and the rest of the file
makes sense.

A student taps **Microprocessor → Lesson 9** on their phone.

**1. The browser asks the server for a page.** The address is
`/learn/mp-register-set`. Next.js sees the folder `app/(app)/learn/[slug]/` and
knows `[slug]` means "any lesson name goes here".

**2. The server looks the lesson up.** It asks Prisma, Prisma asks Postgres in
Singapore, and back comes the lesson: title, minutes, and a long list of
**content blocks**.

**3. Content is data, not a page.** A lesson is stored as a list of blocks —
`{ t: "hook" }`, `{ t: "code" }`, `{ t: "viz", name: "pair-lab" }`, and so on.
Nothing about the *look* is stored. That is why changing how a hook is displayed
changes it in all 102 lessons at once.

**4. `{ t: "viz" }` becomes a real panel.** The block only carries a name. A file
called `components/viz/VizBlock.tsx` holds a list matching each name to its
component — `"pair-lab"` to `PairLab` — and renders it. This is why adding a panel
is two steps: write the component, then register the name.

**5. The server checks the gate.** `lib/unlock.ts` decides whether this student
has earned this topic yet. (Right now it always says yes — see `lib/gates.ts`,
explore mode.)

**6. The page arrives, and now the browser takes over.** The words were drawn on
the server and are already visible. The panels are interactive, so React "wakes
them up" in the browser — from that point, pressing a button changes what you see
with no server involved at all.

**7. The student clicks Practice.** Now the interesting part. They type 8085
assembly and press Run, and **nothing is sent anywhere**. `lib/asm8085.ts` is
JavaScript, already downloaded, and it assembles and executes their program on
their own phone. A Python problem does the same through Pyodide; a SQL problem
through sql.js.

**8. Marking.** Their program and the reference solution are both run on identical
memory, and only the parts the problem names are compared. So a correct answer
written with different registers still passes.

**9. Progress is recorded.** One row in the database saying this student solved
this problem. Not "40% complete" — see Part 5.

---

## Part 5 — The four things that are actually unusual

Most of DataMarg is ordinary. These four are not, and they are what to talk about
if anyone asks what is interesting about it.

### 1. There is a real 8085 processor inside the repo

`lib/asm8085.ts` — 957 lines — is a working assembler, simulator and
disassembler. It counts T-states, because "how long does this loop take" is an
exam question and counting them turns it into something checkable. It has 270
hand-derived tests (`npm run test:8085`).

The design point: **one engine, four consumers.** The student's browser, the
lesson verifier, the content checker and the marker all import that same file. So
they cannot disagree with each other. If the simulator is wrong, it is wrong
everywhere at once — which is far safer than being wrong in one place only.

### 2. Lesson content is verified by running it, not by trusting it

`npm run verify:lesson -- microprocessor mp-register-set` takes every code block,
drill, trace question and debug task in that lesson, **runs them**, and checks the
printed answers against what the lesson claims. A lesson does not ship until that
passes.

This is unusual. Most courses are written by a person who believed the output was
right. Here the machine confirms it.

Its limit is written down honestly in `docs/HANDOFF.md`: it runs the code, it does
not read the sentences. Prose can still claim a wrong number, and it has — three
times, all caught later and recorded so it stops happening.

### 3. Progress is calculated, never stored

The database never holds "Python 40% complete". It holds rows: this lesson read,
this problem solved. Every percentage on every page is calculated from those rows
at the moment you look.

This is not a style preference. Stored progress is exactly what produced a fake
streak and a seeded "Python done" that had to be removed twice. Anything stored
can drift from the truth; anything derived cannot.

The same idea runs the subject locks: a subject shows as "coming soon" when its
lessons are still stubs. Finish it and it opens by itself. There is no flag anyone
has to remember to flip.

### 4. Everything runs on the student's own phone

No code the student writes is ever sent to a server. Python, SQL and 8085 all
execute in the browser.

This is the decision that makes the whole platform affordable. Running student
code on a server means sandboxes, queues, timeouts, abuse and a bill that grows
with every student. Running it in the browser means the cost of the thousandth
student is the same as the first: nothing.

---

## Part 6 — What is built, and what is not

Honest state, 31 July 2026.

**Content: 86 of 102 lessons at the full standard.**

| Subject | Lessons | At standard | Problems |
|---|---|---|---|
| Python | 39 | 39 | 122 |
| Statistics | 11 | 11 | 23 |
| Pandas | 6 | 6 | 27 |
| Visualization | 5 | 5 | 20 |
| SQL | 6 | 6 | 18 |
| Microprocessor | 19 | 19 | 73 |
| BI | 3 | 0 | 0 |
| ML | 6 | 0 | 3 |
| DL | 3 | 0 | 0 |
| Deploy | 4 | 0 | 0 |

The bottom four are not broken. They are **written as stubs and not yet
rewritten** — 48 to 129 words each, no panels, no quizzes. Microprocessor has 23
of its planned 42 lessons still to write.

**Built and working:** accounts, the dashboard, lessons, the practice editor with
three languages, quizzes, challenges you can share by code, notes, focus mode,
study rooms, a leaderboard, certificates, a resume builder with an ATS check,
printable chapter notes, four themes and a clock-following auto theme.

**Deliberately not built:** the AI Mentor. It is the only feature that would cost
money per student per message, forever, and that decision belongs to Jugendra
rather than to whoever is writing code that week. The design is kept in
`docs/ai-mentor-plan.md` so it can be switched on when there is a reason.

---

## Part 7 — Changing something yourself

The smallest safe loop, and the fastest way to make all of the above real:

1. **Change a lesson's words.** Find the lesson in `prisma/seed.mjs`, edit a
   sentence, then run `npm run db:lessons`. It is live immediately — lesson text
   is served from the database, so no deploy is needed.
2. **Change something visual.** Edit a file in `components/`, then
   `npm run build` and deploy. This one does need a deploy, because components
   ship inside the app rather than the database.
3. **Check you have not broken anything.** `npm run db:check` reads all the
   content and complains about anything inconsistent. `npm run syllabus` prints
   the honest state of every subject.

One rule, learned the hard way and written in `docs/HANDOFF.md`: **never run
`npm run db:seed`.** It rebuilds the database from scratch and erases every
student's progress. `db:lessons` and `db:content` are the safe, additive ones.

---

## Where the rest of the story is

- **`docs/ARCHITECTURE.md`** — what the platform is for, and the rules every
  design decision is measured against.
- **`docs/LEARNING-SPEC.md`** — what the learning experience is supposed to be.
- **`docs/HANDOFF.md`** — how a lesson is built, and every trap that has cost
  time. Read §4 before changing anything.
- **`git log`** — roughly 46,000 words of "what changed and why". Every commit
  explains its own reasoning. Once Part 1 of this file is comfortable, that log
  is the most detailed record of how this platform was actually built.
