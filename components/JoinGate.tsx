"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// What an invite link opens onto. Shows what the room actually is — including
// how long the focus block runs — before anyone commits to sitting in it.
export function JoinGate(p: {
  code: string; name: string; subject: string; topic: string; hostName: string;
  focusMinutes: number; breakMinutes: number; count: number; max: number; ended: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function join() {
    setBusy(true); setErr("");
    const r = await fetch("/api/rooms", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", code: p.code }),
    }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r?.ok) router.refresh();
    else setErr(r?.error ?? "Could not join.");
  }

  if (p.ended) {
    return (
      <div className="card room-empty">
        <div className="re-mark">🏁</div>
        <h3>This room has already ended</h3>
        <p><Link href="/rooms">Look at other rooms</Link> or open your own.</p>
      </div>
    );
  }

  const full = p.count >= p.max;
  return (
    <div className="card room-empty join-gate">
      <div className="re-mark">📚</div>
      <h3>{p.name}</h3>
      <p className="jg-meta">{p.subject}{p.topic && ` · ${p.topic}`} · host {p.hostName}</p>
      <div className="jg-rules">
        <div><b>{p.focusMinutes} min focus</b> — heads-down study, emoji only</div>
        <div><b>{p.breakMinutes} min discussion</b> — doubts from the queue, one at a time</div>
        <div><b>{p.count}/{p.max} log</b> inside right now</div>
      </div>
      {err && <div className="room-err" style={{ marginTop: 12 }}>{err}</div>}
      <button className="btn btn-primary" onClick={join} disabled={busy || full} style={{ marginTop: 14 }}>
        {full ? "Room is full" : busy ? "Joining…" : "Join →"}
      </button>
    </div>
  );
}
