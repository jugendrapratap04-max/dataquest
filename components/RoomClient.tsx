"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VoiceCall, type VoiceSignal } from "@/components/VoiceCall";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mmss, humanDuration, QUICK_REPLIES, EMOJIS } from "@/lib/focus";
import { isStudying } from "@/components/ActivityPing";

type Member = {
  userId: string; name: string; isHost: boolean; isMe: boolean;
  status: "studying" | "away" | "left"; activeSeconds: number; focusPct: number;
  handRaised: boolean; needsHelp: boolean;
  inVoice: boolean; micMuted: boolean;
};
type QueueItem = { id: string; text: string; name: string; mine: boolean };
type Msg = { id: string; name: string; kind: string; text: string; mine: boolean };
type Entry = { id: string; text: string; resolved: boolean; queued: boolean };

type State = {
  room: {
    id: string; code: string; name: string; subject: string; topic: string; maxParticipants: number;
    isPublic: boolean; focusMinutes: number; breakMinutes: number; hostName: string;
    iAmHost: boolean; voiceEnabled: boolean; endedAt: string | null;
  };
  phase: "focus" | "discussion" | "ended";
  cycle: number; secondsLeft: number; phaseSeconds: number;
  members: Member[]; queue: QueueItem[]; messages: Msg[]; messagesLeft: number;
  signals: VoiceSignal[];
};

const POLL_MS = 2500;
const BEAT_MS = 15_000;
// Generous, and shared across tabs — the room literally tells you to open
// Practice in a second tab, so "away" must not mean "not looking at the room".
const IDLE_MS = 5 * 60_000;

