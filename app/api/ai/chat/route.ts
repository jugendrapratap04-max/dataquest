import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { readJson } from '@/lib/http';
import { LocalModelProvider } from '@/lib/ai/local';
import { OpenAIProvider } from '@/lib/ai/openai';
import { OllamaProvider } from '@/lib/ai/ollama';
import { assemblePrompt } from '@/lib/ai/context';
import { fetchLessonSnippets } from '@/lib/ai/retrieval';
import { MENTOR_SYSTEM_PROMPT } from '@/lib/ai/systemPrompt';

const MAX_MESSAGE_LENGTH = 8000; // characters

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const body = await readJson(req);
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) return NextResponse.json({ error: 'message too long' }, { status: 413 });

  // Assemble student-aware context (weak concepts, signals, profile notes)
  const context = await assemblePrompt(user.id, message);

  // Simple heuristic: if the client provided a lessonId, include relevant snippets
  let snippets: string[] = [];
  if (body.lessonId && typeof body.lessonId === 'string') {
    try {
      snippets = await fetchLessonSnippets(body.lessonId, 5);
    } catch (e) {
      // ignore retrieval errors; model can still answer without lesson context
      // eslint-disable-next-line no-console
      console.warn('Retrieval error', e);
    }
  }

  // Final prompt: include system prompt, small context, and any snippets.
  const composedParts = [MENTOR_SYSTEM_PROMPT, context];
  if (snippets.length) {
    composedParts.push('DataMarg lesson snippets (prefer these when relevant):');
    for (const s of snippets) composedParts.push(s);
  }
  composedParts.push(`User question:\n${message}`);
  const finalPrompt = composedParts.join('\n\n');

  // Select provider by AI_PROVIDER env var
  const providerName = (process.env.AI_PROVIDER || '').toLowerCase();
  let provider: any = null;

  try {
    if (providerName === 'ollama') {
      provider = new OllamaProvider(process.env.OLLAMA_BASE_URL, process.env.OLLAMA_MODEL);
    } else if (providerName === 'openai' && process.env.OPENAI_API_KEY) {
      provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
    } else {
      // Default: local stub for dev
      provider = new LocalModelProvider();
    }

    const reply = await provider.generateReply(finalPrompt);
    return NextResponse.json({ ok: true, reply: reply.text });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('AI provider error', err);
    // Map some known messages to user-friendly errors
    const msg = String(err?.message || 'AI provider error');
    if (msg.toLowerCase().includes('ollama')) {
      return NextResponse.json({ error: 'AI model unavailable. Try again later.' }, { status: 502 });
    }
    return NextResponse.json({ error: 'AI provider error' }, { status: 502 });
  }
}
