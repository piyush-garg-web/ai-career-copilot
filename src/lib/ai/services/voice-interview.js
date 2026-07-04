// src/lib/ai/services/voice-interview.js

import { generateJSONContent } from "../service";
import {
  VOICE_QUESTIONS_SYSTEM_PROMPT,
  buildVoiceQuestionPrompt,
  VOICE_ANSWER_EVALUATION_SYSTEM_PROMPT,
  buildVoiceAnswerEvaluationPrompt,
  VOICE_SESSION_EVALUATION_SYSTEM_PROMPT,
  buildVoiceSessionEvaluationPrompt,
} from "../prompts/voice-interview";
import {
  validateVoiceQuestion,
  validateVoiceAnswerEvaluation,
  validateVoiceSessionEvaluation,
} from "../validators/voice-interview";

/**
 * Generates the initial starting question for a voice mock interview.
 */
export async function generateVoiceQuestion({
  role,
  difficulty,
  type,
  resumeText,
  jobDescription,
  language = "en",
}) {
  const prompt = buildVoiceQuestionPrompt({
    role,
    difficulty,
    type,
    resumeText,
    jobDescription,
    language,
  });

  console.log(`[VOICE INTERVIEW SERVICE]: Generating starting question for Role: ${role}, Focus: ${type}, Lang: ${language}`);

  return await generateJSONContent({
    prompt,
    systemInstruction: VOICE_QUESTIONS_SYSTEM_PROMPT,
    validator: validateVoiceQuestion,
    temperature: 0.3, // slightly conversational
    maxTokens: 1024,
    cacheContext: null, // Avoid caching voice questions to keep it dynamic and unique per session
  });
}

/**
 * Evaluates a single conversational answer and generates the next follow-up.
 */
export async function evaluateVoiceAnswer({
  question,
  answer,
  language = "en",
  currentQuestionNumber,
  totalQuestions,
}) {
  const prompt = buildVoiceAnswerEvaluationPrompt({
    question,
    answer,
    language,
    currentQuestionNumber,
    totalQuestions,
  });

  console.log(`[VOICE INTERVIEW SERVICE]: Evaluating spoken answer. Turn: ${currentQuestionNumber}/${totalQuestions}`);

  return await generateJSONContent({
    prompt,
    systemInstruction: VOICE_ANSWER_EVALUATION_SYSTEM_PROMPT,
    validator: validateVoiceAnswerEvaluation,
    temperature: 0.1, // low temperature for grading consistency
    maxTokens: 2048,
    cacheContext: {
      feature: "interview-evaluation",
      questionContent: question,
      userAnswer: answer,
    },
  });
}

/**
 * Compiles the final report scorecard (with combined voice and local vision parameters).
 */
export async function compileVoiceSessionScorecard({
  role,
  difficulty,
  interviewType,
  questionsData,
  videoAnalyticsData = null,
  language = "en",
}) {
  const prompt = buildVoiceSessionEvaluationPrompt({
    role,
    difficulty,
    interviewType,
    questionsData,
    videoAnalyticsData,
    language,
  });

  console.log(`[VOICE INTERVIEW SERVICE]: Compiling final scorecard report for Role: ${role}`);

  return await generateJSONContent({
    prompt,
    systemInstruction: VOICE_SESSION_EVALUATION_SYSTEM_PROMPT,
    validator: validateVoiceSessionEvaluation,
    temperature: 0.15,
    maxTokens: 3072,
    cacheContext: null,
  });
}
