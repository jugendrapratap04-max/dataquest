// Copies Pyodide package wheels into public/pyodide so a subject's runtime works
// offline — in the student's browser, in the server-side re-verifier
// (lib/verify.ts) and in db:check, all three of which point at that one folder.
//
//   node scripts/vendor-wheels.mjs matplotlib
//   node scripts/vendor-wheels.mjs --list
//
// Dependencies are resolved from public/pyodide/pyodide-lock.json, which ships
// the whole distribution's index (354 packages) even though only a handful of
// wheels are kept. So "add matplotlib" means "add matplotlib and the eight
// things it needs", and this works that out rather than leaving you to read the
// import error and guess.
//
// Every download is checked against the sha256 the lock file already states. A
// wheel that does not match is never written: a silently corrupt wheel fails at
// `import` inside WASM, where the error says nothing about the file.
//
// Why not just let Pyodide fetch from the CDN at runtime? Because loadPackage
// then needs the network, and a platform that cannot verify a student's solution
// offline is a platform that breaks whenever jsDelivr has a bad day. The wheels
// are committed for the same reason.

// A package the distribution does not ship at all (seaborn is one) can still be
// added when it is PURE PYTHON, with --pypi. That downloads the py3-none-any
// wheel from PyPI and writes a matching entry into our own copy of
// pyodide-lock.json, which is what makes `import seaborn` resolve offline
// without micropip and without a network call at runtime. Only pure-Python
// wheels qualify: anything compiled has to be built against this exact
// Emscripten ABI, and a manylinux wheel will not load in WASM.
//
//   node scripts/vendor-wheels.mjs --pypi seaborn==0.13.2 --depends numpy,pandas,matplotlib

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "public", "pyodide");
const LOCK = join(DIR, "pyodide-lock.json");
const VERSION = JSON.parse(readFileSync(join(process.cwd(), "node_modules", "pyodide", "package.json"), "utf8")).version;
const CDN = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;

const lock = JSON.parse(readFileSync(LOCK, "utf8"));
const pkgs = lock.packages;

const args = process.argv.slice(2);

if (!args.length || args.includes("--help")) {
  console.log("usage: node scripts/vendor-wheels.mjs <package>...   |   --list");
  process.exit(args.length ? 0 : 1);
}

if (args.includes("--list")) {
  const have = Object.values(pkgs)
    .filter((p) => existsSync(join(DIR, p.file_name)))
    .sort((a, b) => a.name.localeCompare(b.name));
  const mb = (f) => (statSync(join(DIR, f)).size / 1048576).toFixed(2);
  console.log(`vendored in public/pyodide (pyodide ${VERSION}, python ${lock.info.python}):`);
  for (const p of have) console.log(`  ${p.name.padEnd(16)} ${p.version.padEnd(18)} ${mb(p.file_name).padStart(6)} MB`);
  console.log(`\n  ${have.length} package(s), ${have.reduce((s, p) => s + Number(mb(p.file_name)), 0).toFixed(2)} MB total`);
  process.exit(0);
}

