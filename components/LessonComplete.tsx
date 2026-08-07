"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Celebrate } from "@/components/Celebrate";

/* Marking a lesson done, and the one celebration the design system actually
 * asks for: "lesson complete, module complete, level up — nothing smaller."
 * Finishing a lesson used to be the quietest moment in the app — a button that
 * navigated. The card names what was finished and offers the next step, so the
 * moment is marked without taking the reader anywhere they did not choose.
 *
 * The confetti canvas and the sound cue both sit inside Celebrate, which
 * already honours prefers-reduced-motion and the mute setting.
 */
export function LessonComplete({
  lessonId, href, label, title,
}: {
  lessonId: string;
  href: string;
  label: string;
  /** The lesson just finished — named in the celebration. */
  title?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const go = async () => {
    setBusy(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, status: "done" }),
      });
    } catch {}
    // Prefetch so "Keep going" is instant behind the card.
    router.prefetch?.(href);
    setBusy(false);
    setDone(true);
  };

  return (
    <>
      <button className="btn btn-teal" onClick={go} disabled={busy || done}>
        {busy ? "Saving…" : done ? "Lesson complete ✓" : label}
      </button>
      {done && (
        <Celebrate
          title="Lesson complete! 🎉"
          sub={title ? `“${title}” is done and saved to your progress.` : undefined}
          nextLabel={label}
          onNext={() => router.push(href)}
          onClose={() => setDone(false)}
        />
      )}
    </>
  );
}
