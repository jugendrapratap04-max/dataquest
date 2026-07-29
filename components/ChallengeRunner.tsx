"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDuration } from "@/lib/duration";

export type RunnerQuestion = { q: string; options: string[]; from: string; fromSlug: string };

export function ChallengeRunner({ code, questions }: { code: string; questions: RunnerQuestion[] }) {
  const router = useRouter();
  const [at, setAt] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The clock the student sees. The server clamps whatever this reports, and
  // the honest position is that a browser-reported duration is worth roughly
  // what the person is willing to make it worth — which is why time only breaks
  // ties here and never outranks a correct answer.
  useEffect(() => {
    const id = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const q = questions[at];
  const answered = answers.filter((a) => a !== null).length;

  function pick(i: number) {
    setAnswers((prev) => prev.map((a, k) => (k === at ? i : a)));
  }

  async function submit() {
    setBusy(true);
    setError(null);
    const r = await fetch(`/api/challenge/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, seconds: elapsed }),
    }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r?.ok) router.refresh();
    else setError(r?.error ?? "Could not save your run — check your connection and press Finish again.");
  }

  return (
    <section className="card pad">
      <div className="ch-run-head">
        <span className="ch-step">Question {at + 1} of {questions.length}</span>
        <span className="time-pill live">⏱ {formatDuration(elapsed)}</span>
      </div>
      <div className="ch-bar"><div className="ch-bar-fill" style={{ width: `${(answered / questions.length) * 100}%` }} /></div>

      <h3 className="ch-q">{q.q}</h3>

      <div className="ch-options">
        {q.options.map((opt, i) => (
          <button key={i} className={`ch-opt${answers[at] === i ? " on" : ""}`} onClick={() => pick(i)}>
            <span className="ch-opt-k">{String.fromCharCode(65 + i)}</span>{opt}
          </button>
        ))}
      </div>

      {/* No "correct!" feedback mid-run — that is what makes it a test rather
          than a lesson. The explanations all arrive together at the end, which
          is also when they are most useful. */}
      <p className="ch-hint" style={{ marginTop: 12 }}>From <b>{q.from}</b></p>

      {error && <div className="note warn" style={{ marginTop: 12 }}><span className="i">⚠️</span><div>{error}</div></div>}

      <div className="ch-nav">
        <button className="btn btn-ghost" onClick={() => setAt((n) => Math.max(0, n - 1))} disabled={at === 0}>← Back</button>
        {at < questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setAt((n) => n + 1)}>Next →</button>
        ) : (
          <button className="btn btn-primary" onClick={submit} disabled={busy}>
            {busy ? "Saving…" : `Finish (${answered}/${questions.length} answered)`}
          </button>
        )}
      </div>

      <p className="ch-hint" style={{ marginTop: 14 }}>
        You get <b>one scored run</b> — that is what keeps the comparison fair. Want to drill these topics properly?{" "}
        <Link href="/practice" style={{ color: "var(--teal)" }}>Practice is unlimited →</Link>
      </p>
    </section>
  );
}
