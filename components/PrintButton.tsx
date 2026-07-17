"use client";

// Opens the browser's print dialog — used to save the certificate as a PDF, the
// same mechanism the resume builder uses. The print stylesheet hides the app
// chrome so only the certificate lands on the page.
export function PrintButton({ label = "Download / Print PDF" }: { label?: string }) {
  return (
    <button className="btn btn-primary" onClick={() => window.print()}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
      {label}
    </button>
  );
}
