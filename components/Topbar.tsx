"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const titles: Record<string, [string, string]> = {
  "/": ["Welcome back, {name}", "Aaj ka target — 1 topic padho, phir 5 problems solve karo."],
  "/roadmap": ["Data Science Skill Sheet", "Zero to job-ready — 9 phases, do career checkpoints."],
  "/learn": ["Lessons", "Pehle samjho, phir aage badho — ek time pe ek topic."],
  "/practice": ["Practice Arena", "Jo padha, usi pe abhi likh ke dekho — tabhi pakka hota hai."],
  "/projects": ["Projects", "Skills ko real projects me lagao — portfolio yahin banta hai."],
  "/notes": ["My Notes", "Tumhari personal cheat-sheet — revision ka best dost."],
  "/progress": ["Your Analytics", "Growth track karo — mazbooti aur gaps dono dikhengi."],
  "/leaderboard": ["Leaderboard", "Batchmates ke saath ranking — XP kamaao, upar chadho."],
  "/certificates": ["Certificates", "Har track complete karke certificate kamaao."],
  "/resume": ["Resume + ATS", "Job-ready resume banao aur ATS score check karo."],
};

function pick(pathname: string): [string, string] {
  if (pathname === "/") return titles["/"];
  const key = Object.keys(titles).find((k) => k !== "/" && pathname.startsWith(k));
  return key ? titles[key] : ["DataQuest", "Learn. Practice. Get job-ready."];
}

const SunPath = () => (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></>);
const MoonPath = () => (<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />);

type Item = { title: string; slug: string; sub: string; kind: "lesson" | "problem" };

export function Topbar({ user }: { user: { name: string; streak: number } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [title, sub] = pick(pathname);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<Item[] | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("dq-theme"); } catch {}
    const cur = (saved as "light" | "dark") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", cur);
    setTheme(cur);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
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

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("dq-theme", next); } catch {}
    setTheme(next);
  };

  const results = q.trim() && index
    ? index.filter((it) => it.title.toLowerCase().includes(q.toLowerCase()) || it.sub.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : [];

  const goTo = (it: Item) => {
    setOpen(false); setQ("");
    router.push(it.kind === "lesson" ? `/learn/${it.slug}` : `/practice/${it.slug}`);
  };

  const firstName = user.name.split(" ")[0];

  return (
    <header className="topbar">
      <div className="greet">
        <h1>{title.replace("{name}", firstName)}</h1>
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
        <button className="icon-btn" onClick={toggle} aria-label="Toggle theme">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {theme === "dark" ? <MoonPath /> : <SunPath />}
          </svg>
        </button>
      </div>
    </header>
  );
}
