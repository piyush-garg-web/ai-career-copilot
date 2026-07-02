import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ResumeDetailsView } from "@/components/resume/resume-details-view";

export const revalidate = 0; // Disable static page generation cache for dynamic database fetches

export const metadata = {
  title: "Resume Details | AI Career Copilot",
  description: "View details, text transcripts, and parsed structured sections of your resume.",
};


export default async function ResumeDetailPage({ params }) {
  // Resolve Dynamic Params Asynchronously in Next.js 15
  const resolvedParams = await params;
  const resumeId = resolvedParams.id;

  if (!resumeId) {
    redirect("/resume");
  }

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

  // Fetch the resume from the database
  const resume = await db.resume.findUnique({
    where: { id: resumeId },
  });

  // Verify resume exists and belongs to the authenticated DB User
  if (!resume || resume.userId !== dbUser.id) {
    redirect("/resume");
  }

  return (
    <div className="container mx-auto py-2">
      <ResumeDetailsView resume={resume} />
    </div>
  );
}
