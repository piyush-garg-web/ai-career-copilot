import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { InterviewSetupForm } from "@/components/resume/interview-setup-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, BarChart2 } from "lucide-react";

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
    <div className="space-y-6">
      <PageHeader
        title="AI Interview Coach"
        description="Build custom mock interview sessions and record answers to receive structured, active-coaching feedback."
      />

      {resumes.length === 0 ? (
        /* Empty State */
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm py-16">
          <CardContent className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 animate-pulse">
              <BarChart2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">No Resumes Found</h3>
              <p className="text-sm text-muted-foreground font-medium">
                You must upload your resume document first before practicing mock interview rounds.
              </p>
            </div>
            <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 h-10 px-5">
              <Link href="/resume/upload">
                <Plus className="w-4 h-4" />
                Upload Resume
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Load Interview Setup Form */
        <InterviewSetupForm resumes={resumes} jobDescriptions={jobDescriptions} />
      )}
    </div>
  );
}
