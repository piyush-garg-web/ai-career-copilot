// src/lib/ai/providers/grok.js

import OpenAI from "openai";
import { BaseAIProvider, AIServiceError } from "./base";

export class GrokProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey || "",
      baseURL: "https://api.x.ai/v1",
    });
  }

  /**
   * Translates raw errors into standardized AIServiceError objects.
   */
  _handleError(error) {
    if (error instanceof AIServiceError) {
      return error;
    }

    const msg = (error.message || "").toLowerCase();
    const status = error.status || 0;
    
    // Quota Limit Exhausted
    if (
      msg.includes("quota") ||
      msg.includes("insufficient_quota") ||
      msg.includes("limit exceeded") ||
      status === 429
    ) {
      return new AIServiceError(
        "The AI service has temporarily reached its usage limit. Please try again later.",
        "QUOTA_EXHAUSTED",
        { retryable: false, originalError: error }
      );
    }

    // Invalid API Key
    if (
      msg.includes("invalid_api_key") ||
      msg.includes("authentication") ||
      msg.includes("api key") ||
      status === 401 ||
      status === 403
    ) {
      return new AIServiceError(
        "AI configuration error.",
        "INVALID_API_KEY",
        { retryable: false, originalError: error }
      );
    }

    // Request Timeout
    if (
      msg.includes("timeout") ||
      msg.includes("timed out")
    ) {
      return new AIServiceError(
        "AI service is taking longer than expected.",
        "TIMEOUT",
        { retryable: true, originalError: error }
      );
    }

    // Temporary/Transient Network or Server Errors
    if (
      status === 500 ||
      status === 502 ||
      status === 503 ||
      msg.includes("internal server") ||
      msg.includes("unavailable") ||
      msg.includes("fetch failed")
    ) {
      return new AIServiceError(
        "AI service is temporarily unavailable. Please try again.",
        "TEMPORARY_FAILURE",
        { retryable: true, originalError: error }
      );
    }

    // Default API Error
    return new AIServiceError(
      error.message || "An unexpected error occurred during AI execution.",
      "API_ERROR",
      { retryable: false, originalError: error }
    );
  }

  async generateJSON({ prompt, systemInstruction, temperature = 0.1, maxTokens = 4096, model }) {
    try {
      if (!this.config.apiKey) {
        throw new AIServiceError("AI configuration error. GROK_API_KEY is missing.", "INVALID_API_KEY", { retryable: false });
      }

      const messages = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Invalid response format received from Grok.");
      }

      return JSON.parse(content.trim());
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async generateText({ prompt, systemInstruction, temperature = 0.1, maxTokens = 4096, model }) {
    try {
      if (!this.config.apiKey) {
        throw new AIServiceError("AI configuration error. GROK_API_KEY is missing.", "INVALID_API_KEY", { retryable: false });
      }

      const messages = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Invalid response format received from Grok.");
      }

      return content;
    } catch (error) {
      throw this._handleError(error);
    }
  }
}
