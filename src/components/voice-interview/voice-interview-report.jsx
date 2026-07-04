// src/components/voice-interview/voice-interview-report.jsx

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Sparkles,
  BookOpen,
  History,
  FileText,
  Clock,
  Mic,
  Video,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  Target,
} from "lucide-react";

export function VoiceInterviewReport({ session, onBackToHistory, onRetake }) {
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(0);

  if (!session) return null;

  const {
    title,
    role,
    difficulty,
    interviewType,
    overallScore = 0,
    feedback = "",
    roadmap = {},
    analytics = {},
    questions = [],
    videoEnabled = false,
  } = session;

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-emerald-500";
    if (score >= 70) return "text-blue-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score) => {
    if (score >= 85) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "bg-blue-500/10 border-blue-500/20";
    if (score >= 50) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  // Safe JSON extraction for filler words
  let fillerWords = [];
  if (analytics?.fillerWords) {
    if (Array.isArray(analytics.fillerWords)) {
      fillerWords = analytics.fillerWords;
    } else {
      try {
        fillerWords = JSON.parse(analytics.fillerWords);
      } catch (e) {}
    }
  }

  // Categories scores (Speech parameters)
  const speechCategories = [
    { name: "Technical Accuracy", score: analytics?.technicalScore || overallScore },
    { name: "Communication", score: analytics?.communicationScore || overallScore },
    { name: "Grammar Core", score: analytics?.grammarScore || 80 },
    { name: "Vocabulary Terminology", score: analytics?.vocabularyScore || 80 },
    { name: "Confidence Presence", score: analytics?.confidenceScore || 80 },
    { name: "Spoken Fluency", score: analytics?.fluency || 80 },
  ];

  // Video scores if vision was enabled
  const videoCategories = [
    { name: "Eye Contact Score", score: analytics?.eyeContactScore || 80 },
    { name: "Posture Stability", score: analytics?.postureScore || 85 },
    { name: "Attention Level", score: analytics?.attentionScore || 85 },
    { name: "Lighting Quality", score: analytics?.lightingScore || 80 },
    { name: "Face Centering", score: analytics?.faceCenteringScore || 85 },
    { name: "Camera Presence", score: analytics?.cameraPresenceScore || 90 },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-1 print:p-0 print:bg-white print:text-black">
      {/* Print-only title */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">AI Voice Mock Interview Scorecard Report</h1>
        <p className="text-sm text-gray-500">Candidate target role: {role} ({difficulty} difficulty)</p>
      </div>

      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-6 print:hidden">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Target Role: <span className="text-foreground">{role}</span> &bull; Difficulty: <span className="text-foreground">{difficulty}</span> &bull; Type: <span className="text-foreground">{interviewType}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBackToHistory} className="rounded-xl text-xs font-bold cursor-pointer">
            <History className="w-4 h-4 mr-1.5" />
            History
          </Button>
          <Button variant="outline" onClick={handlePrint} className="rounded-xl text-xs font-bold cursor-pointer">
            <Download className="w-4 h-4 mr-1.5" />
            Download PDF
          </Button>
          <Button onClick={onRetake} className="rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold cursor-pointer shadow-md">
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Retake Interview
          </Button>
        </div>
      </div>

      {/* Grid: Overall Score Radial & Key Feedback */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Radial Overall Score Card */}
        <Card className={`md:col-span-4 border-border/40 hover:border-border transition-all duration-300 relative overflow-hidden flex flex-col justify-center items-center p-6 ${getScoreBg(overallScore)}`}>
          <div className="absolute top-2 right-2 text-xs font-black uppercase text-muted-foreground/40">
            Aggregate Score
          </div>
          <div className="relative w-36 h-36 rounded-full flex items-center justify-center bg-background/80 shadow-md border border-border/20 mb-4 mt-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="currentColor"
                className={getScoreColor(overallScore)}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallScore / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{overallScore}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Rating</span>
            </div>
          </div>
          <span className={`text-sm font-extrabold uppercase ${getScoreColor(overallScore)}`}>
            {overallScore >= 85 ? "Excellent Performance!" : overallScore >= 70 ? "Good Performance" : "Requires Practice"}
          </span>
        </Card>

        {/* Global Summary Feedback Card */}
        <Card className="md:col-span-8 border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-500" />
              Coaching Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-medium">
              {feedback || "Overall evaluation details are still generating. Please inspect individual response reports below."}
            </p>

            {/* Speaking duration indicators */}
            <div className="grid grid-cols-3 gap-3 border-t border-border/20 pt-4 text-center">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground/80 font-semibold uppercase block">Speaking Speed</span>
                <span className="text-sm font-extrabold text-foreground flex items-center justify-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-blue-500" />
                  {Math.round(analytics?.speakingSpeed || 130)} WPM
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground/80 font-semibold uppercase block">Average Pause</span>
                <span className="text-sm font-extrabold text-foreground flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {analytics?.avgPause || 1.2}s
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground/80 font-semibold uppercase block">Filler Words Used</span>
                <span className="text-sm font-extrabold text-foreground block">
                  {fillerWords.length > 0 ? (
                    <span className="text-yellow-500">{fillerWords.join(", ")}</span>
                  ) : (
                    <span className="text-emerald-500">None detected!</span>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scores Categories breakdown tabs */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Speech Score categories */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Mic className="w-4 h-4 text-blue-500" />
              Speech & Communication Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {speechCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>{cat.name}</span>
                  <span className="text-foreground">{cat.score}%</span>
                </div>
                <Progress value={cat.score} className="h-2 bg-accent" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Video Score categories */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-500" />
              Vision & Posture Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {videoEnabled ? (
              videoCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span>{cat.name}</span>
                    <span className="text-foreground">{cat.score}%</span>
                  </div>
                  <Progress value={cat.score} className="h-2 bg-accent" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Video className="w-8 h-8 opacity-25 mb-2" />
                <p className="text-xs font-semibold">Video Analysis was not enabled for this session.</p>
                <p className="text-[10px] opacity-80 mt-1 max-w-[250px]">To track eye contact, body alignment, and attention score, choose Voice + Video interview mode next time.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accordion tabs: Transcripts, Question Details, Personalized Roadmaps */}
      <Tabs defaultValue="questions" className="w-full print:border-none">
        <TabsList className="grid grid-cols-3 bg-accent/40 rounded-xl p-1 max-w-lg mb-6 print:hidden">
          <TabsTrigger value="questions" className="text-xs font-bold py-2 rounded-lg cursor-pointer">Question Feedbacks</TabsTrigger>
          <TabsTrigger value="transcript" className="text-xs font-bold py-2 rounded-lg cursor-pointer">Full Dialog Log</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs font-bold py-2 rounded-lg cursor-pointer">Learning Roadmap</TabsTrigger>
        </TabsList>

        {/* 1. Question Feedbacks Tab */}
        <TabsContent value="questions" className="space-y-4">
          {questions.map((q, idx) => {
            const isExpanded = expandedQuestionIdx === idx;
            const ans = q.answer || {};

            return (
              <Card key={q.id} className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden">
                <div
                  onClick={() => setExpandedQuestionIdx(isExpanded ? -1 : idx)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/20 transition-colors select-none"
                >
                  <div className="flex items-start gap-3 min-w-0 pr-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 text-xs font-black shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">{q.content}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      ans.score >= 85 ? "bg-emerald-500/10 text-emerald-400" : ans.score >= 70 ? "bg-blue-500/10 text-blue-400" : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      Score: {ans.score || 0}%
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="p-4 border-t border-border/20 bg-background/30 space-y-4 text-xs font-semibold">
                    {/* User Answer block */}
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-500">Your Spoken Answer:</h4>
                      <p className="text-xs leading-relaxed text-muted-foreground p-3 rounded-xl bg-accent/20 italic">
                        &ldquo;{ans.userResponse || "No response provided."}&rdquo;
                      </p>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Key Strengths:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground/90 leading-relaxed font-semibold pl-1">
                          {Array.isArray(ans.strengths) ? ans.strengths.map((str, i) => <li key={i}>{str}</li>) : <li>Great articulation and core description.</li>}
                        </ul>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-yellow-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Concrete Gaps & Improvements:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground/90 leading-relaxed font-semibold pl-1">
                          {Array.isArray(ans.weaknesses) ? ans.weaknesses.map((weak, i) => <li key={i}>{weak}</li>) : <li>Elaborate further using quantifiable metrics.</li>}
                        </ul>
                      </div>
                    </div>

                    {/* Improved Answer sample */}
                    <div className="space-y-1.5 border-t border-border/20 pt-3">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Model Spoken Sample (STAR Framework):
                      </h4>
                      <p className="text-xs leading-relaxed text-muted-foreground p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 italic">
                        &ldquo;{ans.improvedAnswer || "Sample answer is not compiled."}&rdquo;
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* 2. Dialog Log Tab */}
        <TabsContent value="transcript">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-3.5">
                {/* AI Question */}
                <div className="flex flex-col max-w-[85%] rounded-2xl p-3 text-xs bg-indigo-500/10 border border-indigo-500/10 rounded-tl-none mr-auto">
                  <span className="text-[9px] font-black uppercase opacity-60 mb-1">Interviewer (Q{idx + 1})</span>
                  <p className="font-semibold text-foreground">&ldquo;{q.content}&rdquo;</p>
                </div>
                {/* User Answer */}
                <div className="flex flex-col max-w-[85%] rounded-2xl p-3 text-xs bg-blue-600 text-white rounded-tr-none ml-auto">
                  <span className="text-[9px] font-black uppercase opacity-80 mb-1">You</span>
                  <p className="font-medium">&ldquo;{q.answer?.userResponse || "[No Answer]"}&rdquo;</p>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* 3. Learning Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Strengths & Weaknesses log summaries */}
            <Card className="border border-border/40 bg-card/60 backdrop-blur-md p-4">
              <h3 className="text-sm font-black flex items-center gap-1.5 text-foreground mb-4">
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                Observe Strengths & Growth Areas
              </h3>
              <div className="space-y-4 text-xs font-semibold text-muted-foreground leading-relaxed">
                <div>
                  <h4 className="text-[10px] uppercase font-black tracking-wider text-emerald-500 mb-1">Core Strengths</h4>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    {Array.isArray(roadmap.strengths) ? (
                      roadmap.strengths.map((s, i) => <li key={i}>{s}</li>)
                    ) : (
                      <li>Candidate communicates technical projects effectively.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-black tracking-wider text-yellow-500 mb-1">Areas to Optimize</h4>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    {Array.isArray(roadmap.weaknesses) ? (
                      roadmap.weaknesses.map((w, i) => <li key={i}>{w}</li>)
                    ) : (
                      <li>Improve reaction time and limit pacing pauses.</li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Preparation Roadmap checklist */}
            <Card className="border border-border/40 bg-card/60 backdrop-blur-md p-4">
              <h3 className="text-sm font-black flex items-center gap-1.5 text-foreground mb-4">
                <Target className="w-4 h-4 text-blue-500" />
                Personalized Learning Roadmap
              </h3>
              <div className="space-y-3.5 text-xs font-semibold text-muted-foreground">
                {Array.isArray(roadmap.milestones) ? (
                  roadmap.milestones.map((m, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="p-1 rounded bg-blue-500/10 text-blue-400 shrink-0 font-extrabold">✦</span>
                      <span className="leading-relaxed">{m}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-2.5 items-start">
                    <span className="p-1 rounded bg-blue-500/10 text-blue-400 shrink-0">✦</span>
                    <span className="leading-relaxed">Practice quantitative metrics and time pacing.</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recommended Practice Topics */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-md p-4">
            <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground mb-3">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Recommended Practice Topics to Master Next
            </h3>
            <div className="flex flex-wrap gap-2 pt-1.5">
              {Array.isArray(roadmap.practiceTopics) ? (
                roadmap.practiceTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    {topic}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  STAR response structuring
                </span>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
export default VoiceInterviewReport;
