"use client";

import { useState } from "react";

// The share control. It builds the URL from window.location rather than taking
// a base from the server, so it is correct on localhost, on the preview domain
// and in production without anything being configured.
export function ShareLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/challenge/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard access can be refused — on an insecure origin, or by the
      // user. Selecting the text is the fallback, so show it either way.
      setCopied(false);
    }
  }

  return (
    <div className="ch-share">
      <code className="ch-share-url">/challenge/{code}</code>
      <button className="btn btn-ghost" style={{ padding: "7px 13px" }} onClick={copy}>
        {copied ? "✓ Copied" : "Copy link"}
      </button>
    </div>
  );
}
