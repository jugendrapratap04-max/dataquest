"use client";

import { useState } from "react";

type Level = "easy" | "medium" | "hard";
type Q = { q: string; options: string[]; correct: number; why: string; level?: Level };

const LEVELS: { key: Level; label: string; dot: string; sub: string }[] = [
  { key: "easy", label: "Easy", dot: "🟢", sub: "did the core idea land?" },
  { key: "medium", label: "Medium", dot: "🟡", sub: "can you apply it to a new case?" },
  { key: "hard", label: "Hard", dot: "🔴", sub: "edge cases and bugs — answers are not written in the lesson" },
];

// A short end-of-lesson quiz. Questions test whether the concept actually
// clicked (predict-the-output, spot-the-bug, apply-to-a-new-case) rather than
// "what did the lesson say" — so the answer isn't findable by re-reading. Each
// question locks after one pick and explains why, right or wrong.
//
// Questions may carry a `level` (easy/medium/hard). When they do, they render as
// separate sections that score separately, stacked easiest first with no gate
// between them — a student who can't do Hard still keeps their Easy/Medium score.
// Quizzes written before levels existed have no `level` and render as one list.
export function LessonQuiz({ items }: { items: Q[] }) {
  const [ans, setAns] = useState<(number | null)[]>(() => items.map(() => null));

  const choose = (qi: number, oi: number) =>
    setAns((a) => (a[qi] !== null ? a : a.map((v, i) => (i === qi ? oi : v))));

  const answered = ans.filter((a) => a !== null).length;
  const done = answered === items.length;
  const score = items.reduce((n, it, i) => n + (ans[i] === it.correct ? 1 : 0), 0);
  const verdict = score === items.length
    ? "concept clear! 🎉"
    : score >= Math.ceil(items.length / 2)
      ? "solid — read the explanation for the ones you missed."
      : "no problem — read the lesson once more, then try again.";

  // Index every question first so a question keeps its answer slot even after
  // being grouped into a section.
  const indexed = items.map((it, i) => ({ it, i }));
  const leveled = items.some((it) => it.level);
  const sections = leveled
    ? LEVELS.map((L) => ({ ...L, qs: indexed.filter(({ it }) => it.level === L.key) })).filter((s) => s.qs.length)
    : [{ key: "all" as const, label: "", dot: "", sub: "", qs: indexed }];

  const Question = ({ it, i, n }: { it: Q; i: number; n: number }) => {
    const a = ans[i];
    return (
      <div className="quiz-q">
        <div className="quiz-qt"><span className="quiz-n">Q{n}</span><span dangerouslySetInnerHTML={{ __html: it.q }} /></div>
        <div className="quiz-opts">
          {it.options.map((o, oi) => {
            let cls = "quiz-opt";
            if (a !== null) {
              if (oi === it.correct) cls += " correct";
              else if (oi === a) cls += " wrong";
              else cls += " dim";
            }
            return (
              <button key={oi} className={cls} disabled={a !== null} onClick={() => choose(i, oi)}>
                <span className="quiz-key">{String.fromCharCode(65 + oi)}</span>{o}
              </button>
            );
          })}
        </div>
        {a !== null && (
          <div className={`quiz-why ${a === it.correct ? "ok" : "no"}`}>
            <b>{a === it.correct ? "✅ Correct." : "❌ Not quite."}</b> <span dangerouslySetInnerHTML={{ __html: it.why }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card quiz">
      <div className="quiz-head">🧠 <b>Check your understanding</b><span className="quiz-count">{answered}/{items.length}</span></div>
      <p className="quiz-sub">
        Think first, then pick — each question locks after one choice.
        {leveled && " Three levels, scored separately: clear Easy and Medium and you understand the lesson; Hard is the stretch."}
      </p>

      {sections.map((s) => {
        const secDone = s.qs.every(({ i }) => ans[i] !== null);
        const secScore = s.qs.reduce((n, { it, i }) => n + (ans[i] === it.correct ? 1 : 0), 0);
        return (
          <div className={`quiz-sec ${s.key}`} key={s.key}>
            {s.label && (
              <div className="quiz-lvl">
                <span className="ql-name">{s.dot} {s.label}</span>
                <span className="ql-sub">{s.sub}</span>
                {secDone && <span className="ql-score">{secScore}/{s.qs.length}</span>}
              </div>
            )}
            {s.qs.map(({ it, i }) => <Question key={i} it={it} i={i} n={i + 1} />)}
          </div>
        );
      })}

      {done && (
        <div className="quiz-score">
          Total <b>{score}/{items.length}</b> — {verdict}
        </div>
      )}
    </div>
  );
}
