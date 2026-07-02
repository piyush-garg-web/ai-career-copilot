import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { evaluateCandidateAnswer } from "@/lib/ai/services/interview";

/**
 * POST /api/interviews/[id]/answer
 * Submits the candidate's answer for a question, evaluates it with Gemini, and records results.
 */
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
      return NextResponse.json({ error: "Unauthorized - User record not found" }, { status: 401 });
    }

    // Resolve dynamic params asynchronously as required by Next.js 15
    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session identifier." }, { status: 400 });
    }

    const { questionId, content } = await req.json();

    if (!questionId) {
      return NextResponse.json({ error: "Missing question identifier." }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Answer content cannot be empty." }, { status: 400 });
    }

    // Find and verify session ownership
    const session = await db.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== dbUser.id) {
      return NextResponse.json({ error: "Interview session not found or access denied." }, { status: 404 });
    }

    // Find and verify question belongs to session
    const question = await db.interviewQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question || question.sessionId !== session.id) {
      return NextResponse.json({ error: "Question not found or does not belong to this session." }, { status: 404 });
    }

    console.log(`[EVALUATE API]: Evaluating answer for Question: "${question.content.substring(0, 40)}..."`);

    // Call AI single-answer evaluation service
    const evaluation = await evaluateCandidateAnswer(
      question.content,
      question.questionType,
      content.trim()
    );

    // Save answer evaluation in database using upsert
    const answer = await db.interviewAnswer.upsert({
      where: { questionId: question.id },
      update: {
        content: content.trim(),
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvedAnswer: evaluation.improvedAnswer,
        analysis: {
          communication: evaluation.communication,
          technicalAccuracy: evaluation.technicalAccuracy,
          confidence: evaluation.confidence,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
        },
      },
      create: {
        questionId: question.id,
        content: content.trim(),
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvedAnswer: evaluation.improvedAnswer,
        analysis: {
          communication: evaluation.communication,
          technicalAccuracy: evaluation.technicalAccuracy,
          confidence: evaluation.confidence,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
        },
      },
    });

    console.log(`[EVALUATE API SUCCESS]: Recorded evaluation ID: ${answer.id} with score: ${evaluation.score}%`);

    return NextResponse.json({
      success: true,
      evaluation: {
        score: evaluation.score,
        communication: evaluation.communication,
        technicalAccuracy: evaluation.technicalAccuracy,
        confidence: evaluation.confidence,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        improvedAnswer: evaluation.improvedAnswer,
        feedback: evaluation.feedback,
      },
    });
  } catch (error) {
    console.error("[ANSWER EVALUATION ROUTE EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate candidate answer." },
      { status: 500 }
    );
  }
}
