-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "voiceEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "RoomMember" ADD COLUMN     "inVoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "micMuted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RoomSignal" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomSignal_roomId_toId_createdAt_idx" ON "RoomSignal"("roomId", "toId", "createdAt");

-- AddForeignKey
ALTER TABLE "RoomSignal" ADD CONSTRAINT "RoomSignal_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

