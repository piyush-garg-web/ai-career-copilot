"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
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
  Star,
  Trash2,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { usePremium } from "@/hooks/use-premium";
import { PremiumBadge } from "@/components/shared/PremiumBadge";

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
  initialReviews = [],
  voiceStats = {
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    totalPracticeTime: 0,
    lastInterviewDate: "N/A",
    voiceReadinessScore: 0,
  },
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isPremium } = usePremium();

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "";
    const diffInMs = Date.now() - new Date(timestamp).getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return t("common.justNow");
    if (diffInMins < 60) return t("common.minutesAgo", { count: diffInMins });
    if (diffInHours < 24) return t("common.hoursAgo", { count: diffInHours });
    if (diffInDays === 1) return t("common.daysAgo", { count: 1 });
    if (diffInDays < 30) return t("common.daysAgo", { count: diffInDays });
    return new Date(timestamp).toLocaleDateString();
  };

  const uploadedDateFormatted = resumeUploadedDate ? getRelativeTime(resumeUploadedDate) : t("dashboard.stats.noUploadsYet");
  const lastAnalyzedNameFormatted = lastAnalyzedResumeName || t("common.none");

  const [userReviews, setUserReviews] = React.useState(initialReviews || []);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState(null);

  const [reviewRating, setReviewRating] = React.useState(0);
  const [reviewTitle, setReviewTitle] = React.useState("");
  const [reviewText, setReviewText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeletingId, setIsDeletingId] = React.useState(null);

  // Sync state when editing targets change
  React.useEffect(() => {
    if (editingReview) {
      setReviewRating(editingReview.rating);
      setReviewTitle(editingReview.title);
      setReviewText(editingReview.review);
    } else {
      setReviewRating(0);
      setReviewTitle("");
      setReviewText("");
    }
  }, [editingReview]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      toast.error(t("dashboard.reviews.validation.rating"));
      return;
    }
    if (!reviewTitle.trim()) {
      toast.error(t("dashboard.reviews.validation.titleRequired"));
      return;
    }
    if (reviewTitle.length > 100) {
      toast.error(t("dashboard.reviews.validation.titleLength"));
      return;
    }
    if (!reviewText.trim()) {
      toast.error(t("dashboard.reviews.validation.descriptionRequired"));
      return;
    }
    if (reviewText.length > 500) {
      toast.error(t("dashboard.reviews.validation.descriptionLength"));
      return;
    }

    setIsSubmitting(true);
    const url = editingReview ? `/api/reviews/${editingReview.id}` : "/api/reviews";
    const method = editingReview ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          review: reviewText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingReview ? t("dashboard.reviews.success.updated") : t("dashboard.reviews.success.submitted"));
        
        if (editingReview) {
          setUserReviews((prev) =>
            prev.map((r) => (r.id === editingReview.id ? data.review : r))
          );
        } else {
          setUserReviews((prev) => [data.review, ...prev]);
        }

        setIsFormOpen(false);
        setEditingReview(null);
      } else {
        toast.error(data.error || t("dashboard.reviews.errors.save"));
      }
    } catch (err) {
      toast.error(t("dashboard.reviews.errors.saveUnexpected"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm(t("dashboard.reviews.confirmDelete"))) return;
    setIsDeletingId(reviewId);

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t("dashboard.reviews.success.deleted"));
        setUserReviews((prev) => prev.filter((r) => r.id !== reviewId));
        if (editingReview && editingReview.id === reviewId) {
          setEditingReview(null);
          setIsFormOpen(false);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || t("dashboard.reviews.errors.delete"));
      }
    } catch (err) {
      toast.error(t("dashboard.reviews.errors.deleteUnexpected"));
    } finally {
      setIsDeletingId(null);
    }
  };

  const quickActions = [
    {
      title: t("dashboard.quickActions.upload"),
      description: t("dashboard.quickActions.uploadDesc"),
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10 hover:shadow-blue-600/20",
      action: () => router.push("/resume"),
    },
    {
      title: t("dashboard.quickActions.analyze"),
      description: t("dashboard.quickActions.analyzeDesc"),
      icon: Sparkles,
      color: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10 hover:shadow-indigo-600/20",
      action: () => router.push("/resume/analysis"),
    },
    {
      title: t("dashboard.quickActions.interview"),
      description: t("dashboard.quickActions.interviewDesc"),
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
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent flex items-center gap-3">
            {t("dashboard.welcome.title")}, {userFirstName || t("dashboard.welcome.defaultUser")}! 👋
            {isPremium && <PremiumBadge />}
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {t("dashboard.welcome.subtitle")}
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

          const statsTitleMap = {
            "Resume Score": t("dashboard.stats.resumeScore"),
            "ATS Score": t("dashboard.stats.atsScoreCard"),
            "Job Match %": t("dashboard.stats.jobMatchCard"),
            "Interview Score": t("dashboard.stats.interviewScoreCard")
          };
          const title = statsTitleMap[stat.title] || stat.title;

          const changeTranslationMap = {
            "Latest resume optimization": t("dashboard.stats.latestResumeOptimization"),
            "No resume analyzed yet": t("dashboard.stats.noResumeAnalyzedYet"),
            "Strong ATS compatibility": t("dashboard.stats.strongAtsCompatibility"),
            "Needs keyword booster": t("dashboard.stats.needsKeywordBooster"),
            "Pending analysis": t("dashboard.stats.pendingAnalysis"),
            "Match compatibility scan": t("dashboard.stats.matchCompatibilityScan"),
            "No match scan run": t("dashboard.stats.noMatchScanRun"),
            "Excellent response quality": t("dashboard.stats.excellentResponseQuality"),
            "Requires coaching practice": t("dashboard.stats.requiresCoachingPractice"),
            "No coach session completed": t("dashboard.stats.noCoachSessionCompleted")
          };
          const change = changeTranslationMap[stat.change] || stat.change;

          return (
            <Card
              key={idx}
              className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden relative group hover:border-border transition-all duration-300 hover:shadow-md hover:shadow-accent/5"
            >
              {/* Colored top hover indicator */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {title}
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
                    <span>{change}</span>
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
                {t("dashboard.stats.completeness")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{profileCompletion}% {t("dashboard.quickActions.complete")}</span>
              </div>
              <Progress value={profileCompletion} className="h-2 bg-accent" />
              <p className="text-[10px] text-muted-foreground font-semibold">
                {t("dashboard.stats.completenessHint")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-colors duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                {t("dashboard.metadata.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs font-semibold text-muted-foreground">
              <div className="flex justify-between border-b border-border/20 pb-2">
                <span>{t("dashboard.metadata.lastUpload")}</span>
                <span className="text-foreground">{uploadedDateFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("dashboard.metadata.lastAnalyzed")}</span>
                <span className="text-foreground truncate max-w-[150px]" title={lastAnalyzedNameFormatted}>{lastAnalyzedNameFormatted}</span>
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
                {t("dashboard.weeklyTrend.title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("dashboard.weeklyTrend.desc")}
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
                {points.map((p, i) => {
                  const labelMap = {
                    "Resume": t("dashboard.stats.resumeScore"),
                    "ATS": t("dashboard.stats.atsScoreCard"),
                    "Job Match": t("dashboard.stats.jobMatchCard"),
                    "Interview": t("dashboard.stats.interviewScoreCard")
                  };
                  const label = labelMap[p.label] || p.label;
                  return (
                    <g key={i}>
                      {/* Shadow circle for visual depth */}
                      <circle cx={p.x} cy={p.y} r="8" fill={p.color} className="opacity-20" />
                      <circle cx={p.x} cy={p.y} r="4" fill={p.color} stroke="#ffffff" strokeWidth="1.5" />
                      <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[10px] font-black fill-foreground">
                        {p.val}%
                      </text>
                      <text x={p.x} y="180" textAnchor="middle" className="text-[9px] font-bold fill-muted-foreground">
                        {label}
                      </text>
                    </g>
                  );
                })}
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
                {t("dashboard.suggestions.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {suggestions.map((s, i) => (
                <div key={i} className="flex gap-2.5 items-start text-xs font-semibold text-muted-foreground leading-relaxed">
                  <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0">✦</span>
                  <span>{s.startsWith("dashboard.") ? t(s) : s}</span>
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
                {t("dashboard.insights.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {insights.map((ins, i) => (
                <div key={i} className="flex gap-2.5 items-start text-xs font-semibold text-muted-foreground leading-relaxed">
                  <span className="p-1 rounded bg-teal-500/10 text-teal-400 shrink-0">✔</span>
                  <span>{ins.startsWith("dashboard.") ? t(ins) : ins}</span>
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
                  {t("dashboard.activity.title")}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                  {t("dashboard.activity.desc")}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-500 hover:text-blue-600 rounded-xl cursor-pointer"
                onClick={() => router.push("/resume/analysis")}
              >
                {t("dashboard.activity.viewAll")}
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              {activities.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-semibold">{t("dashboard.activity.empty")}</p>
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
                              {act.titleKey ? t(act.titleKey) : act.title}
                            </p>
                            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                              {act.createdAt ? getRelativeTime(act.createdAt) : act.time}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {act.descKey ? t(act.descKey, act.descParams) : act.description}
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
                {t("dashboard.quickActions.title")}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                {t("dashboard.quickActions.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {quickActions.map((action, idx) => {
                const ActionIcon = action.icon;
                const actionsTitleMap = {
                  "Upload Resume": t("dashboard.quickActions.upload"),
                  "Analyze Resume": t("dashboard.quickActions.analyze"),
                  "Start Interview": t("dashboard.quickActions.interview")
                };
                const actionTitle = actionsTitleMap[action.title] || action.title;

                const actionsDescMap = {
                  "Upload a PDF or Word document.": t("dashboard.quickActions.uploadDesc"),
                  "Run ATS scanning & optimizations.": t("dashboard.quickActions.analyzeDesc"),
                  "Practice behavioral & technical questions.": t("dashboard.quickActions.interviewDesc")
                };
                const actionDesc = actionsDescMap[action.description] || action.description;

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
                          {actionTitle}
                        </span>
                        <span className="text-[10px] opacity-80 leading-none mt-1 font-medium">
                          {actionDesc}
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

      {/* Premium Voice Mock Interview Card */}
      {isPremium && (
        <motion.div variants={itemVariants} className="mt-8">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden relative group hover:border-border transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-blue-500/10 via-blue-500/60 to-indigo-500/10 opacity-70" />
            <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Mic className="w-5 h-5 text-blue-500" />
                  🎤 AI Mock Interview (Voice + Video)
                </CardTitle>
                <CardDescription className="text-xs max-w-2xl leading-relaxed">
                  Practice realistic AI-powered voice & video interviews with real-time speech recognition, natural AI voice responses, detailed communication analytics, and personalized feedback.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => router.push("/voice-mock-interview")}
                  className="rounded-xl"
                >
                  Start Voice Interview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/voice-mock-interview?tab=history")}
                  className="rounded-xl"
                >
                  View History
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="grid gap-4 grid-cols-2 md:grid-cols-6 border-t border-border/20 pt-4 text-center">
                <div className="space-y-1 p-2 rounded-xl bg-accent/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Total Interviews</span>
                  <span className="text-sm font-black text-foreground block pt-0.5">{voiceStats.totalInterviews}</span>
                </div>
                <div className="space-y-1 p-2 rounded-xl bg-accent/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Average Score</span>
                  <span className="text-sm font-black text-foreground block pt-0.5">{voiceStats.averageScore}%</span>
                </div>
                <div className="space-y-1 p-2 rounded-xl bg-accent/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Best Score</span>
                  <span className="text-sm font-black text-foreground block pt-0.5">{voiceStats.bestScore}%</span>
                </div>
                <div className="space-y-1 p-2 rounded-xl bg-accent/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Practice Time</span>
                  <span className="text-sm font-black text-foreground block pt-0.5">{voiceStats.totalPracticeTime} mins</span>
                </div>
                <div className="space-y-1 p-2 rounded-xl bg-accent/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Last Interview</span>
                  <span className="text-[11px] font-black text-foreground block pt-0.5">{voiceStats.lastInterviewDate}</span>
                </div>
                <div className="space-y-1 p-2 rounded-xl bg-accent/20 flex flex-col justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Readiness Score</span>
                  <span className="text-sm font-black text-foreground block">{voiceStats.voiceReadinessScore}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Community Reviews Feedback Card */}
      <motion.div variants={itemVariants} className="mt-8">
        <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                {t("dashboard.reviews.title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("dashboard.reviews.description")}
              </CardDescription>
            </div>
            {!isFormOpen && (
              <Button
                onClick={() => {
                  setEditingReview(null);
                  setIsFormOpen(true);
                }}
                className="rounded-xl px-4 py-2 cursor-pointer bg-primary hover:bg-primary/95 text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t("dashboard.reviews.write")}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {isFormOpen && (
              <div className="p-5 rounded-2xl border border-border/40 bg-background/50 space-y-4">
                <h3 className="text-sm font-extrabold text-foreground">
                  {editingReview ? t("dashboard.reviews.editTitle") : t("dashboard.reviews.newTitle")}
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground">{t("dashboard.reviews.yourRating")}</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-0.5 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors duration-150 ${
                              star <= reviewRating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted-foreground/35 fill-transparent hover:text-yellow-500/80"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="review-title" className="text-xs font-bold text-foreground">
                      {t("dashboard.reviews.reviewTitle")}
                    </label>
                    <input
                      id="review-title"
                      type="text"
                      placeholder={t("dashboard.reviews.titlePlaceholder")}
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      maxLength={100}
                      required
                      className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all duration-200"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="review-description" className="text-xs font-bold text-foreground">
                      {t("dashboard.reviews.reviewDetails")}
                    </label>
                    <textarea
                      id="review-description"
                      placeholder={t("dashboard.reviews.detailsPlaceholder")}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      maxLength={500}
                      required
                      className="w-full min-h-[100px] p-3 rounded-xl border border-border/50 bg-background/50 text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all duration-200 resize-none"
                    />
                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                      <span>{t("dashboard.reviews.maxCharacters")}</span>
                      <span>{reviewText.length} / 500</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingReview(null);
                      }}
                      className="rounded-xl text-xs font-bold cursor-pointer"
                    >
                      {t("dashboard.reviews.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {isSubmitting ? t("dashboard.reviews.saving") : editingReview ? t("dashboard.reviews.saveChanges") : t("dashboard.reviews.submitReview")}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* List of user reviews */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground/80">
                {t("dashboard.reviews.yourReviews", { count: userReviews.length })}
              </h3>
              {userReviews.length === 0 ? (
                <p className="text-xs text-muted-foreground/85 font-medium py-3 text-center border border-dashed border-border/40 rounded-xl">
                  {t("dashboard.reviews.empty")}
                </p>
              ) : (
                <div className="grid gap-4">
                  {userReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl border border-border/45 bg-background/30 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-border/80 transition-colors"
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-muted-foreground/20"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {new Date(rev.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-foreground truncate">{rev.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                          &ldquo;{rev.review}&rdquo;
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingReview(rev);
                            setIsFormOpen(true);
                          }}
                          className="rounded-xl h-8 px-2.5 text-[11px] font-bold cursor-pointer hover:bg-secondary/60"
                        >
                          <Edit className="w-3 h-3 mr-1.5" />
                          {t("dashboard.reviews.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteReview(rev.id)}
                          disabled={isDeletingId === rev.id}
                          className="rounded-xl h-8 px-2.5 text-[11px] font-bold text-red-500 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 mr-1.5" />
                          {isDeletingId === rev.id ? "..." : t("dashboard.reviews.delete")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
