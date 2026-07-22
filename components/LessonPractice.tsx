"use client";

import { useState } from "react";

/* Scaffolding between "read the lesson" and "write a whole function from a blank
 * page" — the cliff novices fall off. Research (worked-example effect, subgoal
 * labels, PRIMM) says the ladder is: worked example -> faded example -> write it
 * yourself. `worked` is static and lives in the lesson renderer; the two rungs
 * that need a student answer live here.
 *
 * Both are ungraded on purpose: they cost no XP and can be retried, so a student
 * is free to be wrong. The graded rung is the practice problems. */

type Slot = { answer: string; accept?: string[]; why?: string };

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
const isRight = (val: string, s: Slot) =>
  [s.answer, ...(s.accept ?? [])].some((a) => norm(a) === norm(val));

function Verdict({ ok, total, right }: { ok: boolean; total: number; right: number }) {
  return (
    <div className={`fx-verdict ${ok ? "ok" : "no"}`}>
      {ok ? `✅ All ${total} correct — you can write this yourself now.` : `${right}/${total} correct. Read the notes, then try again.`}
    </div>
  );
}

/** Faded worked example: the same solution with a few pieces removed. */
export function FadedExample({ code, blanks, output }: { code: string; blanks: Slot[]; output?: string }) {
  const [vals, setVals] = useState<string[]>(() => blanks.map(() => ""));
  const [checked, setChecked] = useState(false);
  const parts = code.split("____");
  const right = blanks.reduce((n, b, i) => n + (isRight(vals[i], b) ? 1 : 0), 0);

  return (
    <div className="fx">
      <pre className="fx-code">
        {parts.map((p, i) => (
          <span key={i}>
            {p}
            {i < blanks.length && (
              <input
                className={`fx-in ${checked ? (isRight(vals[i], blanks[i]) ? "ok" : "no") : ""}`}
                value={vals[i]}
                size={Math.max(4, blanks[i].answer.length + 1)}
                spellCheck={false}
                aria-label={`blank ${i + 1}`}
                onChange={(e) => { setVals((p) => { const n = [...p]; n[i] = e.target.value; return n; }); setChecked(false); }}
              />
            )}
          </span>
        ))}
      </pre>
      {output && <div className="fx-out">It should print: <b>{output}</b></div>}

      <div className="fx-actions">
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} onClick={() => setChecked(true)}>Check</button>
        {checked && <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => { setVals(blanks.map(() => "")); setChecked(false); }}>Clear</button>}
        {checked && !blanks.every((b, i) => isRight(vals[i], b)) && (
          <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => { setVals(blanks.map((b) => b.answer)); setChecked(true); }}>Show answer</button>
        )}
      </div>

      {checked && (
        <>
          <Verdict ok={right === blanks.length} total={blanks.length} right={right} />
          <ul className="fx-notes">
            {blanks.map((b, i) => b.why && (
              <li key={i} className={isRight(vals[i], b) ? "ok" : "no"}>
                <b>Blank {i + 1}</b> <span dangerouslySetInnerHTML={{ __html: b.why }} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** Code tracing: a student who cannot say what a variable holds at line 5
 *  cannot write line 6. Line numbers are shown so questions can point at them. */
export function TraceCheck({ code, steps }: { code: string; steps: (Slot & { q: string })[] }) {
  const [vals, setVals] = useState<string[]>(() => steps.map(() => ""));
  const [checked, setChecked] = useState(false);
  const right = steps.reduce((n, s, i) => n + (isRight(vals[i], s) ? 1 : 0), 0);

  return (
    <div className="fx">
      <pre className="fx-code numbered">
        {code.split("\n").map((line, i) => (
          <span className="fx-line" key={i}><span className="fx-ln">{i + 1}</span>{line || " "}{"\n"}</span>
        ))}
      </pre>
      <div className="fx-qs">
        {steps.map((s, i) => (
          <label className="fx-q" key={i}>
            <span dangerouslySetInnerHTML={{ __html: s.q }} />
            <input
              className={`fx-in ${checked ? (isRight(vals[i], s) ? "ok" : "no") : ""}`}
              value={vals[i]}
              size={8}
              spellCheck={false}
              onChange={(e) => { setVals((p) => { const n = [...p]; n[i] = e.target.value; return n; }); setChecked(false); }}
            />
          </label>
        ))}
      </div>
      <div className="fx-actions">
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} onClick={() => setChecked(true)}>Check</button>
        {checked && <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => { setVals(steps.map(() => "")); setChecked(false); }}>Clear</button>}
      </div>
      {checked && (
        <>
          <Verdict ok={right === steps.length} total={steps.length} right={right} />
          <ul className="fx-notes">
            {steps.map((s, i) => s.why && (
              <li key={i} className={isRight(vals[i], s) ? "ok" : "no"}>
                <b>{`Q${i + 1}`}</b> answer <code>{s.answer}</code> — <span dangerouslySetInnerHTML={{ __html: s.why }} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
