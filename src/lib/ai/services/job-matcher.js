import { generateJSONContent } from "../service";
import { JOB_MATCH_SYSTEM_PROMPT, buildJobMatchPrompt } from "../prompts/job-match";
import { validateJobMatch } from "../validators/job-match";

/**
 * Executes AI Job Description Matching comparison scan using Gemini.
 * 
 * @param {string} rawText - Plain text parsed from PDF/DOCX.
 * @param {object} parsedData - Structured JSON fields extracted from the resume.
 * @param {string} jobDescription - Pasted target job description text requirements.
 * @returns {Promise<object>} - Validated JSON evaluation containing alignment scores and keyword lists.
 */
export async function matchJobDescriptionWithAI(rawText, parsedData, jobDescription, resumeId = null, aiPreferences = {}) {
  if (!rawText || !rawText.trim()) {
    throw new Error("Cannot run Job Matching with empty or missing plain resume text.");
  }
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error("Cannot run Job Matching with empty or missing target job description requirements.");
  }

  // Construct comparison prompt template containing resume and job requirements
  const prompt = buildJobMatchPrompt(rawText, parsedData || {}, jobDescription, aiPreferences);

  console.log(`[JOB MATCHER SERVICE]: Executing AI comparison match. Job description length: ${jobDescription.length}`);

  // Query the generic AI infrastructure service
  return await generateJSONContent({
    prompt,
    systemInstruction: JOB_MATCH_SYSTEM_PROMPT,
    validator: validateJobMatch,
    temperature: 0.1, // Low temperature for maximum compliance and consistent scores
    cacheContext: {
      feature: "job-match",
      resumeId: resumeId || "unknown_resume",
      jobDescription,
    },
  });
}
