import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { readJson, idOf } from "@/lib/http";

// Record one answer to one end-of-lesson quiz question.
//
// The quiz used to live entirely in React state: a student answered eleven
// questions, saw their score, closed the tab, and the clearest signal this
// platform produces about whether a topic landed was gone. Nothing downstream
// could ever know that they picked "returns a new list" three times running.
//
// The client sends only *which* question and *what they picked*. Everything
// recorded — whether it was right, and the question text itself — is read here
// from the lesson's own content. That is deliberate: /api/submit learned the
// hard way that a client-supplied verdict is a client-supplied lie waiting to
// happen. There is no XP on a quiz answer so nobody gains by faking one, but a
// faked row would still corrupt the only record of what this student understands
// — and that record is the input to everything personalised we build later.

/** A question snapshot is a sentence, not an essay. */
const MAX_Q = 500;

/** Quiz text carries markup (`<code>`, `<b>`) because it renders as HTML. Stored
 *  as plain text: this column exists to be read back and reasoned about, and the
 *  tags are noise for every one of those uses. */
function plain(html: unknown): string {
  if (typeof html !== "string") return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_Q);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  // A signed-out visitor reads the whole lesson and may take the quiz — there is
  // simply nowhere to file the answer. Same quiet 200 as /api/attempt: this is
  // "not recorded", not "something broke".
  if (!user) return NextResponse.json({ ok: false, reason: "guest" }, { status: 200 });

  const b = await readJson(req);
  const lessonId = idOf(b.lessonId);
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  // Number.isInteger, not a truthiness check: question 0 is a real question and
  // option 0 is a real option, and both are falsy.
  const qIndex = b.qIndex;
  const chosen = b.chosen;
  if (!Number.isInteger(qIndex) || !Number.isInteger(chosen)) {
    return NextResponse.json({ error: "qIndex and chosen must be integers" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { contentJson: true },
  });
  if (!lesson) return NextResponse.json({ error: "lesson not found" }, { status: 404 });

  let blocks: unknown[] = [];
  try {
    blocks = JSON.parse(lesson.contentJson || "[]");
  } catch {
    return NextResponse.json({ error: "lesson has no readable content" }, { status: 409 });
  }

  // One quiz block per lesson — checked across all 121 lessons before this route
  // was written. If a second one is ever added, the two would share an index
  // space and this must start taking the block index too.
  const quiz = blocks.find(
    (x): x is { t: string; items: unknown[] } =>
      !!x && typeof x === "object" && (x as { t?: string }).t === "quiz"
  );
  if (!quiz || !Array.isArray(quiz.items)) {
    return NextResponse.json({ error: "lesson has no quiz" }, { status: 404 });
  }

  const item = quiz.items[qIndex as number] as
    | { q?: string; options?: unknown[]; correct?: number }
    | undefined;
  if (!item || !Array.isArray(item.options)) {
    return NextResponse.json({ error: "no such question" }, { status: 404 });
  }
  if ((chosen as number) < 0 || (chosen as number) >= item.options.length) {
    return NextResponse.json({ error: "no such option" }, { status: 400 });
  }

  await prisma.quizAnswer.create({
    data: {
      userId: user.id,
      lessonId,
      qIndex: qIndex as number,
      question: plain(item.q),
      chosen: chosen as number,
      correct: chosen === item.correct,
    },
  });

  // The client already knows whether it was right — it rendered the verdict from
  // the same content. Nothing useful to send back.
  return NextResponse.json({ ok: true });
}
