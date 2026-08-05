-- Two tables the platform needed before any AI feature can exist: what a student
-- answered on a lesson quiz, and which explained errors they keep hitting. Both
-- were being computed and then discarded in the browser.
--
-- Purely additive. Nothing here touches an existing table, column or row — it is
-- CREATE TABLE, CREATE INDEX and ADD FOREIGN KEY only, generated with
-- `prisma migrate diff` rather than hand-written.

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "qIndex" INTEGER NOT NULL,
    "question" TEXT NOT NULL DEFAULT '',
    "chosen" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "dialect" TEXT NOT NULL DEFAULT 'python',
    "problemId" TEXT,
    "lessonSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizAnswer_userId_lessonId_idx" ON "QuizAnswer"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "QuizAnswer_userId_correct_idx" ON "QuizAnswer"("userId", "correct");

-- CreateIndex
CREATE INDEX "QuizAnswer_userId_createdAt_idx" ON "QuizAnswer"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ErrorEvent_userId_rule_idx" ON "ErrorEvent"("userId", "rule");

-- CreateIndex
CREATE INDEX "ErrorEvent_userId_createdAt_idx" ON "ErrorEvent"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorEvent" ADD CONSTRAINT "ErrorEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorEvent" ADD CONSTRAINT "ErrorEvent_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
