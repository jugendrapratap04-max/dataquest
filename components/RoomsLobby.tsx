"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mmss, MIN_PARTICIPANTS, MAX_PARTICIPANTS } from "@/lib/focus";

type Row = {
  code: string; name: string; subject: string; topic: string; hostName: string;
  isPublic: boolean; maxParticipants: number; focusMinutes: number; breakMinutes: number;
  phase: string; cycle: number; secondsLeft: number; count: number; full: boolean; joined: boolean;
};

export function RoomsLobby() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"none" | "create" | "join">("none");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [f, setF] = useState({
    name: "", subject: "Python", topic: "", maxParticipants: 4,
    focusMinutes: 30, breakMinutes: 5, isPublic: true,
  });

  const load = useCallback(async () => {
    const r = await fetch("/api/rooms").then((x) => x.json()).catch(() => null);
    if (r?.rooms) setRooms(r.rooms);
    setLoaded(true);
  }, []);

  // The lobby refreshes slowly on purpose — it's a list of rooms, not a room.
  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await load(); })();
    const t = setInterval(() => { void load(); }, 10_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [load]);

  async function create() {
    if (!f.name.trim()) { setErr("Give the room a name."); return; }
    setBusy(true); setErr("");
    const r = await fetch("/api/rooms", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...f }),
    }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r?.code) router.push(`/rooms/${r.code}`);
    else setErr(r?.error ?? "Could not create the room.");
  }

  async function join(c: string) {
    setBusy(true); setErr("");
    const r = await fetch("/api/rooms", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", code: c }),
    }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r?.code) router.push(`/rooms/${r.code}`);
    else setErr(r?.error ?? "Could not join.");
  }

  return (
    <>
      <div className="sec-head">
        <h2 style={{ fontSize: 19 }}>Study Rooms</h2>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => { setMode(mode === "join" ? "none" : "join"); setErr(""); }}>Code se join</button>
          <button className="btn btn-primary" onClick={() => { setMode(mode === "create" ? "none" : "create"); setErr(""); }}>+ Create room</button>
        </div>
      </div>
      <p className="page-intro">
        Study together, quietly. During a focus block you only study — doubts go in the notebook.
        In the break those doubts come into the queue and you discuss them one by one.
      </p>

      {err && <div className="room-err">{err}</div>}

      {mode === "join" && (
        <div className="card focus-setup" style={{ marginBottom: 18 }}>
          <label className="fset">
            <span className="k">Room code</span>
            <input className="inp mono" placeholder="XYZ-123" value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === "Enter") join(code); }} />
          </label>
          <button className="btn btn-primary fset-go" onClick={() => join(code)} disabled={busy || !code.trim()}>Join →</button>
        </div>
      )}

      {mode === "create" && (
        <div className="card focus-setup" style={{ marginBottom: 18 }}>
          <div className="fset-row">
            <label className="fset"><span className="k">Room name</span>
              <input className="inp" placeholder="Python Arrays" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
            <label className="fset"><span className="k">Subject</span>
              <select className="inp" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>
                {["Python", "Statistics", "Pandas/NumPy", "SQL", "Machine Learning", "General"].map((s) => <option key={s}>{s}</option>)}
              </select></label>
          </div>
          <div className="fset-row">
            <label className="fset"><span className="k">Topic</span>
              <input className="inp" placeholder="Loops aur nested loops" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} /></label>
            <label className="fset"><span className="k">Max log</span>
              <select className="inp" value={f.maxParticipants} onChange={(e) => setF({ ...f, maxParticipants: Number(e.target.value) })}>
                {Array.from({ length: MAX_PARTICIPANTS - MIN_PARTICIPANTS + 1 }, (_, i) => i + MIN_PARTICIPANTS)
                  .map((n) => <option key={n} value={n}>{n}</option>)}
              </select></label>
          </div>
          <div className="fset-row">
            <label className="fset"><span className="k">Focus (min)</span>
              <select className="inp" value={f.focusMinutes} onChange={(e) => setF({ ...f, focusMinutes: Number(e.target.value) })}>
                {[15, 25, 30, 45, 50, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select></label>
            <label className="fset"><span className="k">Discussion (min)</span>
              <select className="inp" value={f.breakMinutes} onChange={(e) => setF({ ...f, breakMinutes: Number(e.target.value) })}>
                {[3, 5, 10, 15].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select></label>
          </div>
          <label className="fcheck">
            <input type="checkbox" checked={f.isPublic} onChange={(e) => setF({ ...f, isPublic: e.target.checked })} />
            <span>Public — anyone can find it in the list and join. Otherwise it is code-only.</span>
          </label>
          <button className="btn btn-primary fset-go" onClick={create} disabled={busy}>
            {busy ? "Creating…" : "Create room →"}
          </button>
        </div>
      )}

      {!loaded ? null : rooms.length === 0 ? (
        <div className="card room-empty">
          <div className="re-mark">📚</div>
          <h3>No rooms are open right now</h3>
          <p>Open the first one and send the code to a friend. Studying alone? <a href="/focus">Focus Mode</a> needs nobody else.</p>
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map((r) => (
            <div key={r.code} className="card room-card">
              <div className="rc-top">
                <span className={`fphase ${r.phase === "focus" ? "focus" : "break"}`}>
                  {r.phase === "focus" ? "Focus" : "Discussion"}
                </span>
                <span className="tag num">{mmss(r.secondsLeft)}</span>
                {!r.isPublic && <span className="tag">private</span>}
              </div>
              <h3 className="rc-name">{r.name}</h3>
              <div className="rc-meta">{r.subject}{r.topic && ` · ${r.topic}`}</div>
              <div className="rc-meta">Host: {r.hostName} · {r.focusMinutes}+{r.breakMinutes} min</div>
              <div className="rc-foot">
                <div className="rc-seats">
                  {Array.from({ length: r.maxParticipants }, (_, i) => (
                    <span key={i} className={`seat${i < r.count ? " on" : ""}`} />
                  ))}
                  <span className="rc-count num">{r.count}/{r.maxParticipants}</span>
                </div>
                <button className="btn btn-primary rc-join" disabled={busy || (r.full && !r.joined)}
                  onClick={() => join(r.code)}>
                  {r.joined ? "Go back" : r.full ? "Full" : "Join"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
