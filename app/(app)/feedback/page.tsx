import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { FeedbackAdmin } from "@/components/FeedbackAdmin";

// Admin-only inbox for beta feedback. Gated by ADMIN_EMAIL — if that env var
// isn't set, nobody sees this (and the page says so), rather than defaulting to
// the shared demo account.
export default async function FeedbackInboxPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = !!adminEmail && user.email === adminEmail;

  if (!isAdmin) {
    return (
      <section className="card pad" style={{ maxWidth: 560 }}>
        <div className="eyebrow" style={{ color: "var(--ink-faint)" }}>Feedback inbox</div>
        <h2 style={{ fontSize: 18, margin: "8px 0 8px" }}>Ye page sirf admin ke liye hai</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: 0 }}>
          Feedback dekhne ke liye <code>ADMIN_EMAIL</code> env var ko apne account ki email pe set
          karo (Vercel → Settings → Environment Variables), phir usi account se login karo.
        </p>
      </section>
    );
  }

  const rows = await prisma.feedback.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { name: true, email: true } } },
    take: 300,
  });

  const items = rows.map((f) => ({
    id: f.id,
    category: f.category,
    message: f.message,
    path: f.path,
    status: f.status,
    who: f.user.name,
    email: f.user.email,
    when: f.createdAt.toISOString(),
  }));

  return <FeedbackAdmin items={items} />;
}
