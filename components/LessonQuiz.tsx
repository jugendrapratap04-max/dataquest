"use client";

import { useState } from "react";

type Q = { q: string; options: string[]; correct: number; why: string };

// A short end-of-lesson quiz. Questions test whether the concept actually
// clicked (predict-the-output, spot-the-bug, apply-to-a-new-case) rather than
// "what did the lesson say" — so the answer isn't findable by re-reading. Each
// question locks after one pick and explains why, right or wrong.
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
      ? "achha — jo galat hue unki wajah dekh lo."
      : "koi baat nahi — lesson ek baar dobara padho, phir try karo.";

  return (
    <div className="card quiz">
      <div className="quiz-head">🧠 <b>Quick Quiz</b><span className="quiz-count">{answered}/{items.length}</span></div>
      <p className="quiz-sub">Pehle khud socho, phir chuno — har sawaal ek hi baar. Jawab lesson me nahi likha; concept clear hai to aa jayega.</p>

      {items.map((it, qi) => {
        const a = ans[qi];
        return (
          <div className="quiz-q" key={qi}>
            <div className="quiz-qt"><span className="quiz-n">Q{qi + 1}</span><span dangerouslySetInnerHTML={{ __html: it.q }} /></div>
            <div className="quiz-opts">
              {it.options.map((o, oi) => {
                let cls = "quiz-opt";
                if (a !== null) {
                  if (oi === it.correct) cls += " correct";
                  else if (oi === a) cls += " wrong";
                  else cls += " dim";
                }
                return (
                  <button key={oi} className={cls} disabled={a !== null} onClick={() => choose(qi, oi)}>
                    <span className="quiz-key">{String.fromCharCode(65 + oi)}</span>{o}
                  </button>
                );
              })}
            </div>
            {a !== null && (
              <div className={`quiz-why ${a === it.correct ? "ok" : "no"}`}>
                <b>{a === it.correct ? "✅ Sahi!" : "❌ Nahi."}</b> <span dangerouslySetInnerHTML={{ __html: it.why }} />
              </div>
            )}
          </div>
        );
      })}

      {done && (
        <div className="quiz-score">
          Score <b>{score}/{items.length}</b> — {verdict}
        </div>
      )}
    </div>
  );
}
