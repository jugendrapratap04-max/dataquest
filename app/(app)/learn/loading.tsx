/* Shown while the subject list is fetched.
 *
 * It mirrors the real grid — a title, the intro line, then cards in the same
 * auto-fill columns — because a skeleton that does not match its page makes the
 * content jump when it lands, which is worse than the blank screen it replaced.
 */
export default function LoadingSubjects() {
  return (
    <>
      <div className="sk sk-title" />
      <div className="sk sk-line lg" />
      <div className="sk-grid" style={{ marginTop: 22 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div className="sk sk-block" key={i} />
        ))}
      </div>
    </>
  );
}
