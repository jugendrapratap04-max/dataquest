/* Somebody else's profile while it loads.
 *
 * Same shape as your own profile minus the editor — a public page has no form
 * on it — so the skeleton is the identity strip, the stat row and one column of
 * cards. It calls getProgress() like the rest of this group.
 */
export default function LoadingPublicProfile() {
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
      <div className="sk" style={{ height: 220, borderRadius: 16, marginBottom: 18 }} />
      <div className="sk" style={{ height: 260, borderRadius: 16 }} />
    </>
  );
}
