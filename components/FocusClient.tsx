"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { mmss, humanDuration } from "@/lib/focus";
import { isStudying } from "@/components/ActivityPing";

type Session = {
  id: string;
  topic: string;
  goal: string;
  focusMinutes: number;
  breakMinutes: number;
  phase: "focus" | "discussion" | "ended";
  cycle: number;
  secondsLeft: number;
  phaseSeconds: number;
  elapsedSeconds: number;
  activeSeconds: number;
  focusPct: number;
  problemsSolved: number;
};

type Summary = {
  topic: string;
  goal: string;
  elapsedSeconds: number;
  activeSeconds: number;
  focusPct: number;
  cyclesDone: number;
  problemsSolved: number;
  doubtsWritten: number;
  completed: boolean;
};

type Entry = { id: string; text: string; resolved: boolean };
type HistoryRow = {
  id: string;
  topic: string;
  goal: string;
  startedAt: string;
  elapsedSeconds: number;
  activeSeconds: number;
  focusPct: number;
  problemsSolved: number;
  inRoom: boolean;
};

const BEAT_MS = 15_000;
// Nothing touched anywhere in DataQuest for this long and you've walked away.
// Long on purpose: reading a lesson is studying, and reading doesn't move the
// mouse. Active time stops; the session clock never does.
const IDLE_MS = 5 * 60_000;

