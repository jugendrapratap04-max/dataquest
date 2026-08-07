/* The certificate list while getProgress() works out what has been earned.
 *
 * An intro line, then the grid of certificate cards. They are tall because a
 * certificate card carries a seal, a subject, a status and a button — this is
 * the page where a blank screen would read as "you have earned nothing", which
 * is the worst possible wrong answer to show somebody.
 */
export default function LoadingCertificates() {
  return (
    <>
      <div className="sk sk-title" style={{ width: "32%" }} />
      <div className="sk sk-line sm" style={{ width: "60%" }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 16,
          marginTop: 20,
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div className="sk" style={{ height: 186, borderRadius: 16 }} key={i} />
        ))}
      </div>
    </>
  );
}
