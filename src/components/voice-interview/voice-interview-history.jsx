// src/components/voice-interview/voice-interview-history.jsx

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import {
  Mic,
  Video,
  Search,
  SlidersHorizontal,
  Clock,
  Award,
  Trash2,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export function VoiceInterviewHistory({ sessions = [], onViewSession, onRetakeSession, onDeleteSession }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [deletingId, setDeletingId] = useState(null);

  // Extract unique interview types for filters
  const uniqueTypes = ["all", ...new Set(sessions.map((s) => s.interviewType).filter(Boolean))];

  // Client-side search & filtering logic
  const filteredSessions = sessions
    .filter((session) => {
      const matchSearch =
        session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.role?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDifficulty =
        difficultyFilter === "all" || session.difficulty === difficultyFilter;

      const matchType =
        typeFilter === "all" || session.interviewType === typeFilter;

      return matchSearch && matchDifficulty && matchType;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "highest") {
        return (b.overallScore || 0) - (a.overallScore || 0);
      }
      if (sortBy === "lowest") {
        return (a.overallScore || 0) - (b.overallScore || 0);
      }
      return 0;
    });

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation(); // prevent card click
    if (!confirm("Are you sure you want to permanently delete this voice interview session and all its associated reports/analytics?")) {
      return;
    }

    setDeletingId(sessionId);
    try {
      const res = await fetch(`/api/voice-interview/${sessionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Voice Interview Session deleted successfully.");
        if (onDeleteSession) {
          onDeleteSession(sessionId);
        }
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Delete failed");
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to delete session.");
    } finally {
      setDeletingId(null);
    }
  };

  const getScoreBadgeClass = (score) => {
    if (!score && score !== 0) return "bg-slate-500/10 text-slate-400";
    if (score >= 85) return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (score >= 70) return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (score >= 50) return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
    return "bg-red-500/10 text-red-500 border border-red-500/20";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-1 text-xs font-semibold">
      {/* Search & Filters Controls */}
      <Card className="border border-border/40 bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/50 bg-background/50 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Filters Select row */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 min-w-[120px]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="p-2 rounded-lg border border-border/40 bg-background text-[11px]"
              >
                <option value="all">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 rounded-lg border border-border/40 bg-background text-[11px]"
            >
              <option value="all">All Interview Types</option>
              {uniqueTypes.filter((t) => t !== "all").map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 rounded-lg border border-border/40 bg-background text-[11px]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Score</option>
              <option value="lowest">Sort: Lowest Score</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Histories */}
      {filteredSessions.length === 0 ? (
        <Card className="border border-border/40 bg-card/60 backdrop-blur-md py-12 text-center text-muted-foreground shadow-sm">
          <BookOpen className="w-10 h-10 opacity-20 mx-auto mb-2" />
          <p className="font-semibold text-xs">No voice interview sessions found matching your filters.</p>
          <p className="text-[10px] opacity-80 mt-0.5">Start your premium voice mock session today!</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredSessions.map((sess) => {
            const formattedDate = new Date(sess.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <Card
                key={sess.id}
                onClick={() => onViewSession(sess)}
                className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-all duration-300 hover:shadow-md hover:shadow-accent/5 cursor-pointer relative group flex flex-col justify-between"
              >
                {/* Visual score indicators */}
                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <CardTitle className="text-sm font-black text-foreground truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      {sess.title}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <span>{formattedDate}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        {sess.videoEnabled ? <Video className="w-3 h-3 text-emerald-500" /> : <Mic className="w-3 h-3 text-blue-500" />}
                        {sess.interviewType}
                      </span>
                    </CardDescription>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] rounded-full font-black uppercase shrink-0 ${getScoreBadgeClass(sess.overallScore)}`}>
                    {sess.status === "COMPLETED" ? `${sess.overallScore || 0}%` : "Incomplete"}
                  </span>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                    {sess.feedback || "Session was created but not finalized with an overall scorecard review."}
                  </p>

                  <div className="flex items-center justify-between border-t border-border/20 pt-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                      Duration: {sess.duration} mins
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === sess.id}
                        onClick={(e) => handleDelete(e, sess.id)}
                        className="w-8 h-8 rounded-lg text-red-500 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetakeSession(sess);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-accent/40 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                      <div className="p-1 rounded-lg bg-accent/40 text-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default VoiceInterviewHistory;
