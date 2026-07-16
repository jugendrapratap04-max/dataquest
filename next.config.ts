import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The submit route re-runs a solution server-side before paying out XP
  // (lib/verify.ts). Both runtimes load their own wasm and wheels off disk at
  // run time, so the bundler has to leave them alone: inlined, `import("pyodide")`
  // dies with "Cannot find module as expression is too dynamic" and every Python
  // problem silently awards nothing — which is worse than the hole it closes.
  serverExternalPackages: ["pyodide", "sql.js"],
};

export default nextConfig;
