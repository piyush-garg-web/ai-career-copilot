/**
 * Validation utility for structured AI Resume Analysis JSON responses.
 */

/**
 * Validates the structure and constraints of the Resume Analysis JSON output.
 * @param {object} json - The parsed JSON response.
 * @returns {string|null} - Error description if invalid, or null if valid.
 */
export function validateResumeAnalysis(json) {
  if (!json || typeof json !== "object") {
    return "Response payload is not a valid JSON object.";
  }

  // 1. Validate Score Fields (Must be integers between 0 and 100)
  const scoreFields = [
    "overallScore",
    "atsScore",
    "skillsScore",
    "experienceScore",
    "educationScore",
    "projectsScore",
    "grammarScore",
  ];

  for (const field of scoreFields) {
    const value = json[field];
    if (typeof value !== "number" || isNaN(value)) {
      return `Field '${field}' must be a number. Got: ${typeof value}`;
    }
    if (!Number.isInteger(value)) {
      return `Field '${field}' must be an integer. Got: ${value}`;
    }
    if (value < 0 || value > 100) {
      return `Field '${field}' must be between 0 and 100. Got: ${value}`;
    }
  }

  // 2. Validate List Fields (Must be arrays of strings)
  const arrayFields = ["strengths", "weaknesses", "missingKeywords", "suggestions"];
  for (const field of arrayFields) {
    const arr = json[field];
    if (!Array.isArray(arr)) {
      return `Field '${field}' must be an array. Got: ${typeof arr}`;
    }
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== "string") {
        return `Item at index ${i} in field '${field}' is not a string. Got: ${typeof arr[i]}`;
      }
    }
  }

  // 3. Validate summary (Must be a non-empty string)
  if (typeof json.summary !== "string") {
    return `Field 'summary' must be a string. Got: ${typeof json.summary}`;
  }
  if (!json.summary.trim()) {
    return "Field 'summary' cannot be empty.";
  }

  return null; // Passes all validation criteria
}
