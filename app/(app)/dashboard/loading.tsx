/* The dashboard while its progress queries run.
 *
 * The hero, the stat row and the two columns keep their real proportions, so
 * the eye is already in the right place when the numbers arrive.
 */
export default function LoadingDashboard() {
  return (
    <>
      <div className="sk sk-title" style={{ width: "35%" }} />
      <div className="sk" style={{ height: 150, borderRadius: 16, marginBottom: 18 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 18 }}>
        {Array.from({ length: 4 }, (_, i) => (
          <div className="sk" style={{ height: 82, borderRadius: 12 }} key={i} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: 18 }}>
        <div className="sk" style={{ height: 260, borderRadius: 16 }} />
        <div className="sk" style={{ height: 260, borderRadius: 16 }} />
      </div>
    </>
  );
}
