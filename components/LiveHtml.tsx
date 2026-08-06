"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { highlightPython } from "@/lib/highlight";

/* An HTML lesson example the student can change and watch.
 *
 * WHY THIS EXISTS. LiveCode gave every Python example an editor, a Run button
 * and a Reset — and the HTML course shipped without the equivalent, so its
 * examples were dead text again: a student could read `<h2 id="faq">` and had
 * no way to ask "what happens if the id doesn't match?" That is the exact gap
 * LiveCode was built to close, reopened on a new subject.
 *
 * WHY THERE IS NO RUN BUTTON. Python has to be executed to produce output, so
 * "Run" is an honest verb there. Markup is not executed — it is rendered — and
 * the render can simply happen as the student types, the way the workbench
 * preview already does. A Run button here would be a ceremony with no meaning.
 * Reset stays, for LiveCode's reason: without a way back, a beginner will not
 * touch the example, and breaking it is the point.
 *
 * WHY THE FRAME IS SANDBOXED WITH NOTHING ALLOWED. Same argument as the
 * workbench (see HtmlWorkbench.tsx): the student's markup is untrusted input,
 * `sandbox=""` denies it scripts, forms, navigation and same-origin access,
 * and nothing this component needs requires any of those. Root-relative paths
 * like /img-lab/cat.svg still resolve and render — images are subresources,
 * not scripts.
 *
 * WHY THE PREVIEW ONLY APPEARS ONCE EDITING STARTS. The read-only state must
 * look exactly like a normal `.code` block — LiveCode's rule, kept: the
 * invitation is the button, not a different-looking box. The lesson's claimed
 * output line serves the reader; the live render serves the editor.
 */
export function LiveHtml({ file, code, output }: { file: string; code: string; output?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(code);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const dirty = draft !== code;

  /* Debounced, for the workbench's reason: rewriting srcDoc tears down and
   * rebuilds the whole frame, and half-typed markup is not worth rendering. */
  const [preview, setPreview] = useState(code);
  useEffect(() => {
    if (!editing) return;
    const id = setTimeout(() => setPreview(draft), 250);
    return () => clearTimeout(id);
  }, [draft, editing]);

  // Same wrapper the workbench uses: a full document is left alone, a fragment
  // gets a charset and sane defaults instead of inheriting the browser's.
  const srcDoc = useMemo(() => {
    if (/<html[\s>]/i.test(preview)) return preview;
    return `<!doctype html><html><head><meta charset="utf-8">
<style>body{font:15px/1.6 system-ui,sans-serif;margin:16px;color:#1a1a1a;background:#fff}</style>
</head><body>${preview}</body></html>`;
  }, [preview]);

  function reset() {
    setDraft(code);
    setPreview(code); // straight past the debounce — Reset should feel instant
    areaRef.current?.focus();
  }

  /* Tab indents two spaces, HTML convention — same handler as the workbench,
   * for the same reason: nesting is how structure is read, so a Tab that moves
   * focus makes the editor useless for the language it teaches. */
  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: en, value } = el;
    if (e.shiftKey) {
      const line = value.lastIndexOf("\n", s - 1) + 1;
      if (value.slice(line, line + 2) === "  ") {
        setDraft(value.slice(0, line) + value.slice(line + 2));
        requestAnimationFrame(() => el.setSelectionRange(Math.max(line, s - 2), Math.max(line, en - 2)));
      }
      return;
    }
    setDraft(value.slice(0, s) + "  " + value.slice(en));
    requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
  }

  return (
    <div className={`code live${editing ? " editing" : ""}`}>
      <div className="bar">
        <span className="dot" style={{ background: "#FF5F57" }} />
        <span className="dot" style={{ background: "#FEBC2E" }} />
        <span className="dot" style={{ background: "#28C840" }} />
        <span className="fn">{file}</span>
        {!editing && (
          <button className="lc-try" onClick={() => setEditing(true)}>
            Try it yourself →
          </button>
        )}
        {editing && (
          <span className="lc-acts">
            <button className="lc-reset" onClick={reset} disabled={!dirty} title="Put the original markup back">
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

      {editing ? (
        <div className="lh-view">
          <div className="lh-cap">What the browser draws — it updates as you type</div>
          {/* sandbox="" — nothing allowed. See the note at the top. */}
          <iframe title={`Live preview of ${file}`} sandbox="" srcDoc={srcDoc} />
        </div>
      ) : (
        output && <div className="out">Output:<br /><b>{output}</b></div>
      )}
    </div>
  );
}
