# ARCHITECTURE_ANALYSIS — DataMarg / Etudo (summary)

Date: 2026-08-09
Author: Copilot CLI (session)

This document summarizes the current repository architecture and outlines how to integrate an Adaptive AI Mentor.

---

## 1. Existing architecture (high level)

Frontend
- Next.js (app dir) using server and client components (React + TypeScript).
- Heavy client features: Monaco editor, Pyodide runtime (public/pyodide), sql.js (public/sqljs), interactive viz components in components/viz.
- Layout and pages in app/(app)/ and app/; components under components/; global styles in globals.css.

Backend
- Next API routes located under app/api/ (route.ts files) and server helpers under lib/.
- Server-side Python verification using Pyodide in lib/verify.ts (runs inside Node WASM sandbox with interrupt watchdog).
- Server-side RAG-like static assets (public) and linkedom for HTML checks.

Database
- Prisma ORM (prisma/schema.prisma). Key models: User, Lesson, Problem, Submission, ProblemAttempt, LessonProgress, Track, Chapter.
- Indexes and transaction usage already present for Submission-related flows.

Authentication & sessions
- Cookie-based sessions: lib/auth provides signSession/verify with sessionVersion to revoke tokens.
- Login/signup/logout routes under app/api/auth/.
- Rate-limiting in lib/rate-limit.ts (in-process Map, noted serverless limitation).

Course / lesson system
- Lessons stored in DB with contentJson; lessonOutline utility derives TOC, minutes, anchors.
- Practice problems stored in Problem model with testsJson and solutionCode.
- Lesson pages render interactive blocks and embed Workbench components (PracticeWorkbench, SqlWorkbench, LiveCode, LiveHtml).

Quiz & verification
- Client runs tests for instant feedback; server re-runs student submissions (lib/verify.ts) before awarding XP.
- Tests passed to client in ProblemData (note: this leaks expected values to page source; server reverify mitigates exploitation).

Progress tracking
- LessonProgress, Submission, ProblemAttempt track user progress, solved status, and time-to-solve.
- getStreak/getActivity utilities compute streaks and activity heatmap.

Existing AI
- No production AI Mentor exists. No direct provider integrations found. There are guardrails around API usage and costs in docs.

APIs / routes
- app/api/ contains many endpoints: auth, submit, progress, notes, feedback, challenge, rooms, search, etc. readJson, idOf, textOf helpers in lib/http centralize input checks.

State management
- Combination of server components for data fetching and client components for interactive state.
- getCurrentUser abstraction for per-request user resolution.

Design system
- globals.css and a theme scheduling system (lib/theme-schedule). Reusable UI primitives in components/ (cards, buttons, nav, topbar).

Environment & deployment
- env vars: AUTH_SECRET, DATABASE_URL, ADMIN_EMAIL, others.
- Intended deployment: Vercel / Next.js. Build uses `prisma generate` then `next build`.

Testing & verification
- Project includes scripts: `npm run db:check`, `npm run verify:lesson`, `npm run test:*` (several), and `scripts/dead-code.mjs`.

Error handling & security
- App uses layered error boundaries (app/error.tsx and app/(app)/error.tsx).
- lib/http guards against malformed JSON and arbitrary Prisma filters.
- Several security fixes already implemented (Pyodide jsglobals, session revocation).

---

## 2. Reusable components & services that should be reused
- Lesson rendering flow: lessonOutline, LessonTopics, LessonPractice — reuse for Knowledge retrieval anchors.
- Practice Workbench components for runnable examples and hint/progression UI.
- lib/prisma for DB access; reuse schema patterns for any new tables.
- lib/session / getCurrentUser for auth context.
- lib/verify.ts pattern (sandboxed execution, interrupt) for any code-sandboxing needs.
- components/viz for visual explanations and interactive demos.

---

## 3. Problems / missing pieces for AI Mentor
- No AI provider abstraction exists; must add an AIProvider interface.
- No student learning profile table or concept master data.
- No retrieval/RAG index for lesson blocks — need mapping from concepts → lesson content (indexing or simple DB queries).
- Client UI for chat/mentor not present.
- Cost-control and local-model fallback path not implemented.
- Observability for AI metrics not in place.

---

## 4. Proposed AI Mentor architecture (fit to repo)

