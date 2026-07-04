// src/app/api/voice-interview/[id]/route.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { compileVoiceSessionScorecard } from "@/lib/ai/services/voice-interview";

// GET /api/voice-interview/[id]
export async function GET(req, { params }) {
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

    const session = await db.voiceInterviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          include: { answer: true },
          orderBy: { order: "asc" },
        },
        analytics: true,
        transcripts: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!session || session.userId !== dbUser.id) {
      return NextResponse.json({ error: "Session not found or access denied." }, { status: 404 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("[VOICE SESSION GET EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch voice interview session." },
      { status: 500 }
    );
  }
}

// PUT /api/voice-interview/[id] (Finalizes / Updates Session Status)
export async function PUT(req, { params }) {
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
    const { status, finalSpeechStats = {}, finalVideoStats = {} } = body;

    // Fetch existing session
    const session = await db.voiceInterviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          include: { answer: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!session || session.userId !== dbUser.id) {
      return NextResponse.json({ error: "Session not found or access denied." }, { status: 404 });
    }

    if (status === "ABANDONED") {
      await db.voiceInterviewSession.update({
        where: { id: sessionId },
        data: { status: "ABANDONED" },
      });
      return NextResponse.json({ success: true, status: "ABANDONED" });
    }

    if (status === "COMPLETED") {
      console.log(`[VOICE INTERVIEW COMPILATION]: Compiling scores for Session ${sessionId}`);

      // 1. Gather dialogue logs to send to Gemini
      const dialogData = session.questions.map((q) => ({
        question: q.content,
        answer: q.answer?.userResponse || "No answer provided.",
        evaluation: q.answer
          ? {
              score: q.answer.score,
              technicalAccuracy: q.answer.technicalAccuracy,
              communication: q.answer.communication,
              grammar: q.answer.grammar,
              vocabulary: q.answer.vocabulary,
              confidence: q.answer.confidence,
              completeness: q.answer.completeness,
              fluency: q.answer.fluency,
              professionalism: q.answer.professionalism,
            }
          : null,
      }));

      // 2. Prepare client-derived vision analytics if video was enabled
      let visionSummary = null;
      if (session.videoEnabled && finalVideoStats) {
        visionSummary = {
          eyeContactScore: Math.round(finalVideoStats.eyeContactScore) || null,
          postureScore: Math.round(finalVideoStats.postureScore) || null,
          attentionScore: Math.round(finalVideoStats.attentionScore) || null,
          lightingScore: Math.round(finalVideoStats.lightingScore) || null,
          faceCenteringScore: Math.round(finalVideoStats.faceCenteringScore) || null,
          cameraPresenceScore: Math.round(finalVideoStats.cameraPresenceScore) || null,
          engagementScore: Math.round(finalVideoStats.engagementScore) || null,
          faceDetectionPercentage: parseFloat(finalVideoStats.faceDetectionPercentage) || null,
          lookingAwayFrequency: parseFloat(finalVideoStats.lookingAwayFrequency) || null,
          smileCount: parseInt(finalVideoStats.smileCount, 10) || null,
          shoulderAlignmentScore: Math.round(finalVideoStats.shoulderAlignmentScore) || null,
          bodyStabilityScore: Math.round(finalVideoStats.bodyStabilityScore) || null,
          screenEngagementScore: Math.round(finalVideoStats.screenEngagementScore) || null,
          cameraDistanceScore: Math.round(finalVideoStats.cameraDistanceScore) || null,
          blinkFrequency: parseFloat(finalVideoStats.blinkFrequency) || null,
        };
      }

      // 3. Call Gemini to compile final scorecard & roadmap
      const evaluation = await compileVoiceSessionScorecard({
        role: session.role,
        difficulty: session.difficulty,
        interviewType: session.interviewType,
        questionsData: dialogData,
        videoAnalyticsData: visionSummary,
        language: session.language,
      });

      // 4. Save analytics & update session in database using transaction
      await db.$transaction(async (tx) => {
        // Upsert VoiceInterviewAnalytics
        await tx.voiceInterviewAnalytics.upsert({
          where: { sessionId: session.id },
          update: {
            speakingSpeed: parseFloat(finalSpeechStats.speakingSpeed) || undefined,
            wordsPerMinute: parseFloat(finalSpeechStats.wordsPerMinute) || undefined,
            avgPause: parseFloat(finalSpeechStats.avgPause) || undefined,
            longestPause: parseFloat(finalSpeechStats.longestPause) || undefined,
            responseTime: parseFloat(finalSpeechStats.responseTime) || undefined,
            thinkingTime: parseFloat(finalSpeechStats.thinkingTime) || undefined,
            fillerWords: finalSpeechStats.fillerWords || undefined,
            grammarScore: evaluation.grammarScore,
            vocabularyScore: evaluation.vocabularyScore,
            communicationScore: evaluation.communicationScore,
            technicalScore: evaluation.technicalScore,
            confidenceScore: evaluation.confidenceScore,
            speechAccuracy: parseFloat(finalSpeechStats.speechAccuracy) || 85.0,
            fluency: parseFloat(finalSpeechStats.fluency) || evaluation.fluencyScore,
            
            // Video analytics
            eyeContactScore: visionSummary?.eyeContactScore,
            postureScore: visionSummary?.postureScore,
            attentionScore: visionSummary?.attentionScore,
            lightingScore: visionSummary?.lightingScore,
            faceCenteringScore: visionSummary?.faceCenteringScore,
            cameraPresenceScore: visionSummary?.cameraPresenceScore,
            engagementScore: visionSummary?.engagementScore,
            faceDetectionPercentage: visionSummary?.faceDetectionPercentage,
            lookingAwayFrequency: visionSummary?.lookingAwayFrequency,
            smileCount: visionSummary?.smileCount,
            shoulderAlignmentScore: visionSummary?.shoulderAlignmentScore,
            bodyStabilityScore: visionSummary?.bodyStabilityScore,
            screenEngagementScore: visionSummary?.screenEngagementScore,
            cameraDistanceScore: visionSummary?.cameraDistanceScore,
            blinkFrequency: visionSummary?.blinkFrequency,
          },
          create: {
            sessionId: session.id,
            speakingSpeed: parseFloat(finalSpeechStats.speakingSpeed) || null,
            wordsPerMinute: parseFloat(finalSpeechStats.wordsPerMinute) || null,
            avgPause: parseFloat(finalSpeechStats.avgPause) || null,
            longestPause: parseFloat(finalSpeechStats.longestPause) || null,
            responseTime: parseFloat(finalSpeechStats.responseTime) || null,
            thinkingTime: parseFloat(finalSpeechStats.thinkingTime) || null,
            fillerWords: finalSpeechStats.fillerWords || null,
            grammarScore: evaluation.grammarScore || null,
            vocabularyScore: evaluation.vocabularyScore || null,
            communicationScore: evaluation.communicationScore || null,
            technicalScore: evaluation.technicalScore || null,
            confidenceScore: evaluation.confidenceScore || null,
            speechAccuracy: parseFloat(finalSpeechStats.speechAccuracy) || 85.0,
            fluency: parseFloat(finalSpeechStats.fluency) || evaluation.fluencyScore || 80.0,

            // Video analytics
            eyeContactScore: visionSummary?.eyeContactScore,
            postureScore: visionSummary?.postureScore,
            attentionScore: visionSummary?.attentionScore,
            lightingScore: visionSummary?.lightingScore,
            faceCenteringScore: visionSummary?.faceCenteringScore,
            cameraPresenceScore: visionSummary?.cameraPresenceScore,
            engagementScore: visionSummary?.engagementScore,
            faceDetectionPercentage: visionSummary?.faceDetectionPercentage,
            lookingAwayFrequency: visionSummary?.lookingAwayFrequency,
            smileCount: visionSummary?.smileCount,
            shoulderAlignmentScore: visionSummary?.shoulderAlignmentScore,
            bodyStabilityScore: visionSummary?.bodyStabilityScore,
            screenEngagementScore: visionSummary?.screenEngagementScore,
            cameraDistanceScore: visionSummary?.cameraDistanceScore,
            blinkFrequency: visionSummary?.blinkFrequency,
          },
        });

        // Update session info
        await tx.voiceInterviewSession.update({
          where: { id: session.id },
          data: {
            status: "COMPLETED",
            overallScore: evaluation.overallScore,
            feedback: evaluation.summary,
            roadmap: {
              strengths: evaluation.strengths,
              weaknesses: evaluation.weaknesses,
              milestones: evaluation.roadmap,
              practiceTopics: evaluation.practiceTopics,
            },
            completedAt: new Date(),
          },
        });
      });

      console.log(`[VOICE INTERVIEW COMPLETED]: Session ${sessionId} compiled successfully.`);
      return NextResponse.json({ success: true, status: "COMPLETED" });
    }

    return NextResponse.json({ error: "Invalid status parameters." }, { status: 400 });
  } catch (error) {
    console.error("[VOICE SESSION PUT EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update voice interview session." },
      { status: 500 }
    );
  }
}

// DELETE /api/voice-interview/[id]
export async function DELETE(req, { params }) {
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

    const session = await db.voiceInterviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== dbUser.id) {
      return NextResponse.json({ error: "Session not found or access denied." }, { status: 404 });
    }

    await db.voiceInterviewSession.delete({
      where: { id: sessionId },
    });

    console.log(`[VOICE INTERVIEW DELETE SUCCESS]: Session ${sessionId} removed.`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VOICE SESSION DELETE EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete voice interview session." },
      { status: 500 }
    );
  }
}
