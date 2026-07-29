-- Onboarding answers (docs/LEARNING-SPEC.md §5).
-- All nullable or defaulted, so every existing account stays valid and simply
-- has not been onboarded yet.
ALTER TABLE "User" ADD COLUMN "gender" TEXT;
ALTER TABLE "User" ADD COLUMN "institution" TEXT;
ALTER TABLE "User" ADD COLUMN "interestsCsv" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "User" ADD COLUMN "onboardedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "welcomedAt" TIMESTAMP(3);
