# Dashboard worklist — one item at a time

Built 2026-08-07 from a five-lens code audit (69 raw findings) plus a live
click-through of every control on the deployed page. This is the list we work
down **one item per sitting**, verifying each before the next — Jugendra's rule:
*"ek ek karke thing uthaenge, jab improve ho tabhi aage badhenge."*

**How to use it.** Take the top unchecked item. Fix it. Measure it. Tick it.
Anything found on the way gets added to the bottom, not fixed on the spot.

**Status key:** `[ ]` open · `[x]` done · **D** = needs Jugendra's decision
before code · **F** = just fix, no decision.

> **The `F` items are GitHub issues #1–#12** (2026-08-07), written so Copilot's
> coding agent — or anyone — can act without this conversation. Each carries
> file references, a re-measured reproduction, and what not to break.
> The `D` items stay here: they need a decision, or live measurement against the
> production database and the deployed site, which no CI sandbox has.

---

## Done already

- [x] **D0 · Four focus rings were deleted by a leaked CSS comment.** `F`
      A comment closed early, prose fell into the stylesheet, and CSS error
      recovery ate the rule below it — the todo input, both note fields and both
      code editors lost their keyboard focus ring while keeping `outline:none`.
      Nothing caught it (build, lint and the dead-code sweep all passed).
      Fixed; `npm run dead-code` now parses the stylesheet as check 0.
      Commit `27d13e8`.

---

## Tier 1 — the page tells lies (do these first)

- [x] **D1 · done — Continue now means your subject.** `F`
      Nothing records "last opened", so the hero follows the most recent thing
      the student **finished** (a completed lesson or a solved problem,
      whichever is later) and opens the first unfinished lesson in that subject;
      then the next unfinished anywhere; then lesson one. The eyebrow and CTA
      follow real activity instead of sign-in, so a signed-in account that has
      never opened a lesson reads "Start here", not "Continue where you left
      off". Verified against three real accounts on a production build:
      SQL → SQL & SELECT, HTML → HTML lesson 3 (its first unfinished, not its
      first), zero-activity → Python lesson 1 under "Start here". Commit
      `13ffad6`.
      **NOT verifiable on the live site:** production sessions cannot be minted
      (its AUTH_SECRET is a sensitive var), so the per-user check runs against a
      local production build pointed at the production database.

- [x] **D2 · done — and it took D3 with it.** `F`
      A "skill" was a name in a list; nothing said which lesson teaches it. The
      gap was filled by ticking skills in **list order** against a ratio of
      lessons done, and that ratio drove a "Skills mastered" percentage on two
      pages plus a green tick per skill on a third.
      Fixed at the source. The dashboard ring shows what the card is already
      titled — overall progress, `(lessons + problems) done / exists` — so it is
      the **sum** of the tiles two cards up and cannot disagree with them; the
      legend names the two components plus subjects opened, and at zero it
      offers the lesson that would move it. `/progress` traded "Skills Mastered"
      for the same number and its bars are honestly titled "Progress by
      subject". The roadmap keeps the skill NAMES (a real fact about the
      syllabus) and drops the tick and the empty checkbox.
      Verified on a real account: ring 2%, legend 8/160 and 2/450, tiles 8/160
      and 2/450, `/progress` 2%, 104 skill rows with 0 ticked. Commit `be5015b`.

- [x] **D3 · gone with D2.** The "In progress 104 / Locked 0" legend does not
      exist any more — the ring's three rows are lessons, problems and subjects
      opened, all counted from what the student did.

- [x] **D4 · done — and the item as written was half wrong.** `F`
      **Measuring first killed the premise.** There are no unwritten subjects:
      all 11 have lessons and 141 of 160 pass the teaching-block test (the code
      comment claimed 50 of 83). The real bug was quieter and worse — `ready`
      meant *every* lesson at the full standard, so **Python (56/58) and HTML
      (22/35) both counted as unwritten**, and the only thing keeping a padlock
      off the flagship course was EXPLORE_MODE, a review switch `gates.ts` says
      to turn off once there are students.
      Fixed: `ready` asks whether the subject has any lessons; `isTaught()`
      deleted (a drifted second copy of `check-syllabus.mjs`'s standard — that
      standard has one owner, `npm run syllabus`). `ready` is exposed on
      `TrackProgress`; `status` and its consumers (skills legend, roadmap) are
      untouched, verified after. The tile stops printing zeros: an unopened
      subject reads **"Not started"** with no empty rail. Commit `e08a555`.

