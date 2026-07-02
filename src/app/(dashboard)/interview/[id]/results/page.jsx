import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { InterviewResultView } from "@/components/resume/interview-result-view";

export const revalidate = 0; // Disable static build route caching for live dynamic session reports

export default async function InterviewResultsPage({ params }) {
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

  // Resolve dynamic route parameters asynchronously as required by Next.js 15
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  if (!sessionId) {
    redirect("/interview");
  }

  // Fetch session data along with questions and their nested evaluations
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

  // If session is still active, redirect candidate to practice room
  if (session.status !== "COMPLETED") {
    redirect(`/interview/${session.id}`);
  }

  return (
    <div className="container mx-auto py-2">
      <InterviewResultView session={session} questions={session.questions} />
    </div>
  );
}
