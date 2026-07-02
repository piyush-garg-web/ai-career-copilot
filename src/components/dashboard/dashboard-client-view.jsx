"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Gauge,
  Target,
  Mic,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Briefcase,
  ChevronRight,
  FileCheck2,
  Mail,
  User,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Framer motion animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },
  },
};

// Map activity types to icons and colors
const iconMap = {
  resume: { icon: FileCheck2, color: "text-green-500 bg-green-500/10" },
  interview: { icon: Mic, color: "text-blue-500 bg-blue-500/10" },
  match: { icon: Target, color: "text-cyan-500 bg-cyan-500/10" },
  letter: { icon: Mail, color: "text-purple-500 bg-purple-500/10" },
};

export function DashboardClientView({
  stats,
  activities,
  userFirstName,
  profileCompletion = 0,
  resumeUploadedDate = "N/A",
  lastAnalyzedResumeName = "None",
  suggestions = [],
  insights = [],
}) {
  const router = useRouter();

  const quickActions = [
    {
      title: "Upload Resume",
      description: "Upload a PDF or Word document.",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10 hover:shadow-blue-600/20",
      action: () => router.push("/resume"),
    },
    {
      title: "Analyze Resume",
      description: "Run ATS scanning & optimizations.",
      icon: Sparkles,
      color: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10 hover:shadow-indigo-600/20",
      action: () => router.push("/resume/analysis"),
    },
    {
      title: "Start Interview",
      description: "Practice behavioral & technical questions.",
      icon: Mic,
      color: "bg-slate-900 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 hover:bg-slate-800 text-white shadow-slate-950/10",
      action: () => router.push("/interview"),
    },
  ];

  // Map stat configuration keys to runtime icons
  const statConfig = {
    "Resume Score": { icon: FileText, color: "text-blue-500" },
    "ATS Score": { icon: Gauge, color: "text-green-500" },
    "Job Match %": { icon: Target, color: "text-cyan-500" },
    "Interview Score": { icon: Award, color: "text-purple-500" },
  };

  // SVG Chart points calculation
  const points = [
    { x: 60, y: 160 - (stats[0].progress / 100) * 110, label: "Resume", val: stats[0].progress, color: "#3b82f6" },
    { x: 170, y: 160 - (stats[1].progress / 100) * 110, label: "ATS", val: stats[1].progress, color: "#10b981" },
    { x: 280, y: 160 - (stats[2].progress / 100) * 110, label: "Job Match", val: stats[2].progress, color: "#06b6d4" },
    { x: 390, y: 160 - (stats[3].progress / 100) * 110, label: "Interview", val: stats[3].progress, color: "#8b5cf6" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
            Welcome back, {userFirstName || "there"}! 👋
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Here&apos;s an overview of your resume improvements and interview coach prep.
          </p>
        </div>
      </motion.div>

      {/* Analytics Cards Grid */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, idx) => {
          const config = statConfig[stat.title] || { icon: FileText, color: "text-blue-500" };
          const Icon = config.icon;
          return (
            <Card
              key={idx}
              className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden relative group hover:border-border transition-all duration-300 hover:shadow-md hover:shadow-accent/5"
            >
              {/* Colored top hover indicator */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </span>
                <Icon className={`w-4 h-4 ${config.color} transition-transform duration-200 group-hover:scale-110`} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {stat.value}
                  </span>
                  {stat.max && (
                    <span className="text-xs text-muted-foreground/80 font-medium">
                      /{stat.max}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Progress value={stat.progress} className="h-1.5 bg-accent" />
                  <p className="text-[11px] font-medium text-muted-foreground/90 flex items-center gap-1">
                    {stat.trend === "up" && (
                      <TrendingUp className="w-3 h-3 text-green-500 inline-block" />
                    )}
                    <span>{stat.change}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Profile Completion, Metadata & Weekly Analytics Row */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Profile Completion & Metadata */}
        <motion.div variants={itemVariants} className="md:col-span-5 lg:col-span-4 space-y-6">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-colors duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{profileCompletion}% Complete</span>
              </div>
              <Progress value={profileCompletion} className="h-2 bg-accent" />
              <p className="text-[10px] text-muted-foreground font-semibold">
                Complete your target role, goals, and experience details in the Profile tab to align AI metrics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-colors duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                Resume Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs font-semibold text-muted-foreground">
              <div className="flex justify-between border-b border-border/20 pb-2">
                <span>Last Upload Date</span>
                <span className="text-foreground">{resumeUploadedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Analyzed Resume</span>
                <span className="text-foreground truncate max-w-[150px]" title={lastAnalyzedResumeName}>{lastAnalyzedResumeName}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Analytics Custom SVG Chart */}
        <motion.div variants={itemVariants} className="md:col-span-7 lg:col-span-8">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md h-full hover:border-border transition-colors duration-200">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Weekly Analytics Trend
              </CardTitle>
              <CardDescription className="text-xs">
                Performance indicators plotted across core coaching parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-44">
              <svg viewBox="0 0 450 200" className="w-full h-full">
                {/* Horizontal Guide Lines */}
                <line x1="30" y1="20" x2="420" y2="20" stroke="currentColor" className="text-border/20" strokeDasharray="3 3" />
                <line x1="30" y1="75" x2="420" y2="75" stroke="currentColor" className="text-border/20" strokeDasharray="3 3" />
                <line x1="30" y1="130" x2="420" y2="130" stroke="currentColor" className="text-border/20" strokeDasharray="3 3" />
                <line x1="30" y1="160" x2="420" y2="160" stroke="currentColor" className="text-border/40" />

                {/* Connecting Line path */}
                <path
                  d={`M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y}`}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                />

                {/* Data Points rendering */}
                {points.map((p, i) => (
                  <g key={i}>
                    {/* Shadow circle for visual depth */}
                    <circle cx={p.x} cy={p.y} r="8" fill={p.color} className="opacity-20" />
                    <circle cx={p.x} cy={p.y} r="4" fill={p.color} stroke="#ffffff" strokeWidth="1.5" />
                    <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[10px] font-black fill-foreground">
                      {p.val}%
                    </text>
                    <text x={p.x} y="180" textAnchor="middle" className="text-[9px] font-bold fill-muted-foreground">
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Suggestions & Quick Insights Row */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Recent AI Suggestions */}
        <motion.div variants={itemVariants} className="md:col-span-6 lg:col-span-6">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md h-full hover:border-border transition-colors duration-200">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Recent AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {suggestions.map((s, i) => (
                <div key={i} className="flex gap-2.5 items-start text-xs font-semibold text-muted-foreground leading-relaxed">
                  <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0">✦</span>
                  <span>{s}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Small Quick Insights */}
        <motion.div variants={itemVariants} className="md:col-span-6 lg:col-span-6">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md h-full hover:border-border transition-colors duration-200">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-400" />
                Coaching Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {insights.map((ins, i) => (
                <div key={i} className="flex gap-2.5 items-start text-xs font-semibold text-muted-foreground leading-relaxed">
                  <span className="p-1 rounded bg-teal-500/10 text-teal-400 shrink-0">✔</span>
                  <span>{ins}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Middle Grid: Recent Activity & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="md:col-span-7 lg:col-span-8">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md h-full hover:border-border transition-colors duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                  Your recent updates and system analysis logs.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-500 hover:text-blue-600 rounded-xl cursor-pointer"
                onClick={() => router.push("/resume/analysis")}
              >
                View all
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              {activities.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-semibold">No recent activity logs found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((act) => {
                    const mapped = iconMap[act.type] || { icon: Clock, color: "text-muted-foreground bg-muted" };
                    const ActIcon = mapped.icon;
                    return (
                      <div
                        key={act.id}
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/30 transition-colors duration-200 group cursor-pointer"
                        onClick={() => {
                          if (act.type === "resume") router.push(`/resume/analysis?id=${act.refId}`);
                          if (act.type === "match") router.push(`/job-match`);
                          if (act.type === "interview") router.push(`/interview/history`);
                        }}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${mapped.color}`}>
                          <ActIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-0.5 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                              {act.title}
                            </p>
                            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                              {act.time}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {act.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="md:col-span-5 lg:col-span-4">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md h-full hover:border-border transition-colors duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                Launch key workflows instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {quickActions.map((action, idx) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={idx}
                    onClick={action.action}
                    className={`w-full justify-between h-14 rounded-xl px-4 py-3 flex items-center transition-all duration-200 cursor-pointer ${action.color}`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-1.5 rounded-lg bg-white/10 text-white shrink-0">
                        <ActionIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold leading-none">
                          {action.title}
                        </span>
                        <span className="text-[10px] opacity-80 leading-none mt-1 font-medium">
                          {action.description}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
