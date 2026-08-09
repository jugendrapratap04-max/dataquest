import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { readJson } from '@/lib/http';
import { LocalModelProvider } from '@/lib/ai/local';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const body = await readJson(req);
  const message = typeof body.message === 'string' ? body.message : '';
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });

  const provider = new LocalModelProvider();
  const reply = await provider.generateReply(message);

  return NextResponse.json({ ok: true, reply: reply.text });
}
