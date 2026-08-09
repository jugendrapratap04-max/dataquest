import { prisma } from "./prisma";
import { getStreak } from "./progress";
import { getSolvedStats } from "./profile-stats";

/*
 * What Byte knows about the student it is talking to.
 *
 * All of this already existed in the database and none of it ever reached the
 * chat, so Byte greeted a student on their fortieth day exactly as it greeted
 * them on their first.
 *
 * Assembled on the SERVER from the session's user id. Nothing here may ever be
 * accepted from the request body: the moment the client can name the student,
 * anyone can ask Byte to describe somebody else's progress.
 *
 * Deliberately does NOT call getProgress(). That query loads every track with
 * every lesson and every problem — it is the reason the dashboard needed a
 * skeleton — and running it on each chat message would make talking to Byte the
 * most expensive thing a student can do. The four narrow queries below answer
 * the same question for this purpose.
 */

/** Where the student is in the course, in the smallest number of queries. */
async function getPlace(userId: string) {
  /*
   * LessonProgress has no updatedAt, only completedAt, so "what are you working
   * on" is answered from the last lesson FINISHED rather than the last one
   * opened. That is the more useful anchor anyway: it names a subject the
   * student definitely reached.
   */
  const last = await prisma.lessonProgress.findFirst({
    where: {
      userId,
      status: "done",
      completedAt: { not: null },
    },
    orderBy: { completedAt: "desc" },
    select: {
      completedAt: true,
      lesson: {
        select: {
          title: true,
          order: true,
          trackId: true,
          track: {
            select: { title: true },
          },
        },
      },
    },
  });

  if (!last) {
    return null;
  }

  const trackId = last.lesson.trackId;

  const [totalInTrack, doneInTrack, next] =
    await Promise.all([
      prisma.lesson.count({
        where: { trackId },
      }),

      prisma.lessonProgress.count({
        where: { userId, status: "done", lesson: { trackId } },
      }),

      /*
       * The first lesson after this one that is not already finished — the
       * same "where a click should land" idea the subject tiles use.
       */
      prisma.lesson.findFirst({
        where: {
          trackId,
          order: { gt: last.lesson.order },
          progress: {
            none: { userId, status: "done" },
          },
        },
        orderBy: { order: "asc" },
        select: { title: true },
      }),
    ]);

  return {
    subject: last.lesson.track.title,
    lastLesson: last.lesson.title,
    lastAt: last.completedAt,
    doneInTrack,
    totalInTrack,
    nextLesson: next?.title ?? null,
  };
}

/**
 * A compact plain-text briefing on the student, or null when nobody is signed
 * in. Kept short on purpose — it rides along with every single message.
 */
export async function getStudentContext(
  userId: string
): Promise<string | null> {
  const [user, streak, solved, place] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          role: true,
          goal: true,
          bio: true,
          institution: true,
          interestsCsv: true,
          xp: true,
          createdAt: true,
        },
      }),

      getStreak(userId),
      getSolvedStats(userId),
      getPlace(userId),
    ]);

  if (!user) {
    return null;
  }

  const lines: string[] = [];

  lines.push(`Name: ${user.name}`);

  if (user.role) {
    lines.push(`Describes themselves as: ${user.role}`);
  }

  if (user.goal) {
    lines.push(`Their stated goal: ${user.goal}`);
  }

  if (user.institution) {
    lines.push(`Studying at: ${user.institution}`);
  }

  const interests = user.interestsCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (interests.length > 0) {
    lines.push(`Interested in: ${interests.join(", ")}`);
  }

  if (user.bio) {
    lines.push(`Wrote about themselves: ${user.bio}`);
  }

  lines.push(`XP: ${user.xp}`);

  if (streak.streak > 0) {
    lines.push(
      `Current streak: ${streak.streak} day(s) in a row (their best is ${streak.bestStreak})`
    );
  } else if (streak.bestStreak > 0) {
    lines.push(
      `Streak: broken right now. Their best was ${streak.bestStreak} days — worth encouraging without nagging.`
    );
  }

  if (place) {
    lines.push(
      `Currently learning: ${place.subject} — ${place.doneInTrack} of ${place.totalInTrack} topics done`
    );

    lines.push(`Last finished: "${place.lastLesson}"`);

    if (place.nextLesson) {
      lines.push(`Next up for them: "${place.nextLesson}"`);
    }
  } else {
    lines.push(
      `Has not finished a lesson yet — they are new. Do not talk about their progress as if there is any.`
    );
  }

  if (solved.totalSolved > 0) {
    lines.push(
      `Practice: ${solved.totalSolved} problems solved out of ${solved.totalProblems}`
    );

    const strong = solved.byTopic
      .filter((t) => t.solved >= 3)
      .slice(0, 5)
      .map((t) => `${t.tag} (${t.solved}/${t.total})`);

    if (strong.length > 0) {
      lines.push(`Strongest topics: ${strong.join(", ")}`);
    }

    /*
     * Only topics they have actually STARTED. A topic they have never touched
     * is not a weakness, and listing it as one would have Byte scolding a
     * beginner for not having done the whole catalogue yet.
     */
    const shaky = [...solved.byTopic]
      .filter((t) => t.total >= 3 && t.solved < t.total)
      .sort((a, b) => a.solved / a.total - b.solved / b.total)
      .slice(0, 3)
      .map((t) => `${t.tag} (${t.solved}/${t.total})`);

    if (shaky.length > 0) {
      lines.push(
        `Started but not finished: ${shaky.join(", ")}`
      );
    }
  }

  return lines.join("\n");
}

