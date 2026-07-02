import { aiClient, DEFAULT_MODEL } from "./client";
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

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
 * Generic service helper to request structured JSON content from Gemini.
 * Implements linear retry backoffs, request timeouts, and structure validation.
 * 
 * @param {object} params
 * @param {string} params.prompt - Main query prompt.
 * @param {string} [params.systemInstruction] - Role description or guide.
 * @param {function} [params.validator] - A callback function validator(json) returning an error string if invalid.
 * @param {number} [params.temperature=0.1] - Control randomness (low for consistency).
 * @param {string} [params.model=DEFAULT_MODEL] - Model version.
 * @param {number} [params.maxTokens=2048] - Output limit.
 * @param {number} [params.retries=2] - Number of retries on network/parse failures.
 * @param {number} [params.timeoutMs=15000] - Request timeout gate.
 * @returns {Promise<object>} - Parsed and validated JSON response.
 */
export async function generateJSONContent({
  prompt,
  systemInstruction,
  validator,
  temperature = 0.1,
  model = DEFAULT_MODEL,
  maxTokens = 4096,
  retries = 2,
  timeoutMs = 25000, // Generous timeout for large text parsing
}) {
  let attempt = 0;

  // Build standard safety configurations suitable for resume analysis
  const safetySettings = [
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

  while (attempt <= retries) {
    try {
      console.log(
        `[AI SERVICE]: Generating content (Attempt ${attempt + 1}/${retries + 1}). ` +
        `Model: ${model}, Temperature: ${temperature}`
      );

      // Create API call promise
      const apiCallPromise = aiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
          safetySettings,
        },
      });

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API request timed out.")), timeoutMs)
      );

      // Race the API call against the timeout gate
      const response = await Promise.race([apiCallPromise, timeoutPromise]);

      if (!response || typeof response.text !== "string") {
        throw new Error("Invalid response format received from Gemini client.");
      }

      const responseText = response.text;
      const parsedJson = parseJsonResponse(responseText);

      // Validate schema if custom validator callback is provided
      if (validator) {
        const validationError = validator(parsedJson);
        if (validationError) {
          throw new Error(`JSON Schema validation failed: ${validationError}`);
        }
      }

      console.log("[AI SERVICE]: Successfully generated and validated JSON response.");
      return parsedJson;

    } catch (error) {
      console.error(
        `[AI SERVICE ERROR] Attempt ${attempt + 1} failed:`,
        error.message || error
      );

      attempt++;
      if (attempt > retries) {
        let cleanErrorMessage = error.message;
        if (
          error.message.includes("quota") ||
          error.message.includes("RESOURCE_EXHAUSTED") ||
          error.message.includes("limit exceeded") ||
          error.message.includes("429")
        ) {
          cleanErrorMessage = "Your Gemini API Key quota or rate limit has been exceeded. Please check your plan/billing details or replace your GEMINI_API_KEY in the environment config (.env) file.";
        } else if (
          error.message.includes("API key not valid") ||
          error.message.includes("API_KEY_INVALID") ||
          error.message.includes("key is invalid")
        ) {
          cleanErrorMessage = "Invalid Gemini API Key. Please verify your GEMINI_API_KEY environment variable in your .env file.";
        }
        throw new Error(
          `AI Infrastructure failed after ${retries + 1} attempts. Last error: ${cleanErrorMessage}`
        );
      }

      // Linear retry delay backoff (1s, 2s, etc.)
      const delay = attempt * 1000;
      console.log(`[AI SERVICE]: Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
