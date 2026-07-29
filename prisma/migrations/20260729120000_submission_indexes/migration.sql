-- Submission had no index at all, while every other model had them.
-- It is queried by userId on nearly every authed page render.
CREATE INDEX "Submission_userId_problemId_passed_idx" ON "Submission"("userId", "problemId", "passed");
CREATE INDEX "Submission_userId_createdAt_idx" ON "Submission"("userId", "createdAt");
