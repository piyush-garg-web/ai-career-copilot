// src/app/(dashboard)/voice-mock-interview/page.jsx

import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { VoiceInterviewClient } from "@/components/voice-interview/voice-interview-client";

export const revalidate = 0; // Disable server cache for real-time history/analytics

export const metadata = {
  title: "AI Voice Mock Interview | CareerCopilot",
  description: "Practice interactive mock interviews with natural AI speech synthesis, speech recognition, and visual analytics.",
};

export default async function VoiceMockInterviewPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  // Fetch DB User
  const dbUser = await db.user.findUnique({
    where: { clerkId },
  });

  if (!dbUser) {
    redirect("/resume");
  }

  // 1. Fetch user's resumes
  const resumes = await db.resume.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch user's job descriptions
  const jds = await db.jobDescription.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch voice mock interview sessions
  const sessions = await db.voiceInterviewSession.findMany({
    where: { userId: dbUser.id },
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
    orderBy: { createdAt: "desc" },
  });

  // 4. Calculate overall voice statistics
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED" && s.overallScore !== null);
  const totalInterviews = completedSessions.length;

  let averageScore = 0;
  let bestScore = 0;
  let totalPracticeTimeMins = 0;
  let voiceReadinessScore = 0;
  let lastInterviewDate = "N/A";

  if (totalInterviews > 0) {
    const scores = completedSessions.map((s) => s.overallScore);
    averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / totalInterviews);
    bestScore = Math.max(...scores);

    // Estimate duration: sum of session duration settings
    totalPracticeTimeMins = completedSessions.reduce((sum, s) => sum + (s.duration || 15), 0);

    // Get last interview date relative string
    const lastSession = completedSessions[0];
    lastInterviewDate = new Date(lastSession.completedAt || lastSession.updatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Voice readiness score = weighted combination of confidence, communication, and grammar
    const confidenceSum = completedSessions.reduce((sum, s) => sum + (s.analytics?.confidenceScore || 80), 0);
    const commsSum = completedSessions.reduce((sum, s) => sum + (s.analytics?.communicationScore || 80), 0);
    const grammarSum = completedSessions.reduce((sum, s) => sum + (s.analytics?.grammarScore || 80), 0);
    voiceReadinessScore = Math.round((confidenceSum + commsSum + grammarSum) / (3 * totalInterviews));
  }

  // Look for any active/incomplete voice session to support "Continue last interview"
  const activeSession = sessions.find((s) => s.status === "ACTIVE");

  const stats = {
    totalInterviews,
    averageScore,
    bestScore,
    totalPracticeTime: `${totalPracticeTimeMins} mins`,
    lastInterviewDate,
    voiceReadinessScore: voiceReadinessScore || 0,
  };

  return (
    <div className="container mx-auto py-4">
      <VoiceInterviewClient
        resumes={resumes}
        jds={jds}
        sessions={sessions}
        stats={stats}
        activeSession={activeSession ? {
          id: activeSession.id,
          title: activeSession.title,
          firstQuestion: activeSession.questions[0]?.content || "Please introduce yourself.",
          totalQuestions: activeSession.duration,
          videoEnabled: activeSession.videoEnabled,
        } : null}
      />
    </div>
  );
}
