"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Loader2,
  Sparkles,
  Award,
  AlertTriangle,
  Check,
  ArrowRight,
  Clock,
  MessageSquare,
  FileText,
  BadgeAlert,
  ThumbsUp,
  Flame,
  User,
  Bot,
  Activity,
  AwardIcon,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function InterviewSessionFlow({ session, questions }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Chat conversation logs state
  const [messages, setMessages] = useState([
    {
      id: "init-q",
      sender: "interviewer",
      content: questions[0]?.content || "Hello! Let's begin the mock interview session.",
      type: questions[0]?.questionType || "Mixed",
      index: 0,
    },
  ]);

  // Aggregate evaluations to display dynamic live indicators
  const [scores, setScores] = useState({
    technical: 0,
    communication: 0,
    confidence: 0,
    problemSolving: 0,
    count: 0,
  });

  const chatEndRef = useRef(null);

  // Timer interval logic
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isEvaluating]);

  const formatTime = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const activeQuestion = questions[currentIndex] || {};
  const isLastQuestion = currentIndex === questions.length - 1;

  // Submit candidate answer
  const handleSubmitAnswer = async () => {
    const candidateInput = answerText.trim();
    if (!candidateInput || candidateInput.length < 10) {
      toast.error("Please provide a slightly more detailed response (minimum 10 characters).");
      return;
    }

    // Append candidate message immediately
    const userMsgId = `ans-${currentIndex}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "candidate",
        content: candidateInput,
      },
    ]);

    setAnswerText("");
    setIsEvaluating(true);
    toast.info("Gemini AI is assessing your answer metrics...");

    try {
      const response = await fetch(`/api/interviews/${session.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          content: candidateInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit answer.");
      }

      const data = await response.json();
      const evalData = data.evaluation;

      // Update aggregate scoring indexes
      setScores((prev) => {
        const count = prev.count + 1;
        return {
          technical: Math.round((prev.technical * prev.count + evalData.technicalAccuracy) / count),
          communication: Math.round((prev.communication * prev.count + evalData.communication) / count),
          confidence: Math.round((prev.confidence * prev.count + evalData.confidence) / count),
          problemSolving: Math.round((prev.problemSolving * prev.count + (evalData.score || 70)) / count),
          count,
        };
      });

      // Append evaluation system response
      setMessages((prev) => [
        ...prev,
        {
          id: `eval-${currentIndex}`,
          sender: "system_feedback",
          evaluation: evalData,
        },
      ]);

      toast.success("Response recorded!");
    } catch (err) {
      console.error("Submit Answer Failure:", err);
      toast.error(err.message || "Failed to submit answer.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Next question logic
  const handleNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    
    // Append next question from AI interviewer
    setMessages((prev) => [
      ...prev,
      {
        id: `q-${nextIndex}`,
        sender: "interviewer",
        content: questions[nextIndex].content,
        type: questions[nextIndex].questionType,
        index: nextIndex,
      },
    ]);
  };

  // Complete Mock Interview Session
  const handleFinishInterview = async () => {
    setIsCompleting(true);
    toast.info("Mock evaluation session closing. Compiling final metrics...");

    try {
      const response = await fetch(`/api/interviews/${session.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: secondsElapsed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to finalize session.");
      }

      toast.success("Interview completed! Loading scorecard...");
      router.push(`/interview/${session.id}/results`);
    } catch (err) {
      console.error("Complete Session Failure:", err);
      toast.error(err.message || "Failed to compile overall scorecard.");
      setIsCompleting(false);
    }
  };

  const progressPercentage = ((currentIndex + (scores.count > currentIndex ? 1 : 0)) / questions.length) * 100;
  const remainingCount = questions.length - scores.count;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Session Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">Simulated Chat Room</span>
          <h1 className="text-lg font-extrabold text-foreground truncate max-w-md">
            {session.title}
          </h1>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/40 bg-card/60 text-xs font-semibold text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
          <span>Practice session progress</span>
          <span>
            {scores.count} / {questions.length} Answers Evaluated ({remainingCount} Remaining)
          </span>
        </div>
        <Progress value={progressPercentage} className="h-1.5 bg-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Feed layout */}
        <Card className="border border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl overflow-hidden lg:col-span-8 flex flex-col h-[520px]">
          {/* Live scrolling message zone */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              if (msg.sender === "interviewer") {
                return (
                  <div key={msg.id} className="flex gap-2.5 max-w-[85%] items-start">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/25">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div className="p-3 bg-muted/40 rounded-2xl rounded-tl-none border border-border/20 text-xs font-semibold leading-relaxed space-y-1 text-foreground">
                      <div className="flex items-center justify-between gap-4 pb-1">
                        <span className="text-[9px] uppercase font-bold text-indigo-400">Interviewer</span>
                        <Badge variant="outline" className="text-[8px] px-1 py-0 bg-background text-indigo-400 font-extrabold uppercase scale-90 border-indigo-500/25">
                          {msg.type}
                        </Badge>
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                );
              } else if (msg.sender === "candidate") {
                return (
                  <div key={msg.id} className="flex gap-2.5 max-w-[85%] items-start ml-auto flex-row-reverse">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/25">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div className="p-3 bg-blue-600 text-white rounded-2xl rounded-tr-none text-xs font-semibold leading-relaxed">
                      <p>{msg.content}</p>
                    </div>
                  </div>
                );
              } else if (msg.sender === "system_feedback") {
                const evalData = msg.evaluation;
                return (
                  <div key={msg.id} className="p-3.5 rounded-xl border border-indigo-500/10 bg-indigo-500/5 text-xs font-semibold leading-relaxed space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Response Evaluation
                      </span>
                      <span className="text-xs font-black text-indigo-400">Score: {evalData.score}%</span>
                    </div>
                    <p className="text-muted-foreground">{evalData.feedback}</p>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1 text-[11px]">
                        <span className="text-emerald-500 font-bold block">✓ Strengths</span>
                        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground font-semibold">
                          {evalData.strengths.slice(0, 2).map((s, idx) => <li key={idx}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <span className="text-amber-500 font-bold block">⚠ Improvements</span>
                        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground font-semibold">
                          {evalData.improvements.slice(0, 2).map((i, idx) => <li key={idx}>{i}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {/* AI thinking / evaluating loader */}
            {isEvaluating && (
              <div className="flex gap-2.5 max-w-[85%] items-start">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/25">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="flex space-x-1.5 p-2.5 bg-accent/40 rounded-xl w-16 items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Action and input zone */}
          <div className="p-3.5 border-t border-border/20 bg-muted/5 space-y-3 relative">
            <AnimatePresence>
              {isCompleting && (
                <div className="absolute inset-0 bg-background/90 z-20 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-xs font-bold">Compiling Mock Session Report Card...</span>
                </div>
              )}
            </AnimatePresence>

            {scores.count > currentIndex ? (
              /* Navigation to next question or complete buttons */
              <div className="flex gap-3">
                {isLastQuestion ? (
                  <Button
                    onClick={handleFinishInterview}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-md shadow-indigo-500/10 cursor-pointer gap-1.5"
                  >
                    Complete Practice & Grade
                    <Check className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-md shadow-indigo-500/10 cursor-pointer gap-1.5"
                  >
                    Prepare Next Question
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              /* Text Response Input */
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your response to the interviewer's question..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={2}
                  disabled={isEvaluating}
                  className="rounded-xl border-border/40 bg-background/30 text-xs font-semibold leading-relaxed resize-none focus-visible:ring-indigo-500/30 min-h-[60px]"
                />
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                  <span>Enter 10+ characters to evaluate response alignment.</span>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={isEvaluating || answerText.trim().length < 10}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-7 px-4 shadow-sm text-[10px] cursor-pointer"
                  >
                    Submit Answer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Dynamic Scoring indicators Side Widget */}
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm p-5 rounded-2xl lg:col-span-4 space-y-4">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-indigo-400" />
            Live Session Scores
          </h4>

          <div className="space-y-3.5">
            {/* Technical */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>Technical Accuracy</span>
                <span className="text-foreground">{scores.technical}%</span>
              </div>
              <Progress value={scores.technical} className="h-1 bg-accent" />
            </div>

            {/* Communication */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>Communication Clarity</span>
                <span className="text-foreground">{scores.communication}%</span>
              </div>
              <Progress value={scores.communication} className="h-1 bg-accent" />
            </div>

            {/* Confidence */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>Confidence Index</span>
                <span className="text-foreground">{scores.confidence}%</span>
              </div>
              <Progress value={scores.confidence} className="h-1 bg-accent" />
            </div>

            {/* Problem Solving */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>Problem Solving Quotient</span>
                <span className="text-foreground">{scores.problemSolving}%</span>
              </div>
              <Progress value={scores.problemSolving} className="h-1 bg-accent" />
            </div>
          </div>

          <Separator className="bg-border/20" />

          <p className="text-[9px] text-muted-foreground font-semibold leading-relaxed">
            Live metric scores will average and update instantly as soon as you submit response evaluations to the interviewer.
          </p>
        </Card>
      </div>
    </div>
  );
}
