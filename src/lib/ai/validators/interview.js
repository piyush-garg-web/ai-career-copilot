/**
 * JSON validation helpers for AI Interview Coach responses.
 */

/**
 * Validates generated interview questions.
 * @param {object} json - The parsed JSON.
 * @returns {string|null} - Error description or null if valid.
 */
export function validateGeneratedQuestions(json) {
  if (!json || typeof json !== "object") {
    return "Questions output is not a JSON object.";
  }

  const list = json.questions;
  if (!Array.isArray(list) || list.length === 0) {
    return "Questions list must be a non-empty array.";
  }

  const validTypes = ["TECHNICAL", "BEHAVIORAL", "SITUATIONAL"];

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (typeof item.content !== "string" || !item.content.trim()) {
      return `Question content at index ${i} is missing or empty.`;
    }
    if (!validTypes.includes(item.type)) {
      return `Question type at index ${i} is invalid: '${item.type}'. Expected TECHNICAL, BEHAVIORAL, or SITUATIONAL.`;
    }
    if (typeof item.order !== "number" || isNaN(item.order)) {
      return `Question order at index ${i} is missing or not a number.`;
    }
  }

  return null;
}

/**
 * Validates individual answer evaluation format.
 * @param {object} json - The parsed JSON.
 * @returns {string|null} - Error description or null if valid.
 */
export function validateAnswerEvaluation(json) {
  if (!json || typeof json !== "object") {
    return "Answer evaluation is not a valid JSON object.";
  }

  const scoreFields = ["score", "communication", "technicalAccuracy", "confidence"];
  for (const field of scoreFields) {
    const val = json[field];
    if (typeof val !== "number" || isNaN(val) || !Number.isInteger(val) || val < 0 || val > 100) {
      return `Score field '${field}' must be an integer between 0 and 100. Got: ${val}`;
    }
  }

  const arrayFields = ["strengths", "improvements"];
  for (const field of arrayFields) {
    const arr = json[field];
    if (!Array.isArray(arr)) {
      return `Field '${field}' must be an array. Got: ${typeof arr}`;
    }
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== "string") {
        return `Item at index ${i} in field '${field}' is not a string.`;
      }
    }
  }

  if (typeof json.improvedAnswer !== "string") {
    return "Field 'improvedAnswer' must be a string.";
  }

  if (typeof json.feedback !== "string" || !json.feedback.trim()) {
    return "Field 'feedback' must be a non-empty string.";
  }

  return null;
}

/**
 * Validates final session evaluation scorecard.
 * @param {object} json - The parsed JSON.
 * @returns {string|null} - Error description or null if valid.
 */
export function validateSessionEvaluation(json) {
  if (!json || typeof json !== "object") {
    return "Session scorecard is not a valid JSON object.";
  }

  const scoreFields = ["overallScore", "technicalScore", "communicationScore", "confidenceScore"];
  for (const field of scoreFields) {
    const val = json[field];
    if (typeof val !== "number" || isNaN(val) || !Number.isInteger(val) || val < 0 || val > 100) {
      return `Score field '${field}' must be an integer between 0 and 100. Got: ${val}`;
    }
  }

  const arrayFields = ["strengths", "areasToImprove", "nextSteps"];
  for (const field of arrayFields) {
    const arr = json[field];
    if (!Array.isArray(arr)) {
      return `Field '${field}' must be an array. Got: ${typeof arr}`;
    }
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== "string") {
        return `Item at index ${i} in field '${field}' is not a string.`;
      }
    }
  }

  if (typeof json.summary !== "string" || !json.summary.trim()) {
    return "Field 'summary' must be a non-empty string.";
  }

  return null;
}
