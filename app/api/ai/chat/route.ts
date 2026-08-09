import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { readJson } from '@/lib/http';
import { LocalModelProvider } from '@/lib/ai/local';
import { OpenAIProvider } from '@/lib/ai/openai';
import { assemblePrompt } from '@/lib/ai/context';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const body = await readJson(req);
  const message = typeof body.message === 'string' ? body.message : '';
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });

  // Compose a small student-aware prompt to send to the provider.
  const prompt = await assemblePrompt(user.id, message);

  // Use OpenAI when API key is configured; otherwise fall back to the local stub.
  let provider;
  if (process.env.OPENAI_API_KEY) {
    provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
  } else {
    provider = new LocalModelProvider();
  }

  try {
    const reply = await provider.generateReply(prompt);
    return NextResponse.json({ ok: true, reply: reply.text });
  } catch (err) {
    // Log server-side and return a safe error to the client
    // (Don't leak provider errors or stack traces to users)
    // eslint-disable-next-line no-console
    console.error('AI provider error', err);
    return NextResponse.json({ error: 'AI provider error' }, { status: 502 });
  }
}
