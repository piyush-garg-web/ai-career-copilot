import { generateJSONContent } from "../service";
import { RESUME_ANALYSIS_SYSTEM_PROMPT, buildResumeAnalysisPrompt } from "../prompts/resume-analysis";
import { validateResumeAnalysis } from "../validators/resume-analysis";

/**
 * Executes AI Resume Analysis by querying the Gemini model with raw resume text and structured details.
 * Saves results to the database and verifies outputs.
 * 
 * @param {string} rawText - Plain text parsed from PDF/DOCX.
 * @param {object} parsedData - Structured JSON fields extracted by regexes.
 * @returns {Promise<object>} - Validated JSON evaluation containing scores, list matrices, and summary.
 */
export async function analyzeResumeWithAI(rawText, parsedData) {
  if (!rawText || !rawText.trim()) {
    throw new Error("Cannot run AI Resume Analysis with empty or missing plain text.");
  }

  // Construct query prompt containing raw text and parsed details
  const prompt = buildResumeAnalysisPrompt(rawText, parsedData || {});

  console.log(`[RESUME ANALYZER SERVICE]: Executing AI analysis request. Raw text length: ${rawText.length}`);

  // Query the generic AI infrastructure service
  return await generateJSONContent({
    prompt,
    systemInstruction: RESUME_ANALYSIS_SYSTEM_PROMPT,
    validator: validateResumeAnalysis,
    temperature: 0.15, // Low temperature for deterministic scoring consistency
  });
}
