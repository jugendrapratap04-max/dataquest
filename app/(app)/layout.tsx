import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ActivityPing } from "@/components/ActivityPing";
import { FeedbackButton } from "@/components/FeedbackButton";
import { FocusButton } from "@/components/LayoutControls";
import { EtudoBuddy } from "@/components/EtudoBuddy";
import { BytePet } from "@/components/BytePet";
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
    // Four independent reads, so they go together rather than one after another.
    const [lessonProgressCount, submissionCount, progress, streakData] = await Promise.all([
      prisma.lessonProgress.count({ where: { userId: user.id } }),
      prisma.submission.count({ where: { userId: user.id } }),
      getProgress(user.id),
      getStreak(user.id),
    ]);

    // "Welcome back" is a lie on someone's first visit.
    isNew = user.xp === 0 && lessonProgressCount === 0 && submissionCount === 0;

    const totalUnits = progress.totalLessons + progress.totalProblems;
    const doneUnits = progress.lessonsDone + progress.problemsDone;
    roadmapPct = totalUnits ? Math.round((doneUnits / totalUnits) * 100) : 0;
    streak = streakData.streak;
  }

  return (
    <div className="app">
      {/* First thing in the tab order, and invisible until it has focus.
          Without it a keyboard or screen-reader user tabs through the whole
          sidebar — every subject, every link — before reaching the lesson they
          opened, on every single page. */}
      <a href="#main" className="skip-link">Skip to content</a>
      {/* Only makes sense for a member: activity feeds a focus session. */}
      {user && <ActivityPing />}
      <Sidebar
        user={user ? { name: user.name, role: user.role, xp: user.xp, avatarEmoji: user.avatarEmoji } : null}
        roadmapPct={roadmapPct}
      />
      {/* ⚠️ THE TOPBAR MUST STAY OUTSIDE <main>, AND `id="main"` MUST STAY ON IT.
          It used to read `<main className="main" id="main">` with the Topbar as
          its first child, which broke the skip link in a way nothing reported.
          Measured with a real Tab-then-Enter walk: pressing "Skip to content"
          landed the next Tab on the SEARCH INPUT — still furniture — and the
          reader then tabbed through search, sign-in, start-free, the sound
          toggle and the theme switcher before reaching a word of the lesson.
          The link worked and skipped nothing.

          It was also the platform contradicting its own lesson 24, which
          defines main as "what is left when you remove the parts repeated on
          every page". The landing page in app/page.tsx already had this right;
          only this layout was wrong.

          `tabIndex={-1}` so activating the link MOVES focus rather than only
          moving the sequential-focus starting point — without it Chrome leaves
          focus on the body, so a screen reader announces nothing at the moment
          the user acts. */}
      <div className="main">
        <div className="wrap">
          <Topbar user={user ? { name: user.name, streak, isNew, xp: user.xp } : null} />
          <main id="main" tabIndex={-1}>{children}</main>
        </div>
      </div>
      {/* ALL OF THESE ARE position:fixed, SO THEIR PLACE HERE IS PURELY TAB
          ORDER — nothing about where they appear depends on it. They used to
          render before the Sidebar, which put "Focus reading" at tab stop 2 of
          the whole page: the walk went skip-link, then the floating button at
          y=746, then jumped 718px back UP to the navigation. Tab order is
          meant to follow the page, and a control that floats over the bottom
          corner belongs at the end of it, not ahead of every nav item.

          Feedback is gated on `user` — it is tied to an account we can reply
          to. Focus is not: reading is free, and the reader who most needs the
          extra width is the one who has not signed up yet.

          Byte is two components on purpose. BytePet is the body you drag and
          click; EtudoBuddy is the conversation, and the only one of the two
          that can cost an API call. They never import each other — the pet
          announces on window and the chat listens (lib/pet-events.ts) — which
          is what lets the chat keep working below 819px, where the pet is
          display:none and the "Ask Byte" button takes over. */}
      <FocusButton />
      <EtudoBuddy />
      <BytePet />
      {user && <FeedbackButton />}
    </div>
  );
}
