"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LessonComplete({ lessonId, href, label }: { lessonId: string; href: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, status: "done" }),
      });
    } catch {}
    router.push(href);
  };

  return (
    <button className="btn btn-teal" onClick={go} disabled={busy}>
      {busy ? "Loading…" : label}
    </button>
  );
}
