import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { InterviewSessionFlow } from "@/components/resume/interview-session-flow";

export const revalidate = 0; // Disable static build route caching for active interview state updates

export default async function ActiveInterviewPage({ params }) {
  // Resolve Clerk session
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

  // Resolve dynamic params asynchronously as required by Next.js 15
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  if (!sessionId) {
    redirect("/interview");
  }

  // Fetch session details, related questions, and their answers
  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: {
        include: { answer: true },
        orderBy: { order: "asc" },
      },
    },
  });

  // Verify ownership
  if (!session || session.userId !== dbUser.id) {
    redirect("/interview");
  }

  // If session is already completed, redirect directly to results report
  if (session.status === "COMPLETED") {
    redirect(`/interview/${session.id}/results`);
  }

  return (
    <div className="container mx-auto py-2">
      <InterviewSessionFlow session={session} questions={session.questions} />
    </div>
  );
}
