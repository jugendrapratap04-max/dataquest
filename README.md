# DataQuest 📊🔥

Ek full-stack **data science learning platform** — LeetCode jaisa, but data science ke liye.
Philosophy: **pehle padho → phir usi topic pe practice karo → phir project banao.**

Zero se ₹6–12 LPA tak ka poora roadmap, real in-browser Python compiler, aur progress tracking.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind v4 + custom design system (`app/globals.css`) |
| Database | Prisma + SQLite (`prisma/schema.prisma`, `dev.db`) |
| Python execution | **Pyodide** (Python → WebAssembly, browser me chalta hai, `/public/pyodide`) |
| Code editor | Monaco (VS Code wala editor) |

Sab kuch local chalta hai — koi paid API ya code-execution server nahi.

---

## Chalane ka tarika

```bash
npm install          # dependencies (ek baar)
npm run db:reset     # database banao + seed data daalo (tracks, lessons, problems)
npm run dev          # http://localhost:3000
```

Extra commands:
```bash
npm run db:seed      # sirf seed data dobara daalo
npm run db:studio    # Prisma Studio — database GUI me dekho
```

---

## Structure

```
app/
  page.tsx                 Dashboard (streak, XP, roadmap, progress)
  roadmap/                 9-phase skill sheet
  learn/[slug]/            Lesson view (notes + code + "ab practice karo")
  practice/[slug]/         Compiler — Monaco + Pyodide + test cases
  projects/  notes/  progress/
  api/submit/              Submission record + XP award
  api/progress/            Lesson complete tracking
components/                Sidebar, Topbar, PracticeWorkbench, PhaseList, ...
lib/
  prisma.ts                DB client
  session.ts               Current user (cookie -> demo user; NextAuth baad me)
  pyodide-runner.ts        Browser me Python run + test checking
  highlight.ts             Lesson code highlighting
prisma/
  schema.prisma            Data model
  seed.mjs                 Sample content (Python track fully seeded)
```

---

## Abhi kya real hai (working)
- Real login / signup / logout — email + password, har student ka apna account & progress
- Real database — user, tracks, lessons, problems, submissions, notes
- Real Python compiler — Pyodide se browser me actual code chalta hai
- Real test-case checking — pass/fail with expected vs got
- Interactive visualizations — Memory Playground, Casting Lab, Operator Lab, Loop Visualizer, List Indexer
- No copy-paste practice editor + celebration on solve
- Progress persist — XP milta hai, submissions save hote hain, dashboard update hota hai
- **Python Basics module COMPLETE** — 7 lessons + 21 practice problems

### Demo login
`jugendra@dataquest.dev` / `dataquest` — ya khud ka account bana lo (Signup).
Prod me `AUTH_SECRET` env set karo.

## Aage karne wala (TODO)
- [ ] Baaki tracks ka content (Statistics, Pandas, SQL, ML…)
- [ ] SQL playground (sql.js se)
- [ ] Pandas/NumPy practice (Pyodide me micropip se install)
- [ ] Leaderboard, certificates, daily challenge logic
- [ ] Streak auto-update (daily activity pe)
- [ ] Session hardening (session table / rotation)

---

_Made with Claude Code. Pehle padho, phir practice karo, phir project banao._
