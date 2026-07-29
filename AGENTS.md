# Read this before designing anything

**DataMarg is not a Python course and not a Data Science platform.** It is an
AI-powered, multi-subject learning ecosystem. Python is only the first subject.

Before you design a schema, a service, an AI workflow or a screen, read
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). The short version:

- The model is **Subject → Chapter → Topic → { lesson, visualization, quiz, problems }**.
  Today's `Track` is a Subject and today's `Lesson` is a Topic; `Chapter` does not exist yet.
- Every subject uses the same engine: Learn → Visualize → Practice → AI Guidance →
  Quiz → Revision → Projects → Career Path.
- A subject may bring its own compiler or simulator, or none. Progress, XP and
  revision work identically across all of them.
- **Do not hardcode anything to Python or Data Science.** Four places still do,
  and they are listed in the architecture doc — fix them when you touch them.

Current state and open work: [`docs/IMPROVEMENTS.md`](docs/IMPROVEMENTS.md).
Technical findings: [`docs/REVIEW-2026-07-29.md`](docs/REVIEW-2026-07-29.md).

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
