# DataQuest 📊🔥

Ek full-stack **data science learning platform** — LeetCode jaisa, but data science ke liye.
Philosophy: **pehle padho → phir usi topic pe practice karo → phir project banao.**

Zero se ₹6–12 LPA tak ka poora roadmap, real in-browser Python + SQL, aur progress tracking.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind v4 + custom design system (`app/globals.css`) |
| Database | Prisma + SQLite (`prisma/schema.prisma`, `dev.db`) |
| Python execution | **Pyodide** (Python → WebAssembly, `/public/pyodide`) |
| SQL execution | **sql.js** (SQLite → WebAssembly, `/public/sqljs`) |
| Code editor | Monaco (VS Code wala editor) |

Code browser me hi chalta hai — koi paid API, koi code-execution server nahi. Pyodide aur
sql.js dono `public/` me vendored hain, isliye Python/SQL chalane ke liye kisi CDN pe
depend nahi karte.

> Ek exception: **Monaco editor `cdn.jsdelivr.net` se load hota hai** (`@monaco-editor/react`
> ka default). Yaani editor ko internet chahiye — jsdelivr block/down ho to code likhne ka
> box nahi aayega. Poori tarah offline chahiye to Monaco ko bhi self-host karna padega.

---

## Chalane ka tarika

```bash
npm install
cp .env.example .env   # phir AUTH_SECRET bharo (neeche dekho)
npm run db:reset       # database banao + seed data daalo
npm run dev            # http://localhost:3000
```

Extra commands:
```bash
npm run db:seed      # seed data dobara daalo (reset ke bina)
npm run db:content   # SQL + pandas problems add/refresh karo (existing progress safe)
npm run db:studio    # Prisma Studio — database GUI me dekho
```

> ⚠️ `db:reset` **saara user data mita deta hai** (progress, XP, submissions).
> Sirf content add karna ho to `db:content` use karo — wo upsert karta hai, mitaata nahi.

### AUTH_SECRET
Session cookie isse sign hoti hai. Dev me ek fallback chal jaata hai, par **production me
ye zaroori hai** — warna app boot hone se mana kar dega. Wajah: fallback is repo me committed
hai, aur jo bhi use padh le wo kisi bhi user ka cookie bana ke uske account me ghus sakta hai.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Demo login
`jugendra@dataquest.dev` / `dataquest` — ya khud ka account bana lo (Signup).

---

## Structure

```
app/
  (app)/page.tsx           Dashboard (streak, XP, roadmap, progress)
  (app)/roadmap/           9-phase skill sheet
  (app)/learn/[slug]/      Lesson view (notes + code + "ab practice karo")
  (app)/practice/[slug]/   Compiler — Python (Pyodide) ya SQL (sql.js)
  (app)/projects/  notes/  progress/  leaderboard/  certificates/  resume/
  api/auth/                login / signup / logout
  api/submit/              Submission record + XP award
components/
  PracticeWorkbench.tsx    Python: Monaco + test cases
  SqlWorkbench.tsx         SQL: Monaco + schema browser + result grid
  viz/                     Interactive visualizations
lib/
  auth.ts                  Password hashing + signed session cookie
  pyodide-runner.ts        Browser me Python run + test checking
  sql-runner.ts            Browser me SQL run + result-set diffing
prisma/
  schema.prisma            Data model
  seed.mjs                 Poora seed
  sql-problems.mjs         SQL problems (seed + db:content dono isi se)
  pandas-problems.mjs      NumPy/pandas problems
  apply-problems.mjs       Additive applier (upsert by slug)
```

---

## Abhi kya real hai (working)

- **Real login/signup** — scrypt password hashing, HMAC-signed session cookie
- **Real database** — user, tracks, lessons, problems, submissions, notes
- **Real Python compiler** — Pyodide se browser me actual code, test-case checking
- **Real SQL playground** — sql.js pe asli SQLite; grading result-set diff se hoti hai,
  isliye koi bhi sahi query pass hoti hai (sirf ek "expected" spelling nahi)
- **Interactive visualizations** — Memory Playground, Casting Lab, Operator Lab, Loop
  Visualizer, List Indexer, Bell Curve, Scatter/Correlation, DataFrame Anatomy
- No-paste practice editor + celebration on solve
- Progress persist — XP, submissions, dashboard update
- Leaderboard, certificates, resume + ATS checker, search, notes

### Content abhi kahan tak hai

| Track | Lessons | Problems |
|---|---:|---:|
| Python | 38 | 89 |
| Pandas / NumPy | 6 | 27 |
| Statistics | 11 | 19 |
| SQL | 6 | 18 |
| ML | 6 | 3 |
| Visualization | 5 | **0** |
| BI | 3 | **0** |
| Deep Learning | 3 | **0** |
| Deployment | 4 | **0** |
| **Total** | **82** | **156** |

Saaf baat: Python, Pandas, Statistics aur SQL solid hain — yahi chaar interview me sabse
zyada poochhe jaate hain. **Viz, BI, DL aur Deployment me padhne ko content hai par
practice ka ek bhi problem nahi** — un tracks pe "zero se job-ready" abhi pura nahi hota.

---

## Aage karne wala (TODO)

- [ ] **Permanent deploy** — SQLite → Postgres + Vercel (SQLite serverless pe persist nahi hota)
- [ ] Viz / BI / DL / Deployment tracks ke practice problems (abhi 0)
- [ ] matplotlib / sklearn practice (pandas jaise wheel-download pattern se)
- [ ] Streak auto-update (daily activity pe)
- [ ] Session hardening — expiry, rotation, revoke (abhi cookie 30 din, revoke nahi hoti)

---

_Made with Claude Code. Pehle padho, phir practice karo, phir project banao._
