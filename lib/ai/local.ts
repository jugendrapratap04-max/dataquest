import { AIProvider, AIResponse } from './provider';

/**
 * LocalModelProvider is a safe stub for development and offline use.
 * It returns a deterministic canned response so the feature can be wired
 * end-to-end without depending on a cloud provider.
 */
export class LocalModelProvider implements AIProvider {
  async generateReply(prompt: string): Promise<AIResponse> {
    // Keep responses short and neutral; do not echo secrets.
    const text = `AI Mentor (stub): I received your message (${String(prompt).slice(0, 120)}).\n\nThis is a local stub response — configure an AI provider to get full answers.`;
    return { text };
  }
}
