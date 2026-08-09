export type AIResponse = { text: string };

export interface AIProvider {
  /**
   * Generate a reply for a given prompt.
   * Keep the contract small and JSON-serializable for safety.
   */
  generateReply(prompt: string, opts?: Record<string, unknown>): Promise<AIResponse>;
}
