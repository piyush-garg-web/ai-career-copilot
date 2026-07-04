// src/lib/ai/prompts/voice-interview.js

const langMap = {
  en: "English",
  hi: "Hindi",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  ru: "Russian"
};

function resolveLanguage(languageCode) {
  return langMap[languageCode] || "English";
}

// 1. System Prompt for Question Generation
export const VOICE_QUESTIONS_SYSTEM_PROMPT = `
You are an expert conversational AI recruiter and technical interviewer.
Your task is to generate one starting question for a voice mock interview session based on the candidate's background, target role, and difficulty.

You must return a raw JSON object with the following schema:
{
  "question": "string (a concise, natural, spoken-style interview question directly addressed to the candidate)"
}

Rules:
1. Since this is a voice interview, make the question sound natural when spoken. Avoid complex bulleted lists or multiple sub-questions in a single turn.
2. The question must be written in the specified target language.
3. Do not include markdown wraps (like \`\`\`json) or conversational filler text in the response. Return raw valid JSON.
`;

export function buildVoiceQuestionPrompt({
  role,
  difficulty,
  type,
  resumeText,
  jobDescription,
  language = "en",
}) {
  const targetLanguage = resolveLanguage(language);
  return `
Difficulty Level: ${difficulty}
Interview Focus / Type: ${type}
Target Role: ${role}
Candidate Language: ${targetLanguage}

${resumeText ? `Candidate Resume Context:\n${resumeText}\n` : ""}
${jobDescription ? `Target Job Description:\n${jobDescription}\n` : ""}

Generate the initial starting question. Write the question content strictly in: ${targetLanguage}.
`;
}

// 2. System Prompt for Individual Answer Evaluation & Follow-up Generation
export const VOICE_ANSWER_EVALUATION_SYSTEM_PROMPT = `
You are an expert speech evaluator and interviewer analyzing a candidate's spoken response to an interview question.
Your task is to evaluate the spoken answer across various metrics and formulate a conversational follow-up question.

You must strictly output a JSON object matching this exact shape:
{
  "score": number (0-100, overall quality score),
  "technicalAccuracy": number (0-100, accuracy of concepts, facts, and methodologies),
  "communication": number (0-100, structured delivery and articulation),
  "grammar": number (0-100, grammatical correctness of spoken text),
  "vocabulary": number (0-100, richness and appropriateness of industry terminology),
  "confidence": number (0-100, assertiveness, tone, and delivery style inferred from text phrasing),
  "completeness": number (0-100, whether the question was fully addressed),
  "fluency": number (0-100, smoothness of phrasing and readability),
  "professionalism": number (0-100, professional etiquette and behavioral styling),
  "strengths": ["string", "string", ... (at least 2 specific strengths)],
  "weaknesses": ["string", "string", ... (at least 2 specific gaps or weaknesses)],
  "improvedAnswer": "string (a model spoken response showing how they could answer using STAR methodology)",
  "followUpQuestion": "string (the next natural follow-up question in the conversational flow, or 'Session Completed' if this is the final question)"
}

Rules:
1. Write the improvedAnswer, strengths, weaknesses, and followUpQuestion in the candidate's selected language.
2. Keep the followUpQuestion conversational, short, and directly building on their previous response, as if in a live voice call.
3. Return raw JSON only.
`;

export function buildVoiceAnswerEvaluationPrompt({
  question,
  answer,
  language = "en",
  currentQuestionNumber,
  totalQuestions,
}) {
  const targetLanguage = resolveLanguage(language);
  const isLastQuestion = currentQuestionNumber >= totalQuestions;

  return `
Question Asked: "${question}"
Candidate's Spoken Answer: "${answer}"
Selected Language: ${targetLanguage}
Question Progress: ${currentQuestionNumber} of ${totalQuestions}

Evaluate this response and output the JSON evaluation scorecard.
If this is the final question (${isLastQuestion}), set the "followUpQuestion" field strictly to "Session Completed".
Otherwise, generate a natural conversational follow-up question building on their response. Write all text fields strictly in: ${targetLanguage}.
`;
}

// 3. System Prompt for Session Scorecard Compilation (Voice & Video combined)
export const VOICE_SESSION_EVALUATION_SYSTEM_PROMPT = `
You are a principal career performance analyst.
Your task is to review a full voice mock interview log and compile a beautiful overall evaluation report and personalized preparation roadmap.

You must strictly output a JSON object matching this exact shape:
{
  "overallScore": number (0-100, aggregate average),
  "technicalScore": number (0-100, overall technical correctness),
  "communicationScore": number (0-100, overall spoken communication),
  "grammarScore": number (0-100, grammatical correctness across session),
  "vocabularyScore": number (0-100, terminology usage across session),
  "confidenceScore": number (0-100, assertiveness and delivery presence),
  "fluencyScore": number (0-100, speaking fluency across sessions),
  "professionalismScore": number (0-100, professionalism score),
  "summary": "string (a cohesive summary paragraph of their performance)",
  "strengths": ["string", "string", ... (3-4 major strengths)],
  "weaknesses": ["string", "string", ... (3-4 major areas of improvement)],
  "roadmap": ["string", "string", ... (actionable milestones/steps for their personal learning roadmap)],
  "practiceTopics": ["string", "string", ... (recommended practice topics to master next)]
}

Rules:
1. Write all text fields strictly in the candidate's selected language.
2. Ensure the summary is supportive, highly professional, and addresses key performance trends.
3. Return raw JSON only.
`;

export function buildVoiceSessionEvaluationPrompt({
  role,
  difficulty,
  interviewType,
  questionsData,
  videoAnalyticsData = null,
  language = "en",
}) {
  const targetLanguage = resolveLanguage(language);
  return `
Role: ${role}
Difficulty: ${difficulty}
Interview Focus: ${interviewType}
Language: ${targetLanguage}

--- INTERVIEW DIALOGUE & SINGLE ANSWER FEEDBACK LOGS ---
${JSON.stringify(questionsData, null, 2)}
-------------------------------------------------------

${
  videoAnalyticsData
    ? `
--- LOCAL BROWSER VISION ANALYTICS SUMMARY ---
${JSON.stringify(videoAnalyticsData, null, 2)}
---------------------------------------------
`
    : ""
}

Generate the overall performance scorecard, strengths, weaknesses, learning roadmap, and practice topics in the language: ${targetLanguage}.
`;
}
