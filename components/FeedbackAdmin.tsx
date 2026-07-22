"use client";

import { useState } from "react";

type Item = {
  id: string; category: string; message: string; path: string;
  status: string; who: string; email: string; when: string;
};

const CAT_LABEL: Record<string, string> = { bug: "🐞 Bug", idea: "💡 Idea", other: "💬 Other" };

function ago(iso: string) {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function FeedbackAdmin({ items }: { items: Item[] }) {
  const [list, setList] = useState(items);
  const [filter, setFilter] = useState<"all" | "new">("new");

  async function mark(id: string, status: "new" | "seen") {
    setList((l) => l.map((f) => (f.id === id ? { ...f, status } : f)));
    await fetch("/api/feedback", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  const newCount = list.filter((f) => f.status === "new").length;
  const shown = filter === "new" ? list.filter((f) => f.status === "new") : list;

  return (
    <div>
      <div className="page-intro">
        <h1 style={{ fontSize: 22, fontWeight: 750 }}>Feedback Inbox</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "4px 0 0" }}>
          Testers ne jo bheja — {list.length} total, {newCount} naye.
        </p>
      </div>

      <div className="fa-tabs">
        <button className={`fa-tab${filter === "new" ? " on" : ""}`} onClick={() => setFilter("new")}>
          Naye <span className="fa-n">{newCount}</span>
        </button>
        <button className={`fa-tab${filter === "all" ? " on" : ""}`} onClick={() => setFilter("all")}>
          Sab <span className="fa-n">{list.length}</span>
        </button>
      </div>

      {shown.length === 0 ? (
        <section className="card pad" style={{ textAlign: "center", color: "var(--ink-faint)" }}>
          {filter === "new" ? "No new feedback — all caught up. 🎉" : "No feedback has come in yet."}
        </section>
      ) : (
        <div className="fa-list">
          {shown.map((f) => (
            <section key={f.id} className={`card fa-item${f.status === "new" ? " is-new" : ""}`}>
              <div className="fa-top">
                <span className={`fa-cat fa-${f.category}`}>{CAT_LABEL[f.category] || f.category}</span>
                <span className="fa-meta">{f.who} · {ago(f.when)}</span>
                {f.status === "new"
                  ? <button className="fa-mark" onClick={() => mark(f.id, "seen")}>Mark as seen ✓</button>
                  : <button className="fa-mark seen" onClick={() => mark(f.id, "new")}>↩ Mark as new</button>}
              </div>
              <p className="fa-msg">{f.message}</p>
              {f.path && <div className="fa-path mono">{f.path} · {f.email}</div>}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
