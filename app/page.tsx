import { redirect } from "next/navigation";

/* THE FRONT DOOR IS THE DASHBOARD.
 *
 * Until 2026-08-07 this route was a marketing page and signed-in readers were
 * redirected past it. Jugendra's call: "ye landing page ho, naki other" — a
 * visitor should arrive inside the product, not in front of a pitch about it.
 *
 * That is only possible because the dashboard was built guest-first: it takes
 * `__guest__` for a user id, returns honest zeros, shows the whole roadmap, and
 * opens every lesson without an account. Nothing behind it is a wall. The old
 * page still exists, and still explains the method, at /about.
 *
 * A redirect rather than a copy of the dashboard: the dashboard needs the
 * app shell (sidebar, topbar, skip link) that lives in app/(app)/layout.tsx,
 * and rendering it from here would mean maintaining that chrome twice.
 */
export default function Home() {
  redirect("/dashboard");
}
