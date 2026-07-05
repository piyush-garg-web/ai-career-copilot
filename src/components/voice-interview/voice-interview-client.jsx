// src/components/voice-interview/voice-interview-client.jsx

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VoiceInterviewSetup } from "./voice-interview-setup";
import { VoiceInterviewFlow } from "./voice-interview-flow";
import { VoiceInterviewReport } from "./voice-interview-report";
import { VoiceInterviewHistory } from "./voice-interview-history";
import { VoiceInterviewSettings } from "./voice-interview-settings";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import {
  Mic,
  Video,
  Award,
  Clock,
  Sparkles,
  BookOpen,
  HelpCircle,
  Play,
  History,
  FileText,
  Calendar,
  Zap,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export function VoiceInterviewClient({
  resumes = [],
  jds = [],
  sessions: initialSessions = [],
  stats,
  activeSession: initialActiveSession = null,
}) {
  const { t } = useTranslation();
  
  // Coordinate states
  const [view, setView] = useState("overview"); // 'overview' | 'setup' | 'flow' | 'report' | 'history' | 'settings'
  const [sessions, setSessions] = useState(initialSessions);
  const [activeSession, setActiveSession] = useState(initialActiveSession);
  const [selectedReportSession, setSelectedReportSession] = useState(null);
  const [settings, setSettings] = useState(null);
  
  // Runtime flow setup
  const [flowParams, setFlowParams] = useState(null);

  const handleStartSession = (params) => {
    setFlowParams(params);
    setView("flow");
  };

  const handleSessionFinished = async () => {
    try {
      // Reload sessions list
      const res = await fetch("/api/voice-interview/settings"); // dummy trigger or fetch list
      const listRes = await fetch(`/api/voice-interview/${flowParams?.sessionId || activeSession?.id}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        if (listData.session) {
          // Update sessions list
          setSessions((prev) => [listData.session, ...prev.filter((s) => s.id !== listData.session.id)]);
          setSelectedReportSession(listData.session);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setActiveSession(null);
    setView("report");
  };

  const handleViewReport = (session) => {
    setSelectedReportSession(session);
    setView("report");
  };

  const handleRetake = (session) => {
    setView("setup");
  };

  const handleDeleteSession = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleLoadSettings = async () => {
    try {
      const res = await fetch("/api/voice-interview/settings");
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setView("settings");
      }
    } catch (error) {
      console.error("[SETTINGS] Failed to load:", error);
      toast.error("Failed to load settings");
    }
  };

  const handleSettingsSaved = (savedSettings) => {
    setSettings(savedSettings);
  };

  // Setup FAQs & Interview tips
  const faqs = [
    {
      q: "How does the Speech-to-Text fallback operate?",
      a: "CareerCopilot queries Groq Whisper Large v3 to fetch exceptionally high-quality spoken transcripts. If the API is rate-limited or offline, the app transparently shifts transcription processing to the browser's local Web Speech engine, ensuring zero flow disruptions.",
    },
    {
      q: "Is my camera stream uploaded or recorded?",
      a: "No. Your camera frames are processed strictly in-memory within your local web browser using MediaPipe and TensorFlow.js. We never upload or save raw video files. Only derived metadata scores (such as posture or eye contact percentages) are saved.",
    },
    {
      q: "Can I practice in languages other than English?",
      a: "Yes! The module fully supports multilingual voice practice. Gemini will formulate questions, SpeechSynthesis will speak, and STT will transcribe in your selected target language (e.g. Hindi, Spanish, Japanese, German, etc.).",
    },
  ];

  const tips = [
    "Speak clearly and at a moderate pace (130-150 words per minute).",
    "Prepare in a quiet environment to allow noise-suppression to block ambient sound.",
    "Place your camera at eye level and sit centered in the frame to optimize posture scoring.",
    "Formulate responses using the STAR method (Situation, Task, Action, Result) for higher evaluation marks.",
  ];

  return (
    <div className="space-y-6">
      {/* Back Button - shown on all views except overview */}
      {view !== "overview" && (
        <div className="max-w-5xl mx-auto p-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("overview")}
            className="flex items-center gap-2 border-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Button>
        </div>
      )}

      {/* 1. OVERVIEW DASHBOARD VIEW */}
      {view === "overview" && (
        <div className="space-y-8">
          {/* Premium Hero Block */}
          <div className="p-8 rounded-3xl border border-border/40 bg-gradient-to-br from-indigo-950/40 via-background/60 to-blue-950/20 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between gap-6 items-start">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Conversational Live Coach
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                🎤 AI Mock Interview (Voice + Video)
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                Practice realistic AI-powered voice & video interviews with real-time speech recognition, natural AI voice responses, detailed communication analytics, and personalized feedback.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={() => setView("setup")}
                  className="rounded-xl"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Start Voice Interview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setView("history")}
                  className="rounded-xl"
                >
                  <History className="w-3.5 h-3.5 mr-1.5" />
                  View History
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLoadSettings}
                  className="rounded-xl"
                >
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Overall stats widget */}
            {activeSession && (
              <Card className="border-blue-500/30 bg-blue-500/5 backdrop-blur-sm p-4 w-full md:max-w-xs shrink-0 rounded-2xl">
                <CardHeader className="p-0 pb-2.5">
                  <CardTitle className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Active Session Available
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <p className="text-[11px] text-muted-foreground font-semibold line-clamp-2">
                    {activeSession.title}
                  </p>
                  <Button
                    onClick={() => {
                      setFlowParams({
                        sessionId: activeSession.id,
                        firstQuestion: activeSession.firstQuestion,
                        mode: activeSession.videoEnabled ? "video" : "voice",
                        totalQuestions: activeSession.totalQuestions,
                      });
                      setView("flow");
                    }}
                    className="w-full rounded-lg"
                  >
                    Continue Last Interview
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats Counter Matrix */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Card className="border-border/40 bg-card/60 backdrop-blur-md p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Total Voice Interviews</span>
              <Mic className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
              <span className="text-xl font-black text-foreground block">{stats.totalInterviews}</span>
            </Card>

            <Card className="border-border/40 bg-card/60 backdrop-blur-md p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Average Score</span>
              <Award className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
              <span className="text-xl font-black text-foreground block">{stats.averageScore}%</span>
            </Card>

            <Card className="border-border/40 bg-card/60 backdrop-blur-md p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Best Score</span>
              <Sparkles className="w-5 h-5 text-yellow-500 mx-auto mb-1.5" />
              <span className="text-xl font-black text-foreground block">{stats.bestScore}%</span>
            </Card>

            <Card className="border-border/40 bg-card/60 backdrop-blur-md p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Total Practice Time</span>
              <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <span className="text-xl font-black text-foreground block">{stats.totalPracticeTime}</span>
            </Card>

            <Card className="border-border/40 bg-card/60 backdrop-blur-md p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Last Interview Date</span>
              <Calendar className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
              <span className="text-sm font-black text-foreground block leading-tight mt-1">{stats.lastInterviewDate}</span>
            </Card>

            {/* Readiness Weighted Progress */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-md p-4 text-center flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Voice Readiness</span>
                <span className="text-lg font-black text-foreground block mb-1.5">{stats.voiceReadinessScore}%</span>
              </div>
              <Progress value={stats.voiceReadinessScore} className="h-1.5 bg-accent" />
            </Card>
          </div>

          {/* Details Row: How It Works & Supported Types */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Supported Types */}
            <Card className="border border-border/40 bg-card/60 backdrop-blur-md p-5 text-xs font-semibold">
              <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 mb-4">
                <Zap className="w-4 h-4 text-blue-500" />
                Supported Interview Specializations
              </h3>
              <div className="flex flex-wrap gap-2 text-muted-foreground">
                {[
                  "HR & Core Behavioral", "Technical General", "Frontend Development", "Backend Infrastructure",
                  "Full Stack Engineering", "React & Modern Javascript", "Node.js Server Architectures",
                  "DSA & Algorithms", "System Design", "Cloud Infrastructure", "AI / Machine Learning",
                  "Java", "Python", "Custom Job Descriptions", "Company-Specific Frameworks"
                ].map((type) => (
                  <span key={type} className="px-2.5 py-1 rounded bg-accent/40 border border-border/20 text-[10px] text-muted-foreground">
                    {type}
                  </span>
                ))}
              </div>
            </Card>

            {/* Practice Tips */}
            <Card className="border border-border/40 bg-card/60 backdrop-blur-md p-5 text-xs font-semibold">
              <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 mb-4">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Tips for Premium Mock Success
              </h3>
              <ul className="space-y-2.5 text-muted-foreground">
                {tips.map((t, idx) => (
                  <li key={idx} className="flex gap-2 items-start leading-relaxed">
                    <span className="text-blue-500 font-extrabold">&bull;</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* FAQS & Info widgets */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-md p-5 text-xs font-semibold">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 mb-4">
              <HelpCircle className="w-4 h-4 text-teal-400" />
              Frequently Asked Questions
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="space-y-1.5 p-3.5 rounded-2xl border border-border/30 bg-background/30">
                  <h4 className="font-extrabold text-foreground">{faq.q}</h4>
                  <p className="text-muted-foreground/90 leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 2. SETUP MODE VIEW */}
      {view === "setup" && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setView("overview")} className="rounded-xl font-bold cursor-pointer text-xs mb-2">
            &larr; Back to Dashboard
          </Button>
          <VoiceInterviewSetup
            onStartSession={handleStartSession}
            initialResumes={resumes}
            initialJds={jds}
          />
        </div>
      )}

      {/* 3. ACTIVE FLOW VIEW */}
      {view === "flow" && flowParams && (
        <VoiceInterviewFlow
          sessionId={flowParams.sessionId}
          firstQuestion={flowParams.firstQuestion}
          settings={flowParams.settings}
          totalQuestions={flowParams.totalQuestions}
          videoEnabled={flowParams.mode === "video"}
          onSessionFinished={handleSessionFinished}
          onExit={() => setView("overview")}
        />
      )}

      {/* 4. RESULTS REPORT VIEW */}
      {view === "report" && selectedReportSession && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setView("overview")} className="rounded-xl font-bold cursor-pointer text-xs mb-2">
            &larr; Back to Dashboard
          </Button>
          <VoiceInterviewReport
            session={selectedReportSession}
            onBackToHistory={() => setView("history")}
            onRetake={() => setView("setup")}
          />
        </div>
      )}

      {/* 5. HISTORY VIEW */}
      {view === "history" && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setView("overview")} className="rounded-xl font-bold cursor-pointer text-xs mb-2">
            &larr; Back to Dashboard
          </Button>
          <VoiceInterviewHistory
            sessions={sessions}
            onViewSession={handleViewReport}
            onRetakeSession={handleRetake}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      )}

      {/* 6. SETTINGS VIEW */}
      {view === "settings" && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setView("overview")} className="rounded-xl font-bold cursor-pointer text-xs mb-2">
            &larr; Back to Dashboard
          </Button>
          <VoiceInterviewSettings
            initialSettings={settings || {}}
            onSave={handleSettingsSaved}
          />
        </div>
      )}
    </div>
  );
}
export default VoiceInterviewClient;
