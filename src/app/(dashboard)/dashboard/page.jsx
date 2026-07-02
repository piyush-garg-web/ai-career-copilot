import React from "react";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { DashboardClientView } from "@/components/dashboard/dashboard-client-view";

export const revalidate = 0; // Disable server cache to ensure fresh DB loads

export const metadata = {
  title: "Dashboard | AI Career Copilot",
  description: "Get a comprehensive overview of your resume metrics, ATS readiness scores, and AI mock interview practice stats.",
};


// Helper to format relative time in Node.js
function formatRelativeTime(date) {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return new Date(date).toLocaleDateString();
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  // Fetch or create user record
  let dbUser = await db.user.findUnique({
    where: { clerkId },
  });

  if (!dbUser) {
    const user = await currentUser();
    if (user) {
      const email = user.emailAddresses?.[0]?.email_address;
      if (email) {
        dbUser = await db.user.create({
          data: {
            clerkId,
            email,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            imageUrl: user.imageUrl || null,
          },
        });
      }
    }
  }

  if (!dbUser) {
    redirect("/resume");
  }

  // 1. Fetch resumes to calculate resumeScore & atsScore
  const resumes = await db.resume.findMany({
    where: { userId: dbUser.id },
    include: { analysis: true },
    orderBy: { createdAt: "desc" },
  });

  const latestAnalyzedResume = resumes.find(r => r.status === "ANALYZED" && r.analysis);
  const resumeScore = latestAnalyzedResume ? latestAnalyzedResume.analysis.overallScore : 0;
  const atsScore = latestAnalyzedResume ? latestAnalyzedResume.analysis.atsScore : 0;

  // 2. Fetch latest JobMatch record
  const latestMatch = await db.jobMatch.findFirst({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });
  const jobMatchScore = latestMatch ? latestMatch.matchScore : 0;

  // 3. Fetch latest completed InterviewSession record
  const latestInterview = await db.interviewSession.findFirst({
    where: { userId: dbUser.id, status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
  });
  const interviewScore = latestInterview ? latestInterview.overallScore || 0 : 0;

  // Calculate Profile Completion %
  const profileFields = ["bio", "location", "linkedinUrl", "targetRole", "targetIndustry", "experienceLevel", "careerGoals"];
  const filledFields = profileFields.filter(f => dbUser[f]);
  const profileCompletion = Math.round((filledFields.length / profileFields.length) * 100);

  // Resume Uploaded & Last Analyzed metadata
  const resumeUploadedDate = resumes[0] ? formatRelativeTime(resumes[0].createdAt) : "No uploads yet";
  const lastAnalyzedResumeName = latestAnalyzedResume ? latestAnalyzedResume.fileName : "None";

  // Parse Suggestions from Latest Resume Analysis
  let suggestions = [];
  if (latestAnalyzedResume && latestAnalyzedResume.analysis) {
    const rawSuggestions = latestAnalyzedResume.analysis.suggestions;
    if (Array.isArray(rawSuggestions)) {
      suggestions = rawSuggestions.slice(0, 3);
    } else if (typeof rawSuggestions === "object" && rawSuggestions !== null) {
      suggestions = Object.values(rawSuggestions).slice(0, 3);
    } else if (typeof rawSuggestions === "string") {
      try {
        suggestions = JSON.parse(rawSuggestions).slice(0, 3);
      } catch (e) {
        suggestions = [rawSuggestions];
      }
    }
  }

  // Fallback default suggestions if empty
  if (suggestions.length === 0) {
    suggestions = [
      "Upload your first resume to get detailed AI feedback suggestions.",
      "Practice mock interviews to get targeted responses recommendations.",
      "Match against jobs to find technical capability gaps.",
    ];
  }

  // Compile Dynamic Quick Insights
  const insights = [];
  if (atsScore > 0 && atsScore < 80) {
    insights.push("Improve ATS score by adding missing keywords highlighted in your report.");
  } else if (atsScore >= 80) {
    insights.push("ATS score is optimized! Continue matching to job descriptions to find custom gaps.");
  }
  if (interviewScore === 0) {
    insights.push("Practice mock interviews to evaluate technical delivery and confidence levels.");
  } else if (interviewScore < 80) {
    insights.push("Strengthen problem-solving keywords in answers to raise interview index.");
  }
  if (jobMatchScore > 0 && jobMatchScore < 70) {
    insights.push("Customize your resume projects to better align with job requirements.");
  }
  if (insights.length < 3) {
    insights.push("Quantify resume bullet achievements with metrics and technical details.");
  }

  // Format stats payload
  const stats = [
    {
      title: "Resume Score",
      value: resumeScore > 0 ? String(resumeScore) : "0",
      max: "100",
      change: resumeScore > 0 ? "Latest resume optimization" : "No resume analyzed yet",
      trend: resumeScore > 0 ? "up" : "neutral",
      progress: resumeScore,
    },
    {
      title: "ATS Score",
      value: atsScore > 0 ? String(atsScore) : "0",
      max: "100",
      change: atsScore >= 80 ? "Strong ATS compatibility" : atsScore > 0 ? "Needs keyword booster" : "Pending analysis",
      trend: atsScore > 0 ? "up" : "neutral",
      progress: atsScore,
    },
    {
      title: "Job Match %",
      value: jobMatchScore > 0 ? `${jobMatchScore}%` : "0%",
      max: null,
      change: jobMatchScore > 0 ? "Match compatibility scan" : "No match scan run",
      trend: "neutral",
      progress: jobMatchScore,
    },
    {
      title: "Interview Score",
      value: interviewScore > 0 ? String(interviewScore) : "0",
      max: "100",
      change: interviewScore >= 80 ? "Excellent response quality" : interviewScore > 0 ? "Requires coaching practice" : "No coach session completed",
      trend: interviewScore > 0 ? "up" : "neutral",
      progress: interviewScore,
    },
  ];

  // 4. Build Recent Activity Feed from Database
  const activityLogs = [];

  // Resume activities
  resumes.slice(0, 5).forEach((res) => {
    if (res.status === "ANALYZED" && res.analysis) {
      activityLogs.push({
        id: `resume-analyzed-${res.id}`,
        refId: res.id,
        type: "resume",
        title: "Resume Analyzed",
        description: `Scorecard computed for "${res.fileName}". Score: ${res.analysis.overallScore}/100.`,
        time: formatRelativeTime(res.updatedAt),
        rawTime: new Date(res.updatedAt).getTime(),
      });
    } else if (res.status === "PARSED") {
      activityLogs.push({
        id: `resume-parsed-${res.id}`,
        refId: res.id,
        type: "resume",
        title: "Resume Parsed",
        description: `Content extracted from "${res.fileName}". Ready for analysis.`,
        time: formatRelativeTime(res.updatedAt),
        rawTime: new Date(res.updatedAt).getTime(),
      });
    }
  });

  // Job Match activities
  const recentMatches = await db.jobMatch.findMany({
    where: { userId: dbUser.id },
    include: { jobDescription: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  recentMatches.forEach((match) => {
    activityLogs.push({
      id: `match-${match.id}`,
      refId: match.id,
      type: "match",
      title: "Job Match Scanned",
      description: `Matched against "${match.jobDescription.company || "Target Job"}". Alignment: ${match.matchScore}%.`,
      time: formatRelativeTime(match.createdAt),
      rawTime: new Date(match.createdAt).getTime(),
    });
  });

  // Interview activities
  const recentInterviews = await db.interviewSession.findMany({
    where: { userId: dbUser.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  recentInterviews.forEach((session) => {
    if (session.status === "COMPLETED") {
      activityLogs.push({
        id: `interview-${session.id}`,
        refId: session.id,
        type: "interview",
        title: "Interview Completed",
        description: `Practice session for "${session.role}" graded. Score: ${session.overallScore || 0}%.`,
        time: formatRelativeTime(session.updatedAt),
        rawTime: new Date(session.updatedAt).getTime(),
      });
    } else if (session.status === "ACTIVE") {
      activityLogs.push({
        id: `interview-${session.id}`,
        refId: session.id,
        type: "interview",
        title: "Interview Started",
        description: `Coaching session for "${session.role}" is currently active.`,
        time: formatRelativeTime(session.updatedAt),
        rawTime: new Date(session.updatedAt).getTime(),
      });
    }
  });

  // Sort merged list by descending timestamp and limit to 4
  const sortedActivities = activityLogs
    .sort((a, b) => b.rawTime - a.rawTime)
    .slice(0, 4);

  // Fetch existing review if any
  const userReview = await db.review.findFirst({
    where: { userId: dbUser.id },
  });

  return (
    <DashboardClientView
      stats={stats}
      activities={sortedActivities}
      userFirstName={dbUser.firstName}
      profileCompletion={profileCompletion}
      resumeUploadedDate={resumeUploadedDate}
      lastAnalyzedResumeName={lastAnalyzedResumeName}
      suggestions={suggestions}
      insights={insights}
      initialReview={userReview}
    />
  );
}
