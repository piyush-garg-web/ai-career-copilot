import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Sparkles, Eye, ArrowRight, ClipboardCheck, ArrowLeft } from "lucide-react";

export const revalidate = 0; // Disable static build route caching for history list logs

// Helper: Format duration from seconds to MM:SS
const formatDuration = (totalSecs) => {
  if (!totalSecs) return "N/A";
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}m ${s}s`;
};

// Helper: Get status badge styles
const getStatusBadge = (status, score) => {
  switch (status) {
    case "ACTIVE":
      return { label: "In Progress", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    case "COMPLETED":
      return { label: `Completed • Score: ${score || 0}%`, className: "bg-green-500/10 text-green-400 border-green-500/20" };
    case "ABANDONED":
      return { label: "Abandoned", className: "bg-muted text-muted-foreground border-border/40" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border-border/40" };
  }
};

export default async function InterviewHistoryPage() {
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

  // Fetch all user interview sessions
  const sessions = await db.interviewSession.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/interview"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Interview Coach
          </Link>
          <PageHeader
            title="Interview History Logs"
            description="Inspect overall card ratings, dialogue details, and tailored career coach insights from past practices."
          />
        </div>
      </div>

      {sessions.length === 0 ? (
        /* Empty State */
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm py-16">
          <CardContent className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 animate-pulse">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">No History Found</h3>
              <p className="text-sm text-muted-foreground font-medium">
                You have not practiced any mock interview sessions yet.
              </p>
            </div>
            <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10 h-10 px-5">
              <Link href="/interview">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Start Your First Session
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Selector List Grid */
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((sess) => {
            const badge = getStatusBadge(sess.status, sess.overallScore);
            return (
              <Card
                key={sess.id}
                className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-border/80 hover:shadow-md transition-all duration-300 flex flex-col group overflow-hidden"
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-105 transition-transform duration-200 shrink-0">
                      <ClipboardCheck className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-bold text-foreground truncate group-hover:text-indigo-400 transition-colors duration-200" title={sess.title}>
                        {sess.title}
                      </CardTitle>
                      <span className="text-[10px] font-semibold text-muted-foreground/80 tracking-wide uppercase mt-0.5 block">
                        {sess.role}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2 flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>Duration: {formatDuration(sess.duration)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-between gap-2.5 bg-muted/20 px-6 py-3.5">
                  <Badge variant="outline" className={badge.className}>
                    {badge.label}
                  </Badge>

                  {/* Actions depending on session status */}
                  {sess.status === "COMPLETED" ? (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-xl border border-border/40 text-xs font-bold gap-1.5 text-indigo-400 bg-background/50 hover:bg-accent cursor-pointer"
                    >
                      <Link href={`/interview/${sess.id}/results`}>
                        <Eye className="w-3.5 h-3.5 animate-pulse" />
                        View Report
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-xl border border-border/40 text-xs font-bold gap-1.5 text-foreground hover:bg-accent cursor-pointer"
                    >
                      <Link href={`/interview/${sess.id}`}>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        Resume Mock
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
