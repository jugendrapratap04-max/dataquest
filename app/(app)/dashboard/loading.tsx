/* The dashboard while its progress queries run.
 *
 * Built from the page's OWN class names — `.grid`, `.col`, `.stats`, `.card` —
 * rather than re-describing the layout in inline styles. The old version
 * described a different page: `minmax(0,1.6fr) minmax(0,1fr)` columns against
 * the real `1fr 336px`, 18px gaps against 20, a title bar the page does not
 * have, and about a third of the real height. Measured at 1280px, the dashboard
 * is 1136px tall and this stood in for it with roughly 400.
 *
 * Describing the layout twice is what let the two drift apart in the first
 * place. Now the columns and gaps come from the same rules the page uses, so
 * they cannot.
 *
 * Only the block HEIGHTS are numbers, because a skeleton has no content to get
 * its height from. Measured on the live dashboard at 1280px:
 *   left  255 hero · 135 stats · 236 · 202
 *   right 292 · 240 · 228
 *
 * ⚠️ No space is reserved for the guest banner, though a signed-out visitor
 * gets one (210px). `loading.tsx` renders before anything is awaited, so it
 * cannot know who is looking — and guessing wrong in the other direction would
 * leave every signed-in student, who sees this page far more often, staring at
 * 210px of empty shimmer that then collapses.
 */
export default function LoadingDashboard() {
  return (
    <div className="grid">
      <div className="col">
        <div className="card sk" style={{ height: 255 }} />

        <div className="stats">
          {Array.from({ length: 4 }, (_, i) => (
            <div className="card sk" style={{ height: 135 }} key={i} />
          ))}
        </div>

        <div className="card sk" style={{ height: 236 }} />
        <div className="card sk" style={{ height: 202 }} />
      </div>

      <div className="col">
        <div className="card sk" style={{ height: 292 }} />
        <div className="card sk" style={{ height: 240 }} />
        <div className="card sk" style={{ height: 228 }} />
      </div>
    </div>
  );
}
