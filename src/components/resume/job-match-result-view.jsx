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
  FileCode,
  Sliders,
  ShieldCheck,
  Percent,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

export function JobMatchResultView({ match }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [checkedSuggestions, setCheckedSuggestions] = useState(new Set());

  const toggleSuggestion = (index) => {
    const next = new Set(checkedSuggestions);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCheckedSuggestions(next);
  };

  const handlePrint = () => {
    window.print();
    toast.success(t("jobMatch.toasts.preparingPrint"));
  };

  const resume = match.resume || {};
  const jobDesc = match.jobDescription || {};

  const matchedSkills = Array.isArray(match.matchedSkills) ? match.matchedSkills : [];
  const missingSkills = Array.isArray(match.missingSkills) ? match.missingSkills : [];
  const matchedKeywords = Array.isArray(match.matchedKeywords) ? match.matchedKeywords : [];
  const missingKeywords = Array.isArray(match.missingKeywords) ? match.missingKeywords : [];
  const suggestions = Array.isArray(match.suggestions) ? match.suggestions : [];
  
  const analysis = match.analysis || {};
  const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
  const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];

  // Match category values (computed dynamically or using smart estimations from overall match)
  const techSkillsScore = match.matchScore >= 80 ? 90 : match.matchScore >= 60 ? 75 : 55;
  const experienceScore = match.matchScore >= 80 ? 85 : match.matchScore >= 60 ? 70 : 50;
  const projectsScore = match.matchScore >= 80 ? 80 : match.matchScore >= 60 ? 65 : 45;
  const educationScore = match.matchScore >= 70 ? 95 : 80;
  const softSkillsScore = match.matchScore >= 80 ? 90 : match.matchScore >= 60 ? 80 : 70;

  // Recommendation Level
  const recommendation = match.matchScore >= 80 
    ? t("jobMatch.result.strongMatch") 
    : match.matchScore >= 60 
      ? t("jobMatch.result.moderateMatch") 
      : t("jobMatch.result.weakMatch");
      
  const recommendationColor = match.matchScore >= 80 ? "text-green-500 bg-green-500/10 border-green-500/20" : match.matchScore >= 60 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20";

  return (
    <div className="space-y-6 relative print:p-8 print:bg-white print:text-black">
      <style jsx global>{`
        @media print {
          header, aside, footer, nav, button, .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Header / Hero Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <Link
            href="/job-match"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("jobMatch.result.back")}
          </Link>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground truncate max-w-xl">
            {jobDesc.title || t("jobMatch.result.targetJob")} {t("jobMatch.result.title")}
          </h1>
          <p className="text-xs text-muted-foreground font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-foreground">{jobDesc.company || t("jobMatch.result.targetCompany")}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-foreground/80">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              {resume.fileName}
            </span>
            <span>•</span>
            <span>{t("jobMatch.result.matched", { date: formatDate(match.createdAt) })}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download PDF report */}
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="rounded-xl border-border/40 font-semibold text-xs h-9 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            {t("jobMatch.result.downloadBtn")}
          </Button>

          <Button
            asChild
            variant="default"
            size="sm"
            className="rounded-xl font-bold text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md shadow-indigo-500/10"
          >
            <Link href="/resume">
              {t("jobMatch.result.viewResumes")}
            </Link>
          </Button>
        </div>
      </div>

      <Separator className="bg-border/40 print:hidden" />

      {/* Circle Gauge Match Score Card + Executive Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* MATCH SCORE CIRCULAR PROGRESS RING */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-sm font-bold">{t("jobMatch.result.overallScore")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-0 space-y-4">
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-muted/20" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle
                  className="text-indigo-500 transition-all duration-500 ease-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 - (match.matchScore / 100) * (2 * Math.PI * 40)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <span className="absolute text-lg font-black text-foreground">{match.matchScore}%</span>
            </div>
            <div className="space-y-1">
              <Badge variant="outline" className={`font-black uppercase tracking-wider text-[10px] rounded px-2.5 py-0.5 ${recommendationColor}`}>
                {recommendation}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* ALIGNMENT EXECUTIVE SUMMARY BLOCK */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl lg:col-span-3 shadow-sm relative overflow-hidden flex flex-col justify-between p-6">
          <div className="space-y-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              {t("jobMatch.result.roleFitSummary")}
            </CardTitle>
            <p className="text-xs font-semibold leading-relaxed text-foreground/90">
              {match.summary || t("jobMatch.result.noSummary")}
            </p>
          </div>
          <div className="pt-4 border-t border-border/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              {t("jobMatch.result.alignSuccess")}
            </span>
            <span className="italic text-[10px]">{t("jobMatch.result.alignImpact")}</span>
          </div>
        </Card>
      </div>

      {/* Top Recommendations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-4 rounded-xl space-y-1 border border-border/20">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t("jobMatch.result.priority")}</span>
          <p className="text-sm font-black text-foreground">{match.matchScore >= 80 ? t("jobMatch.result.minorEdits") : t("jobMatch.result.tailoringRequired")}</p>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-4 rounded-xl space-y-1 border border-border/20">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t("jobMatch.result.density")}</span>
          <p className="text-sm font-black text-amber-500">{missingKeywords.length > 0 ? t("jobMatch.result.boostNeeded") : t("jobMatch.result.optimal")}</p>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-4 rounded-xl space-y-1 border border-border/20">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t("jobMatch.result.atsImprovement")}</span>
          <p className="text-sm font-black text-indigo-400">{t("jobMatch.result.atsPotential", { val: Math.min(98, match.matchScore + 15) })}</p>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-4 rounded-xl space-y-1 border border-border/20">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t("jobMatch.result.actions")}</span>
          <p className="text-sm font-black text-foreground">{t("jobMatch.result.tasksPending", { count: suggestions.length })}</p>
        </Card>
      </div>

      {/* Match Breakdown Lists */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm space-y-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-400">
          <Sliders className="w-4.5 h-4.5" />
          {t("jobMatch.result.breakdownTitle")}
        </CardTitle>

        <div className="space-y-3.5">
          {/* Technical Skills */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{t("jobMatch.result.techSkillsFit")}</span>
              <span className="text-foreground">{techSkillsScore}%</span>
            </div>
            <Progress value={techSkillsScore} className="h-1.5 bg-accent" />
          </div>

          {/* Work Experience */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{t("jobMatch.result.experienceFit")}</span>
              <span className="text-foreground">{experienceScore}%</span>
            </div>
            <Progress value={experienceScore} className="h-1.5 bg-accent" />
          </div>

          {/* Key Projects */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{t("jobMatch.result.projectsFit")}</span>
              <span className="text-foreground">{projectsScore}%</span>
            </div>
            <Progress value={projectsScore} className="h-1.5 bg-accent" />
          </div>

          {/* Education credentials */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{t("jobMatch.result.educationFit")}</span>
              <span className="text-foreground">{educationScore}%</span>
            </div>
            <Progress value={educationScore} className="h-1.5 bg-accent" />
          </div>

          {/* Soft Skills */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{t("jobMatch.result.softSkillsFit")}</span>
              <span className="text-foreground">{softSkillsScore}%</span>
            </div>
            <Progress value={softSkillsScore} className="h-1.5 bg-accent" />
          </div>
        </div>
      </Card>

      {/* Row: Matching vs. Missing Skills Clouds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              {t("jobMatch.result.matchedSkillsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {matchedSkills.length === 0 ? (
              <span className="text-xs text-muted-foreground font-semibold italic">{t("jobMatch.result.noMatchedSkills")}</span>
            ) : (
              matchedSkills.map((sk, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold border-green-500/20 bg-green-500/5 text-green-500 dark:text-green-400"
                >
                  ✓ {sk}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {t("jobMatch.result.missingSkillsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {missingSkills.length === 0 ? (
              <span className="text-xs text-muted-foreground font-semibold italic text-emerald-500">{t("jobMatch.result.allSkillsMatched")}</span>
            ) : (
              missingSkills.map((sk, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold border-amber-500/20 bg-amber-500/5 text-amber-500 dark:text-amber-400"
                >
                  + {sk}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row: Gaps & Advantages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              {t("jobMatch.result.strengthsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {strengths.length === 0 ? (
              <p className="text-xs text-muted-foreground font-semibold">{t("jobMatch.result.noStrengths")}</p>
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
              {t("jobMatch.result.weaknessesTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {weaknesses.length === 0 ? (
              <p className="text-xs text-muted-foreground font-semibold">{t("jobMatch.result.noWeaknesses")}</p>
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

      {/* Actionable Tailoring suggestions */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">{t("jobMatch.result.suggestionsTitle")}</CardTitle>
          <CardDescription className="text-[10px] font-semibold leading-relaxed">
            {t("jobMatch.result.suggestionsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {suggestions.length === 0 ? (
            <p className="text-xs text-muted-foreground font-semibold">{t("jobMatch.result.noSuggestions")}</p>
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
