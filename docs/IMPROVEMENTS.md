# DataMarg — Improvements Backlog

Everything Jugendra has asked for, in one place, with what is done, what is left,
and what changes on screen.

**Sources:** Jugendra's product document *"DataMarg – Product Ideas & Feature
Backlog"* (29 July 2026) and his review notes in chat the same day.
**Technical findings** live separately in [`REVIEW-2026-07-29.md`](./REVIEW-2026-07-29.md).

**Status key:** ✅ done and live · 🟡 partly done · ⬜ not started
**Size:** S = under a day · M = a few days · L = a week or more · XL = months

---

## A. At a glance

| # | What you asked for | Status | Size |
|---|---|---|---|
| 1 | Operators lesson still in Hinglish | ✅ | — |
| 2 | Quiz jumps back to question 1 after each answer | ✅ | — |
| 3 | Congratulations / solve-flow messages in English | ✅ | — |
| 4 | "Next problem" not related to the topic | ✅ | — |
| 5 | Problems arranged concept-wise | 🟡 | M |
| 6 | 7 more lessons still in old Hinglish format | ⬜ | L |
| 7 | All problem text in English | ⬜ | L |
| 8 | Topic-wise learning + unlock flow | ⬜ | L |
| 9 | Chapter locked until problems solved, then downloadable | ⬜ | M |
| 10 | First-time welcome: gender, class, interests, language | ⬜ | M |
| 11 | Subject-based themes, textures and animation | ⬜ | L |
| 12 | Many subjects: Java, C, C++, JS, Web, AI/ML, DSA, Cloud, Security | ⬜ | XL |

---

## B. Done — and how it was checked

### 1. ✅ Operators lesson rebuilt in English, at full standard
You wrote: *"operator mai language nahi change hua hai"*.

- 805 → 1769 words in source, 2220 as rendered on the page.
- Every teaching block it was missing is now there: analogy, career note, trace,
  11 drills, a debug task.
- Quiz went from 4 unlevelled questions to 10 across three levels.
- **Checked:** `verify:lesson` ran every snippet as real Python — 22/22 passed.
  The interactive Operator Lab was driven in a production build (`%` → `17 % 5 = 2`).
- Live: `/learn/operators`

### 2. ✅ The quiz no longer jumps back to question 1
You wrote: *"jab bhi hum new mcq ka question solve karte hai to bo fir se first
mcq per pahucha deta hai to fir se scroll karna padta hai"*.

The `Question` component was declared **inside** the quiz's render body, so every
answer created a new component type and React threw away and rebuilt all the
questions. The browser lost its scroll position along with them.

- **Checked:** scroll position was 4631 before the click and 4631 after, and the
  question's DOM node is the same object across the answer.
- ⚠️ **The same bug pattern exists elsewhere** — the linter flags it in
  BitwiseLab, ConditionFlow, LoopVisualizer and OperatorLab. Those visuals may
  reset when you interact with them. Not yet fixed (see §F).

### 3. ✅ The solve-flow messages are English now
You wrote: *"congratulation massage bhi English mai hi karna jab problem solve ho
jati hai tab"*.

Changed: the celebration lines and its button ("Yahin ruko" → "Stay here"),
"Agla problem" → "Next problem", "Sab problems" → "All problems", "Code me error
hai" → "Your code has an error", "Query me error hai" → "Your query has an
error", and three verifier messages.

**Not changed:** the problems themselves. See §D.2 — that is the big one.

### 4. ✅ "Next problem" stays on the topic
You wrote: *"bo problem us topic se related nahi hoti hai… mai chahta hoon jab
koi topic pad raha ho to sari problems us topic se hi related ho, aur pichhle
topics se jo student complete kar liya hai, uska revision bhi ho jaye"*.

It used to sort every problem on the platform by difficulty and take the next one
in that global list. Simulated against the real database:

| You just solved | Old next problem | New next problem |
|---|---|---|
| count-positives (loops) | np-array-mean (**NumPy**) | sum-to-n (**loops**) |
| add-two (operators) | final-balance (**encapsulation**) | is-even (**operators**) |
| reverse-string (strings) | round-to (**numbers-math**) | shout (**strings**) |

The rule is now exactly what you described: **same topic first → then earlier
topics already covered (revision, nearest first) → and only when nothing is left
behind, move forward.** A student is never dropped into a topic they have not
reached.

---

## C. Partly done

### 5. 🟡 Problems arranged concept-wise
The *ordering* is fixed (§B.4). What is still missing is coverage:

- **13 Python lessons have no practice problems at all**: getting-started,
  file-handling, modules, scope, dates, decorators, concurrency, async,
  system-modules, data-persistence, testing, debugging-logging, project-git.
