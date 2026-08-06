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

**Rules.**
- Motion communicates state. It is never decoration.
- Most interactions are opacity, colour, or ≤2px of movement.
- Celebration is for lesson complete, module complete, level up — nothing
  smaller.
- Never delay an action to finish an animation.
- `prefers-reduced-motion` must be honoured. The skeletons already do.

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
