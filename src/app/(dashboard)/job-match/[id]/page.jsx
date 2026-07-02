import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { JobMatchResultView } from "@/components/resume/job-match-result-view";

export const revalidate = 0; // Disable static build route caching for dynamic updates

export default async function JobMatchResultPage({ params }) {
  // 1. Resolve Clerk authenticated session
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  // 2. Fetch corresponding DB User
  const dbUser = await db.user.findUnique({
    where: { clerkId },
  });

  if (!dbUser) {
    redirect("/resume");
  }

  // 3. Resolve dynamic route parameters as required by Next.js 15
  const resolvedParams = await params;
  const matchId = resolvedParams.id;

  if (!matchId) {
    redirect("/job-match");
  }

  // 4. Fetch the JobMatch record details and verify ownership
  const jobMatch = await db.jobMatch.findUnique({
    where: { id: matchId },
    include: {
      resume: true,
      jobDescription: true,
    },
  });

  if (!jobMatch || jobMatch.userId !== dbUser.id) {
    redirect("/job-match");
  }

  return (
    <div className="container mx-auto py-2">
      <JobMatchResultView match={jobMatch} />
    </div>
  );
}
