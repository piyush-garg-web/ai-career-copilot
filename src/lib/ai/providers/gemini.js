// src/lib/ai/providers/gemini.js

import { GoogleGenAI } from "@google/genai";
import { HarmCategory, HarmBlockThreshold } from "@google/genai";
import { BaseAIProvider, AIServiceError } from "./base";

export class GeminiAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new GoogleGenAI({
      apiKey: config.apiKey || "",
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
    
    // Quota Limit Exhausted
    if (
      msg.includes("quota") ||
      msg.includes("resource_exhausted") ||
      msg.includes("limit exceeded") ||
      msg.includes("429")
    ) {
      return new AIServiceError(
        "The AI service has temporarily reached its usage limit. Please try again later.",
        "QUOTA_EXHAUSTED",
        { retryable: false, originalError: error }
      );
    }

    // Invalid API Key
    if (
      msg.includes("api key not valid") ||
      msg.includes("api_key_invalid") ||
      msg.includes("key is invalid") ||
      msg.includes("403") ||
      msg.includes("auth")
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
      msg.includes("timed out") ||
      msg.includes("deadline")
    ) {
      return new AIServiceError(
        "AI service is taking longer than expected.",
        "TIMEOUT",
        { retryable: true, originalError: error }
      );
    }

    // Temporary/Transient Network or Server Errors
    if (
      msg.includes("500") ||
      msg.includes("503") ||
      msg.includes("internal server") ||
      msg.includes("unavailable") ||
      msg.includes("fetch failed") ||
      msg.includes("network")
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

  /**
   * Helper to construct safety settings suitable for resume/career evaluations.
   */
  _getSafetySettings() {
    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  }

  async generateJSON({ prompt, systemInstruction, temperature = 0.1, maxTokens = 4096, model }) {
    try {
      if (!this.config.apiKey) {
        throw new AIServiceError("AI configuration error. GEMINI_API_KEY is missing.", "INVALID_API_KEY", { retryable: false });
      }

      const response = await this.client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
          safetySettings: this._getSafetySettings(),
        },
      });

      if (!response || typeof response.text !== "string") {
        throw new Error("Invalid response format received from Gemini client.");
      }

      // Parse and return the content
      let text = response.text.trim();
      
      // Handle potential markdown wrapper blocks
      if (text.startsWith("```json")) {
        text = text.substring(7);
      } else if (text.startsWith("```")) {
        text = text.substring(3);
      }
      if (text.endsWith("```")) {
        text = text.slice(0, -3);
      }
      
      return JSON.parse(text.trim());
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async generateText({ prompt, systemInstruction, temperature = 0.1, maxTokens = 4096, model }) {
    try {
      if (!this.config.apiKey) {
        throw new AIServiceError("AI configuration error. GEMINI_API_KEY is missing.", "INVALID_API_KEY", { retryable: false });
      }

      const response = await this.client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature,
          maxOutputTokens: maxTokens,
          safetySettings: this._getSafetySettings(),
        },
      });

      if (!response || typeof response.text !== "string") {
        throw new Error("Invalid response format received from Gemini client.");
      }

      return response.text;
    } catch (error) {
      throw this._handleError(error);
    }
  }
}
