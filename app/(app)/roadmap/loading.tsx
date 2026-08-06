/* The roadmap while every subject's progress is counted — the heaviest query
 * set on the platform, and so the page most worth showing a shape for.
 */
export default function LoadingRoadmap() {
  return (
    <>
      <div className="sk" style={{ height: 170, borderRadius: 16, marginBottom: 18 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 18 }}>
        {Array.from({ length: 4 }, (_, i) => (
          <div className="sk" style={{ height: 74, borderRadius: 12 }} key={i} />
        ))}
      </div>
      {Array.from({ length: 4 }, (_, i) => (
        <div className="sk" style={{ height: 96, borderRadius: 14, marginBottom: 12 }} key={i} />
      ))}
    </>
  );
}
