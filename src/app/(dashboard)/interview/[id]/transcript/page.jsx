import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { InterviewTranscriptView } from "@/components/resume/interview-transcript-view";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";

const TranscriptExporter = dynamic(() => import("@/components/resume/transcript-exporter").then((m) => m.TranscriptExporter), { ssr: false });

export const revalidate = 0;

export default async function TranscriptPage({ params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await db.user.findUnique({ where: { clerkId } });
  if (!dbUser) redirect("/interview");

  const resolvedParams = await params;
  const sessionId = resolvedParams.id;
  if (!sessionId) redirect("/interview");

  const session = await db.interviewSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== dbUser.id) redirect("/interview");

  const messages = await db.interviewMessage.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' } });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-xl font-bold mb-3">Transcript • {session.title}</h1>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div />
        <TranscriptExporter sessionId={session.id} />
      </div>
      <Card className="p-4">
        <InterviewTranscriptView messages={messages} />
      </Card>
    </div>
  );
}