export function FocusClient({ initial, history }: { initial: Session | null; history: HistoryRow[] }) {
  const [session, setSession] = useState<Session | null>(initial);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rows, setRows] = useState<HistoryRow[]>(history);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [form, setForm] = useState({ topic: "", goal: "", focusMinutes: 30, breakMinutes: 5 });
  const [busy, setBusy] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // The absolute instant the phase ends, so the countdown is immune to a
  // throttled or sleeping tab: we re-derive from the clock rather than counting
  // our own ticks. State, not a ref — it's read during render.
  const [endsAt, setEndsAt] = useState(() => (initial ? Date.now() + initial.secondsLeft * 1000 : 0));
  const phaseRef = useRef<string>("");

  const sessionId = session?.id ?? null;
  const phase = session?.phase ?? null;

  const applySession = useCallback((s: Session | null) => {
    setSession(s);
    if (s) setEndsAt(Date.now() + s.secondsLeft * 1000);
  }, []);

  // The notebook for whichever session is open. The cancel guard stops a slow
  // response from an old session overwriting a newer one's entries.
  useEffect(() => {
    if (!sessionId) return; // start() and end() own clearing the list
    let cancelled = false;
    (async () => {
      const r = await fetch(`/api/notebook?sessionId=${sessionId}`).then((x) => x.json()).catch(() => null);
      if (!cancelled && r?.entries) setEntries(r.entries);
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  // One ticker drives the display; the server is only consulted every BEAT_MS.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  // Heartbeat: the only thing that writes active time, and it says nothing more
  // than whether the student is currently present. Keyed on the session id, not
  // the session object — the object is replaced by every beat's response, which
  // would tear down and restart this interval on each tick.
  useEffect(() => {
    if (!sessionId || phase === "ended") return;
    const beat = async () => {
      const r = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "beat", id: sessionId, active: isStudying(IDLE_MS) }),
      }).then((x) => x.json()).catch(() => null);
      if (r?.session) applySession(r.session);
    };
    const t = setInterval(beat, BEAT_MS);
    return () => clearInterval(t);
  }, [sessionId, phase, applySession]);

  // Focus → break: open the notebook, because that's the moment the doubt you
  // parked is worth looking at.
  useEffect(() => {
    if (!session) return;
    if (phaseRef.current === "focus" && session.phase === "discussion") {
      setNotebookOpen(true);
    }
    phaseRef.current = session.phase;
  }, [session?.phase, session]);

  const secondsLeft = session ? Math.max(0, Math.round((endsAt - now) / 1000)) : 0;
  // When the countdown hits zero the server flips the phase on the next beat;
  // until then show 00:00 rather than a negative number.
  const phaseDone = session && secondsLeft === 0;

  async function start() {
    setBusy(true);
    const r = await fetch("/api/focus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", ...form }),
    }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r?.session) { applySession(r.session); setSummary(null); setEntries([]); }
  }

  async function end() {
    if (!session) return;
    setBusy(true);
    const r = await fetch("/api/focus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end", id: session.id }),
    }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r?.summary) {
      setSummary(r.summary);
      setRows((prev) => [
        {
          id: session.id, topic: r.summary.topic, goal: r.summary.goal,
          startedAt: new Date().toISOString(), elapsedSeconds: r.summary.elapsedSeconds,
          activeSeconds: r.summary.activeSeconds, focusPct: r.summary.focusPct,
          problemsSolved: r.summary.problemsSolved, inRoom: false,
        },
        ...prev,
      ]);
      setSession(null);
      setNotebookOpen(false);
    }
  }

  async function addDoubt() {
    const text = draft.trim();
    if (!text || !session) return;
    setDraft("");
    const r = await fetch("/api/notebook", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, sessionId: session.id }),
    }).then((x) => x.json()).catch(() => null);
    if (r?.entry) setEntries((e) => [r.entry, ...e]);
  }

  async function toggleResolved(en: Entry) {
    setEntries((es) => es.map((x) => (x.id === en.id ? { ...x, resolved: !x.resolved } : x)));
    await fetch("/api/notebook", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: en.id, resolved: !en.resolved }),
    }).catch(() => {});
  }

  async function delDoubt(id: string) {
    setEntries((es) => es.filter((x) => x.id !== id));
    await fetch("/api/notebook", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  // ---- session summary -----------------------------------------------------
  if (summary) {
    return (
      <>
        <div className="sec-head"><h2 style={{ fontSize: 19 }}>Session complete</h2></div>
        <div className="card focus-summary">
          <div className="fs-badge">{summary.completed ? "✅ Full focus block done" : "Short session — that counts, more tomorrow"}</div>
          <h3 className="fs-title">{summary.goal || summary.topic}</h3>
          <div className="stats" style={{ marginTop: 18 }}>
            <div className="card stat"><div className="k">Study time</div><div className="v num">{humanDuration(summary.elapsedSeconds)}</div></div>
            <div className="card stat"><div className="k">Active time</div><div className="v num">{humanDuration(summary.activeSeconds)}</div></div>
            <div className="card stat"><div className="k">Focus</div><div className="v num">{summary.focusPct}<small>%</small></div></div>
            <div className="card stat"><div className="k">Problems solved</div><div className="v num">{summary.problemsSolved}</div></div>
          </div>
          <p className="fs-note">
            Focus {summary.focusPct}% — of the session’s {humanDuration(summary.elapsedSeconds)} you were actually here for {humanDuration(summary.activeSeconds)}.
            {summary.doubtsWritten > 0 && <> You wrote {summary.doubtsWritten} doubts in the notebook — clear them in Notes.</>}
          </p>
          <button className="btn btn-primary" onClick={() => setSummary(null)}>New session</button>
        </div>
      </>
    );
  }

  // ---- setup ---------------------------------------------------------------
  if (!session) {
    return (
      <>
        <div className="sec-head"><h2 style={{ fontSize: 19 }}>Focus Mode</h2></div>
        <p className="page-intro">
          Pick one topic, start the timer, and do only that. If a doubt comes up during focus, write it in the notebook —
          you deal with it in the break. Your study never breaks, and the doubt is never lost.
        </p>

        <div className="card focus-setup">
          <div className="fset-row">
            <label className="fset">
              <span className="k">Topic</span>
              <input className="inp" placeholder="Python — Loops" value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </label>
            <label className="fset">
              <span className="k">Today&apos;s goal</span>
              <input className="inp" placeholder="Solve 5 loop problems" value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })} />
            </label>
          </div>
          <div className="fset-row">
            <label className="fset">
              <span className="k">Focus (min)</span>
              <select className="inp" value={form.focusMinutes}
                onChange={(e) => setForm({ ...form, focusMinutes: Number(e.target.value) })}>
                {[15, 25, 30, 45, 50, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </label>
            <label className="fset">
              <span className="k">Break (min)</span>
              <select className="inp" value={form.breakMinutes}
                onChange={(e) => setForm({ ...form, breakMinutes: Number(e.target.value) })}>
                {[3, 5, 10, 15].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </label>
          </div>
          <button className="btn btn-primary fset-go" onClick={start} disabled={busy}>
            {busy ? "Starting…" : `Start ${form.focusMinutes} min of focus →`}
          </button>
        </div>

        <History rows={rows} />
      </>
    );
  }

  // ---- running -------------------------------------------------------------
  const isFocus = session.phase === "focus";
  const pct = session.phaseSeconds > 0 ? 1 - secondsLeft / session.phaseSeconds : 0;
  const R = 86, C = 2 * Math.PI * R;
  const openDoubts = entries.filter((e) => !e.resolved).length;

  return (
    <>
      <div className={`focus-stage${isFocus ? " is-focus" : " is-break"}`}>
        <div className="fstage-head">
          <span className={`fphase ${isFocus ? "focus" : "break"}`}>{isFocus ? "Focus" : "Break"}</span>
          <span className="tag">Cycle {session.cycle}</span>
          {session.topic && <span className="tag">{session.topic}</span>}
        </div>

        <div className="fring-wrap">
          <svg className="fring" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r={R} className="fring-bg" />
            <circle cx="100" cy="100" r={R} className="fring-fg"
              strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
          </svg>
          <div className="fring-mid">
            <div className="fring-time num">{mmss(secondsLeft)}</div>
            <div className="fring-sub">
              {phaseDone ? "Switching…" : isFocus ? "study only" : "clear your doubts"}
            </div>
          </div>
        </div>

        {session.goal && <p className="fgoal">🎯 {session.goal}</p>}

        <div className="fstats">
          <div><span className="k">Active</span><span className="v num">{humanDuration(session.activeSeconds)}</span></div>
          <div><span className="k">Focus</span><span className="v num">{session.focusPct}%</span></div>
          <div><span className="k">Solved</span><span className="v num">{session.problemsSolved}</span></div>
          <div><span className="k">Doubts</span><span className="v num">{openDoubts}</span></div>
        </div>

        <div className="fbar">
          <button className={`btn btn-ghost${notebookOpen ? " on" : ""}`} onClick={() => setNotebookOpen((o) => !o)}>
            📓 Notebook{openDoubts > 0 && <span className="fdot">{openDoubts}</span>}
          </button>
          <Link className="btn btn-ghost" href="/practice">Open practice</Link>
          <button className="btn btn-ghost fend" onClick={end} disabled={busy}>End session</button>
        </div>
      </div>

      {notebookOpen && (
        <div className="card fnote">
          <div className="sec-head" style={{ marginBottom: 10 }}>
            <h2>Private Notebook</h2>
            <span className="tag" style={{ marginLeft: "auto" }}>only you can see this</span>
          </div>
          <p className="fnote-why">
            {isFocus
              ? "Doubt? Write it here and keep studying. It comes back in the break."
              : "Break time — clear these doubts now."}
          </p>
          <div className="fnote-add">
            <input className="inp" placeholder="Why is binary search O(log n)?" value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addDoubt(); }} />
            <button className="btn btn-teal" onClick={addDoubt} disabled={!draft.trim()}>Add</button>
          </div>
          {entries.length === 0 ? (
            <p className="fnote-empty">No doubts yet. That is either a good sign, or you have not asked enough.</p>
          ) : (
            <ul className="fnote-list">
              {entries.map((e) => (
                <li key={e.id} className={e.resolved ? "done" : ""}>
                  <button className="fnote-tick" onClick={() => toggleResolved(e)}
                    title={e.resolved ? "Reopen" : "Mark as cleared"}>{e.resolved ? "✅" : "○"}</button>
                  <span className="fnote-txt">{e.text}</span>
                  <button className="fnote-del" onClick={() => delDoubt(e.id)} title="Delete">×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <History rows={rows} />
    </>
  );
}

function History({ rows }: { rows: HistoryRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div style={{ marginTop: 26 }}>
      <div className="sec-head"><h2>Study History<span className="sub">pichhle sessions</span></h2></div>
      <div className="card fhist">
        {rows.map((r) => (
          <div key={r.id} className="fhist-row">
            <div className="fhist-main">
              <div className="fhist-topic">
                {r.goal || r.topic}
                {r.inRoom && <span className="tag" style={{ marginLeft: 8 }}>room</span>}
              </div>
              <div className="fhist-meta">
                {new Date(r.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {r.topic}
              </div>
            </div>
            <div className="fhist-num num">{humanDuration(r.activeSeconds)}</div>
            <div className="fhist-num num">{r.focusPct}%</div>
            <div className="fhist-num num">{r.problemsSolved} solved</div>
          </div>
        ))}
      </div>
    </div>
  );
}
