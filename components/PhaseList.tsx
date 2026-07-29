"use client";

import Link from "next/link";
import { useState } from "react";
import { subjectStyle } from "@/lib/subjects";

export type Phase = {
  id: string; slug: string; order: number; title: string; subtitle: string; status: string;
  weeks: string; level: string; whyText: string; milestone: string;
  toolsCsv: string; skills: [name: string, done: boolean][]; firstLesson?: string;
  pct: number;
};

function BoxIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
}

function PhaseCard({ p }: { p: Phase }) {
  const [open, setOpen] = useState(p.status === "now");
  const st = p.status === "done" ? "st-done" : p.status === "now" ? "st-now" : "st-locked";
  // "Locked" was the wrong word twice over. An open subject you have not started
  // is Available, not "In progress" — that claimed work the student had not done.
  // And a closed one is waiting on us to write it, not on them to earn it.
  const stTxt =
    p.status === "done" ? "✓ Done"
    : p.status === "now" ? (p.pct > 0 ? "● In progress" : "○ Available")
    : "🔒 Coming soon";
  const tools = p.toolsCsv ? p.toolsCsv.split(",") : [];

  return (
    <section className={`card phase subject-tint ${p.status}${open ? " open" : ""}`} style={subjectStyle(p.slug)}>
      {/* Keyboard-operable disclosure. This was a plain <div onClick>, and since
          .pbody is display:none until .phase.open, a keyboard user couldn't open a
          phase at all — the skills and the "Start lessons →" link were unreachable. */}
      <div
        className="phead"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }
        }}
      >
        <div className="pnum">{p.order}</div>
        <div className="ptitle">
          <h3>{p.title} <span className={`stchip ${st}`}>{stTxt}</span></h3>
          <div className="meta">{p.weeks} · {p.level} · {p.subtitle}</div>
        </div>
        <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div className="pbody">
        {p.whyText && <div className="why">💡 {p.whyText}</div>}
        <div className="skills">
          {p.skills.map(([name, d], i) => (
            <div key={i} className={`skill${d ? " on" : ""}`}>
              <span className="cb">✓</span><span className="lbl">{name}</span>
            </div>
          ))}
        </div>
        {tools.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tools.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        {p.milestone && (
          <div className="milestone"><BoxIcon /><span><b>Project:</b> {p.milestone}</span></div>
        )}
        {p.firstLesson && (
          <Link href={`/learn/${p.firstLesson}`} className="btn btn-primary" style={{ marginTop: 14 }}>
            Start lessons →
          </Link>
        )}
      </div>
    </section>
  );
}

export function PhaseList({ phases }: { phases: Phase[] }) {
  return <>{phases.map((p) => <PhaseCard key={p.id} p={p} />)}</>;
}
