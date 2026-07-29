import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored WASM runtimes — Pyodide and sql.js, copied in verbatim so the
    // compilers work without a CDN. Linting third-party minified bundles
    // produced 5,565 warnings and 9 of 28 errors, which buried every real
    // finding in our own code. We do not edit these files; we replace them
    // wholesale on upgrade, so there is nothing here a linter can fix.
    "public/pyodide/**",
    "public/sqljs/**",
  ]),
  {
    // The visualisations exist to put Python and JSON syntax on screen, so
    // quotes, apostrophes and `//` are the *content*, not typos: `//` is floor
    // division in OperatorLab and a comment in VariablesPlayground, and
    // JsonBridge shows `'{"1": 95}'` because the whole lesson is that a JSON
    // round-trip turns int keys into string keys.
    //
    // Both rules fired on every one of those and were wrong all 18 times.
    // Obeying them would mean writing teaching material as &apos; and &quot;,
    // which is harder to read in the source and identical on screen. The rules
    // are off here and stay on everywhere else.
    files: ["components/viz/**"],
    rules: {
      "react/no-unescaped-entities": "off",
      "react/jsx-no-comment-textnodes": "off",
    },
  },
]);

export default eslintConfig;
