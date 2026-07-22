import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { FocusClient } from "@/components/FocusClient";
import { derivePhase, focusPct } from "@/lib/focus";

export default async function FocusPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const open = await prisma.studySession.findFirst({
    where: { userId: user.id, endedAt: null, roomId: null },
    orderBy: { startedAt: "desc" },
  });

  const now = new Date();
  const initial = open
    ? (() => {
        const st = derivePhase(
          { phase: "focus", phaseStartedAt: open.startedAt, focusMinutes: open.focusMinutes, breakMinutes: open.breakMinutes, cycle: 1 },
          now
        );
        const elapsed = Math.floor((now.getTime() - open.startedAt.getTime()) / 1000);
        return {
          id: open.id,
          topic: open.topic,
          goal: open.goal,
          focusMinutes: open.focusMinutes,
          breakMinutes: open.breakMinutes,
          phase: st.phase,
          cycle: st.cycle,
          secondsLeft: st.secondsLeft,
          phaseSeconds: st.phaseSeconds,
          elapsedSeconds: elapsed,
          activeSeconds: open.activeSeconds,
          focusPct: focusPct(open.activeSeconds, elapsed),
          problemsSolved: open.problemsSolved,
        };
      })()
    : null;

  const past = await prisma.studySession.findMany({
    where: { userId: user.id, endedAt: { not: null } },
    orderBy: { startedAt: "desc" },
    take: 12,
  });

  return (
    <FocusClient
      initial={initial}
      history={past.map((s) => ({
        id: s.id,
        topic: s.topic,
        goal: s.goal,
        startedAt: s.startedAt.toISOString(),
        elapsedSeconds: s.elapsedSeconds,
        activeSeconds: s.activeSeconds,
        focusPct: focusPct(s.activeSeconds, s.elapsedSeconds),
        problemsSolved: s.problemsSolved,
        inRoom: s.roomId !== null,
      }))}
    />
  );
}
