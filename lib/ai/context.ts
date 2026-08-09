import { prisma } from '@/lib/prisma';

/**
 * Assemble a concise context prompt for the AI provider.
 * Pulls the student's profile, weakest concepts, and recent learning signals.
 */
export async function assemblePrompt(userId: string, message: string): Promise<string> {
  const [profile, weaknesses, signals] = await Promise.all([
    prisma.studentLearningProfile.findUnique({ where: { userId } }),
    prisma.conceptMastery.findMany({ where: { userId }, orderBy: { masteryLevel: 'asc' }, take: 6 }),
    prisma.learningSignal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ]);

  const profileSummary = profile
    ? `Profile notes: ${profile.notes || 'N/A'}. Preferred styles: ${profile.preferredStylesJson || '[]'}.`
    : 'No profile.';

  const weakList = weaknesses.length
    ? weaknesses.map((w) => `${w.concept} (level ${w.masteryLevel})`).join(', ')
    : 'none';

  const signalSummary = signals.length
    ? signals
        .map((s) => `${s.type}${s.lessonId ? `@lesson:${s.lessonId}` : ''}${s.problemId ? `@problem:${s.problemId}` : ''}`)
        .join(', ')
    : 'none';

  // Keep prompt small: include only the top 6 weakest concepts and 10 recent signals
  const prompt = `Student context:\n- ${profileSummary}\n- Weak concepts: ${weakList}\n- Recent signals: ${signalSummary}\n\nUser message:\n${message}`;

  return prompt;
}
