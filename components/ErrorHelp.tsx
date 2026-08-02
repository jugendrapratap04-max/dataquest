import Link from "next/link";
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

export function ErrorHelp({ error, dialect = "python" }: { error?: string; dialect?: "python" | "sql" }) {
  const help = dialect === "sql" ? explainSqlError(error) : explainError(error);
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
