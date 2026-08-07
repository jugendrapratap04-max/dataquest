# UI Redesign — audit and strategy (2026-08-07)

Jugendra supplied ten reference mockups and a master prompt: analyse them against
the current UI, extract the best of both, and restyle Etudo page by page —
**without touching routing, business logic, APIs, database or content.**

This document is the audit those instructions asked for, and the strategy that
came out of it. The visual version (with prototype frames) is the
"Etudo UI Redesign — Audit & Strategy" artifact; this file is the durable record.

## The headline finding

**The mockups and the product already agree on the skeleton.** Continue-learning
hero, stat tiles, subject roadmap strip, practice arena, to-do list, progress
ring, daily-challenge card — every one exists on the live dashboard today, and
the lesson block engine (hook → def → analogy → worked → faded → trace → debug →
drills → quiz, plus 91 viz labs) is *richer* than anything the mockups draw.
The gap is visual voice, not information architecture. This makes the redesign a
**restyle, not a rebuild** — far lower risk than the brief implies.

Second headline: **the default theme is already light warm-paper**
(`--ground:#F1EDE4`, white panels, amber `#E8920C`). The dark screenshots in
ui-shots/ are the unlockable Sunset theme. And the brief's palette already lives
in the tokens: orange primary = existing amber; purple secondary = existing
`--indigo #4F5BD5` (today used only for badges); pastels = the existing `*-soft`
tint set. The work is promotion and usage, not invention.

## Reality check — mockup features vs the platform

| Element | Status | Decision |
|---|---|---|
| Continue hero, stat tiles, subject strip, todo, ring, rooms+voice, leaderboard, badges, challenges, certificates, resume | EXISTS | restyle |
| Weekly activity heatmap on dashboard | PARTIAL (query exists — `getActivity`) | adopt with real data |
| Daily Challenge | PARTIAL (a card linking /practice; its "+20 XP" is a TYPED number) | restyle honestly, drop typed XP |
| Coins/shop, notification bell, premium, per-lesson notes | FICTION | omit — no fake doors |
| AI Mentor | FICTION (zero AI in codebase; cost-rejected earlier) | Jugendra's call |
| Python-only roadmap in every mockup | FICTION | design must stay multi-subject (HTML 35, 8085 19) |

## Current UI — keep vs fix

**Protect:** the token discipline (6 theme blocks, measured radius scale, motion
tokens), the `--sub-h` per-subject hue engine (already implements "every subject
its own accent"), the queried-numbers rule, one-primary-CTA, the block engine,
the walked accessibility work, the microcopy voice.

**Fix (measured in the screenshot audit):** monospace runs the UI voice
(eyebrows, labels, crumbs, whole roadmap paragraphs — reads dev-terminal);
zero-state shaming ("🔥 0 STREAK" pill for the exact users activation needs);
practice list = 441 cards / 26,500px; roadmap = 6,000px accordion monolith;
doubled lesson footers (tnav + lnav read as the same control twice; four stacked
nav blocks on mobile); no illustration/mascot anywhere; logo mark still "D";
stock Next.js favicon; sidebar user card overlapped by the Focus FAB; off-palette
magenta avatar gradient; near-invisible profile heatmap.

## The design language

- **Color — promote, don't replace.** Amber-orange stays the single action
  colour. `--indigo` is retuned into the identity purple. `*-soft` pastels move
  from occasional to the main categorical device (callouts, subject chips, tag
  pills). All four themes keep working; contrast measured per theme per pairing.
- **Typography — the biggest lever.** One self-hosted variable display face
  (proposal: Bricolage Grotesque via `next/font`, OFL, no CDN) for headings,
  greetings, hero numbers. Body stays system. **Mono is demoted to code and
  tabular data only** — every UI label/eyebrow/crumb becomes small-caps sans.
- **Softness.** Elevation-separated cards (shadow token exists), bigger padding
  and section gaps, feature-tint washes instead of 1px shouting borders.
- **Delight.** Hand-built flat SVG illustration set tinted by `--sub-h` (no
  external assets, no bill — pending decision); entrance fades and a
  lesson-complete celebration (sanctioned by the brief; Celebrate engine exists;
  everything behind the global reduced-motion guard; press-block-last preserved).
- **Zero states invite, never shame.** At zero the streak chip reads "Start your
  streak today", stat tiles offer the first action. Activation is the design's
  first customer.

## Rollout (page by page, measured at every step)

0. **Foundation** — font pairing, de-monospacing, tint tokens, elevation,
   zero-state rule, favicon + "E" mark. Done when: contrast passes in all four
   themes, no unaudited layout shift, Lighthouse unchanged.
1. **Dashboard** — the prototype frame for real, incl. activity strip from
   `getActivity`. Done when: one primary CTA, all numbers queried, sidebar
   user-card overlap fixed.
2. **Lesson** — callout tint system mapped 1:1 onto block types (def→purple,
   note→warm, mistakes→red, recap→teal), topic pills, footer dedup,
   lesson-complete celebration. Done when: 760px measure intact, mobile fold not
   worse, verify:lesson untouched.
3. **Practice** — filters/grouping + progressive reveal (list under ~4,000px
   initial), workbench polish. Grading flow byte-identical.
4. **Roadmap + shell** — journey visual from real lock/progress states,
   sidebar/topbar restyle.
5. **The rest** — profile, book, rooms/focus, auth, empty-state sweep.

**Will not change:** routes, APIs, DB, content, the four-theme system,
press-block-last, reduced-motion, queried-numbers, guest-first activation flows.

## Open decisions (Jugendra)

1. AI Mentor: skip UI (recommended) / honest shell over static error-help /
   separately scoped real integration.
2. Illustrations: hand-built SVG set (recommended) / typographic only / supplied assets.
3. Typeface: Bricolage display + system body (recommended) / full pairing / system-only.
4. Start: Foundation+Dashboard (recommended) / Lesson first / Foundation only, then review.
