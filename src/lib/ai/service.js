// src/lib/ai/service.js

import { aiGateway, AIServiceError } from "./gateway";

/**
 * Clean and parse a JSON response from Gemini.
 * Strips markdown formatting block tags if present.
 * @param {string} rawText - Raw text output from the model.
 * @returns {object} - Parsed JSON object.
 */
export function parseJsonResponse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("AI returned an empty or invalid content response.");
  }

  let cleaned = rawText.trim();
  
  // Strip markdown code block wrappers if they exist
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("[AI SERVICE PARSER EXCEPTION]: Raw response was not valid JSON string:\n", rawText);
    throw new Error(`AI generation output did not yield valid JSON structure: ${error.message}`);
  }
}

/**
 * Redesigned generic service helper that calls the centralized AI Gateway.
 * Maintains compatibility for high-level files (resume-analyzer, job-matcher, interview).
 *
 * @param {object} params
 * @param {string} params.prompt - Main query prompt.
 * @param {string} [params.systemInstruction] - Role description or guide.
 * @param {function} [params.validator] - A callback function validator(json) returning an error string if invalid.
 * @param {number} [params.temperature=0.1] - Control randomness (low for consistency).
 * @param {number} [params.maxTokens=4096] - Output limit.
 * @param {object} [params.cacheContext] - Optional structured metadata context for intelligent caching.
 * @returns {Promise<object>} - Parsed and validated JSON response.
 */
export async function generateJSONContent({
  prompt,
  systemInstruction,
  validator,
  temperature = 0.1,
  maxTokens = 4096,
  cacheContext = null,
}) {
  try {
    // Delegate to the central gateway orchestrator
    const result = await aiGateway.generateJSON({
      prompt,
      systemInstruction,
      temperature,
      maxTokens,
      cacheContext,
    });

    // Validate schema if custom validator callback is provided
    if (validator) {
      const validationError = validator(result);
      if (validationError) {
        throw new Error(`JSON Schema validation failed: ${validationError}`);
      }
    }

    return result;

  } catch (error) {
    console.error("[AI SERVICE FACADE EXCEPTION]:", error);

    // Normalize error message for user experience
    let cleanMessage = error.message;

    if (error instanceof AIServiceError) {
      if (error.code === "QUOTA_EXHAUSTED") {
        cleanMessage = "The AI service has temporarily reached its usage limit. Please try again later.";
      } else if (error.code === "INVALID_API_KEY") {
        cleanMessage = "AI configuration error.";
      } else if (error.code === "TIMEOUT") {
        cleanMessage = "AI service is taking longer than expected.";
      }
    }

    throw new Error(cleanMessage);
  }
}
