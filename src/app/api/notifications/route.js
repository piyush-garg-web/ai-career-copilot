import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * GET /api/notifications
 * Generates dynamic notifications from DB records.
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      return NextResponse.json([]);
    }

    const notifications = [];

    // 1. Fetch Resumes (Analyzed)
    const resumes = await db.resume.findMany({
      where: { userId: dbUser.id, status: "ANALYZED" },
      include: { analysis: true },
      orderBy: { updatedAt: "desc" },
      take: 3,
    });

    resumes.forEach((res) => {
      if (res.analysis) {
        notifications.push({
          id: `notif-resume-${res.id}`,
          title: "Resume Analyzed",
          description: `"${res.fileName}" optimization scorecard is ready. Score: ${res.analysis.overallScore}/100.`,
          time: res.updatedAt,
          type: "resume",
          link: `/resume/analysis?id=${res.id}`,
        });
      }
    });

    // 2. Fetch Job Matches
    const matches = await db.jobMatch.findMany({
      where: { userId: dbUser.id },
      include: { jobDescription: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    matches.forEach((m) => {
      notifications.push({
        id: `notif-match-${m.id}`,
        title: "Job Match Completed",
        description: `Matched against "${m.jobDescription.company || "Target Job"}". Compatibility: ${m.matchScore}%.`,
        time: m.createdAt,
        type: "match",
        link: `/job-match`,
      });
    });

    // 3. Fetch Interview Sessions (Completed)
    const sessions = await db.interviewSession.findMany({
      where: { userId: dbUser.id, status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      take: 3,
    });

    sessions.forEach((s) => {
      notifications.push({
        id: `notif-interview-${s.id}`,
        title: "Interview Completed",
        description: `Mock practice for "${s.role}" evaluated. Grade: ${s.overallScore || 0}%.`,
        time: s.updatedAt,
        type: "interview",
        link: `/interview/history`,
      });
    });

    // Sort by time desc
    const sorted = notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("[GET_NOTIFICATIONS_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