High-level flow (incremental):
1. Student hits AI route (app/api/ai/chat/route.ts) → server receives message.
2. Server builds Student Context using lib/session + new lib/ai/context.ts (pulls lesson, progress, weak concepts, recent mistakes via prisma).
3. Retrieval: simple DB-backed RAG in lib/ai/retrieval.ts (query lesson blocks by keyword / concept; later add vector store if needed).
4. AI orchestration: lib/ai/orchestrator.ts calls configured AIProvider implementation (LocalModelProvider stub, CloudProvider via env) with prompt including retrieved context and student profile (structured, size-limited).
5. Learning signal extraction: lib/ai/signals.ts parses AI-driven and student responses to emit structured learning signals into a new table LearningSignal.
6. Student profile update: new table StudentLearningProfile, updated via lib/ai/profile.ts with validated signals.
7. Response streamed back to client via server-sent events if needed (support later).

Why DB-first retrieval
- Keeps infra simple (no external vector DB) for MVP. Use database search over lesson content and metadata; fallback to sending short canonical lesson snippets.

---

## 5. Recommended new DB schema (minimal, additive)
- StudentLearningProfile (userId PK)
  - preferredExplanationStyle, preferredLanguage, updatedAt, compact JSON for per-concept scores (or separate table below)
- ConceptMastery (id, userId, conceptSlug, score int, state enum, updatedAt)
- LearningSignal (id, userId, type, metadata JSON, createdAt)
- MentorConversation (id, userId, role, content, createdAt) — optional, keep short-term only

Notes: Prefer separate ConceptMastery rows rather than large JSON. Keep privacy by default; store minimal conversation transcripts unless consented.

---

## 6. Files to create (first-pass)
- lib/ai/provider.ts (AIProvider interface)
- lib/ai/local.ts (LocalModelProvider stub)
- lib/ai/cloud.ts (CloudProvider adapter — configurable via env)
- lib/ai/context.ts (student context builder)
- lib/ai/retrieval.ts (DB-backed RAG helper)
- lib/ai/orchestrator.ts (compose prompt, call provider)
- lib/ai/signals.ts (learning signal extraction)
- lib/ai/profile.ts (profile read/write utilities)
- app/api/ai/chat/route.ts (main chat endpoint)
- components/AIChat/ChatPanel.tsx (client UI) and supporting components (compact)
- prisma/migrations: add StudentLearningProfile, ConceptMastery, LearningSignal models

---

## 7. Files to modify (minimal, surgical)
- prisma/schema.prisma — add new models (migration required)
- components/LessonTopics.tsx (add stable concept ids/anchors if missing)
- lib/lesson-outline.ts — expose block text and concept tags for retrieval
- components/PracticeWorkbench.tsx — add hint hooks to support mentor-driven hints (non-breaking)
- lib/session.ts / getCurrentUser flows — ensure context contains minimal id and permission checks

---

## 8. Files that should NOT be modified (unless necessary)
- lib/verify.ts (sandboxing & verifier) — reuse, avoid change
- prisma/seed.mjs — do not change content seeds unless migrating
- existing problem test harness and grading logic — do not alter grading behaviour
- critical auth flows: lib/auth.ts and API auth checks

---

## 9. Incremental implementation plan (next steps)
1. Add AIProvider abstraction and a LocalModelProvider stub (no external calls) — minimal code; unit tests.
2. Add DB schema for StudentLearningProfile + ConceptMastery + LearningSignal (prisma migration). Keep schema additive.
3. Implement app/api/ai/chat/route.ts that assembles context and returns canned responses via LocalModelProvider — no costs.
4. Add a lightweight ChatPanel UI behind an authenticated route; show static responses and basic controls (Explain simpler, Give example, Hint).
5. Implement lib/ai/retrieval.ts to query lesson content by keyword and return short snippets (limit length). Integrate into orchestrator.
6. Implement learning signal extraction for explicit feedback events (thumbs up/down, "I don't understand").
7. Add tests for profile creation/update and orchestrator validity.
8. Iterate: swap LocalModelProvider with CloudProvider adapter when a provider is chosen.

Estimate: Phase 0–3 MVP (safe local model + DB) = ~1–2 weeks of focused work depending on content mapping effort.

---

## 10. Risks & mitigations
- Secrets leakage: strictly avoid sending ENV or server-only data to provider; pass only non-sensitive context.
- Cost: start with LocalModelProvider and config-gated CloudProvider. Throttle AI calls.
- Privacy: store only structured signals by default; keep raw transcripts short-term and opt-in for retention.

---

## 11. Next actions (immediate)
1. Confirm this architecture and the minimal DB additions.
2. I will produce a detailed implementation plan listing exact files and changes (one per patch) and a prioritized task list.
3. After your go-ahead, implement the Provider abstraction and the chat API stub as a first commit.

---

End of analysis.