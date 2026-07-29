import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { readJson, textOf } from "@/lib/http";

// Saves the onboarding answers (docs/LEARNING-SPEC.md §5).
//
// Everything is optional and everything is capped. Gender is validated against a
// closed set rather than stored as free text — "prefer not to say" is one of the
// three answers, not an empty field, because it selects its own welcome.

const GENDERS = new Set(["male", "female", "unspecified"]);
const LANGUAGES = new Set(["en", "hi", "hinglish"]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const b = await readJson(req);
  const gender = typeof b.gender === "string" && GENDERS.has(b.gender) ? b.gender : "unspecified";
  const language = typeof b.language === "string" && LANGUAGES.has(b.language) ? b.language : "en";
  const institution = textOf(b.institution, 120);
  const interests = Array.isArray(b.interests)
    ? b.interests.filter((i): i is string => typeof i === "string").slice(0, 12).map((i) => i.slice(0, 40))
    : [];

  await prisma.user.update({
    where: { id: user.id },
    data: {
      gender,
      language,
      institution: institution || null,
      interestsCsv: interests.join(","),
      onboardedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, gender });
}

// Marks the welcome as played. Called once, by the welcome screen itself, so it
// never appears again for this account.
export async function PATCH() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  await prisma.user.update({ where: { id: user.id }, data: { welcomedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