/*
 * How many past turns Byte carries into a reply.
 *
 * Every turn is re-sent on every message, so this is a running cost as much as
 * a memory setting. Twenty is roughly ten exchanges — long enough to hold a
 * debugging session together, short enough that a month-old chat does not get
 * paid for again on every question.
 */
export const CONTEXT_TURNS = 20;

/*
 * How much of the conversation is kept at all.
 *
 * Larger than CONTEXT_TURNS so that raising the context window later does not
 * find the history already thrown away.
 */
export const KEEP_TURNS = 60;

/** The recent conversation, oldest first, in the shape Gemini's `contents` takes. */
export async function getStoredTurns(userId: string) {
  const rows = await prisma.byteMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: CONTEXT_TURNS,
    select: { role: true, text: true },
  });

  return rows.reverse().map((row) => ({
    role: row.role === "model" ? "model" : "user",
    parts: [{ text: row.text }],
  }));
}

/**
 * Record one exchange and trim the tail.
 *
 * Both turns are written together, after the reply is known, so a request that
 * fails on the way to Gemini cannot leave a question in the history with no
 * answer beside it — which would show up later as Byte ignoring something the
 * student had asked.
 */
export async function rememberExchange(
  userId: string,
  question: string,
  answer: string
): Promise<void> {
  /*
   * The two timestamps are set here, a millisecond apart, rather than left to
   * the column default.
   *
   * createMany writes both rows inside one statement, so both would take the
   * same createdAt and the read below — which orders by createdAt — would be
   * free to hand them back in either order. It did: the very first stored
   * exchange came back as the answer followed by the question. That is not a
   * cosmetic problem. Gemini wants turns that alternate starting from a user
   * turn, so a reversed pair puts a model turn first, the route drops it, and
   * the conversation quietly loses its oldest exchange on every read.
   */
  const at = Date.now();

  await prisma.byteMessage.createMany({
    data: [
      {
        userId,
        role: "user",
        text: question,
        createdAt: new Date(at),
      },
      {
        userId,
        role: "model",
        text: answer,
        createdAt: new Date(at + 1),
      },
    ],
  });

  /*
   * Newest rows are kept and the rest deleted by id. Pairs stay contiguous in
   * time and KEEP_TURNS is even, so trimming cannot cut between a question and
   * its answer.
   */
  const keep = await prisma.byteMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: KEEP_TURNS,
    select: { id: true },
  });

  if (keep.length < KEEP_TURNS) {
    return;
  }

  await prisma.byteMessage.deleteMany({
    where: {
      userId,
      id: { notIn: keep.map((row) => row.id) },
    },
  });
}

/** Forget everything Byte has been told. Used by the chat's Clear button. */
export async function forgetConversation(
  userId: string
): Promise<void> {
  await prisma.byteMessage.deleteMany({
    where: { userId },
  });
}
