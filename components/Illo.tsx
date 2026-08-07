/* Hand-built flat illustrations, drawn from design tokens so every theme tints
 * them correctly for free. No image assets, no external art, no bill — the
 * redesign's "friendly" register comes from these plus the display face.
 *
 * The "code" variant renders as THREE stacked SVG layers sharing one viewBox,
 * each on its own translateZ plane. Inside a <Tilt> (transform-style:
 * preserve-3d) they separate into real depth and the spark drifts on its own
 * plane; outside one they collapse flat and nothing breaks. All layer motion
 * lives in CSS, so the global prefers-reduced-motion block switches it off.
 *
 * Server component on purpose: static SVG, none of it needs JavaScript.
 */

const VB = "0 0 128 100";

export function Illo({ name, size = 152 }: { name: "code"; size?: number }) {
  if (name !== "code") return null;
  const h = Math.round(size * 0.78);
  return (
    <div className="illo-3d" style={{ width: size, height: h }} aria-hidden="true">
      {/* back plane — backdrop blob + ground */}
      <svg viewBox={VB} fill="none" className="l-back">
        <ellipse cx="66" cy="56" rx="58" ry="40" fill="var(--accent-soft)" />
        <rect x="30" y="82" width="64" height="4" rx="2" fill="var(--line)" />
      </svg>
      {/* mid plane — the code window */}
      <svg viewBox={VB} fill="none" className="l-mid">
        <rect x="24" y="18" width="80" height="58" rx="10" fill="var(--panel)" stroke="var(--line)" strokeWidth="2" />
        <rect x="24" y="18" width="80" height="16" rx="10" fill="var(--panel-2)" />
        <rect x="24" y="28" width="80" height="6" fill="var(--panel-2)" />
        <circle cx="34" cy="26" r="2.6" fill="var(--bad)" opacity=".8" />
        <circle cx="42" cy="26" r="2.6" fill="var(--spark)" opacity=".9" />
        <circle cx="50" cy="26" r="2.6" fill="var(--good)" opacity=".8" />
        <rect x="33" y="42" width="26" height="5" rx="2.5" fill="var(--accent)" />
        <rect x="63" y="42" width="18" height="5" rx="2.5" fill="var(--line)" />
        <rect x="39" y="52" width="34" height="5" rx="2.5" fill="var(--teal)" opacity=".85" />
        <rect x="39" y="62" width="22" height="5" rx="2.5" fill="var(--line)" />
        <rect x="65" y="62" width="14" height="5" rx="2.5" fill="var(--accent)" opacity=".55" />
      </svg>
      {/* front plane — spark + plant, floating closest to the reader */}
      <svg viewBox={VB} fill="none" className="l-front">
        <path d="M107 10l2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6z" fill="var(--spark)" />
        <rect x="12" y="70" width="12" height="12" rx="3" fill="var(--teal-soft)" stroke="var(--teal)" strokeWidth="1.6" />
        <path d="M18 70c0-6-4-8-7-9 1 5 3 7 7 9zm0 0c0-6 4-8 7-9-1 5-3 7-7 9z" fill="var(--good)" />
      </svg>
    </div>
  );
}
