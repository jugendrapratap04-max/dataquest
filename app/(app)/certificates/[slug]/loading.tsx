/* One certificate while it is verified.
 *
 * A single wide sheet rather than a grid — this page is the certificate itself,
 * so the skeleton is one block in roughly the printed proportions, with the
 * actions under it.
 */
export default function LoadingCertificate() {
  return (
    <>
      <div className="sk sk-line sm" style={{ width: "22%" }} />
      <div
        className="sk"
        style={{ height: 380, borderRadius: 16, margin: "14px 0 18px", maxWidth: 720 }}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <div className="sk" style={{ height: 40, width: 130, borderRadius: 10 }} />
        <div className="sk" style={{ height: 40, width: 110, borderRadius: 10 }} />
      </div>
    </>
  );
}
