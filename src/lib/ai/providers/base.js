// src/lib/ai/providers/base.js

/**
 * Standardized AI Service Error representation.
 */
export class AIServiceError extends Error {
  constructor(message, code, { retryable = false, originalError = null } = {}) {
    super(message);
    this.name = "AIServiceError";
    this.code = code; // e.g. 'QUOTA_EXHAUSTED', 'INVALID_API_KEY', 'TIMEOUT', 'API_ERROR'
    this.retryable = retryable;
    this.originalError = originalError;
  }
}

/**
 * Base abstract class defining the interface for AI Providers.
 * All custom providers (Gemini, OpenAI, etc.) must extend this class.
 */
export class BaseAIProvider {
  constructor(config) {
    this.config = config;
  }

  /**
   * Generates structured JSON content.
   * @param {object} params
   * @param {string} params.prompt
   * @param {string} [params.systemInstruction]
   * @param {number} [params.temperature]
   * @param {number} [params.maxTokens]
   * @param {string} params.model
   * @returns {Promise<object>} Parsed JSON content
   */
  async generateJSON({ prompt, systemInstruction, temperature, maxTokens, model }) {
    throw new Error("generateJSON() must be implemented by the provider subclass.");
  }

  /**
   * Generates raw text content.
   * @param {object} params
   * @param {string} params.prompt
   * @param {string} [params.systemInstruction]
   * @param {number} [params.temperature]
   * @param {number} [params.maxTokens]
   * @param {string} params.model
   * @returns {Promise<string>} Raw text content
   */
  async generateText({ prompt, systemInstruction, temperature, maxTokens, model }) {
    throw new Error("generateText() must be implemented by the provider subclass.");
  }
}
