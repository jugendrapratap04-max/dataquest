"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

type Item = { href: string; label: string; icon: React.ReactNode; count?: string };

const groups = (roadmapPct: number): { label: string; items: Item[] }[] => [
  { label: "Learn", items: [
    { href: "/", label: "Dashboard", icon: <HomeIcon /> },
    { href: "/roadmap", label: "Roadmap", icon: <MapIcon />, count: `${roadmapPct}%` },
    { href: "/learn", label: "Lessons", icon: <BookIcon /> },
    { href: "/notes", label: "Notes", icon: <NoteIcon /> },
  ]},
  { label: "Practice", items: [
    { href: "/practice", label: "Compiler", icon: <CodeIcon /> },
    { href: "/projects", label: "Projects", icon: <BoxIcon /> },
  ]},
  { label: "Progress", items: [
    { href: "/leaderboard", label: "Leaderboard", icon: <TrophyIcon /> },
    { href: "/certificates", label: "Certificates", icon: <CertIcon /> },
    { href: "/resume", label: "Resume + ATS", icon: <ResumeIcon /> },
    { href: "/progress", label: "Analytics", icon: <ChartIcon /> },
  ]},
];

export function Sidebar({ user, roadmapPct }: { user: { name: string; role: string }; roadmapPct: number }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 1).join("");
  const nav = groups(roadmapPct);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="side">
      <div className="logo">
        <div className="mark">D</div>
        <div><span className="wm">DataQuest</span><span className="beta">BETA</span></div>
      </div>
      {nav.map((g) => (
        <div key={g.label}>
          <div className="nav-lbl">{g.label}</div>
          {g.items.map((it) => (
            <Link key={it.href} href={it.href} className={`nav-item${isActive(it.href) ? " active" : ""}`}>
              {it.icon}
              {it.label}
              {it.count && <span className="count">{it.count}</span>}
            </Link>
          ))}
        </div>
      ))}
      <div className="side-foot">
        <div className="userbox">
          <div className="av">{initials}</div>
          <div>
            <div className="nm">{user.name}</div>
            <div className="rl">{user.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
