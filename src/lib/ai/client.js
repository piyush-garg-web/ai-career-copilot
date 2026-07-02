import { GoogleGenAI } from "@google/genai";

// Read API Key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "[GEMINI AI CLIENT WARNING]: GEMINI_API_KEY is not defined in the environment variables. " +
    "AI services will fail to authenticate until a valid key is provided in .env"
  );
}

// Initialize the Google GenAI Client
export const aiClient = new GoogleGenAI({
  apiKey: apiKey || "",
});

// Production-ready default model for structured text analysis
export const DEFAULT_MODEL = "gemini-1.5-flash";
