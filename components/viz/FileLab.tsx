"use client";

import { useState } from "react";

/* The one insight this has to land: `open(path, "w")` empties the file at the
 * moment it opens — before a single byte has been written. Reading it in a
 * modes table does not stick; watching two lines vanish on the open click does.
 *
 * Everything else here follows the same rule — show the cursor, and "why does
 * the second read() give nothing" stops being a mystery. Semantics below match
 * CPython: verified against real Python 3.12, not written from memory. */

type Mode = "r" | "w" | "a" | "x";
type Ev = { text: string; kind: "ok" | "bad" | "wipe" };

const START = "alpha\nbeta\n";
const ADDED = "gamma\n";

const MODES: { m: Mode; label: string; note: string }[] = [
  { m: "r", label: '"r"  read', note: "read only — the file must already exist" },
  { m: "w", label: '"w"  write', note: "empties the file the moment it opens" },
  { m: "a", label: '"a"  append', note: "cursor starts at the end — nothing is lost" },
  { m: "x", label: '"x"  create', note: "refuses if the file already exists" },
];

export function FileLab() {
  const [text, setText] = useState<string | null>(START);
  const [mode, setMode] = useState<Mode>("r");
  const [cur, setCur] = useState<number | null>(null);
  const [openMode, setOpenMode] = useState<Mode | null>(null);
  const [log, setLog] = useState<Ev[]>([]);
  const [wiped, setWiped] = useState(false);

  const say = (t: string, kind: Ev["kind"] = "ok") => setLog((l) => [...l.slice(-5), { text: t, kind }]);
  const isOpen = openMode !== null;

  function doOpen() {
    setWiped(false);
    if (mode === "r") {
      if (text === null) return say("FileNotFoundError: No such file or directory: 'notes.txt'", "bad");
      setCur(0); setOpenMode("r");
      return say('f = open("notes.txt", "r")  →  open, cursor at the start', "ok");
    }
    if (mode === "w") {
      const had = text !== null && text !== "";
      setText(""); setCur(0); setOpenMode("w");
      if (had) { setWiped(true); return say('f = open("notes.txt", "w")  →  the file is EMPTY already — and you have not written anything yet', "wipe"); }
      return say('f = open("notes.txt", "w")  →  open and empty', "ok");
    }
    if (mode === "a") {
      const t = text ?? "";
      setText(t); setCur(t.length); setOpenMode("a");
      return say('f = open("notes.txt", "a")  →  open, cursor at the END, nothing lost', "ok");
    }
    if (text !== null) return say("FileExistsError: File exists: 'notes.txt'", "bad");
    setText(""); setCur(0); setOpenMode("x");
    say('f = open("notes.txt", "x")  →  created it, because nothing was there', "ok");
  }

  function doRead() {
    if (openMode !== "r") return say("io.UnsupportedOperation: not readable", "bad");
    const got = (text ?? "").slice(cur ?? 0);
    setCur((text ?? "").length);
    say(got === "" ? "f.read()  →  ''   nothing left — the cursor is already at the end"
                   : `f.read()  →  ${JSON.stringify(got)}`, got === "" ? "bad" : "ok");
  }

  function doWrite() {
    if (openMode === "r") return say("io.UnsupportedOperation: not writable", "bad");
    const t = text ?? "";
    const at = cur ?? 0;
    setText(t.slice(0, at) + ADDED);
    setCur(at + ADDED.length);
    say(`f.write(${JSON.stringify(ADDED)})  →  written at the cursor`, "ok");
  }

  function reset() {
    setText(START); setCur(null); setOpenMode(null); setLog([]); setWiped(false); setMode("r");
  }

  const head = cur === null ? "" : (text ?? "").slice(0, cur);
  const tail = cur === null ? (text ?? "") : (text ?? "").slice(cur);

  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title">📂 File Lab — what each mode does to your file</span>
        <span className="viz-badge">interactive</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Pick a mode, press <b>open</b>, and watch the file on the left. One of these four deletes
        everything before you have written a single byte.
      </p>

      <div className="viz-controls" style={{ marginBottom: 10 }}>
        {MODES.map((x) => (
          <button key={x.m} className={`ss-preset ${mode === x.m ? "on" : ""}`}
                  disabled={isOpen} onClick={() => setMode(x.m)}>{x.label}</button>
        ))}
      </div>
      <div className="fla-hint">{MODES.find((x) => x.m === mode)!.note}</div>

      <div className="fla-grid">
        <div className="fla-side">
          <div className="fl-cap">notes.txt — on disk</div>
          {text === null
            ? <pre className="fla-file gone">(no such file)</pre>
            : <pre className={`fla-file ${wiped ? "wiped" : ""}`} key={`${text.length}-${cur}`}>
                <span className="fla-done">{head}</span>
                {cur !== null && <span className="fla-caret" />}
                <span>{tail}</span>
                {text === "" && <span className="fla-empty">(empty)</span>}
              </pre>}
          <div className="fla-state">
            {isOpen ? <>handle open in <b>{`"${openMode}"`}</b> · cursor at position <b>{cur}</b></>
                    : <>file is closed</>}
          </div>
        </div>

        <div className="fla-side">
          <div className="fl-cap">what Python does</div>
          <div className="fla-log">
            {log.length === 0 && <span className="fl-empty">press open(...) to start</span>}
            {log.map((e, i) => (
              <div key={i} className={`fla-ev ${e.kind} ${i === log.length - 1 ? "just" : ""}`}>{e.text}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="viz-controls" style={{ marginTop: 12, marginBottom: 0 }}>
        <button className="btn btn-primary" style={{ padding: "8px 14px" }} disabled={isOpen} onClick={doOpen}>
          open(&quot;notes.txt&quot;, &quot;{mode}&quot;) ▶
        </button>
        <button className="btn btn-ghost" style={{ padding: "8px 14px" }} disabled={!isOpen} onClick={doRead}>f.read()</button>
        {/* A JS string, not JSX text: in JSX text a backslash is literal, so
            `\\n` would render as two backslashes and disagree with the log. */}
        <button className="btn btn-ghost" style={{ padding: "8px 14px" }} disabled={!isOpen} onClick={doWrite}>{`f.write(${JSON.stringify(ADDED)})`}</button>
        <button className="btn btn-ghost" style={{ padding: "8px 14px" }} disabled={!isOpen}
                onClick={() => { setOpenMode(null); setCur(null); setWiped(false); say("f.close()  →  saved and closed", "ok"); }}>f.close()</button>
        <button className="btn btn-ghost" style={{ padding: "8px 14px" }} disabled={isOpen || text === null}
                onClick={() => { setText(null); setCur(null); say('os.remove("notes.txt")  →  the file is gone', "ok"); }}>delete the file</button>
        <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={reset}>Reset</button>
      </div>

      {wiped && (
        <div className="note warn" style={{ marginTop: 12 }}>
          <span className="i">⚠️</span>
          <div>
            That is the accident. <code>&quot;w&quot;</code> truncates at <b>open</b> time, not at write time —
            so a script that opens the wrong path in <code>&quot;w&quot;</code> and then crashes has still
            destroyed the file. To add to a file, the mode is <code>&quot;a&quot;</code>.
          </div>
        </div>
      )}
    </div>
  );
}
