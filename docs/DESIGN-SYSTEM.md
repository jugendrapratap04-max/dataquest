# Etudo design system

The rules a change has to follow so the interface stays one interface. Short on
purpose — a document nobody reads is worse than none.

Everything here is in `app/globals.css` under `:root`. **Use the token, never
the literal.**

---

## Shape

| Token | Value | For |
|---|---|---|
| `--r-xs` | 6px | chips, tags, tiny marks |
| `--r-sm` | 10px | buttons, inputs, list rows |
| `--r-md` | 12px | cards and panels |
| `--r-lg` | 16px | feature cards (`--radius` is the same value) |
| `--r-xl` | 20px | heroes |
| `--r-pill` | 999px | pills and round buttons |

**Why a scale exists.** Before it there were **264 radius declarations using ten
different values** — 5, 6, 7, 8, 9, 10, 11, 12, 20, 99. Nine and ten and eleven
pixels are the same corner to a human eye, so those were four separate decisions
nobody made on purpose. The scale was drawn *from* the existing design, so
adopting it moved nothing by more than 1px.

**Deliberately off the scale, and should stay off:** thirteen 2–4px radii on
hairline elements — progress fills and 3px bars, where even `--r-xs` would round
them into pills — and two corner-by-corner values (`7px 7px 0 0`, `9px 0 0 9px`)
that a single token cannot express.

## Motion

| Token | Value | For |
|---|---|---|
| `--t-fast` | .15s | hover, colour, opacity |
| `--t-base` | .2s | the default |
| `--t-slow` | .25s | panels, disclosure, layout |
| `--ease` | `cubic-bezier(.2,0,0,1)` | everything |

Was eight durations (.12 .15 .18 .2 .22 .24 .6 .9). Anything above `--t-slow`
belongs to a celebration, not an interaction.

**That first pass tokenised the transitions and left the animations alone.**
Measured later: 47 of 74 motion declarations still carried a literal, and
`viz-land` — one animation — ran at **.2s, .22s, .24s and .28s across 33
places**. Four values 20ms apart is four decisions nobody made. It is now one
token, and the file reads **64 tokens to 13 literals**.

**Deliberately off the scale, and should stay off.** Each is slower than
`--t-slow` for a reason that is not an interaction:

| Where | Value | Why |
|---|---|---|
| `viz-glow` | .9s, after a .22s delay | An attention fade — "this value just changed". At a quarter-second it is a flicker nobody catches. |
| `.focus-stage`, `.fring-fg` stroke | .6s | The calm shift into break mode. An ambient state change, not a step. |
| `sk-shimmer` | 1.4s, infinite | A loading indicator. Already switched off under reduced motion. |
| `.toast` | .35s | A notification arriving from off-screen has further to travel. |
| `pop` / `ob-pop` / `cc-grow` | .28–.5s | Entrances and the celebration card — the one case the rule above names. |

**Progress fill is one speed: `--t-slow`.** Four bars share it. The fifth,
`.readbar > i`, is on `--t-fast` linear on purpose — every other fill animates a
value that *changed*, while that one tracks the scroll position, a continuous
input the reader is moving right now. Easing it reads as lag.

**Rules.**
- Motion communicates state. It is never decoration.
- Most interactions are opacity, colour, or ≤2px of movement.
- **Every control that reacts to a hover must react to a press.** The stylesheet
  once had 57 `:hover` rules and **zero** `:active` ones, which meant that on a
  phone — where there is no hover at all — tapping anything did nothing visible
  until the action finished. The press layer is the last block in `globals.css`
  and has to stay there: `:hover` and `:active` have equal specificity, so a
  hover written later would silently win.
- Celebration is for lesson complete, module complete, level up — nothing
  smaller. ⚠️ **`Celebrate.tsx` currently fires on every problem's first solve**,
  which is smaller. Not changed unilaterally — it is the reward loop, and this
  product's stated problem is activation.
- Never delay an action to finish an animation.
- `prefers-reduced-motion` is honoured **globally**, not just by the skeletons:
  one block near the top of `globals.css` neutralises animation, transition and
  scroll-behaviour on `*`. `Celebrate.tsx` checks it separately because a canvas
  cannot be reached by CSS. The three other `requestAnimationFrame` uses in the
  app are cursor placement after a Tab-indent, not motion, and need no guard.

## Colour

**Already tokenised — 40 custom properties, and colour was not the problem.**
A redesign spec proposed replacing the palette; it was rejected, because Etudo
has an amber/teal identity and **four working themes** driven by `--sub-h`, and
swapping the palette means rebuilding all four.

Add a colour only as a token, and check it in every theme.

## Focus

There is one global rule:

```css
:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
```

**Never write `outline:none` without a visible replacement.** Six controls did —
the search, the todo input, the note form, a settings field and both code
editors — so keyboard focus landed on them and vanished. They now restore the
ring on `:focus-visible`, which fires for keyboard focus and not for a click, so
the editors stay quiet while typing.

## States every page owes

| State | Rule |
|---|---|
| Loading | A skeleton shaped like the page it stands in for. Never a blank screen, never a bare spinner. `.sk`, `.sk-line`, `.sk-card`, `.sk-block`. |
| Empty | A sentence explaining what would be here, and one action. |
| Error | Calm, plus a retry. |
| Success | Say what happened; celebrate only if it was rare. |

## Numbers in the interface

**Every count comes from the database.** Typed numbers go stale silently: the
homepage advertised "9 subjects" and the roadmap said "Nine subjects" while
eleven were live, for weeks, because the counts beside them were queried and
those two were prose.

## Before you add a component

1. Does one already exist? There are 132 — check first.
2. Does it have hover, active, disabled, loading and focus states?
3. Does it work at 390px?
4. Does it use tokens for every radius, duration and colour?
5. Is every number in it queried rather than typed?
