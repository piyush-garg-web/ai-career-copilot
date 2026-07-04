// src/lib/ai/validators/voice-interview.js

/**
 * Validates generated starting voice question.
 * @param {object} json - Parsed JSON object.
 * @returns {string|null} - Error description or null if valid.
 */
export function validateVoiceQuestion(json) {
  if (!json || typeof json !== "object") {
    return "Question output is not a JSON object.";
  }
  if (typeof json.question !== "string" || !json.question.trim()) {
    return "Field 'question' is missing or not a non-empty string.";
  }
  return null;
}

/**
 * Validates single conversational answer evaluation.
 * @param {object} json - Parsed JSON object.
 * @returns {string|null} - Error description or null if valid.
 */
export function validateVoiceAnswerEvaluation(json) {
  if (!json || typeof json !== "object") {
    return "Answer evaluation is not a valid JSON object.";
  }

  const scoreFields = [
    "score",
    "technicalAccuracy",
    "communication",
    "grammar",
    "vocabulary",
    "confidence",
    "completeness",
    "fluency",
    "professionalism"
  ];

  for (const field of scoreFields) {
    const val = json[field];
    if (typeof val !== "number" || isNaN(val) || !Number.isInteger(val) || val < 0 || val > 100) {
      return `Score field '${field}' must be an integer between 0 and 100. Got: ${val}`;
    }
  }

  const arrayFields = ["strengths", "weaknesses"];
  for (const field of arrayFields) {
    const arr = json[field];
    if (!Array.isArray(arr)) {
      return `Field '${field}' must be an array. Got: ${typeof arr}`;
    }
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== "string" || !arr[i].trim()) {
        return `Item at index ${i} in field '${field}' must be a non-empty string.`;
      }
    }
  }

  if (typeof json.improvedAnswer !== "string" || !json.improvedAnswer.trim()) {
    return "Field 'improvedAnswer' must be a non-empty string.";
  }

  if (typeof json.followUpQuestion !== "string" || !json.followUpQuestion.trim()) {
    return "Field 'followUpQuestion' must be a non-empty string.";
  }

  return null;
}

/**
 * Validates final session scorecard.
 * @param {object} json - Parsed JSON object.
 * @returns {string|null} - Error description or null if valid.
 */
export function validateVoiceSessionEvaluation(json) {
  if (!json || typeof json !== "object") {
    return "Session evaluation is not a valid JSON object.";
  }

  const scoreFields = [
    "overallScore",
    "technicalScore",
    "communicationScore",
    "grammarScore",
    "vocabularyScore",
    "confidenceScore",
    "fluencyScore",
    "professionalismScore"
  ];

  for (const field of scoreFields) {
    const val = json[field];
    if (typeof val !== "number" || isNaN(val) || !Number.isInteger(val) || val < 0 || val > 100) {
      return `Score field '${field}' must be an integer between 0 and 100. Got: ${val}`;
    }
  }

  const arrayFields = ["strengths", "weaknesses", "roadmap", "practiceTopics"];
  for (const field of arrayFields) {
    const arr = json[field];
    if (!Array.isArray(arr)) {
      return `Field '${field}' must be an array. Got: ${typeof arr}`;
    }
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== "string" || !arr[i].trim()) {
        return `Item at index ${i} in field '${field}' must be a non-empty string.`;
      }
    }
  }

  if (typeof json.summary !== "string" || !json.summary.trim()) {
    return "Field 'summary' must be a non-empty string.";
  }

  return null;
}
