import { NextResponse } from "next/server";
import { generateJSONContent } from "@/lib/ai/service";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/test
 * Development-only test endpoint to verify Gemini API infrastructure connectivity.
 */
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. If key is missing, return detailed instructions for the user on how to set it up
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Missing GEMINI_API_KEY environment variable.",
        setupProcedure: [
          "Step 1: Go to Google AI Studio at https://aistudio.google.com/ and sign in.",
          "Step 2: Click the 'Get API key' button in the sidebar or top banner.",
          "Step 3: Create a new API key and copy it.",
          "Step 4: Open your local '.env' file in the project root.",
          "Step 5: Add a new line: GEMINI_API_KEY=your_copied_key_here (without quotes or spaces).",
          "Step 6: Stop your terminal process and restart the dev server: npm run dev",
        ],
      },
      { status: 400 }
    );
  }

  try {
    // 2. Query Gemini using our generic service to fetch and validate the expected JSON shape
    const result = await generateJSONContent({
      prompt: "Execute connection validation test.",
      systemInstruction:
        "You are an infrastructure validation test helper. " +
        "You must return EXACTLY the following JSON object, and absolutely nothing else. " +
        "Output shape: { \"status\": \"ok\", \"message\": \"Gemini infrastructure working\" }",
      validator: (json) => {
        if (!json || typeof json !== "object") {
          return "Response payload is not a JSON object.";
        }
        if (json.status !== "ok") {
          return `Invalid 'status' value. Expected 'ok', got '${json.status}'.`;
        }
        if (json.message !== "Gemini infrastructure working") {
          return `Invalid 'message' value. Expected 'Gemini infrastructure working', got '${json.message}'.`;
        }
        return null; // Passes verification
      },
      temperature: 0.0, // Strict, deterministic output
      timeoutMs: 12000, // Speed test limit
      retries: 1, // Only retry once for testing speed
    });

    // 3. Return the verified JSON result
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GEMINI INFRASTRUCTURE TEST FAILURE]:", error);
    return NextResponse.json(
      {
        error: "AI Infrastructure connection failure.",
        details: error.message || "Unknown execution error.",
      },
      { status: 500 }
    );
  }
}
