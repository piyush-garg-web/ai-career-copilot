import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { InterviewPageClient } from "@/components/resume/interview-page-client";

export const revalidate = 0; // Disable static build route caching

export const metadata = {
  title: "AI Interview Coach | AI Career Copilot",
  description: "Practice mock interview questions tailored to your resume and experience level with real-time feedback.",
};

export default async function InterviewPage() {
  // Resolve Clerk authenticated session
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  // Fetch corresponding DB User
  const dbUser = await db.user.findUnique({
    where: { clerkId },
  });

  if (!dbUser) {
    redirect("/resume");
  }

  // Fetch user's resumes
  const resumes = await db.resume.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  // Fetch user's job descriptions
  const jobDescriptions = await db.jobDescription.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <InterviewPageClient
      dbUser={dbUser}
      resumes={resumes}
      jobDescriptions={jobDescriptions}
    />
  );
}
