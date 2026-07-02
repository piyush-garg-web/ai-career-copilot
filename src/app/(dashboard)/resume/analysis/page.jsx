import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalysisDashboard } from "@/components/resume/analysis-dashboard";
import { AnalysisTrigger } from "@/components/resume/analysis-trigger";
import { FileText, Sparkles, Calendar, HardDrive, Plus, Eye, BarChart2 } from "lucide-react";

export const revalidate = 0; // Disable static build route caching

export const metadata = {
  title: "AI Resume Analysis | AI Career Copilot",
  description: "Analyze your resume structure, strengths, weaknesses, and optimization suggestions.",
};


// Helper: Format file size to human readable MB/KB
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = 1;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Helper: Get status badge styles
const getStatusBadge = (status) => {
  switch (status) {
    case "UPLOADED":
      return { label: "Uploaded", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    case "PARSING":
      return { label: "Parsing", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    case "PARSED":
      return { label: "Parsed", className: "bg-teal-500/10 text-teal-400 border-teal-500/20" };
    case "ANALYZING":
      return { label: "Analyzing", className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
    case "ANALYZED":
      return { label: "Analyzed", className: "bg-green-500/10 text-green-400 border-green-500/20" };
    case "ERROR":
      return { label: "Error", className: "bg-destructive/10 text-destructive border-destructive/20" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border-border/40" };
  }
};

export default async function ResumeAnalysisPage({ searchParams }) {
  // Resolve search parameters dynamically as required by Next.js 15
  const resolvedSearchParams = await searchParams;
  const resumeId = resolvedSearchParams.id;

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

  // CASE 1: Render specific resume's analysis dashboard if ID is provided
  if (resumeId) {
    const resume = await db.resume.findUnique({
      where: { id: resumeId },
      include: { analysis: true },
    });

    // Verify record exists and belongs to the logged-in owner
    if (!resume || resume.userId !== dbUser.id) {
      redirect("/resume/analysis");
    }

    return (
      <div className="container mx-auto py-2">
        {resume.analysis ? (
          <AnalysisDashboard resume={resume} analysis={resume.analysis} />
        ) : (
          <div className="py-12">
            <AnalysisTrigger resumeId={resume.id} />
          </div>
        )}
      </div>
    );
  }

  // CASE 2: No ID provided -> Render the resumes directory selector listing page
  const resumes = await db.resume.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Analysis Panel"
        description="Choose a parsed resume to run comprehensive ATS keyword assessments and content scoring evaluations."
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
                You must upload your resume document first before generating scorecards or feedback reports.
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
        /* Selector List Grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((res) => {
            const badge = getStatusBadge(res.status);
            return (
              <Card
                key={res.id}
                className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-border/80 hover:shadow-md transition-all duration-300 flex flex-col group overflow-hidden"
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-105 transition-transform duration-200 shrink-0">
                      <FileText className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-bold text-foreground truncate group-hover:text-indigo-400 transition-colors duration-200" title={res.fileName}>
                        {res.fileName}
                      </CardTitle>
                      <span className="text-[10px] font-semibold text-muted-foreground/80 tracking-wide uppercase mt-0.5 block">
                        {res.fileType} Document
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2 flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{formatFileSize(res.fileSize)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-between gap-2.5 bg-muted/20 px-6 py-3.5">
                  <Badge variant="outline" className={badge.className}>
                    {badge.label}
                  </Badge>

                  {/* Actions depending on parse status */}
                  {res.status === "ANALYZED" ? (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-xl border border-border/40 text-xs font-bold gap-1.5 text-indigo-400 bg-background/50 hover:bg-accent cursor-pointer"
                    >
                      <Link href={`/resume/analysis?id=${res.id}`}>
                        <BarChart2 className="w-3.5 h-3.5" />
                        View Report
                      </Link>
                    </Button>
                  ) : res.status === "PARSED" ? (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-xl border border-border/40 text-xs font-bold gap-1.5 text-foreground hover:bg-accent cursor-pointer"
                    >
                      <Link href={`/resume/analysis?id=${res.id}`}>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Run AI Analysis
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-xl border border-border/40 text-xs font-bold gap-1.5 text-muted-foreground hover:bg-accent cursor-pointer"
                    >
                      <Link href={`/resume`}>
                        <Eye className="w-3.5 h-3.5" />
                        Extract Text
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
