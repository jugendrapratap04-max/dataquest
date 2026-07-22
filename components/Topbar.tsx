"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const titles: Record<string, [string, string]> = {
  "/dashboard": ["{greeting}, {name}", "Aaj ka target — 1 topic padho, phir 5 problems solve karo."],
  "/roadmap": ["Data Science Skill Sheet", "Zero to job-ready — 9 phases, do career checkpoints."],
  "/learn": ["Lessons", "Pehle samjho, phir aage badho — ek time pe ek topic."],
  "/practice": ["Practice Arena", "Jo padha, usi pe abhi likh ke dekho — tabhi pakka hota hai."],
  "/projects": ["Projects", "Skills ko real projects me lagao — portfolio yahin banta hai."],
  "/notes": ["My Notes", "Tumhari personal cheat-sheet — revision ka best dost."],
  "/progress": ["Your Analytics", "Growth track karo — mazbooti aur gaps dono dikhengi."],
  "/leaderboard": ["Leaderboard", "XP ke hisaab se ranking — solve karo, upar chadho."],
  "/certificates": ["Certificates", "Har track complete karke certificate kamaao."],
  "/resume": ["Resume + ATS", "Job-ready resume banao aur ATS score check karo."],
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

export function Topbar({ user }: { user: { name: string; streak: number; xp: number; isNew?: boolean } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [title, sub] = pick(pathname);

  const [theme, setTheme] = useState<string>("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ name: string; need: number } | null>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<Item[] | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("dq-theme"); } catch {}
    // Only honour a saved theme this account has actually unlocked. Otherwise a
    // locked theme left in localStorage by a higher-XP account on the same
    // browser would apply — and show as both active and 🔒 in the menu.
    const savedT = THEMES.find((t) => t.id === saved);
    const cur = (savedT && user.xp >= savedT.xp) ? savedT.id
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", cur);
    if (cur !== saved) { try { localStorage.setItem("dq-theme", cur); } catch {} }
    setTheme(cur);
  }, [user.xp]);

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

  const firstName = user.name.split(" ")[0];
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <header className="topbar">
      <div className="greet">
        <h1>{title.replace("{greeting}", user.isNew ? "Welcome" : "Welcome back").replace("{name}", firstName)}</h1>
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
                <div className="search-empty">Kuch nahi mila</div>
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
        <div className="streak-chip"><span>🔥</span><b>{user.streak}</b><span className="lbl">streak</span></div>
        <div className="theme-wrap" ref={themeRef}>
          <button className="icon-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Theme chuno" aria-expanded={menuOpen}>
            <span className="theme-sw" style={{ width: 18, height: 18, background: current.sw }} />
          </button>
          {menuOpen && (
            <div className="theme-menu" role="menu">
              <div className="tm-h"><span>Theme</span><span className="coins">🪙 {user.xp.toLocaleString()}</span></div>
              {THEMES.map((t) => {
                const locked = user.xp < t.xp;
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
          🔒 <span><b>{toast.name}</b> theme {toast.need.toLocaleString()} coins pe unlock — abhi {user.xp.toLocaleString()} 🪙</span>
        </div>
      )}
    </header>
  );
}
