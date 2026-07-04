"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Sparkles,
  Eye,
  ArrowRight,
  ClipboardCheck,
  ArrowLeft,
  Trash2,
  RotateCcw,
  Sliders,
  TrendingUp,
  Activity,
  Award,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const formatDuration = (totalSecs) => {
  if (!totalSecs) return "0s";
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const getStatusBadge = (status, score, t) => {
  switch (status) {
    case "ACTIVE":
      return { label: t("interview.history.status.active"), className: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    case "COMPLETED":
      return { label: t("interview.history.status.completed", { score: score || 0 }), className: "bg-green-500/10 text-green-400 border-green-500/20" };
    case "ABANDONED":
      return { label: t("interview.history.status.abandoned"), className: "bg-muted text-muted-foreground border-border/40" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border-border/40" };
  }
};

export function InterviewHistoryView({ initialSessions }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [activeFilter, setActiveFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  // Filter handlers
  const filteredSessions = sessions.filter((s) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "completed") return s.status === "COMPLETED";
    if (activeFilter === "technical") return s.title?.toLowerCase().includes("technical") || s.role?.toLowerCase().includes("tech");
    if (activeFilter === "behavioral") return s.title?.toLowerCase().includes("behavioral") || s.role?.toLowerCase().includes("hr");
    return true;
  });

  // Calculate aggregates
  const completed = sessions.filter((s) => s.status === "COMPLETED");
  const totalSessions = sessions.length;
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completed.length)
    : 0;
  const maxScore = completed.length > 0
    ? Math.max(...completed.map((s) => s.overallScore || 0))
    : 0;
  const totalPracticeTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  // Delete session handler
  const handleDeleteSession = async (id) => {
    try {
      const res = await fetch(`/api/interviews/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        toast.success(t("interview.history.toasts.deleted"));
        setDeletingId(null);
        router.refresh();
      } else {
        toast.error(t("interview.history.toasts.deleteFailed"));
      }
    } catch (e) {
      toast.error(t("interview.history.toasts.deleteError"));
    }
  };

  // Compile trend chart points for completed sessions (up to 5, chronological order)
  const chartSessions = [...completed].reverse().slice(-5);
  const chartPoints = chartSessions.map((s, i) => {
    const x = 40 + (i * 320) / Math.max(1, chartSessions.length - 1);
    const y = 140 - ((s.overallScore || 0) / 100) * 100;
    return { x, y, val: s.overallScore || 0, label: s.role.substring(0, 10) };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Link
          href="/interview"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("interview.history.back")}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{t("interview.history.title")}</h1>
            <p className="text-xs text-muted-foreground font-medium">
              {t("interview.history.desc")}
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Analytics Cards */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t("interview.history.totalSessions")}</span>
              <p className="text-xl font-black text-foreground">{totalSessions}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500"><Activity className="w-5 h-5" /></div>
          </Card>
          
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t("interview.history.avgScore")}</span>
              <p className="text-xl font-black text-indigo-400">{avgScore}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500"><Award className="w-5 h-5" /></div>
          </Card>

          <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t("interview.history.highestScore")}</span>
              <p className="text-xl font-black text-emerald-400">{maxScore}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500"><CheckCircle2 className="w-5 h-5" /></div>
          </Card>

          <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t("interview.history.totalTime")}</span>
              <p className="text-xl font-black text-teal-400">{formatDuration(totalPracticeTime)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500"><Clock className="w-5 h-5" /></div>
          </Card>
        </div>
      )}

      {/* SVG Score Trend Chart */}
      {completed.length > 0 && (
        <Card className="border border-border/40 bg-card/40 backdrop-blur-sm p-6 rounded-2xl flex flex-col justify-between">
          <div className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              {t("interview.history.trendsTitle")}
            </CardTitle>
            <CardDescription className="text-xs">{t("interview.history.trendsDesc")}</CardDescription>
          </div>
          <div className="h-44 pt-4 flex justify-center items-center">
            {chartPoints.length > 1 ? (
              <svg viewBox="0 0 400 160" className="w-full h-full">
                <line x1="30" y1="20" x2="380" y2="20" stroke="currentColor" className="text-border/10" strokeDasharray="3 3" />
                <line x1="30" y1="70" x2="380" y2="70" stroke="currentColor" className="text-border/10" strokeDasharray="3 3" />
                <line x1="30" y1="120" x2="380" y2="120" stroke="currentColor" className="text-border/10" strokeDasharray="3 3" />
                
                <path
                  d={chartPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                />

                {chartPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="6" fill="#6366f1" className="opacity-20" />
                    <circle cx={p.x} cy={p.y} r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
                    <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] font-black fill-foreground">{p.val}%</text>
                    <text x={p.x} y="150" textAnchor="middle" className="text-[8px] font-bold fill-muted-foreground">{p.label}</text>
                  </g>
                ))}
              </svg>
            ) : (
              <p className="text-xs text-muted-foreground font-semibold italic">{t("interview.history.trendsEmpty")}</p>
            )}
          </div>
        </Card>
      )}

      {/* Filter Options */}
      {sessions.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {["all", "completed", "technical", "behavioral"].map((f) => (
            <Button
              key={f}
              onClick={() => setActiveFilter(f)}
              variant={activeFilter === f ? "default" : "outline"}
              className="h-8 rounded-xl px-4 text-xs font-bold capitalize cursor-pointer"
            >
              {t(`interview.history.filters.${f}`)}
            </Button>
          ))}
        </div>
      )}

      {filteredSessions.length === 0 ? (
        /* Empty State */
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm py-20">
          <CardContent className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 animate-pulse">
              <ClipboardCheck className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">{t("interview.history.empty.title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
                {t("interview.history.empty.desc")}
              </p>
            </div>
            <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10 h-10 px-5">
              <Link href="/interview">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                {t("interview.history.empty.btn")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Sessions List Grid */
        <div className="grid gap-5 sm:grid-cols-2">
          {filteredSessions.map((sess) => {
            const badge = getStatusBadge(sess.status, sess.overallScore, t);
            const isDeleting = deletingId === sess.id;

            // Extrapolate detailed category scores for older history entries
            const scores = sess.categoryScores || {};
            const tech = scores.technicalScore || sess.overallScore || 0;
            const comm = scores.communicationScore || sess.overallScore || 0;
            const conf = scores.confidenceScore || sess.overallScore || 0;

            return (
              <Card
                key={sess.id}
                className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-border/80 hover:shadow-md transition-all duration-300 flex flex-col group overflow-hidden"
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 relative">
                  <div className="flex items-center gap-3 min-w-0 pr-12">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-105 transition-transform duration-200 shrink-0">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-bold text-foreground truncate group-hover:text-indigo-400 transition-colors duration-200" title={sess.title}>
                        {sess.title}
                      </CardTitle>
                      <span className="text-[10px] font-semibold text-muted-foreground/80 tracking-wide uppercase mt-0.5 block">
                        {t("interview.history.card.difficulty", { role: sess.role, difficulty: sess.difficulty || "Medium" })}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-2 flex-1 space-y-3.5">
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground border-b border-border/20 pb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{new Date(sess.createdAt).toLocaleDateString("en-US")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{t("interview.history.card.duration", { val: formatDuration(sess.duration) })}</span>
                    </div>
                  </div>

                  {/* Render category indicators */}
                  {sess.status === "COMPLETED" && (
                    <div className="grid grid-cols-3 gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/10 text-[10px] font-bold text-center">
                      <div>
                        <span className="text-muted-foreground block text-[8px] uppercase">{t("interview.result.tech")}</span>
                        <span className="text-indigo-400">{tech}%</span>
                      </div>
                      <div className="border-l border-border/20">
                        <span className="text-muted-foreground block text-[8px] uppercase">{t("interview.result.clarity")}</span>
                        <span className="text-teal-400">{comm}%</span>
                      </div>
                      <div className="border-l border-border/20">
                        <span className="text-muted-foreground block text-[8px] uppercase">{t("interview.result.confidence")}</span>
                        <span className="text-amber-400">{conf}%</span>
                      </div>
                    </div>
                  )}

                  {isDeleting && (
                    <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-[11px] font-semibold flex flex-col gap-2">
                      <span>{t("interview.history.card.deleteConfirm")}</span>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSession(sess.id)}
                          className="h-6 rounded-lg text-[10px] px-2.5 font-bold cursor-pointer"
                        >
                          {t("interview.history.card.confirmBtn")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeletingId(null)}
                          className="h-6 rounded-lg text-[10px] px-2.5 font-bold bg-transparent border-destructive/20 hover:bg-destructive/10 cursor-pointer"
                        >
                          {t("interview.history.card.cancelBtn")}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-between gap-2.5 bg-muted/20 px-4 py-3">
                  <Badge variant="outline" className={badge.className}>
                    {badge.label}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    {/* View Report / Resume */}
                    {sess.status === "COMPLETED" ? (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-xl border border-border/40 text-xs font-bold gap-1.5 text-indigo-400 bg-background/50 hover:bg-accent cursor-pointer"
                      >
                        <Link href={`/interview/${sess.id}/results`}>
                          <Eye className="w-3.5 h-3.5" />
                          {t("interview.history.card.viewReport")}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-xl border border-border/40 text-xs font-bold gap-1.5 text-foreground hover:bg-accent cursor-pointer"
                      >
                        <Link href={`/interview/${sess.id}`}>
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                          {t("interview.history.card.resumeSession")}
                        </Link>
                      </Button>
                    )}

                    {/* Retry mock */}
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-xl border border-border/40 hover:bg-accent cursor-pointer text-muted-foreground hover:text-foreground"
                      title={t("interview.history.card.retryTitle")}
                    >
                      <Link href="/interview">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Link>
                    </Button>

                    {/* Delete */}
                    {!isDeleting && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(sess.id)}
                        className="w-8 h-8 rounded-xl border border-border/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                        title={t("interview.history.card.deleteTitle")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