- **Four whole tracks have zero problems**: Data Visualization, BI, Deep
  Learning, Deployment. Machine Learning has 3 across 6 lessons.

So "every problem comes from the topic you are on" is true wherever problems
exist, and impossible where they do not. **Writing those problems is the work.**

---

## D. Content backlog

### 1. ⬜ Seven lessons still in the old short Hinglish format
Measured by Hinglish word density and length. The rebuilt lessons run ~2,200
words; these run 600–780.

| Order | Lesson | Words | Source array |
|---|---|---|---|
| 3 | operators | ~~678~~ | ~~L2~~ ✅ **done** |
| 5 | loops | 774 | `L4` |
| 6 | lists-tuples | 702 | `L5` |
| 9 | strings | 721 | `L8` |
| 10 | comprehensions | 728 | `L9` |
| 11 | oop | 672 | `L10` |
| 12 | error-handling | 626 | `L11` |
| **17** | **booleans** | **615** | `L16` |

⚠️ **`booleans` was not on your list** — you listed 3, 9, 5, 6, 10, 11, 12. The
measurement found an eighth lesson in exactly the same state.

### 2. ⬜ All problem text in English
You wrote: *"copiler mai jitani bhi problems hai unme hinglish hai, isko bhi
English mai karna hai"*.

Measured: **all 156 problem descriptions are Hinglish, and 140 of them have
Hinglish hints.** This is the single largest content job on the list, and it has
a real consequence today — a student reads an English lesson and then opens a
Hinglish problem underneath it.

**Open question only you can answer:** should the *teaching prose* be English
too, or stay Hinglish with only code and UI in English? The answer changes 7
lessons and 156 problems, so it is worth deciding before any of it starts.

### 3. ⬜ Four stub lessons, and everything beyond Python
- 4 Python lessons are still stubs: testing, debugging-logging, clean-code, project-git.
- **44 of 83 lessons — every lesson in tracks 2 to 9 — are 48–129 word stubs**
  with no teaching blocks and no quiz.
- **48 of 134 syllabus topics have nothing at all**, including all 13 DSA topics
  (Big-O, stacks, queues, linked lists, hash tables, trees, graphs, searching,
  sorting) and 7 reference pages. DSA is the interview-critical block.

---

## E. Your product ideas — the plan for each

### 6. ⬜ Topic-wise learning system (M–L)
Your flow: **Chapter → Topic 1 → solve 2 problems → unlock Topic 2 → solve 2 →
unlock Topic 3 → mini quiz → chapter complete.**

This is the strongest idea in your document and it fits what the platform already
believes: *Learn → Practice → Test → Unlock → Continue*.

**What has to be built:**
- A lesson is currently one long page. It has to be split into named *topics*
  with their own boundaries.
- Progress today records "lesson done". It needs to record "topic done" —
  a schema change.
- Problems need to be tagged to a topic, not just to a lesson.
- Gating rules on the server, not just hidden buttons in the UI.

**Blocked by:** §C.5 — you cannot require 2 problems per topic when 13 lessons
have none.

### 7. ⬜ Smart chapter unlock and download (M)
Your rule: *"jab bo any chapter download karna chahta hai to usko first problem
solve karni hogi"* — read the topic, complete the required problems, pass a
minimum score, and only then the next chapter unlocks and becomes downloadable.

Today `/book` is fully open and prints to PDF with no gate at all. Needs the
same topic-progress data as §6, plus a per-chapter download that respects it.

**One honest caution:** a hard lock frustrates a student who already knows the
topic. Worth considering a "test out" path — pass the quiz and the chapter opens
without grinding the problems.

### 8. ⬜ Personalised first-time welcome (M)
Collect at signup: **name, gender (optional), class/college, interests, preferred
language.** Then a one-time welcome animation — male, female, or neutral.

**What has to be built:** new profile fields, a multi-step signup (today it is
three fields), the animations themselves, and a "seen it" flag so it plays once.

⚠️ **Two things to decide before building:** gender and class are personal data —
the privacy policy has to be updated to say what is stored and why. And "preferred
language" implies the content exists in more than one language, which today it
does not (see §D.2). Better to collect it only once it changes something.

### 9. ⬜ Subject-based themes, textures and animation (L)
Your idea: each subject a different world — Python dark blue with floating
particles, Java orange/red with coffee steam, C++ metallic with circuit textures,
Web with a browser-style interface and neon, AI/ML with neural-network
animation, Data Science with charts in the background. Switching subjects plays
a transition: old theme fades, particles clear, new textures and colours load.

