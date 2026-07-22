"use client";

import { useEffect, useState } from "react";

type Item = { id: number; text: string; kind: "learn" | "prac"; done: boolean };

const KEY = "dq-todos";

// Starter suggestions for a fresh visitor, built from the lesson they're actually
// up next on rather than a hardcoded Python one — a Statistics learner shouldn't
// open the dashboard to "Revise: int vs str". Nothing is pre-ticked, since they
// haven't done any of it. After the first edit these are the user's own todos
// (localStorage), and the starters never come back.
function starterItems(next?: { title: string; track: string } | null): Item[] {
  if (!next) return [{ id: 1, text: "Read your first lesson", kind: "learn", done: false }];
  return [
    { id: 1, text: `Read: ${next.title}`, kind: "learn", done: false },
    { id: 2, text: `Solve 3 ${next.track} drills`, kind: "prac", done: false },
    { id: 3, text: `Revise: ${next.title}`, kind: "learn", done: false },
  ];
}

export function TodoList({ nextLesson }: { nextLesson?: { title: string; track: string } | null }) {
  const [items, setItems] = useState<Item[]>(() => starterItems(nextLesson));
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);

  // load from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} }
  }, [items, ready]);

  const toggle = (id: number) => setItems((p) => p.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  const remove = (id: number) => setItems((p) => p.filter((it) => it.id !== id));
  const add = () => {
    const t = text.trim();
    if (!t) return;
    setItems((p) => [...p, { id: Date.now(), text: t, kind: "prac", done: false }]);
    setText("");
  };

  return (
    <>
      <ul className="todo">
        {items.map((it) => (
          <li key={it.id} className={it.done ? "done" : ""}>
            {/* A real button: the tick used to be a <span onClick>, so a keyboard
                user couldn't check anything off. aria-pressed carries the state. */}
            <button type="button" className="todo-toggle" aria-pressed={it.done} onClick={() => toggle(it.id)}>
              <span className="box" aria-hidden="true">{it.done ? "✓" : ""}</span>
              <span className="txt">{it.text}</span>
            </button>
            <span className={`kind ${it.kind === "learn" ? "learn" : "prac"}`}>{it.kind === "learn" ? "learn" : "practice"}</span>
            <button className="todo-del" onClick={() => remove(it.id)} aria-label={`"${it.text}" hatao`}>×</button>
          </li>
        ))}
      </ul>
      <div className="todo-add">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a new task…" />
        <button onClick={add} aria-label="Add">+</button>
      </div>
    </>
  );
}
