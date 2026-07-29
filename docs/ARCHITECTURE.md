# DataMarg — Product Vision and Architecture

**DataMarg is not a Python course and not a Data Science platform.** It is an
AI-powered personalised learning ecosystem where a student masters technical
skills, builds real projects, and prepares for a career — in one place.

Python is only the **first subject**, chosen because a browser can already run it
and the teaching format can be proven on it. Nothing in the database, the
learning engine, the progress system or the UI should assume Python.

Stated by Jugendra, 29 July 2026. This document is the standing brief: every
schema change, service, AI workflow and screen is designed against it.

---

## 1. The learning flow — identical for every subject

    Learn → Visualize → Practice → AI Guidance → Quiz → Revision → Projects → Career Path

A subject plugs into this engine. The engine never changes shape per subject; only
its content and its runtime do.

## 2. The content model

    Subject → Chapter → Topic → { lessons, visualizations, quizzes, coding problems }

- **Subject** — Python, Java, DSA, System Design, Cyber Security…
- **Chapter** — a coherent unit within a subject.
- **Topic** — the smallest thing a student completes, and the unit that unlocks.
- Each topic owns its explanation, its interactive visual, its quiz and its
  coding problems.
- **Progress is tracked across every subject**, and the AI Mentor sees all of it,
  not one subject's slice.

## 3. Subjects the platform is being built to hold

Python · Java · C · C++ · JavaScript · Web Development · Data Science · Machine
Learning · Artificial Intelligence · Agentic AI · Cloud Computing · Cyber
Security · DevOps · Mobile App Development · Data Structures & Algorithms ·
System Design · Interview Preparation · Real-world Projects · Career Guidance

The reference point is W3Schools — the same breadth of "every course is here",
with a deeper and more modern syllabus, and practice that actually runs.

---

## 4. Where the code stands against this today

Measured on 29 July 2026, not assumed. The good news is that the data model is
closer to the vision than its naming suggests: `Track` is already, in effect,
`Subject`, and nine of them exist.

| Vision requires | Today | Gap |
|---|---|---|
| Subject → Chapter → Topic → content | Track → **Chapter** → Lesson → Problem | ✅ **Done.** `Chapter` exists and all 83 lessons sit in one. Python is split into 6 real chapters; the other eight subjects have a single chapter each, labelled "not split yet" rather than given invented structure. `npm run db:chapters` maintains it. |
| Any subject can have its own runtime | `Problem.kind` is `"python"` or `"sql"` | A two-value flag, not a language registry. |
| Nothing hardcoded to Python | Mostly true, four real spots | See below. |
| Progress across all subjects | Already user-level | XP, streak, submissions and lesson progress are per user and subject-agnostic. **No change needed.** |
| AI Mentor across subjects | Not built | Deliberately — see §6. |

**The four places Python or Data Science was hardcoded — all four now fixed:**

1. ✅ `components/PracticeWorkbench.tsx` — the editor was pinned to
   `defaultLanguage="python"` and the bar always read "Python 3". Both now come
   from the problem, through the new registry in **`lib/languages.ts`**. Adding a
   language is one entry there; `runnable` records honestly whether its code can
   execute in the browser yet.
2. ✅ `app/(app)/dashboard/page.tsx` — icons came from a chain of
   `slug === "python" ? … : slug === "sql" ? …`, so every subject past the four it
   named silently borrowed the statistics colour. Unknown slugs now get a stable
   accent derived from the slug; adding a subject needs no code change.
3. ✅ `components/ResumeBuilder.tsx` — the ATS keyword list was Data Science only
   (pandas, tableau, power bi, scikit), so a student learning Java would have been
   told to "add Pandas". The list is now built from the skills the platform's own
   subjects teach, with the old list kept only as a fallback.
4. ✅ `prisma/check-syllabus.mjs` — graded **only the Python track**, which is why
   it reported "4 lessons below standard" while 44 stubs sat across the other
   eight subjects. It now scores every subject against the same bar. The honest
   platform number is **35 of 83 lessons (42%)**, and **eight of nine subjects
   have nothing at standard at all**.

Plus `Track` carries Data-Science-shaped fields — `checkpoint`
("Data Analyst · ₹4-8 LPA"), `weeks`, `milestone`, `toolsCsv`. These are fine as
*optional* subject metadata; they must not be assumed to exist.

**Verdict:** the platform is not deeply Python-shaped. It is missing one level of
hierarchy, one language registry, and four small pieces of hardcoding.

---

## 5. Target schema

Additive. No student's progress is lost, and nothing is renamed in a way that
requires the whole app to change at once.

