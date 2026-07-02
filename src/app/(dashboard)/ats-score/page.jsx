import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { AtsClientView } from "@/components/ats/ats-client-view";

export const revalidate = 0; // Disable caching to fetch updated data

export const metadata = {
  title: "ATS Score Optimizer | AI Career Copilot",
  description: "Check your resume compatibility score for Applicant Tracking Systems and boost your target keywords.",
};

export default async function AtsScorePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  const dbUser = await db.user.findUnique({
    where: { clerkId },
  });

  if (!dbUser) {
    redirect("/resume");
  }

  const resumes = await db.resume.findMany({
    where: { userId: dbUser.id },
    include: { analysis: true },
    orderBy: { createdAt: "desc" },
  });

  // Calculate summary analytics
  const analyzedResumes = resumes.filter((r) => r.status === "ANALYZED" && r.analysis);
  const averageAtsScore = analyzedResumes.length > 0
    ? Math.round(analyzedResumes.reduce((sum, r) => sum + r.analysis.atsScore, 0) / analyzedResumes.length)
    : 0;

  return (
    <AtsClientView
      resumes={resumes}
      averageAtsScore={averageAtsScore}
      analyzedResumes={analyzedResumes}
    />
  );
}
