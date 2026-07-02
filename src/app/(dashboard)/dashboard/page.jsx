"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Mail,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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

const activities = [
  {
    id: 1,
    type: "resume",
    title: "Resume Analyzed",
    description: "Senior Frontend Engineer Resume optimized. ATS score improved to 82.",
    time: "2 hours ago",
    icon: FileCheck2,
    iconColor: "text-green-500 bg-green-500/10",
    badgeColor: "success",
  },
  {
    id: 2,
    type: "interview",
    title: "Mock Interview Completed",
    description: "Frontend Engineer role mock session. Communication score: 85%.",
    time: "Yesterday",
    icon: Mic,
    iconColor: "text-blue-500 bg-blue-500/10",
    badgeColor: "info",
  },
  {
    id: 3,
    type: "match",
    title: "Job Match Analysis",
    description: "Matched against 'Senior Developer' at Google. Match probability: 74%.",
    time: "3 days ago",
    icon: Target,
    iconColor: "text-cyan-500 bg-cyan-500/10",
    badgeColor: "accent",
  },
  {
    id: 4,
    type: "letter",
    title: "Cover Letter Generated",
    description: "Created customized cover letter for Microsoft. Tone: Professional.",
    time: "4 days ago",
    icon: Mail,
    iconColor: "text-purple-500 bg-purple-500/10",
    badgeColor: "secondary",
  },
];

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
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

  const stats = [
    {
      title: "Resume Score",
      value: "78",
      max: "100",
      change: "+4 from last week",
      trend: "up",
      icon: FileText,
      color: "text-blue-500",
      progress: 78,
    },
    {
      title: "ATS Score",
      value: "82",
      max: "100",
      change: "Good profile match",
      trend: "up",
      icon: Gauge,
      color: "text-green-500",
      progress: 82,
    },
    {
      title: "Job Match %",
      value: "74%",
      max: null,
      change: "Google, Vercel roles",
      trend: "neutral",
      icon: Target,
      color: "text-cyan-500",
      progress: 74,
    },
    {
      title: "Interview Score",
      value: "85",
      max: "100",
      change: "Excellent delivery",
      trend: "up",
      icon: Award,
      color: "text-purple-500",
      progress: 85,
    },
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
          {isLoaded && user ? (
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
              Welcome back, {user.firstName || "there"}! 👋
            </h2>
          ) : (
            <div className="h-9 w-64 bg-accent animate-pulse rounded-lg" />
          )}
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
          const Icon = stat.icon;
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
                <Icon className={`w-4 h-4 ${stat.color} transition-transform duration-200 group-hover:scale-110`} />
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
                className="text-xs text-blue-500 hover:text-blue-600 rounded-xl"
                onClick={() => {
                  toast.success("Navigating to full activity logs...", {
                    description: "Activity page placeholder",
                  });
                }}
              >
                View all
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                {activities.map((act) => {
                  const ActIcon = act.icon;
                  return (
                    <div
                      key={act.id}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/30 transition-colors duration-200 group cursor-pointer"
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${act.iconColor}`}>
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
