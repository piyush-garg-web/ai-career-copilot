import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { compileSessionScorecard } from "@/lib/ai/services/interview";

/**
 * POST /api/interviews/[id]/complete
 * Compiles overall interview mock feedback metrics and closes the session as COMPLETED.
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

    // Optional duration from request body
    const { duration } = await req.json().catch(() => ({}));

    // Find and verify session
    const session = await db.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== dbUser.id) {
      return NextResponse.json({ error: "Interview session not found or access denied." }, { status: 404 });
    }

    // Retrieve all questions and answers in session
    const questions = await db.interviewQuestion.findMany({
      where: { sessionId: session.id },
      include: { answer: true },
      orderBy: { order: "asc" },
    });

    // Prepare transcript log summary for AI coaching compiler
    const dialogueLogs = questions.map((q) => {
      const ans = q.answer || {};
      const analysis = ans.analysis || {};
      return {
        order: q.order,
        type: q.questionType,
        question: q.content,
        answer: ans.content || "(Candidate did not submit an answer)",
        score: ans.score || 0,
        feedback: ans.feedback || "No feedback generated.",
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
      };
    });

    console.log(`[COMPLETE SESSION API]: Requesting final scorecard compilation for Session: ${sessionId}`);

    // Call AI Session compiler
    const scorecard = await compileSessionScorecard(
      session.role,
      session.difficulty,
      dialogueLogs,
      dbUser.aiPreferences || {}
    );

    // Save final report card in InterviewSession
    await db.interviewSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        overallScore: scorecard.overallScore,
        categoryScores: {
          technicalScore: scorecard.technicalScore,
          communicationScore: scorecard.communicationScore,
          confidenceScore: scorecard.confidenceScore,
        },
        evaluation: {
          strengths: scorecard.strengths,
          areasToImprove: scorecard.areasToImprove,
          nextSteps: scorecard.nextSteps,
        },
        feedback: scorecard.summary,
        duration: parseInt(duration, 10) || null,
        completedAt: new Date(),
      },
    });

    console.log(`[COMPLETE SESSION API SUCCESS]: Closed session ${session.id} with final score: ${scorecard.overallScore}%`);

    return NextResponse.json({
      success: true,
      message: "Session evaluation successfully compiled and recorded.",
    });
  } catch (error) {
    console.error("[COMPLETE INTERVIEW SESSION EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to finalize and evaluate interview session." },
      { status: 500 }
    );
  }
}
