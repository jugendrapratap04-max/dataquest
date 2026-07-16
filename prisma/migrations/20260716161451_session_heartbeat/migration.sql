-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roomId" TEXT,
    "topic" TEXT NOT NULL DEFAULT 'General',
    "goal" TEXT NOT NULL DEFAULT '',
    "focusMinutes" INTEGER NOT NULL DEFAULT 30,
    "breakMinutes" INTEGER NOT NULL DEFAULT 5,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "lastBeatAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "cyclesDone" INTEGER NOT NULL DEFAULT 0,
    "problemsSolved" INTEGER NOT NULL DEFAULT 0,
    "messagesUsed" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudySession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StudySession" ("activeSeconds", "breakMinutes", "cyclesDone", "elapsedSeconds", "endedAt", "focusMinutes", "goal", "id", "messagesUsed", "problemsSolved", "roomId", "startedAt", "topic", "userId") SELECT "activeSeconds", "breakMinutes", "cyclesDone", "elapsedSeconds", "endedAt", "focusMinutes", "goal", "id", "messagesUsed", "problemsSolved", "roomId", "startedAt", "topic", "userId" FROM "StudySession";
DROP TABLE "StudySession";
ALTER TABLE "new_StudySession" RENAME TO "StudySession";
CREATE INDEX "StudySession_userId_startedAt_idx" ON "StudySession"("userId", "startedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
