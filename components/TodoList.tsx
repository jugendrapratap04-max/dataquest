"use client";

import { useEffect, useState } from "react";

type Item = { id: number; text: string; kind: "learn" | "prac"; done: boolean };

const initial: Item[] = [
  { id: 1, text: "Read: Variables & Data Types", kind: "learn", done: true },
  { id: 2, text: "Solve 3 Python drills", kind: "prac", done: false },
  { id: 3, text: "Watch: type casting demo", kind: "learn", done: false },
  { id: 4, text: "Revise: int vs str", kind: "learn", done: false },
];

const KEY = "dq-todos";

export function TodoList() {
  const [items, setItems] = useState<Item[]>(initial);
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
            <span className="box" onClick={() => toggle(it.id)}>{it.done ? "✓" : ""}</span>
            <span className="txt" onClick={() => toggle(it.id)}>{it.text}</span>
            <span className={`kind ${it.kind === "learn" ? "learn" : "prac"}`}>{it.kind === "learn" ? "learn" : "practice"}</span>
            <button className="todo-del" onClick={() => remove(it.id)} aria-label="Delete">×</button>
          </li>
        ))}
      </ul>
      <div className="todo-add">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Naya task add karo…" />
        <button onClick={add} aria-label="Add">+</button>
      </div>
    </>
  );
}
