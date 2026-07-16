-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'Easy',
    "tagsCsv" TEXT NOT NULL DEFAULT '',
    "descriptionMd" TEXT NOT NULL DEFAULT '',
    "examplesJson" TEXT NOT NULL DEFAULT '[]',
    "starterCode" TEXT NOT NULL DEFAULT '',
    "solutionCode" TEXT NOT NULL DEFAULT '',
    "functionName" TEXT NOT NULL DEFAULT '',
    "testsJson" TEXT NOT NULL DEFAULT '[]',
    "hintsJson" TEXT NOT NULL DEFAULT '[]',
    "xp" INTEGER NOT NULL DEFAULT 20,
    "kind" TEXT NOT NULL DEFAULT 'python',
    "sqlSetup" TEXT NOT NULL DEFAULT '',
    "lessonId" TEXT,
    CONSTRAINT "Problem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Problem" ("descriptionMd", "difficulty", "examplesJson", "functionName", "hintsJson", "id", "lessonId", "order", "slug", "solutionCode", "starterCode", "tagsCsv", "testsJson", "title", "xp") SELECT "descriptionMd", "difficulty", "examplesJson", "functionName", "hintsJson", "id", "lessonId", "order", "slug", "solutionCode", "starterCode", "tagsCsv", "testsJson", "title", "xp" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
