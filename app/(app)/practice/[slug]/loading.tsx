/* The practice workbench while the problem loads.
 *
 * Two columns in the same 40/60 split the real page uses: the brief on the
 * left, the editor and its preview on the right. The editor block is tall on
 * purpose — it is the thing the student is waiting for.
 */
export default function LoadingWorkbench() {
  return (
    <>
      <div className="sk sk-title" style={{ width: "40%" }} />
      <div className="sk sk-line sm" />
      <div className="hw-grid" style={{ marginTop: 18 }}>
        <div>
          <div className="sk sk-line lg" />
          <div className="sk sk-line lg" />
          <div className="sk sk-line md" />
          <div className="sk" style={{ height: 150, borderRadius: 12, marginTop: 16 }} />
        </div>
        <div>
          <div className="sk" style={{ height: 290, borderRadius: 12, marginBottom: 14 }} />
          <div className="sk" style={{ height: 300, borderRadius: 12 }} />
        </div>
      </div>
    </>
  );
}
