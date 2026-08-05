"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { explainError, explainSqlError } from "@/lib/error-help";

/**
 * The plain-English explanation shown under a raw Python error.
 *
 * Deliberately rendered BELOW the real message rather than instead of it. The
 * student has to learn to read tracebacks eventually, and hiding the real error
 * would make this platform the only place they can debug. This teaches the
 * message; it does not replace it.
 *
 * Renders nothing when no rule matches — a vague guess is worse than silence,
 * because a beginner cannot tell a guess from an explanation.
 */
/* `code` spans in the explanation text become <code> elements.
 *
 * Done by splitting rather than with dangerouslySetInnerHTML on purpose: part of
 * this text is interpolated from the error message, which contains the
 * student's own names and values. Rendering that as HTML would let a variable
 * called `<img onerror=...>` execute. Splitting keeps every piece a React text
 * node, which React escapes for us. */
function withCode(text: string) {
  return text.split("`").map((part, i) =>
    i % 2 === 1 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>
  );
}

export function ErrorHelp({
  error, dialect = "python", problemId, lessonSlug,
}: {
  error?: string;
  dialect?: "python" | "sql";
  /** Where this happened. Both optional — a runnable example inside a lesson has
   *  no problem, and the practice workbench has no lesson. */
  problemId?: string;
  lessonSlug?: string;
}) {
  const help = dialect === "sql" ? explainSqlError(error) : explainError(error);
  const rule = help?.rule;

  /* Which mistakes a student actually keeps making is the other half of what
   * this file already computes, and until now it was computed and dropped.
   *
   * The guard is what makes this safe to put in a render path: this component
   * re-renders on every keystroke in the editor above it, and an unguarded write
   * would file a row per character typed. `error` is in the dependency list, so
   * React skips the effect entirely while the message is unchanged; the ref
   * catches StrictMode's deliberate double-invoke, which shares the instance.
   *
   * A consequence worth stating: running the same broken code twice in a row
   * records one event, not two. That is the behaviour we want — the question is
   * "which mistakes does this student keep hitting", not "how many times did
   * they press Run before reading the message". */
  const lastRef = useRef("");
  useEffect(() => {
    if (!rule || !error) return;
    const key = `${dialect}|${rule}|${error}`;
    if (lastRef.current === key) return;
    lastRef.current = key;
    void fetch("/api/error-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule, dialect, problemId, lessonSlug }),
    }).catch(() => {});
    // Nothing on screen waits for this and a failed write costs one data point,
    // which is not worth an error message on top of the error they already have.
  }, [rule, error, dialect, problemId, lessonSlug]);

  // After the hook, never before it — an early return above a useEffect changes
  // the hook order between renders, which React rejects outright.
  if (!help) return null;

  return (
    <div className="err-help">
      <div className="eh-title">{help.title}</div>
      <p className="eh-what">{withCode(help.what)}</p>
      <p className="eh-fix"><b>Try this —</b> {withCode(help.fix)}</p>
      {help.lesson && (
        <Link className="eh-link" href={`/learn/${help.lesson}`}>
          Read it properly in {help.lessonLabel} →
        </Link>
      )}
    </div>
  );
}
