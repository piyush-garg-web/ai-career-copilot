import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { JobMatchPageClient } from "@/components/resume/job-match-page-client";

export const revalidate = 0; // Disable static build route caching

export default async function JobMatchPage() {
  // Resolve Clerk authenticated user
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

  return (
    <JobMatchPageClient
      dbUser={dbUser}
      resumes={resumes}
    />
  );
}
