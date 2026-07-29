-- Logout used to delete the cookie and nothing else, so a token copied before
-- logging out stayed valid for its full 30 days. The signed cookie now carries
-- this number, and logging out increments it, which invalidates every cookie
-- ever issued for the account at once.
ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
