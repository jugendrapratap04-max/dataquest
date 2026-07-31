"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MODE_KEY, THEME_KEY, themeNow, scheduleHint } from "@/lib/theme-schedule";

const titles: Record<string, [string, string]> = {
  "/dashboard": ["{greeting}, {name}", "Today's target — read one topic, then solve five problems."],
  "/roadmap": ["Skill Sheet", "Nine subjects in the order that works — learn it, practise it, build with it."],
  "/learn": ["Lessons", "Understand it first, then move on — one topic at a time."],
  "/practice": ["Practice Arena", "Write code for what you just read — that is what makes it stick."],
  "/challenge": ["Challenges", "Same questions, sent to a friend — compare scores and see what you both missed."],
  "/projects": ["Projects", "Put your skills into real projects — this is where a portfolio comes from."],
  "/notes": ["My Notes", "Your personal cheat-sheet — the best friend revision has."],
  "/progress": ["Your Analytics", "Track your growth — both your strengths and your gaps."],
  "/leaderboard": ["Leaderboard", "Ranked by XP — solve more, climb higher."],
  "/certificates": ["Certificates", "Finish a track and earn its certificate."],
  "/resume": ["Resume + ATS", "Build your resume and check how it scores against ATS filters."],
};

// No "job-ready" anywhere in here. It reads as a promise about an outcome we do
// not control — we teach the skill and show the evidence, and that is the claim
// we can actually stand behind.
function pick(pathname: string): [string, string] {
  const key = Object.keys(titles).find((k) => pathname.startsWith(k));
  return key ? titles[key] : ["DataMarg", "Learn it. Practise it. Build with it."];
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

  // Two pieces of state, not one, and that is the whole of the auto feature:
  // `theme` is what is applied right now, `auto` is what was chosen. They differ
  // for the entire time the clock is driving, which is why one boolean would not
  // have been enough to draw the menu correctly.
  const [theme, setTheme] = useState<string>("light");
  const [auto, setAuto] = useState(true);
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
    let mode: string | null = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
      mode = localStorage.getItem(MODE_KEY);
    } catch {}
    // Only honour a saved theme this account has actually unlocked. Otherwise a
    // locked theme left in localStorage by a higher-XP account on the same
    // browser would apply — and show as both active and 🔒 in the menu.
    const savedT = THEMES.find((t) => t.id === saved);
    // Auto is the default. A student who has never opened this menu has no mode
    // key at all, so the clock decides — the same rule the pre-paint script in
    // app/layout.tsx follows, which is why the page does not flash.
    const isAuto = mode !== "manual" || !savedT || xp < savedT.xp;
    const cur = isAuto ? themeNow() : savedT.id;
    document.documentElement.setAttribute("data-theme", cur);
    if (cur !== saved) { try { localStorage.setItem(THEME_KEY, cur); } catch {} }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(cur);
    setAuto(isAuto);
  }, [xp]);

  // While the clock is driving, keep watching it. A minute is fine — nothing on
  // this schedule moves faster than that, and somebody studying from 4pm to 9pm
  // should see it change under them rather than on the next reload.
  //
  // The media query is watched for the same reason: `prefers-color-scheme` is a
  // veto on the light theme, so flipping the system to dark at 2pm has to take
  // effect now, not at the next boundary.
  useEffect(() => {
    if (!auto) return;
    const tick = () => {
      const next = themeNow();
      setTheme((prev) => {
        if (prev === next) return prev;
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem(THEME_KEY, next); } catch {}
        return next;
      });
    };
    const id = window.setInterval(tick, 60_000);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", tick);
    return () => { window.clearInterval(id); mq.removeEventListener("change", tick); };
  }, [auto]);

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

  // Picking a theme turns auto off. That is the rule the whole feature rests on:
  // the clock may choose for somebody who has not chosen, and never for somebody
  // who has. The way back is the Auto entry in the same menu.
  const applyTheme = (id: string) => {
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem(THEME_KEY, id);
      localStorage.setItem(MODE_KEY, "manual");
    } catch {}
    setTheme(id);
    setAuto(false);
    setMenuOpen(false);
  };

  const applyAuto = () => {
    const id = themeNow();
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem(THEME_KEY, id);
      localStorage.removeItem(MODE_KEY);
    } catch {}
    setTheme(id);
    setAuto(true);
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
              <button
                className={`theme-opt${auto ? " active" : ""}`}
                onClick={applyAuto}
                role="menuitemradio"
                aria-checked={auto}
              >
                <span className="theme-sw" style={{ background: "linear-gradient(135deg,#F1EDE4 0%,#FF9E5A 52%,#0E1119 100%)" }} />
                <span className="theme-txt">
                  <span className="theme-nm">Auto</span>
                  <span className="theme-sub">{scheduleHint()}</span>
                </span>
                <span className="theme-meta">{auto ? <span className="theme-check">✓</span> : null}</span>
              </button>
              {THEMES.map((t) => {
                const locked = xp < t.xp;
                // Two states, drawn separately: the tick follows the CHOICE, and
                // the "now" pill follows what the clock has applied. They are the
                // same row only when auto is off.
                const active = !auto && theme === t.id;
                const showing = auto && theme === t.id;
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
                        : showing ? <span className="theme-now">now</span>
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
