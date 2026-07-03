// src/lib/ai/providers/openai.js

import { BaseAIProvider, AIServiceError } from "./base";

/**
 * Stub implementation for OpenAI.
 * Demonstrates the ease of plugging in alternative models/providers.
 */
export class OpenAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
  }

  async generateJSON({ prompt, systemInstruction, temperature = 0.1, maxTokens = 4096, model }) {
    if (!this.config.apiKey) {
      throw new AIServiceError(
        "AI configuration error. OPENAI_API_KEY is missing.",
        "INVALID_API_KEY",
        { retryable: false }
      );
    }
    
    console.log(`[OPENAI PROVIDER]: Received request for model ${model}. Stub executing...`);
    
    // In a real implementation, you would use:
    // const response = await openai.chat.completions.create({...})
    throw new AIServiceError(
      "OpenAI integration is configured as a future provider and is not active yet.",
      "API_ERROR",
      { retryable: false }
    );
  }

  async generateText({ prompt, systemInstruction, temperature = 0.1, maxTokens = 4096, model }) {
    if (!this.config.apiKey) {
      throw new AIServiceError(
        "AI configuration error. OPENAI_API_KEY is missing.",
        "INVALID_API_KEY",
        { retryable: false }
      );
    }
    
    throw new AIServiceError(
      "OpenAI integration is configured as a future provider and is not active yet.",
      "API_ERROR",
      { retryable: false }
    );
  }
}
