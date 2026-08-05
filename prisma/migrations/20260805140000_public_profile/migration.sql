-- A shareable profile, off by default.
--
-- Additive and safe on a live table: both columns are optional. `publicProfile`
-- carries a default so every existing row becomes false — nobody who signed up
-- before this migration becomes publicly visible because of it. `username` is
-- NULL for everyone until they claim one, and Postgres allows any number of
-- NULLs under a UNIQUE index, so the constraint costs nothing until it is used.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "publicProfile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
