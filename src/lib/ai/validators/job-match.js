/**
 * Validation utility for structured AI Job Matching JSON responses.
 */

/**
 * Validates the structure and constraints of the Job Match JSON output.
 * @param {object} json - The parsed JSON response.
 * @returns {string|null} - Error description if invalid, or null if valid.
 */
export function validateJobMatch(json) {
  if (!json || typeof json !== "object") {
    return "Response payload is not a valid JSON object.";
  }

  // 1. Validate String Fields
  if (typeof json.jobTitle !== "string" || !json.jobTitle.trim()) {
    return "Field 'jobTitle' must be a non-empty string.";
  }

  if (typeof json.companyName !== "string") {
    return "Field 'companyName' must be a string.";
  }

  // 2. Validate Match Score (Must be integer between 0 and 100)
  const score = json.matchScore;
  if (typeof score !== "number" || isNaN(score)) {
    return `Field 'matchScore' must be a number. Got: ${typeof score}`;
  }
  if (!Number.isInteger(score)) {
    return `Field 'matchScore' must be an integer. Got: ${score}`;
  }
  if (score < 0 || score > 100) {
    return `Field 'matchScore' must be between 0 and 100. Got: ${score}`;
  }

  // 3. Validate List Fields (Must be arrays of strings)
  const arrayFields = [
    "matchingSkills",
    "missingSkills",
    "matchingKeywords",
    "missingKeywords",
    "strengths",
    "weaknesses",
    "suggestions",
  ];

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

  // 4. Validate summary (Must be a non-empty string)
  if (typeof json.summary !== "string") {
    return `Field 'summary' must be a string. Got: ${typeof json.summary}`;
  }
  if (!json.summary.trim()) {
    return "Field 'summary' cannot be empty.";
  }

  return null; // Passes all validation criteria
}
