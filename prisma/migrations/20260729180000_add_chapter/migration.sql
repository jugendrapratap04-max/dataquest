-- The Subject -> Chapter -> Topic level required by docs/ARCHITECTURE.md.
--
-- Additive and reversible: Lesson.chapterId is nullable and Lesson.trackId is
-- untouched, so every existing query keeps working and no progress row moves.
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "trackId" TEXT NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Chapter_slug_key" ON "Chapter"("slug");
CREATE INDEX "Chapter_trackId_order_idx" ON "Chapter"("trackId", "order");

ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_trackId_fkey"
    FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Lesson" ADD COLUMN "chapterId" TEXT;

CREATE INDEX "Lesson_chapterId_order_idx" ON "Lesson"("chapterId", "order");

ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_chapterId_fkey"
    FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
