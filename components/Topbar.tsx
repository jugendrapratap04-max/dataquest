"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const titles: Record<string, [string, string]> = {
  "/dashboard": ["{greeting}, {name}", "Today's target — read one topic, then solve five problems."],
  "/roadmap": ["Data Science Skill Sheet", "Zero to job-ready — 9 phases, do career checkpoints."],
  "/learn": ["Lessons", "Understand it first, then move on — one topic at a time."],
  "/practice": ["Practice Arena", "Write code for what you just read — that is what makes it stick."],
  "/projects": ["Projects", "Put your skills into real projects — this is where a portfolio comes from."],
  "/notes": ["My Notes", "Your personal cheat-sheet — the best friend revision has."],
  "/progress": ["Your Analytics", "Track your growth — both your strengths and your gaps."],
  "/leaderboard": ["Leaderboard", "Ranked by XP — solve more, climb higher."],
  "/certificates": ["Certificates", "Finish a track and earn its certificate."],
  "/resume": ["Resume + ATS", "Build a job-ready resume and check its ATS score."],
};

function pick(pathname: string): [string, string] {
  const key = Object.keys(titles).find((k) => pathname.startsWith(k));
  return key ? titles[key] : ["DataMarg", "Learn. Practice. Get job-ready."];
}

// Two free themes, two earned with coins (= XP; never spent, unlocks at a
// milestone). Swatch is ground on the left, accent on the right so each reads
// distinct at a glance (Focus shows its teal so it doesn't look like Dark).
type Theme = { id: string; name: string; sub: string; xp: number; sw: string };
// BETA DEMO: all themes unlocked (xp:0) so every tester can try them while we
// collect feedback. To re-lock behind coins later, restore Focus xp:500 and
// Sunset xp:1500.
const THEMES: Theme[] = [
  { id: "light", name: "Light", sub: "Warm paper", xp: 0, sw: "linear-gradient(135deg,#F1EDE4 52%,#E8920C 52%)" },
  { id: "dark", name: "Dark", sub: "Classic night", xp: 0, sw: "linear-gradient(135deg,#0E1119 52%,#F5A524 52%)" },
  { id: "focus", name: "Focus", sub: "Deep blue, calm", xp: 0, sw: "linear-gradient(135deg,#0F1A2E 52%,#2DD4BF 52%)" }, // re-lock: 500
  { id: "sunset", name: "Sunset", sub: "Warm & cozy", xp: 0, sw: "linear-gradient(135deg,#1B1012 52%,#FF9E5A 52%)" }, // re-lock: 1500
];

type Item = { title: string; slug: string; sub: string; kind: "lesson" | "problem" };

export function Topbar({ user }: { user: { name: string; streak: number; xp: number; isNew?: boolean } | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [title, sub] = pick(pathname);
  // Declared before the effects below, which use it as a dependency. A visitor
  // has no XP, so free themes only.
  const xp = user?.xp ?? 0;

  const [theme, setTheme] = useState<string>("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ name: string; need: number } | null>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<Item[] | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Same external-store case as TodoList: the saved theme and the OS dark-mode
  // preference are both browser-only, so this cannot run before mount. It also
  // has to setTheme, because the menu renders a tick next to the active one.
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("dq-theme"); } catch {}
    // Only honour a saved theme this account has actually unlocked. Otherwise a
    // locked theme left in localStorage by a higher-XP account on the same
    // browser would apply — and show as both active and 🔒 in the menu.
    const savedT = THEMES.find((t) => t.id === saved);
    const cur = (savedT && xp >= savedT.xp) ? savedT.id
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", cur);
    if (cur !== saved) { try { localStorage.setItem("dq-theme", cur); } catch {} }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(cur);
  }, [xp]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    // preload the search index once
    (async () => {
      try {
        const d = await fetch("/api/search").then((r) => r.json());
        setIndex([
          ...d.lessons.map((l: Item) => ({ ...l, kind: "lesson" as const })),
          ...d.problems.map((p: Item) => ({ ...p, kind: "problem" as const })),
        ]);
      } catch { setIndex([]); }
    })();
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const applyTheme = (id: string) => {
    document.documentElement.setAttribute("data-theme", id);
    try { localStorage.setItem("dq-theme", id); } catch {}
    setTheme(id);
    setMenuOpen(false);
  };

  const nudge = (t: Theme) => {
    setToast({ name: t.name, need: t.xp });
    setTimeout(() => setToast(null), 2600);
  };

  const results = q.trim() && index
    ? index.filter((it) => it.title.toLowerCase().includes(q.toLowerCase()) || it.sub.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : [];

  const goTo = (it: Item) => {
    setOpen(false); setQ("");
    router.push(it.kind === "lesson" ? `/learn/${it.slug}` : `/practice/${it.slug}`);
  };

  const firstName = user ? user.name.split(" ")[0] : "";
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <header className="topbar">
      <div className="greet">
        <h1>{title.replace("{greeting}", user?.isNew ? "Welcome" : "Welcome back").replace("{name}", firstName)}</h1>
        <p>{sub}</p>
      </div>
      <div className="top-actions">
        <div className="search-wrap" ref={wrapRef}>
          <div className="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
            <input
              value={q}
              onFocus={() => setOpen(true)}
              onChange={(e) => { setQ(e.target.value); setOpen(true); }}
              onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); if (e.key === "Enter" && results[0]) goTo(results[0]); }}
              placeholder="Search lessons, problems…"
            />
          </div>
          {open && q.trim() && (
            <div className="search-drop">
              {results.length === 0 ? (
                <div className="search-empty">Nothing found</div>
              ) : results.map((it, i) => (
                <button key={i} className="search-item" onClick={() => goTo(it)}>
                  <span className={`si-tag ${it.kind}`}>{it.kind === "lesson" ? "Lesson" : "Practice"}</span>
                  <span className="si-title">{it.title}</span>
                  <span className="si-sub">{it.sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {user ? (
          <div className="streak-chip"><span>🔥</span><b>{user.streak}</b><span className="lbl">streak</span></div>
        ) : (
          <div className="guest-cta">
            <Link href="/login" className="gc-link">Sign in</Link>
            <Link href="/signup" className="btn btn-primary gc-btn">Start free</Link>
          </div>
        )}
        <div className="theme-wrap" ref={themeRef}>
          <button className="icon-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Choose theme" aria-expanded={menuOpen}>
            <span className="theme-sw" style={{ width: 18, height: 18, background: current.sw }} />
          </button>
          {menuOpen && (
            <div className="theme-menu" role="menu">
              <div className="tm-h"><span>Theme</span><span className="coins">🪙 {xp.toLocaleString()}</span></div>
              {THEMES.map((t) => {
                const locked = xp < t.xp;
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    className={`theme-opt${active ? " active" : ""}${locked ? " locked" : ""}`}
                    onClick={() => (locked ? nudge(t) : applyTheme(t.id))}
                    aria-disabled={locked}
                    role="menuitemradio"
                    aria-checked={active}
                  >
                    <span className="theme-sw" style={{ background: t.sw }} />
                    <span className="theme-txt">
                      <span className="theme-nm">{t.name}</span>
                      <span className="theme-sub">{t.sub}</span>
                    </span>
                    <span className="theme-meta">
                      {active ? <span className="theme-check">✓</span>
                        : locked ? <span className="theme-lock">🔒 {t.xp}</span>
                          : null}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {toast && (
        <div className="theme-toast" role="status">
          🔒 <span><b>{toast.name}</b> theme unlocks at {toast.need.toLocaleString()} coins — you have {xp.toLocaleString()} 🪙</span>
        </div>
      )}
    </header>
  );
}
