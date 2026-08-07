/* The profile while its rank, timeline and progress queries run.
 *
 * The identity strip is the tall block at the top — avatar, name, level, XP bar
 * — and the two columns below it keep the real 1.4 / 1 split so nothing jumps
 * sideways when the data lands.
 */
export default function LoadingProfile() {
  return (
    <>
      <div className="sk" style={{ height: 132, borderRadius: 16, marginBottom: 18 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div className="sk" style={{ height: 78, borderRadius: 12 }} key={i} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 18 }}>
        <div>
          <div className="sk" style={{ height: 190, borderRadius: 16, marginBottom: 18 }} />
          <div className="sk" style={{ height: 240, borderRadius: 16 }} />
        </div>
        <div>
          <div className="sk" style={{ height: 150, borderRadius: 16, marginBottom: 18 }} />
          <div className="sk" style={{ height: 280, borderRadius: 16 }} />
        </div>
      </div>
    </>
  );
}
