"use client";

import { useEffect, useRef } from "react";

const LINES = [
  "Ek aur skill pakki! Isi tarah roz — job door nahi. 🚀",
  "Shabaash! Jo khud likh ke solve kiya, wo kabhi nahi bhoolega. 💪",
  "Consistency hi asli talent hai — aur tum wahi dikha rahe ho. 🔥",
  "Chhote steps, bada result. Aaj ka topic clear! ✅",
  "Ye lo +XP! Ek din ye saare chhote wins ek badi job banenge. 🎯",
];

function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
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
  title = "Shabaash! 🎉", xp, sub, onClose, onNext, nextLabel = "Next →",
}: {
  title?: string; xp?: number; sub?: string; onClose: () => void; onNext?: () => void; nextLabel?: string;
}) {
  const line = sub ?? LINES[(Math.random() * LINES.length) | 0];
  return (
    <>
      <Confetti />
      <div className="celebrate-overlay" onClick={onClose}>
        <div className="celebrate-card" onClick={(e) => e.stopPropagation()}>
          <div className="em">🏆</div>
          <h2>{title}</h2>
          <p>{line}</p>
          {typeof xp === "number" && xp > 0 && <div className="celebrate-xp">+{xp} XP</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 6 }}>
            <button className="btn btn-ghost" onClick={onClose}>Yahin ruko</button>
            {onNext && <button className="btn btn-primary" onClick={onNext}>{nextLabel}</button>}
          </div>
        </div>
      </div>
    </>
  );
}
