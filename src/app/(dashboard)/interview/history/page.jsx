import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { InterviewHistoryView } from "@/components/interview/interview-history-view";

export const revalidate = 0; // Disable static build route caching for history list logs

export default async function InterviewHistoryPage() {
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

  const sessions = await db.interviewSession.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  return <InterviewHistoryView initialSessions={sessions} />;
}
