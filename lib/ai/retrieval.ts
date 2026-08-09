import { prisma } from '@/lib/prisma';

/**
 * Fetch short lesson snippets suitable for RAG-style inclusion.
 * Returns an array of short text snippets (strings).
 */
export async function fetchLessonSnippets(lessonId: string, maxSnippets = 5): Promise<string[]> {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { contentJson: true, title: true } });
  if (!lesson) return [];

  try {
    const blocks: any[] = JSON.parse(lesson.contentJson || '[]');
    // Extract text-like blocks and take the first N short ones
    const snippets: string[] = [];
    for (const b of blocks) {
      if (snippets.length >= maxSnippets) break;
      if (!b) continue;
      if (typeof b === 'string') {
        snippets.push(b.slice(0, 400));
      } else if (b.type === 'text' && b.content) {
        snippets.push(String(b.content).slice(0, 400));
      } else if (b.type === 'code' && b.content) {
        // include short code examples but trim them
        snippets.push(`code:\n${String(b.content).slice(0, 500)}`);
      } else if (b.type === 'example' && b.value) {
        snippets.push(String(b.value).slice(0, 400));
      }
    }

    return snippets;
  } catch (e) {
    return [];
  }
}
