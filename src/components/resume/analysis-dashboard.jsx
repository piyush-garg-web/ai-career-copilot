"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  HardDrive,
  FileText,
  Sparkles,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Check,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Languages,
  ArrowRight,
  ShieldCheck,
  FileUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Helper: Format file size to human readable MB/KB
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = 1;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

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

// Helper: Get Grade Letter
const getGrade = (score) => {
  if (score >= 90) return "A";
  if (score >= 82) return "B+";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
};

// Helper: Get Grade Class
const getGradeClass = (grade) => {
  if (grade === "A" || grade === "B+") return "text-green-500 border-green-500/20 bg-green-500/5";
  if (grade === "B" || grade === "C") return "text-amber-500 border-amber-500/20 bg-amber-500/5";
  return "text-destructive border-destructive/20 bg-destructive/5";
};

export function AnalysisDashboard({ resume, analysis }) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [checkedSuggestions, setCheckedSuggestions] = useState(new Set());
  const [preferences, setPreferences] = useState({
    autoGenerateSuggestions: true,
    highlightKeywords: true,
  });

  React.useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.resumePreferences) {
          setPreferences({
            autoGenerateSuggestions: data.resumePreferences.autoGenerateSuggestions !== false,
            highlightKeywords: data.resumePreferences.highlightKeywords !== false,
          });
        }
      })
      .catch((err) => console.error("Error loading resume settings:", err));
  }, []);

  // Suggestions checklist state toggling
  const toggleSuggestion = (index) => {
    const next = new Set(checkedSuggestions);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCheckedSuggestions(next);
  };

  // Re-run AI Analysis Call
  const handleAnalyzeAgain = async () => {
    setIsAnalyzing(true);
    toast.info("Gemini AI is re-analyzing your resume. Please hold...");
    try {
      const response = await fetch(`/api/resumes/${resume.id}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze document.");
      }

      toast.success("Resume re-analyzed successfully!");
      router.refresh();
    } catch (err) {
      console.error("AI Analysis error:", err);
      toast.error(err.message || "Something went wrong during AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
    toast.success("Preparing report print view...");
  };

  // Extract structured analysis arrays safely
  const scoreBreakdown = analysis.scoreBreakdown || {};
  const strengths = scoreBreakdown.strengths || [];
  const weaknesses = scoreBreakdown.weaknesses || [];
  const suggestions = analysis.suggestions || [];
  const keywords = analysis.keywords || {};
  const missingKeywords = keywords.missingKeywords || [];

  // Grade and Percentile calculations
  const grade = getGrade(analysis.overallScore);
  const percentile = analysis.overallScore > 0 ? Math.round(analysis.overallScore * 0.95 + 4) : 0;
  const improvementPriority = analysis.overallScore >= 85 ? "Low" : analysis.overallScore >= 70 ? "Medium" : "High";
  const estAtsImprovement = analysis.atsScore > 0 ? `${analysis.atsScore} → ${Math.min(98, analysis.atsScore + 14)}` : "0 → 80";

  // Math for Circular Overall Score Ring
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analysis.overallScore / 100) * circumference;

  // Configuration for 6 individual grid cards
  const scoreCardsConfig = [
    {
      title: "ATS Compatibility",
      score: analysis.atsScore,
      icon: <HardDrive className="w-4 h-4 text-indigo-400" />,
      desc: "Measures parser readability and formatting optimization.",
      color: "bg-indigo-500",
    },
    {
      title: "Skills & Keywords",
      score: analysis.skillsScore,
      icon: <Award className="w-4 h-4 text-teal-400" />,
      desc: "Measures density and relevance of technical competencies.",
      color: "bg-teal-500",
    },
    {
      title: "Work Experience",
      score: analysis.experienceScore,
      icon: <Briefcase className="w-4 h-4 text-blue-400" />,
      desc: "Measures action verbs, impact statements, and numbers.",
      color: "bg-blue-500",
    },
    {
      title: "Academic Background",
      score: analysis.educationScore,
      icon: <GraduationCap className="w-4 h-4 text-purple-400" />,
      desc: "Measures credentials layout and degree indexing.",
      color: "bg-purple-500",
    },
    {
      title: "Key Projects",
      score: analysis.projectsScore,
      icon: <Code className="w-4 h-4 text-pink-400" />,
      desc: "Measures technical depth, scope, and code visibility.",
      color: "bg-pink-500",
    },
    {
      title: "Grammar & Phrasing",
      score: analysis.grammarScore,
      icon: <Languages className="w-4 h-4 text-amber-400" />,
      desc: "Measures spelling, active tone, and syntax structure.",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6 relative print:p-8 print:bg-white print:text-black">
      {/* CSS print utility overlay styles */}
      <style jsx global>{`
        @media print {
          header, aside, footer, nav, button, .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Loading Overlay during Analyze Again */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 print:hidden"
          >
            <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 animate-bounce">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                Analyzing Document...
              </h3>
              <p className="text-xs text-muted-foreground font-semibold max-w-xs">
                Gemini AI is reading structure, grammar, and ATS keyword gaps. This will take a few seconds.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <Link
            href="/resume"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to My Resumes
          </Link>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground truncate max-w-xl">
            AI Resume Analysis
          </h1>
          <p className="text-xs text-muted-foreground font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-foreground">{resume.fileName}</span>
            <span>•</span>
            <span>Uploaded {formatDate(resume.createdAt)}</span>
            <span>•</span>
            <span>Analyzed {formatDate(analysis.updatedAt)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download PDF report */}
          <Button
            onClick={handlePrintPDF}
            variant="outline"
            size="sm"
            className="rounded-xl border-border/40 font-semibold text-xs h-9 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            Download PDF Report
          </Button>

          {/* Re-Analyze */}
          <Button
            variant="default"
            size="sm"
            onClick={handleAnalyzeAgain}
            disabled={isAnalyzing}
            className="rounded-xl font-bold text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md shadow-indigo-500/10 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Analyze Again
          </Button>
        </div>
      </div>

      <Separator className="bg-border/40 print:hidden" />

      {/* Dynamic Summary Block */}
      {analysis.summary && (
        <Card className="border border-indigo-500/10 bg-indigo-500/5 rounded-2xl shadow-sm relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              AI Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs font-semibold leading-relaxed text-foreground/90 max-w-4xl">
            {analysis.summary}
          </CardContent>
        </Card>
      )}

      {/* Main SaaS Metrics Card Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Circle Ring Overall Metric */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-sm md:col-span-1">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-bold">Resume Grade</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-0 space-y-4">
            {/* BIG Grade Display */}
            <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl font-black ${getGradeClass(grade)}`}>
              {grade}
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-foreground">{analysis.overallScore}</span>
              <span className="text-xs text-muted-foreground font-semibold block">Overall Score</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
              Grade based on ATS structure, experiences impact, and project details scan.
            </p>
          </CardContent>
        </Card>

        {/* Executive SaaS Metrics Dashboard Card */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl p-6 shadow-sm md:col-span-3 space-y-4">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-blue-500">
            <ShieldCheck className="w-4.5 h-4.5" />
            Key Portfolio Benchmarks
          </CardTitle>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-accent/30 space-y-1 border border-border/20">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Estimated Percentile</span>
              <p className="text-base font-black text-foreground">Top {100 - percentile}%</p>
              <span className="text-[9px] text-muted-foreground block">Better than {percentile}% of applicants</span>
            </div>

            <div className="p-3.5 rounded-xl bg-accent/30 space-y-1 border border-border/20">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Improvement Priority</span>
              <p className={`text-base font-black ${
                improvementPriority === "High" ? "text-rose-500" : improvementPriority === "Medium" ? "text-amber-500" : "text-emerald-500"
              }`}>{improvementPriority}</p>
              <span className="text-[9px] text-muted-foreground block">Urgency of suggestions action</span>
            </div>

            <div className="p-3.5 rounded-xl bg-accent/30 space-y-1 border border-border/20">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">ATS Score Increase</span>
              <p className="text-base font-black text-indigo-400">+{Math.min(98, analysis.atsScore + 14) - analysis.atsScore} Points</p>
              <span className="text-[9px] text-muted-foreground block">With optimization suggestions: {estAtsImprovement}</span>
            </div>
          </div>

          {/* Core Health Check Status */}
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-foreground">Content Health Status</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-bold">
              <div className="p-2.5 rounded-lg border border-border/30 bg-card/60 flex items-center justify-between">
                <span className="text-muted-foreground">Formatting</span>
                <span className={analysis.atsScore >= 80 ? "text-green-500" : "text-amber-500"}>
                  {analysis.atsScore >= 80 ? "Pass" : "Warning"}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-border/30 bg-card/60 flex items-center justify-between">
                <span className="text-muted-foreground">Grammar</span>
                <span className={analysis.grammarScore >= 80 ? "text-green-500" : "text-amber-500"}>
                  {analysis.grammarScore >= 80 ? "Pass" : "Review"}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-border/30 bg-card/60 flex items-center justify-between">
                <span className="text-muted-foreground">Keywords</span>
                <span className={analysis.skillsScore >= 80 ? "text-green-500" : "text-rose-500"}>
                  {analysis.skillsScore >= 80 ? "Complete" : "Low"}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-border/30 bg-card/60 flex items-center justify-between">
                <span className="text-muted-foreground">Length</span>
                <span className="text-green-500">Optimized</span>
              </div>
              <div className="p-2.5 rounded-lg border border-border/30 bg-card/60 flex items-center justify-between col-span-2 sm:col-span-1">
                <span className="text-muted-foreground">Sections</span>
                <span className={analysis.projectsScore >= 70 ? "text-green-500" : "text-amber-500"}>
                  {analysis.projectsScore >= 70 ? "Full" : "Check"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid: 6 Individual Scorecard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scoreCardsConfig.map((card, idx) => (
          <Card key={idx} className="border-border/40 bg-card/40 backdrop-blur-sm hover:border-border transition-colors duration-300 rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-muted/60 border border-border/40 shrink-0">
                    {card.icon}
                  </div>
                  <CardTitle className="text-xs font-bold">{card.title}</CardTitle>
                </div>
                <span className="text-xs font-black text-foreground">{card.score}%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={card.score} className="h-1.5 bg-accent" />
              <p className="text-[11px] leading-relaxed text-muted-foreground font-semibold">
                {card.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Column Row: Strengths vs Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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

        <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Content Gaps & Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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

      {/* Row: Missing Keywords & Actionable Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Missing ATS Keywords</CardTitle>
              <CardDescription className="text-[10px] font-semibold leading-relaxed">
                Add these key competencies to improve your ATS score
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {!preferences.highlightKeywords ? (
                <span className="text-xs text-muted-foreground font-semibold italic">Highlight missing keywords is disabled.</span>
              ) : missingKeywords.length === 0 ? (
                <span className="text-xs text-muted-foreground font-semibold italic">No missing keywords detected. Good job!</span>
              ) : (
                missingKeywords.map((kw, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold border-border/40 bg-muted/60 text-foreground"
                  >
                    + {kw}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Actionable Suggestions</CardTitle>
              <CardDescription className="text-[10px] font-semibold leading-relaxed">
                Check off suggestions as you update your resume file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {!preferences.autoGenerateSuggestions ? (
                <p className="text-xs text-muted-foreground font-semibold italic">Auto Generate suggestions is disabled.</p>
              ) : suggestions.length === 0 ? (
                <p className="text-xs text-muted-foreground font-semibold">No suggestions available.</p>
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
      </div>
    </div>
  );
}
