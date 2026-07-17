import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getProgress } from "@/lib/progress";
import { PrintButton } from "@/components/PrintButton";

// The certificate a learner can actually print — the thing the certificates
// page promised but never delivered. Guarded: only a fully completed track
// renders a certificate, so nobody prints a credential they haven't earned.
export default async function CertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const { tracks } = await getProgress(user.id);
  const t = tracks.find((x) => x.slug === slug);
  if (!t) notFound();

  const earned = t.pct >= 100;

  if (!earned) {
    return (
      <div className="card room-empty" style={{ maxWidth: 560, margin: "40px auto" }}>
        <div className="re-mark">🔒</div>
        <h3>Ye certificate abhi earned nahi hai</h3>
        <p>
          {t.shortTitle} track abhi {t.pct}% complete hai — {t.lessonsDone}/{t.totalLessons} lessons,{" "}
          {t.problemsDone}/{t.totalProblems} problems. Poora karo, phir certificate yahin milega.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
          <Link className="btn btn-primary" href={t.firstLesson ? `/learn/${t.firstLesson}` : "/learn"}>Lessons kholo</Link>
          <Link className="btn btn-ghost" href="/certificates">Wapas</Link>
        </div>
      </div>
    );
  }

  // We don't store a completion timestamp, so the credential is issued the day
  // it's printed — honest for a print-on-demand certificate.
  const issued = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="cert-page">
      <div className="cert-actions">
        <Link className="btn btn-ghost" href="/certificates">← Certificates</Link>
        <PrintButton />
      </div>

      <div className="certificate">
        <div className="cert-frame">
          <div className="cert-eyebrow">Certificate of Completion</div>
          <div className="cert-mark">D</div>
          <p className="cert-line">This certifies that</p>
          <h1 className="cert-name">{user.name}</h1>
          <p className="cert-line">has successfully completed the</p>
          <h2 className="cert-track">{t.title}</h2>
          <div className="cert-stats">{t.totalLessons} lessons · {t.totalProblems} problems · 100% complete</div>
          <div className="cert-foot">
            <div className="cert-foot-item"><div className="cl">Issued</div><div className="cv">{issued}</div></div>
            <div className="cert-badge">★</div>
            <div className="cert-foot-item" style={{ textAlign: "right" }}><div className="cl">Platform</div><div className="cv">DataQuest</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
