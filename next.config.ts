import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The submit route re-runs a solution server-side before paying out XP
  // (lib/verify.ts). Both runtimes load their own wasm and wheels off disk at
  // run time, so the bundler has to leave them alone: inlined, `import("pyodide")`
  // dies with "Cannot find module as expression is too dynamic" and every Python
  // problem silently awards nothing — which is worse than the hole it closes.
  serverExternalPackages: ["pyodide", "sql.js"],

  // On Vercel the submit lambda gets only the files traced from its imports —
  // public/ is served by the CDN, not copied into the function's filesystem.
  // lib/verify.ts reads the Pyodide wheels and sql.js wasm from
  // `process.cwd()/public/...` at run time, so without this the verifier finds
  // an empty directory and every correct solution earns 0 XP. ~21 MB, well
  // under the 250 MB unzipped limit; only cold start pays for it.
  // (Both key spellings on purpose — Next has matched app-router API routes by
  // "/api/x" and "/api/x/route" in different versions.)
  outputFileTracingIncludes: {
    "/api/submit": ["./public/pyodide/**/*", "./public/sqljs/**/*"],
    "/api/submit/route": ["./public/pyodide/**/*", "./public/sqljs/**/*"],
  },
};

export default nextConfig;