```
Subject   (today's Track, renamed)
  id, slug, order, title, subtitle, icon, level
  runtime          "python" | "sql" | "javascript" | "none"   ← drives the editor and the runner
  metaJson         optional per-subject extras (career checkpoint, tools, weeks)

Chapter   (new)
  id, subjectId, slug, order, title, summary

Topic     (today's Lesson, moved under Chapter)
  id, chapterId, slug, order, title, minutes, contentJson
  unlockRuleJson   what must be done before the next topic opens

Problem
  topicId, language, ...                      ← `kind` becomes `language`
  Everything else stays as it is.

TopicProgress   (today's LessonProgress)
  userId, topicId, status
  Chapter and subject completion are DERIVED from this, never stored.
```

**Migration path, in order:**
1. ✅ **Done.** `Chapter` added (migration `20260729180000_add_chapter`), every
   subject given chapters and all 83 lessons placed. `Lesson.chapterId` is
   nullable and `Lesson.trackId` is untouched, so nothing visibly changed and no
   progress row moved — the level simply exists now, ready to be used.
2. Add `Subject.runtime` and `Problem.language`, backfilled from `kind`.
3. Fix the four hardcoded spots to read from those fields.
4. Split the real chapters out of the long lessons, subject by subject.
5. Add `unlockRuleJson` and turn on gating — this is the topic-wise flow already
   in the backlog.

Deriving chapter and subject progress rather than storing it is not a style
preference. Stored progress is exactly what produced the fake streak and the
seeded "Python done" that had to be ripped out twice.

---

## 6. The AI Mentor — the one item that changes the economics

The vision puts a personal AI mentor at the centre. It is the single most
expensive thing on this list, and it is the only one that costs money **per
student, per message, forever**. Everything else on this platform is a one-time
build on free infrastructure.

Today it is deliberately not built (`docs/ai-mentor-plan.md` keeps the design).
The reason has not changed: every student message is a paid API call billed to
whoever owns the key.

Honest options, cheapest first:

1. **Ask-the-mentor on a strict budget** — a small, cheap model, a hard daily cap
   per student, aggressive caching of repeated questions, and mentor replies only
   at real moments (a failed submission, a wrong quiz answer) rather than an
   open chat box. Costs something, but the ceiling is knowable in advance.
2. **Student brings their own key** — zero cost, but almost no beginner has one.
3. **Free tiers** — they rate-limit below one classroom. Fine to prototype on,
   not to launch on.
4. **Not yet** — build every non-AI part of the ecosystem first.

**This is your decision, not mine, because it is the first thing in DataMarg that
has a bill attached.** What I would do: build the mentor's *hooks* now — the
progress data it needs, the moments it would speak — so it is a small change to
switch on, and decide the spend only when there are students to spend it on.

---

## 7. What this vision costs, honestly

Nineteen subjects at the standard Python is being held to is not a small step up.
Python alone is 39 lessons, roughly 80,000 words, 89 problems and 36 interactive
visuals — and 8 of those lessons still need rebuilding.

The runtime problem is separate from the writing problem:

| Subject | To run code in the browser | Difficulty |
|---|---|---|
| DSA, Interview Prep | Nothing new — it is Python, already running | **Free** |
| JavaScript | Nothing — the browser runs it | **Free** |
| Web Development | A sandboxed live preview | Easy |
| SQL | Already running (sql.js) | **Done** |
| Machine Learning | scikit-learn wheels, as pandas was added | Medium |
| C / C++ | clang compiled to WASM, ~10-20 MB | Hard |
| Java | A JVM in WASM; licensing needs checking | Hardest |
| Cloud, Cyber Security, DevOps, System Design, Career | Cannot be practised in a browser — content, quizzes and projects instead | — |

**Recommended order of subjects:** DSA → JavaScript → Web Development →
Interview Preparation → System Design. Every one of those is free to run or needs
no runtime at all, and the first two are what interviews actually test. Java and
C++ should wait for a reason better than completing the list.

---

## 8. The standing rule

When designing any feature, schema, service, AI workflow or screen, assume:

- More than one subject exists, and a new one can be added without a redesign.
- Every subject has chapters; every chapter has topics; every topic has
  explanation, visualization, quiz and problems.
- A subject may bring its own compiler or simulator, or none at all.
- Progress, XP, achievements and revision work identically across subjects.
- The AI Mentor sees the student's whole journey, not one subject.

Do not hardcode anything to Python or Data Science unless there is no alternative
— and when there is no alternative, write down why, here.
