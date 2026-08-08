"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavCollapse } from "@/components/LayoutControls";
import { Avatar } from "@/components/Avatar";
import { levelFor } from "@/lib/profile";

const HomeIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H10v6H4a1 1 0 0 1-1-1z"/></svg>);
const MapIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h12a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H4z"/><path d="M4 5v14"/></svg>);
const BookIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6.5C10 4.5 5 4.5 3 6.5v13c2-2 7-2 9 0 2-2 7-2 9 0v-13c-2-2-7-2-9 0z"/></svg>);
const NoteIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3h11l3 3v15H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>);
const CodeIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 6-5 6 5 6M16 6l5 6-5 6"/></svg>);
const BoxIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
const ChartIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>);
const TrophyIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/></svg>);
const CertIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M8.5 12 7 22l5-3 5 3-1.5-10"/></svg>);
const ResumeIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>);
const TimerIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>);
const RoomIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1"/><path d="M16 6a3 3 0 0 1 0 6M18 20v-1a5 5 0 0 0-2-4"/></svg>);

// `member: true` = a page a signed-out visitor genuinely cannot be shown,
// because everything on it is one person's own: their notes, their focus
// session, a room they would appear inside as a participant. Those keep the
// lock, and the lock is honest.
//
// Everything else is open. Dashboard, Analytics, Leaderboard, Certificates and
// the resume builder used to carry `member: true` and redirect to a login form,
// which meant a visitor could see a marketing page and nothing else — and 12 of
// 14 real signups never opened a single lesson. You cannot ask somebody to
// commit before they have seen what they are committing to. Those five now
// render with honest zeros and a "sign in to keep this" banner instead.
//
// `soon` marks a page that exists but is not built yet. Saying so in the nav is
// the honest alternative to letting it sit unlabelled beside working features.
type Item = { href: string; label: string; icon: React.ReactNode; count?: string; member?: boolean; soon?: boolean };

const groups = (roadmapPct: number): { label: string; items: Item[] }[] => [
  { label: "Learn", items: [
    { href: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { href: "/roadmap", label: "Roadmap", icon: <MapIcon />, count: `${roadmapPct}%` },
    { href: "/learn", label: "Lessons", icon: <BookIcon /> },
    { href: "/book", label: "Written Notes", icon: <BookIcon /> },
    { href: "/notes", label: "Notes", icon: <NoteIcon />, member: true },
  ]},
  { label: "Practice", items: [
    { href: "/practice", label: "Compiler", icon: <CodeIcon /> },
    { href: "/challenge", label: "Challenges", icon: <TrophyIcon /> },
    { href: "/projects", label: "Projects", icon: <BoxIcon />, soon: true },
  ]},
  { label: "Study", items: [
    { href: "/focus", label: "Focus Mode", icon: <TimerIcon />, member: true },
    { href: "/rooms", label: "Study Rooms", icon: <RoomIcon />, member: true },
  ]},
  { label: "Progress", items: [
    { href: "/leaderboard", label: "Leaderboard", icon: <TrophyIcon /> },
    { href: "/certificates", label: "Certificates", icon: <CertIcon /> },
    { href: "/resume", label: "Resume + ATS", icon: <ResumeIcon /> },
    { href: "/progress", label: "Analytics", icon: <ChartIcon /> },
  ]},
];

const LockIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>);

type SideUser = { name: string; role: string; xp: number; avatarEmoji: string | null };

export function Sidebar({ user, roadmapPct }: { user: SideUser | null; roadmapPct: number }) {
  const pathname = usePathname();
  // Every nav href is now a real path (dashboard moved to /dashboard so "/" could
  // become the public landing page), so a plain prefix match is enough.
  const isActive = (href: string) => pathname.startsWith(href);
  const nav = groups(roadmapPct);
  // levelFor and Avatar come from lib/profile.ts, which is deliberately free of
  // prisma so this client component can use them without pulling the database
  // client into the browser bundle.
  const lvl = user ? levelFor(user.xp) : null;

  // On desktop the sidebar is always shown (CSS ignores this state). On mobile it's
  // a drawer — closed by default. It closes on Escape, on a backdrop tap, and on
  // any nav link tap (each Link's onClick), so it never traps the reader.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      <button className="nav-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <div className={`side-backdrop${open ? " show" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`side${open ? " open" : ""}`}>
      <div className="logo">
        <div className="mark">E</div>
        <div><span className="wm">Etudo</span><span className="beta">BETA</span></div>
        <NavCollapse />
      </div>
      {nav.map((g) => (
        <div key={g.label}>
          <div className="nav-lbl">{g.label}</div>
          {g.items.map((it) => {
            const locked = !!it.member && !user;
            return (
              <Link
                key={it.href}
                href={locked ? "/signup" : it.href}
                className={`nav-item${isActive(it.href) ? " active" : ""}${locked ? " locked" : ""}`}
                onClick={() => setOpen(false)}
                // The title is always set, not just when locked: collapsed to
                // icons there is nothing else to tell you what a button does.
                title={locked ? "Sign up to unlock" : it.label}
              >
                {it.icon}
                <span className="nav-text">{it.label}</span>
                {locked ? <span className="nav-lock"><LockIcon /></span> : it.soon ? <span className="nav-soon">soon</span> : it.count && <span className="count">{it.count}</span>}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="side-foot">
        {/* Reachable from inside the app too — a signed-in student should not
            have to log out to find the rules they agreed to. */}
        <div className="side-legal">
          {/* /about is the old front page. Since `/` became the dashboard it has
              no other entrance, and it is the only page that explains the
              method — so it is reachable from every screen, not orphaned. */}
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/guidelines" onClick={() => setOpen(false)}>Guidelines</Link>
          <Link href="/terms" onClick={() => setOpen(false)}>Terms</Link>
          <Link href="/privacy" onClick={() => setOpen(false)}>Privacy</Link>
        </div>
        {user ? (
          <>
            {/* The userbox is a link now. It used to be the one piece of the app
                that showed you your own name and then did nothing with it —
                which is exactly where a person looks for themselves. */}
            <Link href="/profile" className={`userbox${isActive("/profile") ? " active" : ""}`} onClick={() => setOpen(false)}>
              <Avatar name={user.name} emoji={user.avatarEmoji} size={38} />
              <div className="ub-id">
                <div className="nm">{user.name}</div>
                <div className="rl">{user.role}</div>
                <div className="ub-lvl">
                  <span>Level {lvl!.level}</span>
                  <span className="ub-xp">{user.xp.toLocaleString()} XP</span>
                </div>
                <div className="ub-bar"><i style={{ width: `${lvl!.pct}%` }} /></div>
              </div>
              <span className="ub-go" aria-hidden="true">→</span>
            </Link>
            <button className="logout-btn" onClick={logout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>
              Logout
            </button>
          </>
        ) : (
          <div className="guestbox">
            <div className="gb-t">Reading is free.</div>
            <div className="gb-d">Make an account to save your progress, earn certificates and study with friends.</div>
            <Link href="/signup" className="btn btn-primary gb-cta" onClick={() => setOpen(false)}>Create free account</Link>
            <Link href="/login" className="gb-alt" onClick={() => setOpen(false)}>I already have one</Link>
          </div>
        )}
      </div>
      </aside>
    </>
  );
}
