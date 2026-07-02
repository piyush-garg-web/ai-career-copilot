"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gauge,
  Sparkles,
  FileText,
  Calendar,
  HardDrive,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Download,
  ShieldCheck,
  Check,
  X,
  FileCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = 1;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

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

const getGrade = (score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B+";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
};

export function AtsClientView({ resumes, averageAtsScore, analyzedResumes }) {
  const router = useRouter();

  // Find latest analyzed scorecard
  const latestAnalyzed = analyzedResumes[0];
  const currentAts = latestAnalyzed ? latestAnalyzed.analysis.atsScore : 0;
  const currentGrade = getGrade(currentAts);

  // Benchmarks comparison calculations
  const top10Percent = 92;
  const benchmarkAverage = 68;

  // Compile checklist states from latest analysis
  const hasFormatting = currentAts >= 80;
  const hasKeywords = latestAnalyzed ? (latestAnalyzed.analysis.skillsScore >= 75) : false;
  const hasSections = latestAnalyzed ? (latestAnalyzed.analysis.educationScore >= 70 && latestAnalyzed.analysis.experienceScore >= 70) : false;
  const hasGrammar = latestAnalyzed ? (latestAnalyzed.analysis.grammarScore >= 80) : false;
  const hasReadability = currentAts >= 75;

  const handlePrint = () => {
    window.print();
    toast.success("Preparing ATS scorecards report print view...");
  };

  // Compile SVG line graph coordinates for the analyzed resumes (limit to 5)
  const chartResumes = [...analyzedResumes].reverse().slice(-5);
  const chartPoints = chartResumes.map((r, i) => {
    const x = 50 + (i * 300) / Math.max(1, chartResumes.length - 1);
    const y = 150 - (r.analysis.atsScore / 100) * 110;
    return { x, y, score: r.analysis.atsScore, name: r.fileName.substring(0, 10) };
  });

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

      <PageHeader
        title="ATS Score Optimizer"
        description="Verify compatibility of your resumes with parsing engines, optimize keyword density, and identify structural gaps."
        actions={
          analyzedResumes.length > 0 && (
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="rounded-xl border-border/40 font-semibold text-xs h-9 cursor-pointer print:hidden"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download ATS Report
            </Button>
          )
        }
      />

      {analyzedResumes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Executive Grade & Benchmark Summary */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm p-6 flex flex-col justify-between items-center text-center">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ATS Grade</span>
              <div className="w-16 h-16 rounded-full border border-indigo-500/30 flex items-center justify-center text-2xl font-black bg-indigo-500/5 text-indigo-400">
                {currentGrade}
              </div>
            </div>
            <div className="space-y-1.5 pt-4">
              <span className="text-2xl font-black text-foreground">{currentAts}%</span>
              <span className="text-[10px] text-muted-foreground font-semibold block">Your Current score</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold pt-2 leading-relaxed">
              Target a score above 80% to bypass initial parsing filters.
            </p>
          </Card>

          {/* Industry Benchmark comparisons */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm p-6 space-y-4 lg:col-span-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
              Industry ATS Benchmarks Comparison
            </h3>
            
            <div className="space-y-3 pt-2">
              {/* Average ATS */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Average ATS Score</span>
                  <span className="text-foreground">{benchmarkAverage}%</span>
                </div>
                <Progress value={benchmarkAverage} className="h-1.5 bg-accent" />
              </div>

              {/* Your ATS */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-indigo-400">Your Current ATS Score</span>
                  <span className="text-indigo-400">{currentAts}%</span>
                </div>
                <Progress value={currentAts} className="h-2 bg-indigo-600/30 [&>div]:bg-indigo-600" />
              </div>

              {/* Top 10% */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-emerald-400">Top 10% Industry Score</span>
                  <span className="text-emerald-400">{top10Percent}%</span>
                </div>
                <Progress value={top10Percent} className="h-1.5 bg-accent" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ATS Trend & Checklist Section */}
      {analyzedResumes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Custom SVG ATS Trend */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm p-6 lg:col-span-7 flex flex-col justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                ATS Trend Over Time
              </CardTitle>
              <CardDescription className="text-xs">
                History of scans showing progress and optimizations.
              </CardDescription>
            </div>
            <div className="h-44 pt-4 flex justify-center items-center">
              {chartPoints.length > 1 ? (
                <svg viewBox="0 0 400 180" className="w-full h-full">
                  <line x1="30" y1="20" x2="370" y2="20" stroke="currentColor" className="text-border/10" strokeDasharray="3 3" />
                  <line x1="30" y1="75" x2="370" y2="75" stroke="currentColor" className="text-border/10" strokeDasharray="3 3" />
                  <line x1="30" y1="130" x2="370" y2="130" stroke="currentColor" className="text-border/10" strokeDasharray="3 3" />

                  {/* Draw Trend path */}
                  <path
                    d={chartPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-75"
                  />

                  {/* Nodes */}
                  {chartPoints.map((p, idx) => (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r="7" fill="#8b5cf6" className="opacity-20" />
                      <circle cx={p.x} cy={p.y} r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1" />
                      <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] font-black fill-foreground">
                        {p.score}%
                      </text>
                      <text x={p.x} y="170" textAnchor="middle" className="text-[8px] font-bold fill-muted-foreground">
                        {p.name}
                      </text>
                    </g>
                  ))}
                </svg>
              ) : (
                <p className="text-xs text-muted-foreground font-semibold italic">Upload and scan multiple resumes to plot a trend chart.</p>
              )}
            </div>
          </Card>

          {/* ATS Checklist Cards */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm p-6 lg:col-span-5 space-y-4">
            <div>
              <CardTitle className="text-sm font-bold">ATS Structural Checklist</CardTitle>
              <CardDescription className="text-xs">
                Essential checks to ensure error-free parsing.
              </CardDescription>
            </div>
            
            <div className="space-y-2.5 pt-2 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="flex items-center gap-1.5">
                  {hasFormatting ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-rose-500" />}
                  Layout formatting
                </span>
                <Badge variant="outline" className={hasFormatting ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"}>
                  {hasFormatting ? "Clean" : "Needs Review"}
                </Badge>
              </div>

              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="flex items-center gap-1.5">
                  {hasSections ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-rose-500" />}
                  Section indexing
                </span>
                <Badge variant="outline" className={hasSections ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"}>
                  {hasSections ? "Complete" : "Missing Info"}
                </Badge>
              </div>

              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="flex items-center gap-1.5">
                  {hasKeywords ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-rose-500" />}
                  Keyword density
                </span>
                <Badge variant="outline" className={hasKeywords ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"}>
                  {hasKeywords ? "Optimized" : "Low Density"}
                </Badge>
              </div>

              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="flex items-center gap-1.5">
                  {hasGrammar ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-rose-500" />}
                  Active grammar
                </span>
                <Badge variant="outline" className={hasGrammar ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"}>
                  {hasGrammar ? "Valid" : "Grammar Review"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {hasReadability ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-rose-500" />}
                  Parser readability
                </span>
                <Badge variant="outline" className={hasReadability ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"}>
                  {hasReadability ? "High" : "Low Index"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {resumes.length === 0 ? (
        /* Empty State */
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm py-20">
          <CardContent className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 animate-pulse">
              <Gauge className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">No Resumes Uploaded Yet</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
                Upload your portfolio resume to get immediate parsing scan results and optimization keyword checklists.
              </p>
            </div>
            <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 h-10 px-5">
              <Link href="/resume/upload">
                <Plus className="w-4.5 h-4.5" />
                Upload Resume
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Scorecards list */
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Resume ATS Optimization History</h2>
          <div className="grid gap-4 grid-cols-1">
            {resumes.map((res) => {
              const badge = getStatusBadge(res.status);
              const analysis = res.analysis;
              const missingKeywords = analysis?.keywords?.missingKeywords || [];

              return (
                <Card
                  key={res.id}
                  className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-border/80 transition-all duration-300 overflow-hidden"
                >
                  <CardHeader className="pb-4 border-b border-border/20 bg-muted/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground truncate" title={res.fileName}>
                          {res.fileName}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(res.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {formatFileSize(res.fileSize)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </CardHeader>
                  <CardContent className="py-6">
                    {res.status === "ANALYZED" && analysis ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* ATS Circle Gauge */}
                        <div className="md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/20 pb-4 md:pb-0 md:pr-6">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">ATS Score</span>
                          <div className="relative flex items-center justify-center w-24 h-24">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                className="text-muted/20"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                              />
                              <circle
                                className="text-indigo-500 transition-all duration-500 ease-out"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 40}
                                strokeDashoffset={2 * Math.PI * 40 - (analysis.atsScore / 100) * (2 * Math.PI * 40)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                              />
                            </svg>
                            <span className="absolute text-lg font-black text-foreground">{analysis.atsScore}%</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-semibold mt-3 text-center">
                            {analysis.atsScore >= 80 ? "Optimized" : "Needs Review"}
                          </span>
                        </div>

                        {/* Keyword optimizations and feedback */}
                        <div className="md:col-span-3 space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                              Missing Keywords to Optimize (ATS Booster)
                            </h4>
                            {missingKeywords.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {missingKeywords.slice(0, 10).map((kw, i) => (
                                  <Badge key={i} variant="secondary" className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 font-semibold text-[10px] rounded-lg">
                                    + {kw}
                                  </Badge>
                                ))}
                                {missingKeywords.length > 10 && (
                                  <Badge variant="outline" className="text-muted-foreground border-border/40 text-[10px] rounded-lg">
                                    +{missingKeywords.length - 10} more
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-green-500 font-semibold italic">
                                No missing keywords detected! Your resume is well optimized for ATS terms.
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-foreground">Score Summary</h4>
                            <p className="text-xs text-muted-foreground font-semibold leading-relaxed line-clamp-2">
                              {analysis.summary}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <AlertCircle className="w-6 h-6 text-muted-foreground/60 mb-2" />
                        <p className="text-xs text-muted-foreground font-semibold max-w-sm">
                          {res.status === "PARSED"
                            ? "This resume is ready for analysis, but you haven't run the ATS analyzer on it yet."
                            : "This resume is currently processing. Once parsing completes, you can run the ATS analysis scorecard."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/10 border-t border-border/20 px-6 py-3 flex justify-end">
                    {res.status === "ANALYZED" ? (
                      <Button asChild variant="default" size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 cursor-pointer gap-1">
                        <Link href={`/resume/analysis?id=${res.id}`}>
                          View Optimization Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    ) : res.status === "PARSED" ? (
                      <Button asChild variant="default" size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 cursor-pointer gap-1">
                        <Link href={`/resume/analysis?id=${res.id}`}>
                          Run ATS Analysis
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="sm" className="rounded-xl border-border/40 font-semibold text-xs h-8 cursor-pointer">
                        <Link href="/resume">
                          Manage Resume
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