- [x] **D5 · done — there is a problem of the day now.** `F`
      `lib/daily.ts` picks one from the date itself: same problem for everybody
      on the same day, tomorrow's decided by arithmetic. No schema, no table, no
      cost. The pool is the **401 Easy and Medium** problems (measured; all four
      engines, every one with a lesson) — a Super Hard as the day's one task is
      a reason to close the tab. The card names it, quotes its **real**
      difficulty and XP (it used to type "+20 XP" while the award is per problem
      and set by the server), and links to that problem's workbench; if you have
      solved it already it says so and offers another.
      Verified live: guest and signed-in reader get the same problem, the link
      opens a real workbench, the pick holds from 01:00 to 23:00 and changes
      tomorrow. **NOT render-verified:** the already-solved branch — nobody has
      solved today's pick — so both its inputs were checked instead.
      ⚠️ The rollover is the server's day, deliberately the same basis as the
      streak. **D8 must move both together.** Commit `9a766da`.

- [ ] **D6 · Two Practice Arena cards, one destination.** `D`
      "Python Compiler — real, in-browser" and "Problem Sets" both link to
      `/practice`, and so does "All playgrounds →" — three controls, one page.
      There is no free-run compiler route; the only editor is a checked problem.
      *Decision:* build the scratchpad the card promises, or collapse to one
      honest card.

- [x] **D7 · done — reading counts as a day studied; XP stays code-only.** `F`
      **The decision, and why it split.** Finishing a lesson now counts for the
      streak, the dashboard's week of ticks and both heatmaps — showing up is
      measured, which matters most for the seven HTML Module 0/1 lessons and the
      deploy track, where there are no problems to solve by design. One source
      (`studyMoments`) feeds all three counters, because they were separately
      correct before and that is the only reason they stayed in step.
      **XP deliberately does not follow.** `db:check` fails any account holding
      more XP than its passing submissions justify — the invariant born from
      16,080 seeded XP — and `/api/progress` takes the client's word for it, so
      paying XP there would let a loop mint the number the leaderboard ranks on.
      Reading is rewarded by the streak, the squares and four Reading badges;
      solving is rewarded by XP, and the tiles now say which is which.
      Measured before shipping: one real student goes streak 0 → 1 and active
      days 4 → 6 (he had finished two lessons and been told he had none).
      Nobody else moves; seven rows predate `completedAt` and are skipped rather
      than dated by guesswork. Commit `37055e7`.

- [ ] **D8 · Day boundaries run on server time (UTC), not IST.** `D`
      A problem solved at 01:00 IST is filed to the previous day — it can break
      a streak the student kept, and mislabel the weekday on the tick row.
      *Decision:* declare IST for the three bucketing sites (cheap), or store a
      per-user timezone (correct).

---

## Tier 2 — states nobody designed

- [ ] **D9 · Finishing everything sends you back to lesson 1.** `F`
      With no unfinished lesson the code falls back to `lessons[0]`, so the hero
      offers "Continue where you left off → Meet Python". No completion state,
      no certificate link.

- [ ] **D10 · A broken streak erases your best.** `F`
      `best {n}` renders only while the streak is alive, so a student whose
      30-day run broke sees no trace of it — just "your streak begins".

- [ ] **D11 · The hero's "Read theory → Practice" strip is a constant.** `F`
      Step 1 can never show as done (the lesson is by definition unfinished), and
      on the first lesson every new user sees, step 2 can never be ticked either
      — that lesson has no problems.

- [ ] **D12 · Emptying Today's Plan leaves a heading and a blank gap.** `F`
      No empty branch, and the starters never come back once anything is saved.

- [ ] **D13 · Today's Plan is one un-namespaced localStorage key.** `D`
      Two accounts on one browser share a list; a guest's todos follow them into
      a signed-in session; logout does not clear it; a new device loses it.
      *Decision:* namespace by user and clear on logout, or declare it
      device-local in the UI. (Guest → signup carry-over may be wanted.)

---

## Tier 3 — it breaks at certain sizes

