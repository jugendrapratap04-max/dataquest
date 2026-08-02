"use client";

import { useEffect, useRef, useState } from "react";
import { play as playCue } from "@/lib/sound";

const LINES = [
  "Another skill locked in. Keep this up daily — the job is not far. 🚀",
  "Nicely done. What you solve by typing it yourself, you never forget. 💪",
  "Consistency is the real talent — and you are showing it. 🔥",
  "Small steps, big result. Today's topic is clear! ✅",
  "There's your XP. All these small wins add up to one big job. 🎯",
];

function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    // A burst of flying particles is exactly what "reduce motion" exists to stop,
    // so leave the canvas blank for anyone who's asked for it. Checked in the
    // effect (not during render) so it stays a pure render and there's no flash.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    const colors = ["#F5A524", "#2DD4BF", "#4F5BD5", "#34D07F", "#F06A6A"];
    const parts = Array.from({ length: 120 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.3,
      r: 4 + Math.random() * 6, c: colors[(Math.random() * colors.length) | 0],
      vy: 2 + Math.random() * 4, vx: -2 + Math.random() * 4, rot: Math.random() * 6, vr: -0.2 + Math.random() * 0.4,
    }));
    let raf = 0; const start = Date.now();
    const tick = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const p of parts) {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); ctx.restore();
      }
      if (Date.now() - start < 2800) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, cv.width, cv.height);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="confetti" />;
}

export function Celebrate({
  title = "Nicely done! 🎉", xp, sub, onClose, onNext, nextLabel = "Next →",
}: {
  title?: string; xp?: number; sub?: string; onClose: () => void; onNext?: () => void; nextLabel?: string;
}) {
  // Pick the motivational line once on mount (lazy init keeps Math.random out of
  // the render body and stable across re-renders).
  const [line] = useState(() => sub ?? LINES[Math.floor(Math.random() * LINES.length)]);

  // The one cue that gets three notes. This dialog only appears on a genuine
  // solve, and it is always the result of the student pressing Submit — so the
  // browser's autoplay gate has already been satisfied by that click.
  useEffect(() => { playCue("solve"); }, []);

  // Escape closes it. Clicking the backdrop already did, but a keyboard user had
  // no way out of a dialog that appears at the best moment in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <Confetti />
      <div className="celebrate-overlay" onClick={onClose}>
        <div
          className="celebrate-card"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="celebrate-title"
        >
          <div className="em" aria-hidden="true">🏆</div>
          <h2 id="celebrate-title">{title}</h2>
          <p>{line}</p>
          {typeof xp === "number" && xp > 0 && <div className="celebrate-xp">+{xp} XP</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 6 }}>
            <button className="btn btn-ghost" onClick={onClose}>Stay here</button>
            {onNext && <button className="btn btn-primary" onClick={onNext}>{nextLabel}</button>}
          </div>
        </div>
      </div>
    </>
  );
}
