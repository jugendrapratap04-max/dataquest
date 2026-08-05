import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ActivityPing } from "@/components/ActivityPing";
import { FeedbackButton } from "@/components/FeedbackButton";
import { FocusButton } from "@/components/LayoutControls";
import { getCurrentUser } from "@/lib/session";
import { getProgress, getStreak } from "@/lib/progress";
import { prisma } from "@/lib/prisma";

// The app shell — now open to visitors, not just members.
//
// Reading is free: lessons, practice, and the roadmap render for anyone, the
// way W3Schools works. Only the personal pages (dashboard, progress, notes,
// certificates, rooms…) redirect to /login, and each does that itself. Asking
// someone to sign up before they can see a single lesson was costing us the
// visitors we most wanted.
//
// For a signed-out visitor this does no per-user work at all — no progress,
// streak or activity queries — so an open page stays cheap.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  let roadmapPct = 0;
  let streak = 0;
  let isNew = false;

  if (user) {
    // "Welcome back" is a lie on someone's first visit.
    isNew =
      user.xp === 0 &&
      (await prisma.lessonProgress.count({ where: { userId: user.id } })) === 0 &&
      (await prisma.submission.count({ where: { userId: user.id } })) === 0;

    const { lessonsDone, totalLessons, problemsDone, totalProblems } = await getProgress(user.id);
    const totalUnits = totalLessons + totalProblems;
    roadmapPct = totalUnits ? Math.round(((lessonsDone + problemsDone) / totalUnits) * 100) : 0;
    ({ streak } = await getStreak(user.id));
  }

  return (
    <div className="app">
      {/* Both only make sense for a member: activity feeds a focus session, and
          feedback is tied to an account we can reply to. */}
      {user && <ActivityPing />}
      {user && <FeedbackButton />}
      {/* Not gated on `user`: reading is free, and the reader who most needs the
          width is the one who has not signed up yet. */}
      <FocusButton />
      <Sidebar
        user={user ? { name: user.name, role: user.role, xp: user.xp, avatarEmoji: user.avatarEmoji } : null}
        roadmapPct={roadmapPct}
      />
      <main className="main">
        <div className="wrap">
          <Topbar user={user ? { name: user.name, streak, isNew, xp: user.xp } : null} />
          {children}
        </div>
      </main>
    </div>
  );
}
