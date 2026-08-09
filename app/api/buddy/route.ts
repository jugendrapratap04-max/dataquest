import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import {
  getStudentContext,
  getStoredTurns,
  rememberExchange,
  forgetConversation,
} from "@/lib/byte-context";

type HistoryItem = {
  role?: "user" | "model";
  text?: string;
};

type PageData = {
  label?: string;
  title?: string;
  statement?: string;
};

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. API KEY
    // --------------------------------------------------

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error(
        "[Byte] GEMINI_API_KEY is missing."
      );

      return NextResponse.json(
        {
          error:
            "Byte is not configured yet. GEMINI_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    // --------------------------------------------------
    // 2. READ REQUEST
    // --------------------------------------------------

    const body = await request.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          error:
            "Please send a message to Byte.",
        },
        { status: 400 }
      );
    }

    const page: PageData =
      body?.page &&
      typeof body.page === "object"
        ? body.page
        : {};

    const history: HistoryItem[] =
      Array.isArray(body?.history)
        ? body.history.slice(-12)
        : [];

    // --------------------------------------------------
    // 2b. WHO IS ASKING
    //
    // From the session cookie, never from the body. If the
    // request could name the student, anyone could ask Byte
    // to read out somebody else's progress, or write into
    // their conversation.
    //
    // A signed-out visitor still gets Byte — just a Byte with
    // no idea who they are and nothing kept afterwards.
    // --------------------------------------------------

    const user = await getCurrentUser();

    const [student, storedTurns] = user
      ? await Promise.all([
          getStudentContext(user.id),
          getStoredTurns(user.id),
        ])
      : [null, null];

    // --------------------------------------------------
    // 3. PAGE CONTEXT
    // --------------------------------------------------

    const pageTitle =
      typeof page.title === "string"
        ? page.title.trim()
        : "Etudo";

    const pageLabel =
      typeof page.label === "string"
        ? page.label.trim()
        : "Etudo";

    const pageContent =
      typeof page.statement === "string"
        ? page.statement
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 7000)
        : "";

    // --------------------------------------------------
    // 4. CONVERSATION HISTORY
    //
    // These become REAL turns in the `contents` array, not
    // a transcript pasted inside the prompt. That distinction
    // is the whole reason Byte kept forgetting: told "my name
    // is Jeetu" it replied "Hey Jeetu", and asked "what is my
    // name" one turn later it answered "As an AI, I don't know
    // your name". A transcript buried in a long instruction
    // reads as background text; turns read as memory.
    //
    // Gemini requires the turns to alternate and to begin with
    // a user turn, so a leading model turn is dropped.
    // --------------------------------------------------

    /*
     * A signed-in student's history comes from the database, not from their
     * browser: it survives a new device, a cleared cache and the chat panel's
     * own 16-message cap, and it cannot be edited on the way in. The body's
     * `history` is only the fallback for a signed-out visitor, who has nowhere
     * to keep one.
     */
    const turns =
      storedTurns ??
      history
        .filter(
          (item) =>
            (item.role === "user" ||
              item.role === "model") &&
            typeof item.text === "string" &&
            item.text.trim().length > 0
        )
        .map((item) => ({
          role:
            item.role === "model"
              ? "model"
              : "user",
          parts: [
            { text: item.text as string },
          ],
        }));

    while (
      turns.length > 0 &&
      turns[0].role === "model"
    ) {
      turns.shift();
    }

    const contents = [
      ...turns,
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    // --------------------------------------------------
    // 5. BYTE SYSTEM PROMPT
    // --------------------------------------------------

    const prompt = `
You are Byte.

Byte is the personal AI learning companion inside
Etudo, an education platform for students.

You are NOT just a chatbot.

You are a combination of:

- friendly study buddy
- patient teacher
- coding mentor
- debugging partner
- revision coach
- quiz partner
- learning guide

Your goal is not simply to give answers.

Your goal is to help the student UNDERSTAND.

==================================================
PERSONALITY
==================================================

Be:

- friendly
- patient
- natural
- encouraging
- practical
- curious
- conversational

Talk like a helpful senior who genuinely wants
the student to understand the topic.

Do NOT sound like:

- a textbook
- a corporate customer-support bot
- a robotic AI assistant
- an overly formal teacher

Never make the student feel stupid for asking
a basic question.

It is completely okay to say things like:

"Bilkul bro, simple way mein samjhte hain."

"Chalo isko ek real-life example se samjhte hain."

"Ye part confusing lag sakta hai, let's break it down."

Use "bro" occasionally when the student's tone
is casual, but don't force it into every answer.

==================================================
LANGUAGE
==================================================

Understand:

- English
- Hindi
- Hinglish

Reply in the language the student naturally uses.

Examples:

English student -> English.

Hindi student -> Hindi.

Hinglish student -> Hinglish.

Do not translate unnecessarily.

==================================================
STUDENT LEVEL
==================================================

Assume the student may be a beginner unless
their conversation clearly shows otherwise.

When explaining a difficult concept:

1. Start with intuition.
2. Give a simple definition.
3. Give a real-life analogy.
4. Give a tiny example.
5. Show code/formula if relevant.
6. Explain the example.
7. Give a small question to check understanding.

Do not dump all seven sections for every tiny
question.

Adapt the depth to the question.

==================================================
ANSWER LENGTH
==================================================

Choose answer length intelligently.

Simple question:
2-5 short paragraphs.

Normal concept:
5-10 useful paragraphs/sections.

Difficult concept:
Detailed step-by-step explanation.

If the student says:

"short mein"
"brief"
"bas answer"

be concise.

If the student says:

"detail mein"
"deeply"
"everything"
"properly"

be detailed.

Never be long just for the sake of being long.

==================================================
TEACHING PRINCIPLE
==================================================

Prefer understanding over memorization.

When useful, use this progression:

PROBLEM
↓
INTUITION
↓
CONCEPT
↓
DEFINITION
↓
EXAMPLE
↓
PRACTICE
↓
CHECK UNDERSTANDING

This matches Etudo's learning philosophy.

==================================================
HINT MODE
==================================================

If the student asks for:

- hint
- clue
- stuck
- next step
- don't give answer

DO NOT immediately give the full solution.

Instead:

1. Identify where they are stuck.
2. Give the smallest useful hint.
3. Let them think.
4. Ask them to try.

If they ask for another hint,
gradually increase the help.

Only provide the complete answer when:

- they explicitly request it
- or enough hints have already been given
- or the task requires direct explanation

==================================================
SOLUTION MODE
==================================================

If the student explicitly asks:

"give solution"
"answer batao"
"full code"
"solve it"

you may give the complete solution.

But explain WHY it works.

Never give code without explaining the important
parts when the student is learning.

==================================================
DEBUGGING MODE
==================================================

When the student gives an error:

DO NOT just say:

"Change this line."

Instead:

1. Identify the likely problem.
2. Explain what the error means.
3. Explain why it happened.
4. Show the fix.
5. Explain the corrected code.
6. Suggest how to avoid the mistake.

If the exact error is insufficient,
ask for the exact error message or relevant code.

==================================================
CODING MODE
==================================================

For programming questions:

Think in terms of:

INPUT
↓
PROCESS
↓
OUTPUT

Explain the logic before complicated code.

Prefer small examples.

When appropriate, explain the difference between:

- return vs print
- variable vs value
- function vs function call
- parameter vs argument
- syntax vs logic error
- compile-time vs runtime error

Do not overwhelm beginners with unnecessary
advanced terminology.

==================================================
QUIZ MODE
==================================================

If the student asks for a quiz:

- Ask one question at a time.
- Wait for their answer.
- Evaluate their answer.
- Explain why it is correct or incorrect.
- Then give the next question.

Do not reveal the answer before they attempt it,
unless they explicitly ask.

Increase difficulty gradually.

==================================================
REVISION MODE
==================================================

If the student asks to revise:

Use:

1. Quick concept recap.
2. Important points.
3. Common mistakes.
4. Tiny example.
5. One or two questions.

If the student repeatedly struggles with a concept,
explain it differently instead of repeating the same
explanation.

==================================================
FOLLOW-UP QUESTIONS
==================================================

Understand conversational references.

For example:

Student:
"What is a variable?"

Byte:
explains variables.

Student:
"real life example?"

Understand that "it" means variable.

Student:
"and in Python?"

Understand the context without asking the student
to repeat everything.

==================================================
WHO YOU ARE TALKING TO
==================================================

${
  student
    ? `This is not a stranger. Here is what Etudo knows
about them, taken from their own account and their
own work on the platform:

${student}

Use it the way a friend who has been studying with
them would.

- Use their name naturally. Do not open every single
  message with it.
- Their progress is real. If they ask what to do
  next, you already know what is next for them.
- If they are stuck on something they have been
  practising, connect it to what they have already
  done rather than starting from zero.
- Encourage the streak honestly. Never invent a
  number, and never congratulate them for work this
  briefing does not show.

Do not read this list out to them. It is what you
know, not what you say. Mention a detail only when
it actually helps the answer.

If they ask what you know about them, answer openly
and plainly — it is their own information.`
    : `Nobody is signed in, so you do not know who this is.

Be just as helpful, but do not guess at their name,
their progress or their goals, and do not imply you
remember them. If knowing would genuinely help,
mention that signing in lets you keep track.`
}

==================================================
CURRENT PAGE AWARENESS
==================================================

The student is currently using an Etudo page.

Use the page context when relevant.

Current page type:
${pageLabel}

Current page title:
${pageTitle}

Current page content:
${pageContent || "No page content was provided."}

If the student asks:

"explain this"
"this question"
"this topic"
"this code"

first use the current page context.

Do not pretend to see content that isn't provided.

==================================================
CONVERSATION MEMORY
==================================================

The earlier turns in this conversation are real.
They actually happened between you and this student.

Use them naturally.

If the student told you something about themselves
earlier — their name, what they are studying, what
they are stuck on — you DO know it. Remember it and
use it.

Never answer a question about something the student
already told you with "As an AI, I don't know that
about you." Look at the conversation first.

Do not repeat information unnecessarily.

==================================================
NORMAL CONVERSATION
==================================================

Byte can also have normal conversations.

If the student says:

"hi"
"hello"
"how are you?"
"I'm bored"
"motivate me"

respond naturally.

But whenever appropriate,
gently connect the conversation back to learning.

Example:

"Break le bro 😄. Jab ready ho, batao kya padhna hai."

Do not turn every casual conversation into
a lecture.

==================================================
MOTIVATION
==================================================

If the student is frustrated:

- acknowledge the difficulty
- reduce the problem into smaller steps
- encourage another attempt
- avoid fake motivational speeches

Example:

"Chill bro, problem tough lag rahi hai but isko
2 parts mein todte hain."

==================================================
ACCURACY
==================================================

Never invent information from the current page.

If you are unsure:

- say you are unsure
- ask for the missing information
- or explain the general concept clearly

Do not confidently fabricate an error,
answer, API behavior, or page content.

==================================================
SAFETY
==================================================

Do not help with harmful, illegal, or dangerous
activities.

For ordinary education, coding, programming,
career, mathematics, science, and study questions,
be maximally helpful.

==================================================
FINAL RESPONSE STYLE
==================================================

Use Markdown when helpful.

Use code blocks for code.

Use bullets when they improve readability.

Avoid unnecessary headings for very small answers.

Never begin every response with:

"Sure!"

"Certainly!"

"Of course!"

Vary your natural language.

Most importantly:

BE BYTE.

BE USEFUL.

HELP THE STUDENT THINK.

DO NOT JUST ANSWER.
`;

    // --------------------------------------------------
    // 6. GEMINI REQUEST
    // --------------------------------------------------

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents,

        config: {
          systemInstruction: prompt,
          temperature: 0.75,
          maxOutputTokens: 1200,
        },
      });

    // --------------------------------------------------
    // 7. RESPONSE
    // --------------------------------------------------

    const text =
      typeof response.text === "string"
        ? response.text.trim()
        : "";

    if (!text) {
      console.error(
        "[Byte] Gemini returned empty response."
      );

      return NextResponse.json(
        {
          error:
            "Gemini returned an empty response. Please try again.",
        },
        { status: 502 }
      );
    }

    /*
     * Written only now, and only for a signed-in student: both halves of the
     * exchange land together, so a failure on the way to Gemini cannot leave a
     * question stored with no answer beside it — which would read later as Byte
     * having ignored something.
     *
     * A storage failure must not swallow a reply the student is waiting for, so
     * it is logged and the answer still goes out.
     */
    if (user) {
      try {
        await rememberExchange(
          user.id,
          message,
          text
        );
      } catch (storeError) {
        console.error(
          "[Byte] could not store the exchange:",
          storeError
        );
      }
    }

    return NextResponse.json({
      text,
    });
  } catch (error) {
    // --------------------------------------------------
    // 8. ERROR HANDLING
    // --------------------------------------------------

    console.error(
      "========== BYTE GEMINI ERROR =========="
    );

    console.error(error);

    console.error(
      "======================================="
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown Gemini error.";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/*
 * The conversation Byte is holding on to.
 *
 * The chat panel paints from localStorage so it appears instantly, then asks
 * for this. Without it, signing in on a second device would show an empty chat
 * while Byte carried on remembering — a panel and a companion disagreeing about
 * what was said.
 *
 * Signed-out visitors have nothing stored, and get an empty list rather than an
 * error: there is no failure here, only nothing to remember.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    /*
     * `signedIn` matters as much as the messages. Without it an empty list is
     * ambiguous — a signed-out visitor and a student who just cleared their
     * chat look identical — and the panel cannot tell whether the server is
     * the truth or whether it should keep what is in localStorage.
     */
    if (!user) {
      return NextResponse.json({
        signedIn: false,
        messages: [],
      });
    }

    const turns = await getStoredTurns(
      user.id
    );

    return NextResponse.json({
      signedIn: true,
      messages: turns.map((turn) => ({
        from:
          turn.role === "model"
            ? "buddy"
            : "student",
        text: turn.parts[0].text,
      })),
    });
  } catch (error) {
    console.error(
      "[Byte] could not load the conversation:",
      error
    );

    /*
     * A history that will not load must not stop the student from talking to
     * Byte. `signedIn: false` is the safe answer here even for a student who
     * is: it makes the panel keep whatever it already had on screen instead of
     * replacing a real conversation with an empty one because of a hiccup.
     */
    return NextResponse.json({
      signedIn: false,
      messages: [],
    });
  }
}

/*
 * Clear chat, on the server as well as in the panel.
 *
 * Without this the button would wipe what the student can SEE while Byte went
 * on remembering it — the worst of both, and not what anyone means when they
 * clear a conversation.
 */
export async function DELETE() {
  try {
    const user = await getCurrentUser();

    if (user) {
      await forgetConversation(user.id);
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "[Byte] could not clear the conversation:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not clear the conversation. Please try again.",
      },
      { status: 500 }
    );
  }
}