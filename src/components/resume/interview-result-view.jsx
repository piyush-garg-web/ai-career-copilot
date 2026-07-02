"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  Check,
  Flame,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Helper: Format Dates
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Helper: Format duration from seconds to MM:SS
const formatDuration = (totalSecs) => {
  if (!totalSecs) return "N/A";
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}m ${s}s`;
};

export function InterviewResultView({ session, questions }) {
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const toggleExpand = (qId) => {
    setExpandedQuestionId(expandedQuestionId === qId ? null : qId);
  };

  // Extract category scores safely from JSON
  const scores = session.categoryScores || {};
  const techScore = scores.technicalScore || 0;
  const commScore = scores.communicationScore || 0;
  const confScore = scores.confidenceScore || 0;

  // Extract evaluation details safely from JSON
  const evaluation = session.evaluation || {};
  const strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
  const areasToImprove = Array.isArray(evaluation.areasToImprove) ? evaluation.areasToImprove : [];
  const nextSteps = Array.isArray(evaluation.nextSteps) ? evaluation.nextSteps : [];

  // Circle Gauge Math for Overall Score
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((session.overallScore || 0) / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/interview"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Practice Another Interview
          </Link>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground truncate max-w-xl">
            {session.title}
          </h1>
          <p className="text-xs text-muted-foreground font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-foreground">{session.role} Role</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              Duration: {formatDuration(session.duration)}
            </span>
            <span>•</span>
            <span>Completed {formatDate(session.completedAt || session.updatedAt)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-border/40 font-semibold text-xs h-9 cursor-pointer"
          >
            <Link href="/interview/history">
              View History logs
            </Link>
          </Button>

          <Button
            asChild
            variant="default"
            size="sm"
            className="rounded-xl font-bold text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md shadow-indigo-500/10"
          >
            <Link href="/interview">
              New Practice Session
            </Link>
          </Button>
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* Circle Gauge Match Score Card + Executive Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* OVERALL SCORE CIRCULAR RING */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-sm">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-bold">Session Rating</CardTitle>
            <CardDescription className="text-[10px] font-semibold">Gemini overall mock index</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-0 space-y-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-muted/40"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-indigo-500 transition-all duration-1000 ease-out"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-foreground">{session.overallScore}%</span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Rating</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed max-w-xs">
              {session.overallScore >= 80 ? (
                <span className="text-emerald-400 font-bold">Excellent Practice!</span>
              ) : session.overallScore >= 60 ? (
                <span className="text-amber-400 font-bold">Solid Effort.</span>
              ) : (
                <span className="text-destructive font-bold">Needs Improvement.</span>
              )}{" "}
              Your rating ranks higher than <span className="text-indigo-400 font-bold">{session.overallScore}%</span> of practice candidates.
            </p>
          </CardContent>
        </Card>

        {/* MOCK COACH SUMMARY SUMMARY */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-sm rounded-2xl md:col-span-2 shadow-sm relative overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
          <div className="space-y-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              Overall Performance Summary
            </CardTitle>
            <p className="text-xs font-semibold leading-relaxed text-foreground/90">
              {session.feedback || "No performance summary recorded."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border/20 pt-4 mt-4 bg-muted/5 rounded-xl p-3">
            <div className="text-center space-y-0.5">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Technical</span>
              <span className="text-sm font-black text-indigo-400">{techScore}%</span>
            </div>
            <div className="text-center space-y-0.5 border-l border-border/20">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Clarity</span>
              <span className="text-sm font-black text-teal-400">{commScore}%</span>
            </div>
            <div className="text-center space-y-0.5 border-l border-border/20">
              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Confidence</span>
              <span className="text-sm font-black text-amber-400">{confScore}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid: Strengths vs Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Observed Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {strengths.length === 0 ? (
              <p className="text-xs text-muted-foreground font-semibold">No strengths recorded.</p>
            ) : (
              strengths.map((str, idx) => (
                <div key={idx} className="flex gap-3 items-start border border-emerald-500/10 bg-emerald-500/5 p-3.5 rounded-xl text-xs font-semibold text-foreground/90 leading-relaxed">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Focus Growth Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {areasToImprove.length === 0 ? (
              <p className="text-xs text-muted-foreground font-semibold">No weaknesses recorded.</p>
            ) : (
              areasToImprove.map((weak, idx) => (
                <div key={idx} className="flex gap-3 items-start border border-amber-500/10 bg-amber-500/5 p-3.5 rounded-xl text-xs font-semibold text-foreground/90 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{weak}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Next Steps Checklist Card */}
      <Card className="border-border/40 bg-card/45 backdrop-blur-sm rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Recommended Next Steps
          </CardTitle>
          <CardDescription className="text-[10px] font-semibold">Actionable prep tasks for growth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {nextSteps.map((step, idx) => (
            <div key={idx} className="flex gap-3 items-start bg-card/50 border border-border/40 rounded-xl p-3.5 text-xs font-semibold text-foreground/90 leading-relaxed">
              <div className="w-4 h-4 rounded-full border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black">
                {idx + 1}
              </div>
              <span>{step}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* QUESTION BY QUESTION LOG review */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Question-by-Question Dialogue Review
        </h2>

        <div className="space-y-3">
          {questions.map((q) => {
            const ans = q.answer || {};
            const analysis = ans.analysis || {};
            const isExpanded = expandedQuestionId === q.id;

            return (
              <Card
                key={q.id}
                className="border-border/40 bg-card/30 hover:border-border transition-colors duration-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Accordion header click toggling */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="flex items-start justify-between gap-4 p-4 cursor-pointer select-none"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
                      Question #{q.order} • {q.questionType}
                    </span>
                    <h3 className="text-xs font-bold text-foreground leading-snug">
                      {q.content}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black">
                      Score: {ans.score || 0}%
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </div>

                {/* Expanded Feedback Panel */}
                {isExpanded && (
                  <CardContent className="pt-2 pb-5 border-t border-border/20 space-y-5 bg-card/10">
                    {/* User response block */}
                    <div className="space-y-1 pt-2">
                      <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wide">
                        Your Response
                      </span>
                      <p className="text-xs font-semibold leading-relaxed text-foreground/80 p-3 rounded-xl bg-background/50 border border-border/20">
                        {ans.content || "(No response recorded)"}
                      </p>
                    </div>

                    {/* AI Feedback statement */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                        AI Grading Feedback
                      </span>
                      <p className="text-xs font-semibold leading-relaxed text-foreground">
                        {ans.feedback || "No feedback recorded."}
                      </p>
                    </div>

                    {/* Breakdown radar cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-background/30 p-3 rounded-xl border border-border/10">
                      <div className="text-center space-y-0.5">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase block">Score</span>
                        <span className="text-sm font-black text-indigo-400">{ans.score || 0}%</span>
                      </div>
                      <div className="text-center space-y-0.5 border-l border-border/20">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase block">Clarity</span>
                        <span className="text-sm font-black text-teal-400">{analysis.communication || 0}%</span>
                      </div>
                      <div className="text-center space-y-0.5 border-l border-border/20">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase block">Accuracy</span>
                        <span className="text-sm font-black text-blue-400">{analysis.technicalAccuracy || 0}%</span>
                      </div>
                      <div className="text-center space-y-0.5 border-l border-border/20">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase block">Confidence</span>
                        <span className="text-sm font-black text-amber-400">{analysis.confidence || 0}%</span>
                      </div>
                    </div>

                    {/* strengths / weaknesses lists */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* strengths */}
                      <div className="space-y-1 border border-emerald-500/10 bg-emerald-500/5 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          Answer Strengths
                        </span>
                        <ul className="space-y-1 text-xs leading-relaxed font-semibold list-disc list-inside text-foreground/80">
                          {(analysis.strengths || []).map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      {/* improvements */}
                      <div className="space-y-1 border border-amber-500/10 bg-amber-500/5 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Improvement Suggestions
                        </span>
                        <ul className="space-y-1 text-xs leading-relaxed font-semibold list-disc list-inside text-foreground/80">
                          {(analysis.improvements || []).map((i, idx) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* rewritten answer suggestion */}
                    {ans.improvedAnswer && (
                      <div className="space-y-1.5 border border-indigo-500/10 bg-indigo-500/5 p-4 rounded-xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-1.5 text-indigo-500/10">
                          <Flame className="w-12 h-12" />
                        </div>
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Ideal Answer Template
                        </span>
                        <p className="text-xs leading-relaxed font-semibold text-foreground/90">
                          {ans.improvedAnswer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
