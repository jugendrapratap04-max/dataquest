import { AIProvider, AIResponse } from './provider';
import { MENTOR_SYSTEM_PROMPT } from './systemPrompt';

const DEFAULT_BASE = 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'mistral';
const DEFAULT_TIMEOUT_MS = 20_000;

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

export class OllamaProvider implements AIProvider {
  baseUrl: string;
  model: string;
  timeoutMs: number;

  constructor(baseUrl?: string, model?: string, timeoutMs?: number) {
    this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || DEFAULT_BASE;
    this.model = model || process.env.OLLAMA_MODEL || DEFAULT_MODEL;
    this.timeoutMs = timeoutMs || Number(process.env.OLLAMA_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  }

  /**
   * Call the local Ollama HTTP API to generate a reply.
   * Returns { text } where text is the model's answer.
   * Failures throw a descriptive Error which callers should catch and surface safely.
   */
  async generateReply(userPrompt: string): Promise<AIResponse> {
    // Compose the full prompt: system + user
    const composed = `${MENTOR_SYSTEM_PROMPT}\n\nContext and user message:\n${userPrompt}`;

    const url = `${this.baseUrl.replace(/\/$/, '')}/api/generate`;
    const payload = {
      model: this.model,
      prompt: composed,
      // Basic options; models may ignore some of these or offer alternatives
      max_tokens: 800,
      temperature: 0.2,
    };

    const to = timeoutSignal(this.timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: to.signal as any,
      });

      if (res.status === 404) {
        throw new Error('Ollama endpoint not found (404). Is the server running and the API path correct?');
      }

      // Ollama may stream or return NDJSON. Try to parse JSON first; otherwise fall back to text.
      const text = await res.text();
      // Attempt JSON parse for common shapes
      try {
        const j = JSON.parse(text);
        // Ollama's non-stream response often includes `output` or `completion` fields
        const candidate = j.output ?? j.generations ?? j.completion ?? j;
        // If candidate is an array or object, try to extract a string
        if (typeof candidate === 'string') return { text: candidate.trim() };
        if (Array.isArray(candidate) && candidate.length) {
          const first = candidate[0];
          if (typeof first === 'string') return { text: first.trim() };
          if (first?.text) return { text: String(first.text).trim() };
          if (first?.content) return { text: String(first.content).trim() };
        }
        // Fallback: try j.response or j.output_text
        if (j.response && typeof j.response === 'string') return { text: j.response.trim() };
        if (j.output_text && typeof j.output_text === 'string') return { text: j.output_text.trim() };

        // Last resort: return the raw stringified JSON
        return { text: JSON.stringify(j) };
      } catch (e) {
        // Not JSON — treat as plain text
        return { text: text.trim() };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') throw new Error('Ollama request timed out');
      // Bubble a sanitized error
      throw new Error(`Ollama request failed: ${err?.message || String(err)}`);
    } finally {
      to.clear();
    }
  }
}