// --------------------------------------------------------------- --pypi ---
if (args[0] === "--pypi") {
  const spec = args[1] ?? "";
  const [name, version] = spec.split("==");
  if (!name || !version) {
    console.error("usage: --pypi <name>==<version> [--depends a,b,c] [--imports x,y]");
    process.exit(1);
  }
  const depends = (args[args.indexOf("--depends") + 1] ?? "").split(",").filter(Boolean);
  if (args.includes("--depends")) {
    for (const d of depends) {
      if (!pkgs[d]) { console.error(`✗ dependency "${d}" is not in the lock file`); process.exit(1); }
    }
  }

  const meta = await fetch(`https://pypi.org/pypi/${name}/${version}/json`).then((r) => r.json());
  const wheel = (meta.urls ?? []).find((u) => u.packagetype === "bdist_wheel" && u.filename.endsWith("-py3-none-any.whl"));
  if (!wheel) {
    console.error(`✗ ${name} ${version} has no py3-none-any wheel — it is not pure Python, so it cannot be vendored this way.`);
    process.exit(1);
  }

  const buf = Buffer.from(await fetch(wheel.url).then((r) => r.arrayBuffer()));
  const sha = createHash("sha256").update(buf).digest("hex");
  if (sha !== wheel.digests.sha256) {
    console.error(`✗ ${wheel.filename}: sha256 mismatch against PyPI's own digest`);
    process.exit(1);
  }
  writeFileSync(join(DIR, wheel.filename), buf);

  const imports = args.includes("--imports")
    ? args[args.indexOf("--imports") + 1].split(",").filter(Boolean)
    : [name.replace(/-/g, "_")];

  // Insert into the raw text rather than re-serialising.
  //
  // The lock file is one 113 KB line written by Python's json.dumps with sorted
  // keys and ", " separators. Re-serialising it from JS would rewrite every byte
  // of that line, so the diff would be "the whole file changed" and nobody could
  // review the one entry that actually did. Splicing the string keeps the diff to
  // the entry itself.
  const j = (o) =>
    "{" + Object.keys(o).sort().map((k) => `${JSON.stringify(k)}: ${JSON.stringify(o[k])}`).join(", ") + "}";
  const entry = `${JSON.stringify(name)}: ${j({
    depends,
    file_name: wheel.filename,
    imports,
    install_dir: "site",
    name,
    package_type: "package",
    sha256: sha,
    unvendored_tests: false,
    version,
  })}`;

  const raw = readFileSync(LOCK, "utf8");
  const after = Object.keys(pkgs).sort().find((k) => k > name);
  const anchor = `${JSON.stringify(after)}: {`;
  const at = raw.indexOf(anchor);
  if (!after || at < 0) {
    console.error(`✗ could not find where to insert "${name}" in the lock file`);
    process.exit(1);
  }
  const already = raw.includes(`${JSON.stringify(name)}: {`);
  const out = already
    // Replace the old entry in place, so re-running with a new version is safe.
    ? raw.replace(new RegExp(`${JSON.stringify(name)}: \\{[^}]*\\}`), entry)
    : raw.slice(0, at) + entry + ", " + raw.slice(at);
  // Never leave the lock unparseable: a broken lock file makes Pyodide itself
  // fail to start, which looks like every Python feature on the site is down.
  try {
    const check = JSON.parse(out).packages[name];
    if (check?.sha256 !== sha) throw new Error("entry did not round-trip");
  } catch (e) {
    console.error(`✗ the edited lock file did not parse — left untouched (${e.message})`);
    process.exit(1);
  }
  writeFileSync(LOCK, out);
  console.log(`  ADD   ${name} ${version}  (${(buf.length / 1048576).toFixed(2)} MB, sha256 ok, from PyPI)`);
  console.log(`        lock entry written: imports ${JSON.stringify(imports)}, depends ${JSON.stringify(depends)}`);
  console.log(`\n✓ commit the wheel and pyodide-lock.json together — the entry is useless without the file.`);
  process.exit(0);
}

/** Every package `names` needs, itself included, in install order. */
function resolve(names) {
  const seen = new Set();
  const out = [];
  const walk = (name) => {
    if (seen.has(name)) return;
    seen.add(name);
    const p = pkgs[name];
    if (!p) {
      console.error(`✗ "${name}" is not in pyodide-lock.json — this distribution does not ship it.`);
      console.error(`  A pure-Python package can still be added by hand; see docs/HANDOFF.md.`);
      process.exit(1);
    }
    for (const d of p.depends ?? []) walk(d);
    out.push(p);
  };
  names.forEach(walk);
  return out;
}

const wanted = resolve(args);
let added = 0;
let bytes = 0;

for (const p of wanted) {
  const dest = join(DIR, p.file_name);
  if (existsSync(dest)) {
    console.log(`  have  ${p.name} ${p.version}`);
    continue;
  }
  const url = CDN + p.file_name;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`✗ ${p.file_name}: ${res.status} ${res.statusText}\n  ${url}`);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const sha = createHash("sha256").update(buf).digest("hex");
  if (sha !== p.sha256) {
    // Do not write it. A wheel that fails this check would fail at `import`
    // inside WASM with an error that says nothing about the download.
    console.error(`✗ ${p.file_name}: sha256 mismatch\n  lock says ${p.sha256}\n  download  ${sha}`);
    process.exit(1);
  }
  writeFileSync(dest, buf);
  added++;
  bytes += buf.length;
  console.log(`  ADD   ${p.name} ${p.version}  (${(buf.length / 1048576).toFixed(2)} MB, sha256 ok)`);
}

console.log(
  added
    ? `\n✓ ${added} wheel(s) added, ${(bytes / 1048576).toFixed(2)} MB. Commit them — Vercel needs them for lib/verify.ts.`
    : `\n✓ nothing to do; all ${wanted.length} package(s) already vendored.`
);
