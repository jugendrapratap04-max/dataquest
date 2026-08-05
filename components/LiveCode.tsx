"use client";

import { useRef, useState } from "react";
import { highlightPython } from "@/lib/highlight";
import { ErrorHelp } from "@/components/ErrorHelp";
import { play as playCue } from "@/lib/sound";

/* A lesson code block the student can change and re-run.
 *
 * WHY. Until now every example in every lesson was dead text. A beginner could
 * read `print(s[0:4])` and had no way to ask the only question that actually
 * teaches them anything: "what if I put 5?" They had to believe the output
 * rather than see it. That gap is most of the distance between reading about
 * Python and understanding it.
 *
 * WHY THIS IS SAFE TO TURN ON EVERYWHERE. `npm run verify:lesson` already
 * executes every `code` block in real Python and diffs the result against the
 * claimed output. So every block in the course is proven self-contained and
 * runnable before it ships — the guarantee that makes "edit and run this" a
 * flag rather than a rewrite.
 *
 * WHY RESET MATTERS MORE THAN IT LOOKS. Without a way back, a beginner will not
 * touch the example, because breaking it feels permanent. With Reset, breaking
 * it is the point — and breaking things on purpose is where the learning is.
 *
 * WHY NOT MONACO. A lesson can carry eight code blocks. Eight editor instances
 * would cost more than the rest of the page put together. A textarea in the same
 * mono font is indistinguishable here, provided Tab is handled — see below.
 *
 * WHY NOTHING LOADS UNTIL IT IS ASKED FOR. Pyodide is several megabytes. It is
 * fetched on the first Run, not on page load, so a student who only reads pays
 * nothing at all.
 */
/* Has Pyodide been loaded yet in this tab?
 *
 * Module scope on purpose: the runtime is a singleton, so the first Run anywhere
 * on the page pays for the download and every block afterwards is instant. A
 * per-component flag would promise the wait again on each block that had not yet
 * been used, which is the opposite of true.
 *
 * It exists because the wait is otherwise unexplained. A student clicks Run,
 * gets "Running…", and has no way to tell a slow download from a hang — and on
 * the ML lessons that download now includes scikit-learn and scipy, so it is the
 * longest it has ever been. Saying so once costs a line and removes the only
 * reason to conclude the button is broken. */
let warmed = false;

export function LiveCode({
  file, code, output, runnable, lessonSlug,
}: { file: string; code: string; output?: string; runnable: boolean; lessonSlug?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(code);
  const [busy, setBusy] = useState(false);
  const [cold, setCold] = useState(false);
  const [result, setResult] = useState<{ stdout: string; error?: string } | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const dirty = draft !== code;

  async function run() {
    setBusy(true);
    setResult(null);
    setCold(!warmed);
    try {
      const { runPython } = await import("@/lib/pyodide-runner");
      const r = await runPython(draft);
      warmed = true;
      setResult(r);
      playCue(r.error ? "fail" : "pass");
    } catch (e) {
      setResult({ stdout: "", error: String(e) });
      playCue("fail");
    } finally {
      setBusy(false);
      setCold(false);
    }
  }

  function reset() {
    setDraft(code);
    setResult(null);
    areaRef.current?.focus();
  }

  /* Tab must indent, not move focus.
   *
   * In Python this is not a nicety — indentation IS the block structure, so a
   * Tab key that jumps to the next button makes the editor unusable for the
   * language it is teaching. Shift+Tab removes one level, and Escape is left
   * alone so keyboard users still have a way out of the field. */
  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void run(); return; }
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: en, value } = el;

    if (e.shiftKey) {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      if (value.slice(lineStart, lineStart + 4) === "    ") {
        setDraft(value.slice(0, lineStart) + value.slice(lineStart + 4));
        requestAnimationFrame(() => el.setSelectionRange(Math.max(lineStart, s - 4), Math.max(lineStart, en - 4)));
      }
      return;
    }
    setDraft(value.slice(0, s) + "    " + value.slice(en));
    requestAnimationFrame(() => el.setSelectionRange(s + 4, s + 4));
  }

  return (
    <div className={`code live${editing ? " editing" : ""}`}>
      <div className="bar">
        <span className="dot" style={{ background: "#FF5F57" }} />
        <span className="dot" style={{ background: "#FEBC2E" }} />
        <span className="dot" style={{ background: "#28C840" }} />
        <span className="fn">{file}</span>
        {runnable && !editing && (
          <button className="lc-try" onClick={() => setEditing(true)}>
            Try it yourself →
          </button>
        )}
        {editing && (
          <span className="lc-acts">
            <button className="lc-run" onClick={run} disabled={busy}>
              {busy ? "Running…" : "Run"}
            </button>
            <button className="lc-reset" onClick={reset} disabled={busy || !dirty} title="Put the original code back">
              Reset
            </button>
          </span>
        )}
      </div>

      {editing ? (
        <textarea
          ref={areaRef}
          className="lc-area"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          aria-label={`Editable example: ${file}`}
          rows={Math.max(3, draft.split("\n").length)}
        />
      ) : (
        <pre dangerouslySetInnerHTML={{ __html: highlightPython(code) }} />
      )}

      {busy && cold && (
        <div className="lc-cold">
          Downloading Python and its libraries — this happens once, and takes up
          to a minute. Every Run after it is immediate.
        </div>
      )}

      {/* Before the first Run, keep showing the output the lesson claims — it is
          verified, and replacing it with an empty box would lose information. */}
      {!result && output && <div className="out">Output:<br /><b>{output}</b></div>}

      {result && !result.error && (
        <div className="out">Output:<br /><b>{result.stdout || "(nothing printed)"}</b></div>
      )}

      {result?.error && (
        <>
          <div className="out err">{result.error}</div>
          <ErrorHelp error={result.error} lessonSlug={lessonSlug} />
        </>
      )}

      {editing && dirty && !result && (
        <div className="lc-hint">Changed it — press Run to see what happens.</div>
      )}
    </div>
  );
}
