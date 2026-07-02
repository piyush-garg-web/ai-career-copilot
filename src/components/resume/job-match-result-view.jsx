"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Check,
  Award,
  BookOpen,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Helper: Format dates
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export function JobMatchResultView({ match }) {
  const router = useRouter();
  const [checkedSuggestions, setCheckedSuggestions] = useState(new Set());

  // Toggle suggestion checklist items
  const toggleSuggestion = (index) => {
    const next = new Set(checkedSuggestions);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCheckedSuggestions(next);
  };

  const resume = match.resume || {};
  const jobDesc = match.jobDescription || {};

  // Extract arrays from JSON fields safely
  const matchedSkills = Array.isArray(match.matchedSkills) ? match.matchedSkills : [];
  const missingSkills = Array.isArray(match.missingSkills) ? match.missingSkills : [];
  const matchedKeywords = Array.isArray(match.matchedKeywords) ? match.matchedKeywords : [];
  const missingKeywords = Array.isArray(match.missingKeywords) ? match.missingKeywords : [];
  const suggestions = Array.isArray(match.suggestions) ? match.suggestions : [];
  
  const analysis = match.analysis || {};
  const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
  const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];

  // Circle Gauge Math for Match Score
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (match.matchScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Header / Hero Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/job-match"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Compare Another Job
          </Link>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground truncate max-w-xl">
            {jobDesc.title || "Job Target Profile"} Matching Report
          </h1>
          <p className="text-xs text-muted-foreground font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-foreground">{jobDesc.company || "Unknown Company"}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-foreground/80">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              {resume.fileName}
            </span>
            <span>•</span>
            <span>Matched {formatDate(match.createdAt)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Resume button */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-border/40 font-semibold text-xs h-9 cursor-pointer"
          >
            <a href={resume.fileUrl} download={resume.fileName} target="_blank" rel="noopener noreferrer">
              <Download className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              Download Resume
            </a>
          </Button>

          {/* Back to Resumes selector */}
          <Button
            asChild
            variant="default"
            size="sm"
            className="rounded-xl font-bold text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md shadow-indigo-500/10"
          >
            <Link href="/resume">
              View Resumes Directory
            </Link>
          </Button>
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* Circle Gauge Match Score Card + Executive Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MATCH SCORE CIRCULAR PROGRESS RING */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-sm">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-bold">Overall Match Score</CardTitle>
            <CardDescription className="text-[10px] font-semibold">Gemini alignment index</CardDescription>
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
                <span className="text-2xl font-black text-foreground">{match.matchScore}%</span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Match</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed max-w-xs">
              {match.matchScore >= 80 ? (
                <span className="text-emerald-400 font-bold">Strong Match!</span>
              ) : match.matchScore >= 60 ? (
                <span className="text-amber-400 font-bold">Moderate Fit.</span>
              ) : (
                <span className="text-destructive font-bold">Low Alignment.</span>
              )}{" "}
              Your resume aligns with <span className="text-indigo-400 font-bold">{match.matchScore}%</span> of target job qualifications.
            </p>
          </CardContent>
        </Card>

        {/* ALIGNMENT EXECUTIVE SUMMARY BLOCK */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl md:col-span-2 shadow-sm relative overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
          <div className="space-y-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              Role Fit Executive Summary
            </CardTitle>
            <p className="text-xs font-semibold leading-relaxed text-foreground/90">
              {match.summary || "No comparison summary generated."}
            </p>
          </div>
          <div className="pt-4 border-t border-border/20 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target 75%+ scores to pass automated scanner criteria</span>
            </div>
            <span>Powered by Gemini AI</span>
          </div>
        </Card>
      </div>

      {/* Grid: Strengths vs Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Candidate Advantages & Strengths
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
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Alignment Gaps & Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {weaknesses.length === 0 ? (
              <p className="text-xs text-muted-foreground font-semibold">No weaknesses recorded.</p>
            ) : (
              weaknesses.map((weak, idx) => (
                <div key={idx} className="flex gap-3 items-start border border-amber-500/10 bg-amber-500/5 p-3.5 rounded-xl text-xs font-semibold text-foreground/90 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{weak}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row: Matching vs. Missing Skills Clouds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Matched Skills & Competencies
            </CardTitle>
            <CardDescription className="text-[10px] font-semibold">Skills present in your resume that fit target requirements</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {matchedSkills.length === 0 ? (
              <span className="text-xs text-muted-foreground font-semibold italic">No matched skills recorded.</span>
            ) : (
              matchedSkills.map((sk, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold border-emerald-500/10 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400"
                >
                  ✓ {sk}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Missing Required Skills
            </CardTitle>
            <CardDescription className="text-[10px] font-semibold">Qualifications required by the role but missing in your resume</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {missingSkills.length === 0 ? (
              <span className="text-xs text-muted-foreground font-semibold italic text-emerald-500">None! You possess all required skills.</span>
            ) : (
              missingSkills.map((sk, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold border-amber-500/10 bg-amber-500/5 text-amber-500 dark:text-amber-400"
                >
                  + {sk}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row: Matching vs. Missing Keywords Clouds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Keywords */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Matched ATS Keywords
            </CardTitle>
            <CardDescription className="text-[10px] font-semibold">Specialized terminology matching the target profile</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {matchedKeywords.length === 0 ? (
              <span className="text-xs text-muted-foreground font-semibold italic">No matched keywords.</span>
            ) : (
              matchedKeywords.map((kw, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold border-indigo-500/15 bg-indigo-500/5 text-indigo-400"
                >
                  {kw}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        {/* Missing Keywords */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              Missing ATS Keywords
            </CardTitle>
            <CardDescription className="text-[10px] font-semibold">Terms standard in the industry but missing from your pages</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {missingKeywords.length === 0 ? (
              <span className="text-xs text-muted-foreground font-semibold italic text-emerald-500">None! All ATS terminology matches.</span>
            ) : (
              missingKeywords.map((kw, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold border-purple-500/15 bg-purple-500/5 text-purple-400"
                >
                  + {kw}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actionable Tailoring suggestions */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Actionable Tailoring Suggestions</CardTitle>
          <CardDescription className="text-[10px] font-semibold leading-relaxed">
            Check off actions as you update your resume to better match this target role description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {suggestions.length === 0 ? (
            <p className="text-xs text-muted-foreground font-semibold">No suggestions generated.</p>
          ) : (
            suggestions.map((sug, idx) => {
              const isChecked = checkedSuggestions.has(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleSuggestion(idx)}
                  className={`flex gap-3 items-start border rounded-xl p-3.5 cursor-pointer select-none transition-all duration-200 text-xs font-semibold leading-relaxed ${
                    isChecked
                      ? "bg-muted/30 border-muted text-muted-foreground line-through opacity-60"
                      : "bg-card/40 border-border/40 hover:border-indigo-500/30 text-foreground"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200 ${
                      isChecked
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-border bg-background"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{sug}</span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
