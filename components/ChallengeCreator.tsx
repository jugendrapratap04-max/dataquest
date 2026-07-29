"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ChallengeCreator({ subjects }: { subjects: { slug: string; title: string; count: number }[] }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [size, setSize] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    const r = await fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, size }),
    }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r?.code) router.push(`/challenge/${r.code}`);
    else setError(r?.error ?? "Could not create the challenge — check your connection and try again.");
  }

  const pool = subject ? subjects.find((s) => s.slug === subject)?.count ?? 0 : subjects.reduce((n, s) => n + s.count, 0);

  return (
    <section className="card pad">
      <div className="sec-head"><h2>Build a challenge</h2></div>

      <div className="ch-field">
        <div className="ch-label">Subject</div>
        <div className="viz-controls" style={{ flexWrap: "wrap" }}>
          <button className={`btn ${subject === "" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                  onClick={() => setSubject("")}>Everything</button>
          {subjects.map((s) => (
            <button key={s.slug} className={`btn ${subject === s.slug ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 13px" }}
                    onClick={() => setSubject(s.slug)}>{s.title}</button>
          ))}
        </div>
        {/* Only subjects finished to the standard carry a quiz, so this list is
            short on purpose — and it grows by itself as subjects are written. */}
        <p className="ch-hint">{pool} questions to draw from.</p>
      </div>

      <div className="ch-field">
        <div className="ch-label">Length</div>
        <div className="viz-controls">
          {[5, 10, 15].map((n) => (
            <button key={n} className={`btn ${size === n ? "btn-primary" : "btn-ghost"}`} style={{ padding: "7px 15px" }}
                    onClick={() => setSize(n)}>{n}</button>
          ))}
        </div>
        <p className="ch-hint">About {Math.round(size * 0.4)}–{size} minutes.</p>
      </div>

      {error && <div className="note warn" style={{ marginTop: 4 }}><span className="i">⚠️</span><div>{error}</div></div>}

      <button className="btn btn-primary" style={{ marginTop: 16, padding: "11px 20px" }} onClick={create} disabled={busy}>
        {busy ? "Building…" : "Create challenge →"}
      </button>
    </section>
  );
}
