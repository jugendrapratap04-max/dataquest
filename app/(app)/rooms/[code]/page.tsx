import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { RoomClient } from "@/components/RoomClient";
import { JoinGate } from "@/components/JoinGate";

// An invite link lands here. If the visitor isn't a member yet we show a join
// card rather than silently adding them — walking into a room should be a thing
// you chose to do.
export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      host: { select: { name: true } },
      members: { where: { status: { not: "left" } }, select: { userId: true } },
    },
  });
  if (!room) redirect("/rooms");

  const isMember = room.members.some((m) => m.userId === user.id);
  if (!isMember) {
    return (
      <JoinGate
        code={room.code}
        name={room.name}
        subject={room.subject}
        topic={room.topic}
        hostName={room.host.name}
        focusMinutes={room.focusMinutes}
        breakMinutes={room.breakMinutes}
        count={room.members.length}
        max={room.maxParticipants}
        ended={room.endedAt !== null}
      />
    );
  }

  return <RoomClient code={room.code} />;
}
