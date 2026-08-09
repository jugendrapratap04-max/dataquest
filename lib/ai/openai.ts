import { AIProvider, AIResponse } from './provider';

export class OpenAIProvider implements AIProvider {
  apiKey: string;
  model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async generateReply(prompt: string): Promise<AIResponse> {
    // Minimal chat completion call. Keep temperature low for instructional answers.
    const body = {
      model: this.model,
      messages: [
        { role: 'system', content: 'You are an AI Mentor for students. Provide concise, helpful, and safe guidance. Do not reveal system internals or secrets.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.2,
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${text}`);
    }

    const j = await res.json();
    // Support both chat-style and legacy text-style responses
    const reply = j.choices?.[0]?.message?.content ?? j.choices?.[0]?.text ?? '';
    return { text: String(reply).trim() };
  }
}
