"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MODE_KEY, THEME_KEY, themeNow, scheduleHint } from "@/lib/theme-schedule";
import { isMuted as soundIsMuted, setMuted as soundSetMuted, play as playCue } from "@/lib/sound";

const titles: Record<string, [string, string]> = {
  "/dashboard": ["{greeting}, {name}", "Today's target — read one topic, then solve five problems."],
  // No count here on purpose: this map is a static Record with no access to the
  // database, so any number typed into it goes stale the day a subject ships —
  // which is exactly what "Nine subjects" did while eleven were live.
  "/roadmap": ["Skill Sheet", "Every subject in the order that works — learn it, practise it, build with it."],
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

// Module-level so their identity is stable across renders — useSyncExternalStore
// re-subscribes if the subscribe function changes, and a fresh closure every
// render would mean re-subscribing on every render.
//
// The greeting never changes after mount, so there is nothing to subscribe to.
const neverChanges = () => () => {};
const greetingOnServer = () => null;
function greetingNow(): string {
  const h = new Date().getHours();
  // Before 5am counts as evening: someone practising at 2am is finishing a day,
  // not starting one, and "Good morning" to them reads as a machine talking.
  return h < 5 ? "Good evening" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

// No "job-ready" anywhere in here. It reads as a promise about an outcome we do
// not control — we teach the skill and show the evidence, and that is the claim
// we can actually stand behind.
/* Does the PAGE render its own <h1>, or is this bar's title the page heading?
 *
 * It has to be one or the other, and getting it wrong is invisible until
 * somebody reads the page with a screen reader. This bar used to render an
 * <h1> unconditionally, so a lesson shipped two — "Lessons" here and the
 * subject's own title below it — and an outline with two beginnings answers
 * nothing. Making it a <div> everywhere then swung the other way: /practice
 * and /leaderboard have no heading of their own, so they went to zero, and a
 * page with no h1 has no accessible name at all.
 *
 * Exactly three pages carry their own — verified by grep, not by memory. Add a
 * route here when you add an <h1> to its page, and nowhere else. */
function pageOwnsHeading(pathname: string): boolean {
  if (pathname === "/roadmap") return true;
  // Detail pages only. The index pages above them have no heading of their own.
  return /^\/(learn|certificates)\/[^/]+/.test(pathname);
}

function pick(pathname: string): [string, string] {
  const key = Object.keys(titles).find((k) => pathname.startsWith(k));
  return key ? titles[key] : ["Etudo", "Learn it. Practise it. Build with it."];
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

type Item = {
  title: string; slug: string; sub: string;
  kind: "lesson" | "topic" | "problem";
  /** Topics only: which ?t= opens it, and identifiers from its code. */
  t?: number;
  k?: string;
};

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
  // null until the effect below has read localStorage — see the button's comment.
  const [muted, setMuted] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ name: string; need: number } | null>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Item[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Same external-store case as the theme below: the sound preference lives in
  // localStorage, which does not exist on the server, so it cannot be read
  // during render without hydrating to a different icon than was sent.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMuted(soundIsMuted()); }, []);

  // "Good evening" has to come from the READER's clock, not the server's.
  // Rendering it server-side would greet an Indian student with "Good morning"
  // at three in the afternoon, because the server runs in UTC. So the server
  // renders the timeless "Welcome back" and the browser replaces it.
  //
  // useSyncExternalStore rather than the setState-in-effect its two neighbours
  // use, and the difference is real: the mute flag and the theme are values the
  // reader CHANGES later, so they need state. This one is read once at mount and
  // never again, which is precisely what this hook is for — a browser-only value
  // with a server fallback — so it needs no lint suppression either.
  const partOfDay = useSyncExternalStore(neverChanges, greetingNow, greetingOnServer);

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
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  /* Ask the server, rather than downloading the index and filtering here.
   *
   * Filtering locally is what capped search at titles and a few code
   * identifiers — the whole index had to fit in a download. Now the full text of
   * every topic is searched, the browser fetches nothing until someone types,
   * and each answer is eight rows.
   *
   * Debounced so a word costs one request, not one per letter, and every
   * in-flight request is abandoned when the next keystroke arrives — otherwise
   * a slow early response can land after a fast later one and overwrite the
   * results with answers to a query the student has already moved past. */
  useEffect(() => {
    // Too short to be a query. Nothing is cleared here on purpose — the dropdown
    // is gated on the same length below, so there is no state to reset and no
    // synchronous setState in an effect.
    const needle = q.trim();
    if (needle.length < 2) return;

    const ctl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const d = await fetch(`/api/search?q=${encodeURIComponent(needle)}`, { signal: ctl.signal })
          .then((r) => r.json());
        setResults(d.results ?? []);
      } catch { /* aborted, or offline — leave the last results alone */ }
    }, 140);

    return () => { clearTimeout(id); ctl.abort(); };
  }, [q]);

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

  const hrefFor = (it: Item) =>
    it.kind === "problem" ? `/practice/${it.slug}`
      : it.kind === "topic" && it.t && it.t > 1 ? `/learn/${it.slug}?t=${it.t}`
        : `/learn/${it.slug}`;

  const goTo = (it: Item) => {
    setOpen(false); setQ("");
    router.push(hrefFor(it));
  };

  const firstName = user ? user.name.split(" ")[0] : "";
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <header className="topbar">
      <div className="greet">
        {/* A first-time visitor gets "Welcome" whatever the hour — greeting
            somebody good evening on an account they made ninety seconds ago
            reads as a stranger who has mistaken you for a regular.
            A signed-OUT visitor gets no greeting at all. There is no name to
            put after the comma, and the dashboard has been rendering a dangling
            "Welcome back," at them since it was opened to guests. Pages other
            than the dashboard carry no placeholders, so both branches leave
            their titles untouched. */}
        {/* h1 when the page has no heading of its own, div when it does — see
            pageOwnsHeading. Same text and same styling either way; only the
            element changes, so nothing moves on screen. */}
        {(() => {
          const text = user
            ? title.replace("{greeting}", user.isNew ? "Welcome" : partOfDay ?? "Welcome back").replace("{name}", firstName)
            : title.replace("{greeting}, {name}", "Dashboard");
          return pageOwnsHeading(pathname)
            ? <div className="top-title">{text}</div>
            : <h1 className="top-title">{text}</h1>;
        })()}
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
              placeholder="Search topics, lessons, problems…"
              // A placeholder is not a label: it disappears the moment you type,
              // and screen readers are not required to announce it. This input
              // had nothing else, so it was reached as an unnamed text field.
              aria-label="Search topics, lessons and problems"
              type="search"
            />
          </div>
          {open && q.trim().length >= 2 && (
            <div className="search-drop">
              {results.length === 0 ? (
                <div className="search-empty">
                  Nothing matches “{q.trim()}” in lessons, topics or problems.{" "}
                  <Link className="link" href="/learn" onClick={() => setOpen(false)}>Browse all subjects →</Link>
                </div>
              ) : results.map((it, i) => (
                <button key={i} className="search-item" onClick={() => goTo(it)}>
                  <span className={`si-tag ${it.kind}`}>{it.kind === "lesson" ? "Lesson" : it.kind === "topic" ? "Topic" : "Practice"}</span>
                  <span className="si-title">{it.title}</span>
                  <span className="si-sub">{it.sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {user ? (
          user.streak > 0 ? (
            <div className="streak-chip"><span>🔥</span><b>{user.streak}</b><span className="lbl">streak</span></div>
          ) : (
            /* A zero is not worn as a badge. At zero the chip becomes the
               invitation — solving one problem today is what starts it. */
            <Link href="/practice" className="streak-chip zero"><span>🔥</span><span className="lbl">Start your streak</span></Link>
          )
        ) : (
          <div className="guest-cta">
            <Link href="/login" className="gc-link">Sign in</Link>
            <Link href="/signup" className="btn btn-primary gc-btn">Start free</Link>
          </div>
        )}
        {/* Read in an effect, like the theme above it: localStorage does not
            exist on the server, so reading it during render would hydrate to a
            different icon than the server sent. `muted === null` means "not
            known yet" and renders nothing, so there is no flash of the wrong
            state either. */}
        <button
          className="icon-btn"
          onClick={() => { const next = !muted; setMuted(next); soundSetMuted(next); if (!next) playCue("correct"); }}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          aria-pressed={muted === false}
          title={muted ? "Sound off" : "Sound on"}
        >
          {muted === null ? null : muted ? (
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m17 9 4 6m0-6-4 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M16 9a4 4 0 0 1 0 6" /><path d="M19 6.5a8 8 0 0 1 0 11" />
            </svg>
          )}
        </button>
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
