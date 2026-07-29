# DataMarg — The Learning Experience, merged spec

Jugendra has described the learning experience in **two documents**, sent on
29 July 2026. They agree on the shape and disagree in small, load-bearing ways.
This file merges them into one source of truth so nothing has to be guessed
twice, and records exactly where they differed and how it was resolved.

- **Doc A** — *"DataMarg – Product Ideas & Feature Backlog"* (the vision, with
  the per-subject animation detail).
- **Doc B** — *"Additional Product Requirements"* (the stricter rules, with the
  two-problems rule and the download lock).

Architecture rules live in [`ARCHITECTURE.md`](./ARCHITECTURE.md); status and
sizing live in [`IMPROVEMENTS.md`](./IMPROVEMENTS.md). This file is only *what
the experience is supposed to be*.

---

## 1. The learning flow

The two documents give different flows. Merged, keeping every step either one
asks for:

    Learn → Visualize → Practice → AI guidance → Mini quiz → Unlock next topic
          → Download chapter → Continue

| Step | From | Notes |
|---|---|---|
| Learn | both | The topic's written notes |
| Visualize | Doc B | The topic's interactive visual |
| Practice | both | The drills inside the lesson |
| AI guidance | Doc B | **Paused** — the only item with a running cost, and Jugendra has said to stop cost work for now |
| Mini quiz | **Doc A** | Doc B's flow omits it — treated as an accidental omission, not a decision. All 39 Python lessons already have a ten-question quiz built, so dropping it would throw away finished work |
| Unlock next topic | both | Gated on the rules in §3 |
| Download chapter | Doc B | Gated on the rules in §4 |

**Doc A's shorter philosophy line** — *Learn → Practice → Test → Unlock →
Continue* — is the same journey with fewer names. "Test" is the mini quiz.

---

## 2. Structure

    Subject → Chapter → Topic → { notes, visualization, quiz, ≥2 practice problems }

- The **Chapter** level exists (migration `20260729180000_add_chapter`). Python
  is split into six chapters; the other eight subjects have one chapter each,
  labelled "not split yet".
- **Notes must not be one long chapter** (Doc B). Today `/book` generates long
  chapters from lesson content — this is a second surface that has to follow the
  topic split, not just the lesson pages.

### ⚠️ The one open question, and it changes the scale roughly four-fold

Doc A shows *Chapter → Topic 1, 2, 3, 4*. Today the platform has *Chapter →
Lesson*, and each rebuilt lesson is about 2,200 words. So either:

- **(a) Today's lesson IS a topic.** 83 topics platform-wide. ~77 more practice
  problems needed to satisfy §3.
- **(b) Each lesson SPLITS into about four topics.** Python's 39 lessons become
  roughly 150 topics, needing **300+ problems** where Python has 89 today.

**Nothing in §3 or §4 can be built until this is answered**, because the answer
decides whether the gate is reachable at all. Jugendra to confirm.

---

## 3. Practice-based progression

A topic unlocks the next one only when the student has:

1. read the topic,
2. solved **at least two** practice problems for it (Doc B, stated as a hard
   minimum),
3. met the minimum score.

### What this costs today — measured, not estimated

| | |
|---|---|
| Lessons with **2 or more** problems | **39 of 83** |
| Lessons with **no** problems at all | **33** |
| Problems that exist | 156 |
| Extra problems needed for two per topic, at today's granularity | **77** |

Python is not exempt: **20 of its 39 lessons are below the bar** — getting-started,
file-handling, modules, scope, dates, decorators, concurrency, async, testing and
project-git have none at all; json, match-case, inheritance, encapsulation,
dunder-methods, iterators-generators and clean-code have one each.

**Therefore §3 and §4 are content work before they are code work.** The gating
logic is a few days; shipping it against today's content would lock every student
out of topics whose problems do not exist. Content first, gate second.

---

## 4. Chapter download lock

A chapter can be downloaded only after its topics are read, its required problems
solved, and the minimum completion met (both docs agree).

`/book` is currently fully open and prints to PDF with no gate at all.

**One caution worth stating once:** a hard lock also punishes a student who
already knows the material. A "test out" path — pass the quiz and the chapter
opens — keeps the intent (no downloading without demonstrating) without the
frustration. Jugendra's call.

---

## 5. First-time onboarding

Collected at signup: **name**, **gender**, **class or college**, **interests**,
**preferred language**.

Gender is an explicit three-value choice (Doc B): **Male**, **Female**,
**Prefer not to say** — and the third is a first-class option with its own
**neutral** welcome animation, not a fallback.

The welcome animation plays **once**, on first entry, and never again for that
account.

**Two things to settle before building it:**

- Gender and class are personal data. The privacy policy has to say what is
  stored and why, in the same change that starts storing it.
- "Preferred language" implies the content exists in more than one language. It
  does not — the platform is English by Jugendra's own decision. Collecting a
  preference that changes nothing is worse than not asking.

---

## 6. Subject identity and transitions (Doc A)

Every subject should look like its own place, and switching subjects should feel
like moving rooms.

**Done and live:** each subject carries its own hue, shown as a named pill, a
tinted rule on the lesson header, and a progress bar. `lib/subjects.ts` holds one
number per subject; the stylesheet derives the rest, so a new subject needs no
new CSS.

**Not done — Doc A's fuller vision:** per-subject textures and particle effects
(Python snake motifs, Java coffee steam, C++ circuit board and binary, Web
browser chrome and neon, AI neural network, Data Science charts), and the
transition sequence when the subject changes (old theme fades, particles clear,
new textures and colours load, dashboard transforms).

**The honest cost:** the colour system is free to extend. Particles, textures and
transitions are new animated components on every page — download size and battery
on the cheap Android phones these students use, and all of it has to disappear
under `prefers-reduced-motion`, which the platform already respects. Suggested
split: colours everywhere first, animation only on the dashboard and the
subject-switch screen, never behind every lesson.

---

## 7. Where the two documents differed

Recorded so nobody has to re-derive it.

| Point | Doc A | Doc B | Resolved as |
|---|---|---|---|
| Mini quiz in the flow | present | absent | **Kept** — 39 quizzes already exist |
| Visualize / AI guidance in the flow | absent | present | **Kept** (AI guidance paused on cost) |
| Download chapter as a flow step | implied | explicit | **Kept as explicit** |
| Gender options | "optional" | Male / Female / Prefer not to say | **Doc B's three values** |
| Problems per topic | "solve 2 problems" | "at least two", stated as a rule | **Doc B's hard minimum** |
| Notes split by topic | not stated | required | **Doc B** — adds `/book` as a second surface |
| Subject list | 13 subjects + "more" | 19 subjects | **Doc B's longer list**, in ARCHITECTURE.md |
| Per-subject animation detail | full spec | not mentioned | **Kept from Doc A** |
