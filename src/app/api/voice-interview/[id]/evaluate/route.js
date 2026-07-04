// src/app/api/voice-interview/[id]/evaluate/route.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { evaluateVoiceAnswer } from "@/lib/ai/services/voice-interview";

export async function POST(req, { params }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id: sessionId } = await params;
    const body = await req.json();
    const { userResponse, currentQuestionNumber, totalQuestions } = body;

    if (!userResponse || typeof userResponse !== "string") {
      return NextResponse.json({ error: "Missing or invalid candidate response." }, { status: 400 });
    }

    // Retrieve corresponding session and questions
    const session = await db.voiceInterviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!session || session.userId !== dbUser.id) {
      return NextResponse.json({ error: "Session not found or access denied." }, { status: 404 });
    }

    const currentQuestion = session.questions.find((q) => q.order === currentQuestionNumber);
    if (!currentQuestion) {
      return NextResponse.json({ error: "Question not found for this turn." }, { status: 404 });
    }

    console.log(`[EVALUATE API]: Evaluating turn ${currentQuestionNumber}/${totalQuestions} for session ${sessionId}`);

    // Call AI to evaluate answer and generate conversational follow-up
    const evaluation = await evaluateVoiceAnswer({
      question: currentQuestion.content,
      answer: userResponse,
      language: session.language,
      currentQuestionNumber,
      totalQuestions,
    });

    const isLastTurn = currentQuestionNumber >= totalQuestions || evaluation.followUpQuestion === "Session Completed";

    // Save answer and transcripts in transaction
    const result = await db.$transaction(async (tx) => {
      // Check if answer already exists for this question
      const existingAnswer = await tx.voiceInterviewAnswer.findUnique({
        where: { questionId: currentQuestion.id },
      });

      // 1. Create or update VoiceInterviewAnswer
      let answer;
      if (existingAnswer) {
        answer = await tx.voiceInterviewAnswer.update({
          where: { questionId: currentQuestion.id },
          data: {
            userResponse: userResponse,
            score: evaluation.score,
            technicalAccuracy: evaluation.technicalAccuracy,
            communication: evaluation.communication,
            grammar: evaluation.grammar,
            vocabulary: evaluation.vocabulary,
            confidence: evaluation.confidence,
            completeness: evaluation.completeness,
            fluency: evaluation.fluency,
            professionalism: evaluation.professionalism,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            improvedAnswer: evaluation.improvedAnswer,
          },
        });
      } else {
        answer = await tx.voiceInterviewAnswer.create({
          data: {
            questionId: currentQuestion.id,
            userResponse: userResponse,
            score: evaluation.score,
            technicalAccuracy: evaluation.technicalAccuracy,
            communication: evaluation.communication,
            grammar: evaluation.grammar,
            vocabulary: evaluation.vocabulary,
            confidence: evaluation.confidence,
            completeness: evaluation.completeness,
            fluency: evaluation.fluency,
            professionalism: evaluation.professionalism,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            improvedAnswer: evaluation.improvedAnswer,
          },
        });
      }

      // 2. Add transcript entry for User response only if it doesn't exist
      const existingUserTranscript = await tx.voiceTranscript.findFirst({
        where: {
          sessionId: session.id,
          speaker: "USER",
          text: userResponse,
        },
        orderBy: { timestamp: "desc" },
      });

      if (!existingUserTranscript) {
        await tx.voiceTranscript.create({
          data: {
            sessionId: session.id,
            speaker: "USER",
            text: userResponse,
          },
        });
      }

      if (isLastTurn) {
        return { completed: true };
      } else {
        const nextOrder = currentQuestionNumber + 1;
        
        // Prevent duplicate question creation if user clicked multiple times
        let nextQuestion = await tx.voiceInterviewQuestion.findFirst({
          where: {
            sessionId: session.id,
            order: nextOrder,
          },
        });

        if (!nextQuestion) {
          nextQuestion = await tx.voiceInterviewQuestion.create({
            data: {
              sessionId: session.id,
              content: evaluation.followUpQuestion,
              order: nextOrder,
            },
          });

          // Add transcript entry for the AI follow-up
          await tx.voiceTranscript.create({
            data: {
              sessionId: session.id,
              speaker: "AI",
              text: evaluation.followUpQuestion,
            },
          });
        }

        return { completed: false, nextQuestion: nextQuestion.content };
      }
    });

    console.log(`[EVALUATE API SUCCESS]: Turn completed. Completed session: ${result.completed}`);

    return NextResponse.json({
      success: true,
      completed: result.completed,
      nextQuestion: result.nextQuestion || null,
      evaluation: {
        score: evaluation.score,
        improvedAnswer: evaluation.improvedAnswer,
        feedback: evaluation.feedback,
      },
    });
  } catch (error) {
    console.error("[VOICE ANSWER EVALUATION API EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate answer." },
      { status: 500 }
    );
  }
}
