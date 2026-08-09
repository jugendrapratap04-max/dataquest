-- What Byte remembers, moved out of the browser.
--
-- The chat lived in localStorage with a 16-message cap, so Byte forgot you on a
-- different device and forgot the start of a long session while you were still
-- in it. One row per turn; the route trims the old end so a conversation cannot
-- grow without bound.
--
-- Purely additive. CREATE TABLE, CREATE INDEX and ADD FOREIGN KEY only — no
-- existing table, column or row is touched. Generated with `prisma migrate
-- diff` rather than hand-written.
--
-- ON DELETE CASCADE: a deleted account takes its conversation with it.

-- CreateTable
CREATE TABLE "ByteMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ByteMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ByteMessage_userId_createdAt_idx" ON "ByteMessage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ByteMessage" ADD CONSTRAINT "ByteMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

