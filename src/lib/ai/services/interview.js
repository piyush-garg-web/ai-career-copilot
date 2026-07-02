import { generateJSONContent } from "../service";
import {
  INTERVIEW_QUESTIONS_SYSTEM_PROMPT,
  buildQuestionsPrompt,
  ANSWER_EVALUATION_SYSTEM_PROMPT,
  buildAnswerEvaluationPrompt,
  SESSION_EVALUATION_SYSTEM_PROMPT,
  buildSessionEvaluationPrompt,
} from "../prompts/interview";
import {
  validateGeneratedQuestions,
  validateAnswerEvaluation,
  validateSessionEvaluation,
} from "../validators/interview";

/**
 * Generates personalized interview questions based on the candidate's resume and job target.
 */
export async function generateInterviewQuestions({
  rawText,
  parsedData,
  analysis,
  jobDescription,
  type,
  difficulty,
  count,
}) {
  const prompt = buildQuestionsPrompt({
    rawText,
    parsedData,
    analysis,
    jobDescription,
    type,
    difficulty,
    count,
  });

  console.log(`[INTERVIEW SERVICE]: Generating ${count} mock questions of type: ${type}`);

  return await generateJSONContent({
    prompt,
    systemInstruction: INTERVIEW_QUESTIONS_SYSTEM_PROMPT,
    validator: validateGeneratedQuestions,
    temperature: 0.25, // Slightly higher temperature for creative scenarios
    maxTokens: 4096,
  });
}

/**
 * Evaluates a single answer submitted by the candidate.
 */
export async function evaluateCandidateAnswer(questionContent, questionType, userAnswer) {
  const prompt = buildAnswerEvaluationPrompt(questionContent, questionType, userAnswer);

  console.log(`[INTERVIEW SERVICE]: Evaluating answer for question type: ${questionType}`);

  return await generateJSONContent({
    prompt,
    systemInstruction: ANSWER_EVALUATION_SYSTEM_PROMPT,
    validator: validateAnswerEvaluation,
    temperature: 0.1, // low temperature for grading consistency
    maxTokens: 2048,
  });
}

/**
 * Compiles final feedback scorecard for the mock interview session.
 */
export async function compileSessionScorecard(roleName, difficulty, questionData) {
  const prompt = buildSessionEvaluationPrompt(roleName, difficulty, questionData);

  console.log(`[INTERVIEW SERVICE]: Compiling final report for role: ${roleName}`);

  return await generateJSONContent({
    prompt,
    systemInstruction: SESSION_EVALUATION_SYSTEM_PROMPT,
    validator: validateSessionEvaluation,
    temperature: 0.15,
    maxTokens: 3072,
  });
}
