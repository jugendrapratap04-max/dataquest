import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { getCurrentUser } from "@/lib/session";
import { getProgress } from "@/lib/progress";
import { prisma } from "@/lib/prisma";

// The authed app shell. Anyone without a valid session is sent to /login.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // "Welcome back" is a lie on someone's first visit.
  const isNew =
    user.xp === 0 &&
    (await prisma.lessonProgress.count({ where: { userId: user.id } })) === 0 &&
    (await prisma.submission.count({ where: { userId: user.id } })) === 0;

  const { lessonsDone, totalLessons, problemsDone, totalProblems } = await getProgress(user.id);
  const totalUnits = totalLessons + totalProblems;
  const roadmapPct = totalUnits ? Math.round(((lessonsDone + problemsDone) / totalUnits) * 100) : 0;

  return (
    <div className="app">
      <Sidebar user={{ name: user.name, role: user.role }} roadmapPct={roadmapPct} />
      <main className="main">
        <div className="wrap">
          <Topbar user={{ name: user.name, streak: user.streak, isNew }} />
          {children}
        </div>
      </main>
    </div>
  );
}