export function RoomClient({ code }: { code: string }) {
  const router = useRouter();
  const [st, setSt] = useState<State | null>(null);
  const [err, setErr] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState<"people" | "queue" | "chat">("people");
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [leaving, setLeaving] = useState(false);
  const [summary, setSummary] = useState<null | { elapsedSeconds: number; activeSeconds: number; focusPct: number; cyclesDone: number; problemsSolved: number; messagesUsed: number }>(null);

  // When the current phase ends, in absolute time. State, not a ref — it's read
  // during render, and the countdown is derived from it rather than ticked down.
  const [endsAt, setEndsAt] = useState(0);
  const phaseRef = useRef<string>("");
  const roomIdRef = useRef<string>("");

  // Bumped once per successful poll. VoiceCall keys its work on this rather
  // than on `st`, so a batch of signalling messages is consumed exactly once —
  // the server deletes them as it hands them over, so a second pass would drop
  // them on the floor.
  const [pollSeq, setPollSeq] = useState(0);

  const poll = useCallback(async () => {
    const r = await fetch(`/api/rooms/${code}`).then((x) => x.json()).catch(() => null);
    if (!r) return;
    if (r.error) { setErr(r.error); return; }
    setSt(r);
    setEndsAt(Date.now() + r.secondsLeft * 1000);
    setPollSeq((n) => n + 1);
  }, [code]);

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await poll(); })();
    const t = setInterval(() => { void poll(); }, POLL_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, [poll]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(t); }, []);

  // Keyed on the phase string, not the polled state object — that object is
  // replaced every 2.5s, which would restart this interval before it ever fired.
  const phase = st?.phase ?? null;
  useEffect(() => {
    if (!phase || phase === "ended") return;
    const beat = async () => {
      await fetch(`/api/rooms/${code}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "beat", active: isStudying(IDLE_MS) }),
      }).catch(() => {});
    };
    beat();
    const t = setInterval(beat, BEAT_MS);
    return () => clearInterval(t);
  }, [code, phase]);

  const loadNotebook = useCallback(async () => {
    if (!roomIdRef.current) return;
    const r = await fetch(`/api/notebook?roomId=${roomIdRef.current}`).then((x) => x.json()).catch(() => null);
    if (r?.entries) setEntries(r.entries);
  }, []);

  // First poll carries the room id; the notebook needs it to attach entries.
  useEffect(() => {
    if (!st?.room.id || roomIdRef.current) return;
    roomIdRef.current = st.room.id;
    loadNotebook();
  }, [st?.room.id, loadNotebook]);

  // Break starts → the notebook opens itself. That's the moment the parked
  // doubts are worth something.
  useEffect(() => {
    if (!st) return;
    if (phaseRef.current === "focus" && st.phase === "discussion") {
      setNotebookOpen(true);
      setTab("queue");
      loadNotebook();
    }
    phaseRef.current = st.phase;
  }, [st?.phase, st, loadNotebook]);

  async function act(body: Record<string, unknown>) {
    const r = await fetch(`/api/rooms/${code}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }).then((x) => x.json()).catch(() => null);
    if (r?.error) setErr(r.error);
    else setErr("");
    poll();
    return r;
  }

  async function leave() {
    setLeaving(true);
    const r = await act({ action: "leave" });
    if (r?.summary) setSummary(r.summary);
    else router.push("/rooms");
  }

  async function addDoubt() {
    const text = draft.trim();
    if (!text || !roomIdRef.current) return;
    setDraft("");
    const r = await fetch("/api/notebook", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, roomId: roomIdRef.current }),
    }).then((x) => x.json()).catch(() => null);
    if (r?.entry) setEntries((e) => [r.entry, ...e]);
  }

  async function toggleQueue(en: Entry) {
    setEntries((es) => es.map((x) => (x.id === en.id ? { ...x, queued: !x.queued } : x)));
    await fetch("/api/notebook", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: en.id, queued: !en.queued }),
    }).catch(() => {});
    poll();
  }

  async function delDoubt(id: string) {
    setEntries((es) => es.filter((x) => x.id !== id));
    await fetch("/api/notebook", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
    poll();
  }

  if (summary) {
    return (
      <>
        <div className="sec-head"><h2 style={{ fontSize: 19 }}>Room chhoda — session summary</h2></div>
        <div className="card focus-summary">
          <div className="fs-badge">Room: {st?.room.name}</div>
          <div className="stats" style={{ marginTop: 18 }}>
            <div className="card stat"><div className="k">Room me time</div><div className="v num">{humanDuration(summary.elapsedSeconds)}</div></div>
            <div className="card stat"><div className="k">Active time</div><div className="v num">{humanDuration(summary.activeSeconds)}</div></div>
            <div className="card stat"><div className="k">Focus</div><div className="v num">{summary.focusPct}<small>%</small></div></div>
            <div className="card stat"><div className="k">Problems solved</div><div className="v num">{summary.problemsSolved}</div></div>
          </div>
          <p className="fs-note">
            {summary.cyclesDone} focus cycle poore kiye · {summary.messagesUsed} message use kiye.
            Ye session tumhari Study History me aa gaya.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Link className="btn btn-primary" href="/rooms">Rooms pe wapas</Link>
            <Link className="btn btn-ghost" href="/focus">Focus Mode</Link>
          </div>
        </div>
      </>
    );
  }

  if (err && !st) {
    return (
      <div className="card room-empty">
        <div className="re-mark">🔒</div>
        <h3>{err}</h3>
        <p><Link href="/rooms">Rooms list pe wapas jao</Link> aur code se join karo.</p>
      </div>
    );
  }
  if (!st) return <div className="card room-empty"><p>Room khul raha hai…</p></div>;

  if (st.phase === "ended" || st.room.endedAt) {
    return (
      <div className="card room-empty">
        <div className="re-mark">🏁</div>
        <h3>Ye room khatam ho gaya</h3>
        <p>Host ne session end kar diya. Tumhara time Study History me save hai.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
          <Link className="btn btn-primary" href="/rooms">Naya room</Link>
          <Link className="btn btn-ghost" href="/focus">Focus Mode</Link>
        </div>
      </div>
    );
  }

  const isFocus = st.phase === "focus";
  const secondsLeft = Math.max(0, Math.round((endsAt - now) / 1000));
  const pct = st.phaseSeconds > 0 ? 1 - secondsLeft / st.phaseSeconds : 0;
  const me = st.members.find((m) => m.isMe);
  const openDoubts = entries.filter((e) => !e.resolved).length;
  const helpers = st.members.filter((m) => m.needsHelp && !m.isMe);
  const hands = st.members.filter((m) => m.handRaised && !m.isMe);
  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/rooms/${st.room.code}` : "";

  return (
    <div className={`room${isFocus ? " is-focus" : " is-break"}`}>
      {/* ---- header ---- */}
      <div className="room-head card">
        <div className="rh-left">
          <h2 className="rh-name">{st.room.name}</h2>
          <div className="rh-meta">{st.room.subject}{st.room.topic && ` · ${st.room.topic}`} · host {st.room.hostName}</div>
        </div>
        <div className="rh-timer">
          <div className={`fphase ${isFocus ? "focus" : "break"}`}>{isFocus ? "Focus" : "Discussion"}</div>
          <div className="rh-clock num">{mmss(secondsLeft)}</div>
          <div className="rh-prog"><span style={{ width: `${pct * 100}%` }} /></div>
          <div className="rh-cycle">Cycle {st.cycle}</div>
        </div>
        <div className="rh-right">
          <button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(inviteUrl)} title={inviteUrl}>
            📋 Invite
          </button>
          <div className="rh-code mono">{st.room.code}</div>
        </div>
      </div>

      {err && <div className="room-err">{err}</div>}

      {/* ---- avatars ---- */}
      <div className="room-avatars">
        {st.members.map((m) => (
          <div key={m.userId} className={`av${m.status === "away" ? " away" : ""}`} title={`${m.name} · ${m.focusPct}% focus`}>
            <div className="av-circle">{m.name.slice(0, 1).toUpperCase()}</div>
            {m.isHost && <span className="av-host">host</span>}
            {m.handRaised && <span className="av-flag hand">✋</span>}
            {m.needsHelp && <span className="av-flag help">!</span>}
            <div className="av-name">{m.isMe ? "Tum" : m.name.split(" ")[0]}</div>
            <div className="av-sub num">{m.status === "away" ? "away" : humanDuration(m.activeSeconds)}</div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, st.room.maxParticipants - st.members.length) }, (_, i) => (
          <div key={`e${i}`} className="av empty"><div className="av-circle" /><div className="av-name">khaali</div></div>
        ))}
      </div>

      <div className="room-body">
        {/* ---- workspace ---- */}
        <div className="room-work card">
          {isFocus ? (
            <div className="rw-focus">
              <div className="rw-eyebrow">Focus block</div>
              <h3 className="rw-title">{st.room.topic || st.room.subject} — chup-chaap padho</h3>
              <p className="rw-say">
                Ab sirf padhai. Discussion band hai. Doubt aaye to <b>notebook</b> me likh do — {mmss(secondsLeft)} baad
                break me wahi doubt queue me chala jayega aur sabke saamne discuss hoga.
              </p>
              <div className="rw-cta">
                <Link className="btn btn-primary" href="/practice" target="_blank">Practice kholo ↗</Link>
                <Link className="btn btn-ghost" href="/learn" target="_blank">Lessons ↗</Link>
                <button className="btn btn-ghost" onClick={() => setNotebookOpen(true)}>📓 Doubt likho</button>
              </div>
              {(helpers.length > 0 || hands.length > 0) && (
                <div className="rw-alert">
                  {helpers.map((m) => <div key={m.userId}>🆘 <b>{m.name}</b> ko help chahiye</div>)}
                  {hands.map((m) => <div key={m.userId}>✋ <b>{m.name}</b> ne haath uthaya</div>)}
                  <span className="rw-alert-note">Break me sabse pehle inhe sunenge.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="rw-break">
              <div className="rw-eyebrow">Discussion break</div>
              <h3 className="rw-title">Ab doubts clear karo</h3>
              {st.queue.length === 0 ? (
                <p className="rw-say">Queue khaali hai. Jisko doubt hai, notebook se “Discuss karo” dabaye — list yahan aayegi.</p>
              ) : (
                <ol className="rw-queue">
                  {st.queue.map((q, i) => (
                    <li key={q.id}>
                      <span className="rq-n num">{i + 1}</span>
                      <span className="rq-who">{q.mine ? "Tum" : q.name}</span>
                      <span className="rq-txt">{q.text}</span>
                      {st.room.iAmHost && (
                        <button className="btn btn-ghost rq-done" onClick={() => act({ action: "resolveQueue", id: q.id })}>Ho gaya</button>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              <div className="rw-cta">
                <button className="btn btn-ghost" onClick={() => setNotebookOpen(true)}>📓 Notebook</button>
                {st.room.iAmHost && <button className="btn btn-teal" onClick={() => act({ action: "skip" })}>Break khatam → Focus</button>}
              </div>
            </div>
          )}

          {notebookOpen && (
            <div className="rw-note">
              <div className="sec-head" style={{ marginBottom: 8 }}>
                <h2>Private Notebook</h2>
                <span className="tag" style={{ marginLeft: "auto" }}>sirf tum dekh sakte ho</span>
                <button className="fnote-del" onClick={() => setNotebookOpen(false)}>×</button>
              </div>
              <div className="fnote-add">
                <input className="inp" placeholder="Merge aur Join me farak kya hai?" value={draft}
                  onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addDoubt(); }} />
                <button className="btn btn-teal" onClick={addDoubt} disabled={!draft.trim()}>Add</button>
              </div>
              {entries.length === 0 ? (
                <p className="fnote-empty">Doubt yahan likho — koi nahi dekhega jab tak tum “Discuss karo” na dabao.</p>
              ) : (
                <ul className="fnote-list">
                  {entries.map((e) => (
                    <li key={e.id}>
                      <span className="fnote-txt">{e.text}</span>
                      <button className={`btn btn-ghost fnote-q${e.queued ? " on" : ""}`} onClick={() => toggleQueue(e)}>
                        {e.queued ? "Queue me hai" : "Discuss karo"}
                      </button>
                      <button className="fnote-del" onClick={() => delDoubt(e.id)}>×</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ---- sidebar ---- */}
        <div className="room-side card">
          <div className="rs-tabs">
            <button className={tab === "people" ? "on" : ""} onClick={() => setTab("people")}>People</button>
            <button className={tab === "queue" ? "on" : ""} onClick={() => setTab("queue")}>
              Queue{st.queue.length > 0 && <span className="fdot">{st.queue.length}</span>}
            </button>
            <button className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}>Chat</button>
          </div>

          {tab === "people" && (
            <>
              <ul className="rs-people">
                {st.members.map((m) => (
                  <li key={m.userId}>
                    <span className={`dot ${m.status}`} />
                    <span className="rs-nm">
                      {m.isMe ? "Tum" : m.name}
                      {m.isHost && <span className="tag" style={{ marginLeft: 6 }}>host</span>}
                      {m.inVoice && <span title={m.micMuted ? "in voice, muted" : "in voice"} style={{ marginLeft: 6 }}>{m.micMuted ? "🔇" : "🎙️"}</span>}
                    </span>
                    <span className="rs-pct num">{m.focusPct}%</span>
                  </li>
                ))}
              </ul>
              <VoiceCall
                meId={st.members.find((m) => m.isMe)?.userId ?? ""}
                members={st.members.map((m) => ({ userId: m.userId, name: m.name, isMe: m.isMe, inVoice: m.inVoice, micMuted: m.micMuted }))}
                voiceEnabled={st.room.voiceEnabled}
                iAmHost={st.room.iAmHost}
                signals={st.signals ?? []}
                pollSeq={pollSeq}
                post={act}
              />
            </>
          )}

          {tab === "queue" && (
            st.queue.length === 0
              ? <p className="rs-empty">Queue khaali. Notebook se doubt add karo.</p>
              : <ol className="rs-queue">
                  {st.queue.map((q) => (
                    <li key={q.id}><b>{q.mine ? "Tum" : q.name.split(" ")[0]}</b> — {q.text}</li>
                  ))}
                </ol>
          )}

          {tab === "chat" && (
            <div className="rs-chat">
              <div className="rs-msgs">
                {st.messages.length === 0 && <p className="rs-empty">Abhi koi message nahi.</p>}
                {st.messages.map((m) => (
                  <div key={m.id} className={`rs-msg${m.mine ? " mine" : ""}${m.kind === "emoji" ? " emo" : ""}`}>
                    <b>{m.mine ? "Tum" : m.name.split(" ")[0]}</b> {m.text}
                  </div>
                ))}
              </div>
              <div className="rs-emojis">
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => act({ action: "message", kind: "emoji", text: e })}>{e}</button>
                ))}
              </div>
              {isFocus ? (
                <p className="rs-locked">🔒 Focus me sirf emoji. Baat break me — doubt notebook me likho.</p>
              ) : (
                <>
                  <div className="rs-quick">
                    {QUICK_REPLIES.map((q) => (
                      <button key={q} disabled={st.messagesLeft <= 0}
                        onClick={() => act({ action: "message", kind: "quick", text: q })}>{q}</button>
                    ))}
                  </div>
                  <p className="rs-left num">{st.messagesLeft} message bache is cycle me</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- bottom bar ---- */}
      <div className="room-bar card">
        <button className={`btn btn-ghost${me?.handRaised ? " on" : ""}`} onClick={() => act({ action: "hand", on: !me?.handRaised })}>
          ✋ {me?.handRaised ? "Haath uthaya hai" : "Raise hand"}
        </button>
        <button className={`btn btn-ghost${me?.needsHelp ? " danger-on" : ""}`} onClick={() => act({ action: "help", on: !me?.needsHelp })}>
          🆘 {me?.needsHelp ? "Help maangi hai" : "Need help"}
        </button>
        <button className={`btn btn-ghost${notebookOpen ? " on" : ""}`} onClick={() => setNotebookOpen((o) => !o)}>
          📓 Notebook{openDoubts > 0 && <span className="fdot">{openDoubts}</span>}
        </button>
        <div className="rb-mid num">{me ? `${humanDuration(me.activeSeconds)} active · ${me.focusPct}% focus` : ""}</div>
        {st.room.iAmHost && (
          <>
            <button className="btn btn-ghost" onClick={() => act({ action: "skip" })}>
              {isFocus ? "Break shuru karo" : "Focus shuru karo"}
            </button>
            <button className="btn btn-ghost fend" onClick={() => act({ action: "end" })}>Room end</button>
          </>
        )}
        <button className="btn btn-ghost fend" onClick={leave} disabled={leaving}>Leave</button>
      </div>
    </div>
  );
}
