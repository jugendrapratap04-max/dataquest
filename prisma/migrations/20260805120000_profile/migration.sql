-- Student profile: the things a person writes about themselves.
--
-- All nullable and additive, so every existing account stays valid and simply
-- has an empty profile — which is the truth about it.
--
-- There is no avatar URL here on purpose. A photo means blob storage (a bill)
-- and a moderation problem, and neither is worth it before the profile itself
-- exists. `avatarEmoji` holds one emoji from a fixed set instead; the colour
-- behind it is derived from the name, the same way subject hues already work.
ALTER TABLE "User" ADD COLUMN "bio" TEXT;
ALTER TABLE "User" ADD COLUMN "goal" TEXT;
ALTER TABLE "User" ADD COLUMN "avatarEmoji" TEXT;

-- When a lesson was finished.
--
-- Deliberately NULL for every existing row rather than DEFAULT now(). The rows
-- that already exist were written weeks ago, and stamping them with today's
-- date would put "you finished this lesson today" on an activity timeline for
-- work that happened long before it. NULL is honestly "we did not record this",
-- and the timeline skips those rows rather than inventing a date for them.
--
-- Same rule as the seeded streak and the seeded Track.status, both removed for
-- exactly this reason: a plausible number nobody measured is worse than no
-- number at all.
ALTER TABLE "LessonProgress" ADD COLUMN "completedAt" TIMESTAMP(3);
