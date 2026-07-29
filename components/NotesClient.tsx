"use client";

import { useState } from "react";

type Note = { id: string; topic: string; title: string; body: string; code: string };

export function NotesClient({ initial }: { initial: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initial);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ topic: "", title: "", body: "", code: "" });

  async function add() {
    if (!f.title.trim()) return;
    setBusy(true);
    const res = await fetch("/api/notes", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
    }).then((r) => r.json()).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setNotes((n) => [{ id: res.id, topic: f.topic.trim() || "General", title: f.title.trim(), body: f.body.trim(), code: f.code.trim() }, ...n]);
      setF({ topic: "", title: "", body: "", code: "" });
      setShow(false);
    }
  }

  async function del(id: string) {
    setNotes((n) => n.filter((x) => x.id !== id));
    await fetch("/api/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
  }

  return (
    <>
      <div className="sec-head" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 19 }}>My Notes</h2>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setShow((s) => !s)}>{show ? "Cancel" : "+ New note"}</button>
      </div>
      <p className="page-intro">Save anything worth keeping. At revision time this becomes your cheat-sheet.</p>

      {show && (
        <div className="card pad note-form">
          <div className="nf-row">
            {/* aria-label on each field: a placeholder is not a label — it
                disappears the moment you type, and a screen reader announces
                these four boxes as "edit text" with nothing to tell them apart. */}
            <input aria-label="Topic" placeholder="Topic (for example Python)" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} />
            <input aria-label="Title" placeholder="Title *" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </div>
          <textarea aria-label="Note" placeholder="Note — what you want to remember" rows={2} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
          <input aria-label="Code snippet" placeholder="Code snippet (optional)" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
          <button className="btn btn-primary" onClick={add} disabled={busy}>{busy ? "Saving…" : "Save note"}</button>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="card pad">No notes yet. Use &quot;+ New note&quot; above to write your first one.</div>
      ) : (
        <div className="notes-grid">
          {notes.map((n) => (
            <div className="note-card" key={n.id}>
              <button className="note-del" onClick={() => del(n.id)} aria-label="Delete">×</button>
              <div className="nt">{n.topic}</div>
              <h4>{n.title}</h4>
              {n.body && <p>{n.body}</p>}
              {n.code && <span className="code-in">{n.code}</span>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
