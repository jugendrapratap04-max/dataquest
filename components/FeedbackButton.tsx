"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Cat = "bug" | "idea" | "other";
const CATS: { id: Cat; label: string; hint: string }[] = [
  { id: "bug", label: "🐞 Bug", hint: "something broke or looks wrong" },
  { id: "idea", label: "💡 Idea", hint: "this should exist" },
  { id: "other", label: "💬 Other", hint: "anything else" },
];

export function FeedbackButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<Cat>("bug");
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // Close on Escape; focus the textarea when the panel opens.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    areaRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset the form a moment after a successful send, so reopening is clean.
  function reset() {
    setMsg(""); setState("idle"); setError("");
  }

  async function submit() {
    if (msg.trim().length < 3) { setError("Add a little more detail."); return; }
    setState("sending"); setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category: cat, message: msg, path: pathname }),
      });
      const data = await res.json();
      if (!res.ok) { setState("error"); setError(data.error || "Something went wrong."); return; }
      setState("done");
      setTimeout(() => { setOpen(false); reset(); }, 1600);
    } catch {
      setState("error"); setError("Network problem — please try again.");
    }
  }

  return (
    <>
      <button
        className="fb-fab"
        aria-label="Feedback bhejo"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.6a8.5 8.5 0 0 1-.9-3.9A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/>
        </svg>
        <span>Feedback</span>
      </button>

      {open && (
        <>
          <div className="fb-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="fb-panel" role="dialog" aria-label="Feedback bhejo">
            {state === "done" ? (
              <div className="fb-thanks">
                <div className="fb-tick">✓</div>
                <b>Shukriya!</b>
                <p>Feedback received — this is how Etudo gets better.</p>
              </div>
            ) : (
              <>
                <div className="fb-head">
                  <b>Feedback bhejo</b>
                  <button className="fb-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
                </div>
                <p className="fb-sub">This is a beta — tell us anything that feels off. Every note is read.</p>
                <div className="fb-cats">
                  {CATS.map((c) => (
                    <button
                      key={c.id}
                      className={`fb-cat${cat === c.id ? " on" : ""}`}
                      onClick={() => setCat(c.id)}
                      title={c.hint}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={areaRef}
                  className="fb-area"
                  placeholder={CATS.find((c) => c.id === cat)?.hint}
                  value={msg}
                  maxLength={2000}
                  onChange={(e) => setMsg(e.target.value)}
                />
                {error && <div className="fb-err">{error}</div>}
                <button className="btn btn-primary fb-send" onClick={submit} disabled={state === "sending"}>
                  {state === "sending" ? "Sending…" : "Send →"}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
