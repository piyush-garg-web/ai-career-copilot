import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download, Eye, Calendar, HardDrive, Sparkles } from "lucide-react";

// Helper: Format file size to human readable MB/KB
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = 1;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Helper: Get status badge variant and styles
const getStatusBadge = (status) => {
  switch (status) {
    case "UPLOADED":
      return { label: "Uploaded", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20" };
    case "PARSING":
      return { label: "Parsing", className: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20" };
    case "PARSED":
      return { label: "Parsed", className: "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 border-teal-500/20" };
    case "ANALYZING":
      return { label: "Analyzing", className: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20" };
    case "ANALYZED":
      return { label: "Analyzed", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" };
    case "ERROR":
      return { label: "Error", className: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border-border/40" };
  }
};

export default async function ResumesPage() {
  // Resolve Clerk authenticated user
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  // Fetch corresponding DB User
  let dbUser = await db.user.findUnique({
    where: { clerkId },
  });

  // Fallback: Create user record in DB if Clerk webhooks were blocked locally
  if (!dbUser) {
    const user = await currentUser();
    if (user) {
      const email = user.emailAddresses?.[0]?.email_address;
      if (email) {
        dbUser = await db.user.create({
          data: {
            clerkId,
            email,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            imageUrl: user.imageUrl || null,
          },
        });
      }
    }
  }

  let resumes = [];

  // Query resumes belonging to the DB User if they exist
  if (dbUser) {
    resumes = await db.resume.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Resumes"
        description="View and manage your uploaded resumes or upload a new version."
        actions={
          resumes.length > 0 && (
            <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5 shadow-sm shadow-blue-500/10 cursor-pointer h-9 text-xs">
              <Link href="/resume/upload">
                <Plus className="w-4 h-4" />
                Upload Resume
              </Link>
            </Button>
          )
        }
      />

      {resumes.length === 0 ? (
        /* Empty State */
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm py-16">
          <CardContent className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">No resumes uploaded</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Upload your resume in PDF or DOCX format to analyze your ATS score and start mock interviews.
              </p>
            </div>
            <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer h-10 px-5">
              <Link href="/resume/upload">
                <Plus className="w-4 h-4" />
                Upload your first resume
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Resume List Grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => {
            const badge = getStatusBadge(resume.status);
            return (
              <Card
                key={resume.id}
                className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-border transition-all duration-300 hover:shadow-md hover:shadow-accent/5 overflow-hidden flex flex-col group"
              >
                <CardHeader className="flex flex-row items-start justify-between pb-3 space-y-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform duration-200 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-bold text-foreground truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" title={resume.fileName}>
                        <Link href={`/resume/${resume.id}`} className="hover:underline">
                          {resume.fileName}
                        </Link>
                      </CardTitle>
                      <span className="text-[10px] font-semibold text-muted-foreground/80 tracking-wide uppercase mt-0.5 block">
                        {resume.fileType} Document
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2 flex-1 space-y-3">
                  {/* Badge & Info grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{formatFileSize(resume.fileSize)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-between gap-2.5 bg-muted/20 px-6 py-3.5">
                  <Badge variant="outline" className={badge.className}>
                    {badge.label}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-xl border border-border/40 hover:bg-accent cursor-pointer"
                      title="Download document"
                    >
                      <a href={resume.fileUrl} download={resume.fileName} target="_blank" rel="noreferrer">
                        <Download className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-xl border border-border/40 hover:bg-accent cursor-pointer"
                      title="View details"
                    >
                      <Link href={`/resume/${resume.id}`}>
                        <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
