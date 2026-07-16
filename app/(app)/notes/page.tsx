import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { NotesClient } from "@/components/NotesClient";

export default async function NotesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return <NotesClient initial={notes.map((n) => ({ id: n.id, topic: n.topic, title: n.title, body: n.body, code: n.code }))} />;
}
