/* The book index while every subject's chapters and topics are counted. */
export default function LoadingBook() {
  return (
    <div className="book">
      <div className="sk sk-title" style={{ width: "38%", height: 30 }} />
      <div className="sk sk-line lg" />
      <div style={{ marginTop: 22 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div className="sk" style={{ height: 84, borderRadius: 14, marginBottom: 12 }} key={i} />
        ))}
      </div>
    </div>
  );
}
