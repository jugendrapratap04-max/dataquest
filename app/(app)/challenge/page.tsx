import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { challengeableSubjects } from "@/lib/challenge";
import { ChallengeCreator } from "@/components/ChallengeCreator";
import { GuestBanner } from "@/components/GuestBanner";
import { formatDuration } from "@/components/PracticeWorkbench";

export const metadata = {
  title: "Challenges — DataMarg",
  description: "Take a fixed set of questions, send the link to a friend, and compare how you both did.",
};

export default async function ChallengePage() {
  const user = await getCurrentUser();
  const subjects = await challengeableSubjects(5);

  const mine = user
    ? await prisma.challenge.findMany({
        where: { OR: [{ creatorId: user.id }, { attempts: { some: { userId: user.id } } }] },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          code: true, title: true, createdAt: true,
          attempts: { select: { userId: true, correct: true, total: true, seconds: true } },
        },
      })
    : [];

  return (
    <>
      {!user && <GuestBanner what="Challenge a friend — an account is what puts your name on the scoreboard" />}

      <p className="page-intro">
        A challenge is a fixed set of questions. You take it, you send the link, your friend takes the
        <b> same</b> questions — and you both see who got what, and where you went wrong. Nobody has to be
        online at the same time.
      </p>

      {user ? (
        <ChallengeCreator subjects={subjects} />
      ) : (
        <section className="card pad">
          <div className="sec-head"><h2>Build a challenge</h2></div>
          <p className="ch-hint" style={{ marginBottom: 14 }}>
            Drawn from {subjects.reduce((n, s) => n + s.count, 0)} questions across{" "}
            {subjects.map((s) => s.title).join(", ")}.
          </p>
          <Link className="btn btn-primary" href="/signup" style={{ padding: "11px 20px" }}>Create free account →</Link>
        </section>
      )}

      {mine.length > 0 && (
        <section className="card pad" style={{ marginTop: 18 }}>
          <div className="sec-head"><h2>Your challenges</h2></div>
          <div className="ch-list">
            {mine.map((c) => {
              const you = c.attempts.find((a) => a.userId === user!.id);
              return (
                <Link key={c.code} href={`/challenge/${c.code}`} className="ch-row">
                  <div>
                    <div className="ch-row-t">{c.title}</div>
                    <div className="ch-row-s">
                      {c.attempts.length} {c.attempts.length === 1 ? "player" : "players"}
                      {you ? <> · you scored <b>{you.correct}/{you.total}</b> in {formatDuration(you.seconds)}</> : <> · you have not taken it yet</>}
                    </div>
                  </div>
                  <span className="ch-code">{c.code}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
