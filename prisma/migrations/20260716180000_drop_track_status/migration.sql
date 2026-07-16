-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Py',
    "whyText" TEXT NOT NULL DEFAULT '',
    "weeks" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL DEFAULT 'Beginner',
    "milestone" TEXT NOT NULL DEFAULT '',
    "toolsCsv" TEXT NOT NULL DEFAULT '',
    "skillsJson" TEXT NOT NULL DEFAULT '[]',
    "checkpoint" TEXT
);
INSERT INTO "new_Track" ("checkpoint", "icon", "id", "level", "milestone", "order", "skillsJson", "slug", "subtitle", "title", "toolsCsv", "weeks", "whyText") SELECT "checkpoint", "icon", "id", "level", "milestone", "order", "skillsJson", "slug", "subtitle", "title", "toolsCsv", "weeks", "whyText" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_slug_key" ON "Track"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