- [ ] **D14 · Between 1081px and ~1164px the hero's CTA wraps for every lesson
      in the database.** `D`
      The 206px right padding that reserves room for the illustration is keyed to
      *viewport* width, but the card's width comes from the two-column grid — so
      the text column collapses to ~205px. Measured: 82 of 82 real lesson titles
      push the buttons onto their own line; the card grows 251px → 367-462px.
      *Decision:* container query, or move the illustration's hide breakpoint up.

- [ ] **D15 · The floating glyph chips paint on top of the headline.** `F`
      They were meant to sit behind the hero's right half. Measured at 1280px: 4
      of 82 lesson titles collide with an opaque 30×14px chip; at 1100px, 19 do.

- [ ] **D16 · Stat tiles are unequal on a phone.** `F`
      The 7-tick activity row has a 128px min-content width and `1fr` cannot
      shrink below it, so Day Streak is 31px wider than its neighbour
      (measured `166px 135px` at 375px).

- [ ] **D17 · The roadmap row shows 2 of 11 subjects with no scroll signal.** `D`
      No scrollbar is laid out on touch, no fade, no snap — and the header two
      lines above says "11 subjects".
      *Decision:* edge fade, peeking half-tile, scroll-snap, or a 2-column wrap.

- [ ] **D18 · Subject tiles wrap to three lines.** `F`
      The dashboard uses `progress.ts`'s `shortTitle()`, which leaves
      "Business Intelligence & Dashboards" whole — while `subjects.ts` already
      has a short-name map built for exactly this and goes unused here.

- [ ] **D19 · Section links wrap into 2-3 line stubs on a phone** and fall under
      the 44px coarse-pointer floor. `D`

---

## Tier 4 — reachable only by keyboard or screen reader

- [ ] **D20 · The todo delete button is invisible on touch and unreadable to
      focus.** `D`
      `opacity:0` revealed only on `:hover` — on a phone it never appears; a
      keyboard user's focus ring is drawn on a transparent element (WCAG 2.4.7).
      It is 17.6 × 17px at every width, under the 24px AA floor (WCAG 2.5.8).
      *Decision:* always visible on touch, or a different affordance.

- [ ] **D21 · The activity tick row is unreadable to anyone.** `D`
      `aria-label` sits on a bare `<div>` (role `generic`), where ARIA prohibits
      it and screen readers ignore it; the day letters exist only in a hover
      `title`, which a phone cannot reach.
      *Decision:* a `role="img"` summary, or visible day letters under the ticks.

- [ ] **D22 · Section headings mash title and subtitle together.** `F`
      Measured accessible names: "Your Roadmap11 subjects, in order",
      "Practice Arenalearn, then master by doing", "Python Compilerreal,
      in-browser".

- [ ] **D23 · Guests get a heading-level jump.** `F`
      Topbar `h1` → GuestBanner `h3` → hero `h2`. Signed-in users are clean; only
      the guest — the activation audience — gets the skip.

- [ ] **D24 · The loading skeleton is a different page.** `F`
      Wrong column ratio, wrong gaps, a title bar the page does not have, nothing
      for the identity strip or guest banner, and about a third of the real
      height.

---

## The front door moved (2026-08-07)

`/` is the dashboard now — Jugendra: *"ye landing page ho naki other"*. It only
works because the dashboard was built guest-first: honest zeros, the whole
roadmap, every lesson open without an account. The marketing page kept its
content and moved to **`/about`**, linked from the sidebar on every screen and
listed in the sitemap in place of a redirect nothing should index.

## Found on the way (added, not fixed on the spot)

- [ ] **D25 · /roadmap says "Ready now: 11".** `F`
      It counts `status !== "locked"`, which nothing can be, so the box repeats
      the "Subjects" box beside it. Same family as D4; separate page.
- [ ] **D26 · Three definitions of "not written yet".** `D`
      `lib/progress.ts` (has lessons), `/certificates` (`lessons + problems === 0`)
      and `/book` (`lessons.length === 0`) each answer it differently, so one
      subject can read three ways across three pages.
- [ ] **D27 · `unlockedIdsFor` in lib/unlock.ts has zero callers** and encodes
      the progression rule a second time — it will drift from `lockStateFor`. `F`

## Deliberately not on this list

- The AI mentor, coins, notification bell and premium cards from the reference
  mockups. They do not exist and this platform has decided not to fake them.
- `Celebrate.tsx` firing on every problem's first solve — flagged long ago, still
  Jugendra's call, still not changed unilaterally.
