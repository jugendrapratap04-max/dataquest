"use client";

import { useEffect, useRef } from "react";

/* Pointer-follow 3D tilt. The wrapper supplies perspective; the inner element
 * rotates toward the cursor, and children that carry translateZ (the layered
 * Illo, the landing code window's shadow) separate into real depth.
 *
 * Two hard guards, both deliberate:
 * - (pointer: fine) only — on touch there is no hover, so a tilt would only
 *   fire on tap and read as a glitch.
 * - prefers-reduced-motion off — the global CSS block kills transitions, and
 *   this component must not reintroduce motion through inline styles.
 *
 * The transform is written straight to the DOM inside rAF — no React state per
 * mousemove, so a 144Hz pointer costs nothing.
 */
export function Tilt({
  children,
  max = 7,
  className,
}: {
  children: React.ReactNode;
  /** Maximum rotation in degrees. */
  max?: number;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  // A ref, not state: the flag is only ever read inside event handlers, so a
  // re-render would buy nothing and setState-in-effect trips the lint rule.
  const active = useRef(false);

  useEffect(() => {
    active.current =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const move = (e: React.PointerEvent) => {
    if (!active.current) return;
    cancelAnimationFrame(raf.current);
    const { clientX, clientY } = e;
    raf.current = requestAnimationFrame(() => {
      const el = box.current, t = inner.current;
      if (!el || !t) return;
      const r = el.getBoundingClientRect();
      const dx = ((clientX - r.left) / r.width) * 2 - 1;  // -1 .. 1
      const dy = ((clientY - r.top) / r.height) * 2 - 1;
      t.style.transform = `rotateX(${(-dy * max).toFixed(2)}deg) rotateY(${(dx * max).toFixed(2)}deg)`;
    });
  };
  const leave = () => {
    cancelAnimationFrame(raf.current);
    if (inner.current) inner.current.style.transform = "";
  };

  return (
    <div ref={box} className={`tilt-wrap${className ? ` ${className}` : ""}`}
         onPointerMove={move} onPointerLeave={leave}>
      <div ref={inner} className="tilt">{children}</div>
    </div>
  );
}
