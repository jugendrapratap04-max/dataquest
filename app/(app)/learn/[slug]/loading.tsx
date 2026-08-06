/* The lesson page while it loads.
 *
 * Laid out as the real page is since the navigation rebuild — the course
 * contents on the left, the lesson column on the right — so the two do not
 * swap places when the content arrives.
 */
export default function LoadingLesson() {
  return (
    <div className="learn-layout">
      <div className="sk" style={{ height: 420, borderRadius: 12 }} />
      <article>
        <div className="sk sk-line sm" />
        <div className="sk sk-title" style={{ width: "70%", height: 30 }} />
        <div className="sk sk-card">
          <div className="sk sk-line md" />
          <div className="sk sk-line lg" />
          <div className="sk sk-line md" />
        </div>
        <div className="sk sk-line lg" />
        <div className="sk sk-line lg" />
        <div className="sk sk-line md" />
        <div className="sk sk-block" style={{ marginTop: 18 }} />
      </article>
    </div>
  );
}
