# Deploy — DataQuest ko internet pe live karna

Do cheezein chahiye: ek **Postgres database** (Neon) aur **Vercel**. Dono ka free tier kaafi hai.

Ye guide un steps ko alag karti hai jo **tumhe khud karne hain** (account/secrets) aur jo repo me
already ho chuke hain.

---

## ✅ Migration blocker resolved (2026-07-17)

Pehle is guide me ek 🚩 blocker tha: purani init migration sirf 7 tables banati thi (Study
Together ki 5 tables missing) aur dropped `streak`/`bestStreak` columns wapas bana deti thi.
Ab branch **`deploy`** pe wo init regenerate ho chuki hai — `20260717120000_init` current schema
se bani hai, generated SQL padh ke verify kiya: **12 CREATE TABLE** (StudySession, NotebookEntry,
Room, RoomMember, RoomMessage included), `streak` kahin nahi.

Agar kabhi schema badle to yehi karna hai:
```
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script \
  > prisma/migrations/<naya_timestamp>_init/migration.sql
```
...aur generated SQL ko **khud padhna**, deploy se pehle.

---

## Kyun Postgres — SQLite kyun nahi chalega

Vercel serverless pe chalta hai: har request ek fresh, read-only-ish container me ja sakti hai.
`dev.db` file ya toh gayab hogi ya har deploy pe reset. Matlab students ka progress **save hi nahi
hoga**. Isliye Postgres — ek alag server jo requests ke beech zinda rehta hai.

---

## Step 1 — Neon Postgres (tumhe karna hai)

1. [neon.tech](https://neon.tech) pe free account banao
2. New project banao (region: Singapore/Mumbai — India ke users ke liye tez)
3. **Connection string** copy karo — `postgresql://...?sslmode=require` jaisa dikhega
4. Neon me do branches rakho:
   - `main` → production (Vercel isko use karega)
   - `dev` → local development (tumhare laptop ke liye)

> Ye connection string ek **password hai** — kisi ko mat bhejo, screenshot me mat daalo,
> git me commit mat karo. `.env` already gitignored hai.

## Step 2 — Local .env (tumhe karna hai)

`.env` file me `DATABASE_URL` ko Neon ke **dev** branch ka string bana do:

```
DATABASE_URL="postgresql://...dev branch...?sslmode=require"
AUTH_SECRET="...(pehle se generated hai)..."
```

Phir:
```bash
npx prisma migrate deploy   # tables banao
npm run db:seed             # content daalo
npm run dev
```

## Step 3 — Vercel (tumhe karna hai)

1. [vercel.com](https://vercel.com) pe account banao, GitHub se repo import karo
   (repo abhi local-only hai — pehle GitHub pe push karna hoga)
2. Project Settings → **Environment Variables** me ye do daalo:

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon ka **main** branch connection string |
| `AUTH_SECRET` | 64-char random hex (neeche command) |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **AUTH_SECRET set karna zaroori hai** — na hone pe app jaan-bujh ke boot hone se mana kar dega.
> Wajah: uske bina session cookies forge ho sakti hain aur koi bhi kisi ke account me ghus sakta hai.
> Ye local wale se **alag** rakhna.

3. Deploy dabao.

---

## Jo repo me pehle se ho chuka hai (tumhe kuch nahi karna)

- `prisma/schema.prisma` → `provider = "postgresql"`
- Migrations Postgres ke liye regenerate ho chuki hain (`prisma/migrations/`)
- `vercel-build` script — Vercel isko khud uthata hai:
  ```
  prisma generate && prisma migrate deploy && next build
  ```
  - `prisma generate` — Vercel node_modules cache karta hai, isliye ye na ho to stale
    Prisma Client ke saath build ho jaata hai (classic bug)
  - `prisma migrate deploy` — prod database pe tables khud ban jaati hain
- Pyodide (21MB) aur sql.js (696KB) `public/` me hain → students ke browser tak Vercel CDN se
  static serve honge
- **Server-side XP verification ke liye wahi files submit-lambda me bhi jaati hain** —
  `next.config.ts` ka `outputFileTracingIncludes` `/api/submit` function ke saath
  `public/pyodide/**` + `public/sqljs/**` bundle karta hai (warna `lib/verify.ts` ko lambda pe
  khaali folder milta aur har sahi solution 0 XP deta — yehi audit ka **C1** tha). 21MB sirf
  us ek function ka cold start slow karta hai, Vercel ki 250MB limit se bahut neeche.

---

## Deploy ke baad check karna

1. Signup se ek naya account banao → dashboard khulna chahiye
2. Koi Python problem solve karo → tests pass **aur XP milna chahiye** (pehli baar slow).
   **Ye C1 ka asli test hai:** agar "All passed" ke baad bhi 0 XP + verify note dikhe, to
   Pyodide wheels lambda tak nahi pahunche — `outputFileTracingIncludes` ka path check karo.
3. Koi SQL problem solve karo → rows dikhni chahiye + XP milna chahiye
4. `/focus` aur `/rooms` kholo → dono load hone chahiye (Study Together ki 5 nayi tables ka test)
5. Logout → login → **XP wahin hona chahiye** (matlab Postgres sach me persist kar raha hai)

Agar 5 fail hua to `DATABASE_URL` galat hai.

---

## Abhi bhi khula hua (deploy blocker nahi)

- **Session revoke nahi hoti** — cookie 30 din valid hai; logout sirf browser se cookie hataata
  hai, server pe wo token phir bhi valid rehta hai. Learning platform ke liye theek hai, par
  agar kabhi sensitive data aaya to server-side session table chahiye hoga.
- **`npm run db:reset` production pe kabhi mat chalana** — saara student progress mit jayega.
  Content add karna ho to `npm run db:content` chalao — wo slug pe upsert karta hai, mitaata nahi.