**The good news:** the theme system already exists — the whole site is driven by
one `data-theme` attribute and CSS variables, so *colour* identity per subject is
genuinely cheap.

**The honest part:** particles, textures and transition animations are not the
theme system, they are new animated components on every page. They cost download
size and battery on the cheap Android phones your students use, and the platform
already has a `prefers-reduced-motion` switch that must turn all of it off.

**Suggested split:** colours and accents per subject first (small, safe, and most
of the feeling), animation second, and only on the dashboard and subject-switch
screen rather than behind every lesson.

### 10. ⬜ Many subjects — Java, C, C++, JavaScript, Web, AI/ML, DSA, Cloud, Security (XL)
This is the vision, and it is the most expensive item on the list. Two separate
problems hide inside it:

**Content.** Python alone is 39 lessons, roughly 80,000 words, 89 problems and 36
interactive visuals — and 8 of those lessons still need rebuilding. Another
subject at the same standard is that same work again.

**Runtime — this one is engineering, not writing.** The browser today runs Python
(Pyodide) and SQL (sql.js). It cannot run the rest:

| Subject | What running code in the browser needs | Difficulty |
|---|---|---|
| JavaScript | Nothing — the browser already runs it | **Easy** |
| Web (HTML/CSS) | A sandboxed live preview | Easy–Medium |
| C / C++ | clang compiled to WASM, ~10–20 MB download | Hard |
| Java | A JVM in WASM; licensing needs checking | Hardest |
| DSA | Nothing new — it is Python and it already runs | **Easy** |
| AI / ML | scikit-learn wheels, the same way pandas was added | Medium |
| Cloud / Cybersecurity | Cannot be practised in a browser at all — content only | — |

**Recommendation:** the cheapest real expansions are **DSA** (no new runtime, and
it is what interviews test) and **JavaScript** (the browser runs it for free).
Java and C++ should wait until there is a reason bigger than "the list looks
better with them on it".

---

## F. Still open from the technical review

Detail and evidence for each of these is in [`REVIEW-2026-07-29.md`](./REVIEW-2026-07-29.md).

| Issue | Why it matters | Size |
|---|---|---|
| Practice pages send the test answers to the browser | A student can read the expected values in the page source. Fixing it properly means redesigning the instant-feedback loop. | M |
| Logout does not revoke the session | A stolen cookie stays valid 30 days. Needs a token version on the user. | S |
| Interactive visuals may reset on click | Same bug pattern as the quiz — flagged in BitwiseLab, ConditionFlow, LoopVisualizer, OperatorLab. | S |
| `/projects` is a hardcoded "Coming soon" shell | It sits in the sidebar next to real features. | S |
| Voice chat built but locked to the admin | 457 lines of working WebRTC nobody can reach. | S |
| 33 pre-existing lint errors | In TodoList, Topbar, VoiceCall and the viz labs. | S |

---

## G. What changes on screen

Everything above, as a student would notice it.

**Already changed and live:**
- The quiz stays where you are instead of throwing you back to question 1.
- After solving, the next problem is from the same topic.
- The celebration popup, its buttons and the error banners are in English.
- The Operators lesson is longer, English, and has an analogy, a trace, drills and a debug task.
- A real 404 page and an error page instead of a blank dead end.
- The leaderboard no longer shows five fake accounts above real students.
- Every lesson has its own page title, so Google can find them.

**Planned, in the order I would build it:**
1. Seven remaining lessons rebuilt — visibly longer, English, with a quiz and a visual each.
2. Problems and hints in English — the language stops changing halfway down the page.
3. Lessons split into topics, each with its own tick, and a topic bar showing 1/4, 2/4.
4. A topic stays locked until the one before it is done; a chapter cannot be downloaded until its problems are solved.
5. Signup becomes a short multi-step form, followed by a one-time welcome animation.
6. Each subject gets its own colours and accents; later, an animated transition when you switch.
7. New subjects added — DSA and JavaScript first.

---

## H. Suggested order

1. **Decide the language question** (§D.2). Everything downstream depends on it.
2. **Finish the 7 lessons** — Python becomes genuinely complete and English.
3. **Convert the 156 problems** in batches, re-verifying each batch really runs.
4. **Write problems for the 13 empty lessons** — this unblocks the topic-wise flow.
5. **Build the topic-wise unlock system** (§6 and §7 together; they share the data).
6. **Signup + welcome** (§8), with the privacy policy updated in the same change.
7. **Subject colours** (§9, first half).
8. **DSA track**, then **JavaScript**.

Items 1–4 are content and they are what the platform is actually short of. Items
5–8 are features, and each one is more valuable once the content behind it exists.
