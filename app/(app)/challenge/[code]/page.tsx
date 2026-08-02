import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { type ChallengeQuestion } from "@/lib/challenge";
import { ChallengeRunner } from "@/components/ChallengeRunner";
import { GuestBanner } from "@/components/GuestBanner";
import { formatDuration } from "@/lib/duration";
import { ShareLink } from "@/components/ShareLink";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = await prisma.challenge.findUnique({
    where: { code },
    select: { title: true, creator: { select: { name: true } }, attempts: { select: { correct: true, total: true } } },
  });
  if (!c) return { title: "Challenge — Etudo" };
  const best = c.attempts.reduce((m, a) => Math.max(m, a.correct), 0);
  return {
    title: `${c.title} — challenge from ${c.creator.name.split(" ")[0]} | Etudo`,
    description: c.attempts.length
      ? `Best score so far: ${best}/${c.attempts[0].total}. Take the same questions and see how you compare.`
      : "Take the same questions and see how you compare.",
  };
}

export default async function ChallengeRunPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await getCurrentUser();

  const challenge = await prisma.challenge.findUnique({
    where: { code },
    select: {
      code: true, title: true, questions: true,
      creator: { select: { id: true, name: true } },
      attempts: {
        orderBy: [{ correct: "desc" }, { seconds: "asc" }],
        select: { userId: true, correct: true, total: true, seconds: true, answersJson: true, user: { select: { name: true } } },
      },
    },
  });
  if (!challenge) notFound();

  const questions: ChallengeQuestion[] = JSON.parse(challenge.questions);
  const mine = user ? challenge.attempts.find((a) => a.userId === user.id) : undefined;

  // Three states, and each one is a different page: take it, read it, or look
  // at it from the outside. A signed-out visitor gets the third — the scoreboard
  // is the whole point of the link, and hiding it behind a login would close
  // the loop the feature exists to open.
  const canTake = !!user && !mine;

  const firstName = (n: string) => n.trim().split(/\s+/)[0];

  return (
    <>
      <div className="crumb" style={{ marginBottom: 16 }}>
        <Link href="/challenge">← Challenges</Link> / <b>{challenge.title}</b>
      </div>

      {!user && (
        <GuestBanner what={`${firstName(challenge.creator.name)} set this challenge — an account lets you take it`} />
      )}

      {/* Scoreboard, always. It is what the link is for. */}
      <section className="card pad">
        <div className="sec-head"><h2>Scoreboard<span className="sub">{questions.length} questions · code {challenge.code}</span></h2></div>
        {challenge.attempts.length === 0 ? (
          <p className="ch-hint">Nobody has taken this yet. Be the first.</p>
        ) : (
          <div className="ch-board">
            {challenge.attempts.map((a, i) => (
              <div key={a.userId} className={`ch-board-row${user && a.userId === user.id ? " you" : ""}`}>
                <span className="ch-pos">{i + 1}</span>
                <span className="ch-who">{firstName(a.user.name)}{user && a.userId === user.id ? " (you)" : ""}</span>
                <span className="ch-score">{a.correct}/{a.total}</span>
                <span className="ch-time">{formatDuration(a.seconds)}</span>
              </div>
            ))}
          </div>
        )}
        {/* Correct answers first, time only as a tiebreaker — weighing speed into
            the score would reward guessing fast over thinking. */}
        <p className="ch-hint" style={{ marginTop: 12 }}>Ranked by correct answers. Time breaks a tie, and never beats a better score.</p>
        <ShareLink code={challenge.code} />
      </section>

      {canTake && (
        <div style={{ marginTop: 18 }}>
          <ChallengeRunner
            code={challenge.code}
            questions={questions.map((q) => ({ q: q.q, options: q.options, from: q.from, fromSlug: q.fromSlug }))}
          />
        </div>
      )}

      {mine && (
        <section className="card pad" style={{ marginTop: 18 }}>
          <div className="sec-head"><h2>Where you went wrong</h2></div>
          {(() => {
            const picked: (number | null)[] = JSON.parse(mine.answersJson);
            const wrong = questions.map((q, i) => ({ q, i })).filter(({ q, i }) => picked[i] !== q.correct);
            if (!wrong.length) {
              return <p className="ch-hint">Nothing — you got all {questions.length}. The explanations are in the lessons if you want to go deeper.</p>;
            }
            return (
              <>
                <p className="ch-hint" style={{ marginBottom: 14 }}>
                  {wrong.length} to look at. This is the part that makes a challenge worth taking.
                </p>
                <div className="ch-review">
                  {wrong.map(({ q, i }) => (
                    <div key={i} className="ch-rev">
                      <div className="ch-rev-q">{q.q}</div>
                      <div className="ch-rev-a bad">You picked: {picked[i] === null ? "nothing" : q.options[picked[i]!]}</div>
                      <div className="ch-rev-a good">Answer: {q.options[q.correct]}</div>
                      {q.why && <div className="ch-rev-why">{q.why}</div>}
                      <Link className="ch-rev-link" href={`/learn/${q.fromSlug}`}>Read {q.from} →</Link>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </section>
      )}

      {!user && (
        <section className="card pad" style={{ marginTop: 18 }}>
          <div className="sec-head"><h2>Take it yourself</h2></div>
          <p className="ch-hint" style={{ marginBottom: 14 }}>
            The same {questions.length} questions, in the same order. Free, and your score goes on the board above.
          </p>
          <Link className="btn btn-primary" href="/signup" style={{ padding: "11px 20px" }}>Create free account →</Link>
        </section>
      )}
    </>
  );
}
