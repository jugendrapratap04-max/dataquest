/* Progress while getProgress() runs.
 *
 * This page is one of five that call getProgress(), which loads every track
 * with every lesson and every problem — the same query that made the dashboard
 * feel broken before it had a skeleton. Four stat tiles across the top, then
 * the per-subject bars, in the proportions the real page uses.
 */
export default function LoadingProgress() {
  return (
    <>
      <div className="sk sk-title" style={{ width: "30%" }} />
      <div className="sk sk-line sm" style={{ width: "55%" }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 14,
          margin: "18px 0",
        }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div className="sk" style={{ height: 82, borderRadius: 12 }} key={i} />
        ))}
      </div>
      <div className="sk" style={{ height: 24, width: "22%", borderRadius: 8, marginBottom: 14 }} />
      <div style={{ display: "grid", gap: 12 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div className="sk" style={{ height: 44, borderRadius: 10 }} key={i} />
        ))}
      </div>
    </>
  );
}
