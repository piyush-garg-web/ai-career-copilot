"use client";

import React, { useState, useEffect } from "react";
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
  const [currentEvaluation, setCurrentEvaluation] = useState(null);

  // Interval timer count-up logic
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const activeQuestion = questions[currentIndex] || {};
  const isLastQuestion = currentIndex === questions.length - 1;

  // Submit response for AI evaluation
  const handleSubmitAnswer = async () => {
    if (!answerText || answerText.trim().length < 10) {
      toast.error("Please provide a slightly more detailed response (minimum 10 characters).");
      return;
    }

    setIsEvaluating(true);
    toast.info("Gemini AI is assessing your answer metrics...");

    try {
      const response = await fetch(`/api/interviews/${session.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          content: answerText.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit answer.");
      }

      const data = await response.json();
      setCurrentEvaluation(data.evaluation);
      toast.success("Response recorded!");
    } catch (err) {
      console.error("Submit Answer Failure:", err);
      toast.error(err.message || "Failed to submit answer.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to next question card
  const handleNextQuestion = () => {
    setAnswerText("");
    setCurrentEvaluation(null);
    setCurrentIndex((prev) => prev + 1);
  };

  // Compile final scorecard and redirect
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

  const progressPercentage = ((currentIndex + (currentEvaluation ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Session Header Status */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">Active Session Room</span>
          <h1 className="text-lg font-extrabold text-foreground truncate max-w-md">
            {session.title}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-xl border border-border/40 bg-card/60 text-xs font-semibold text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>{formatTime(secondsElapsed)}</span>
        </div>
      </div>

      {/* Dynamic Progress indicator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
          <span>Question Progress</span>
          <span>
            {currentIndex + 1} / {questions.length} Questions
          </span>
        </div>
        <Progress value={progressPercentage} className="h-1.5 bg-accent" />
      </div>

      <Separator className="bg-border/20" />

      {/* Main Panel Card */}
      <Card className="border border-border/40 bg-card/40 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden relative">
        {/* Loading overlay for final compilation */}
        <AnimatePresence>
          {isCompleting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/90 backdrop-blur-md z-40 flex flex-col items-center justify-center gap-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <div className="space-y-1 text-center">
                <h3 className="text-sm font-bold">Compiling Mock Session Report Card...</h3>
                <p className="text-[10px] text-muted-foreground font-semibold max-w-xs leading-relaxed">
                  Gemini is studying your communication logs, technical accuracy quotients, and drafting recommendations.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/20">
          <div className="space-y-1 min-w-0">
            <CardDescription className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
              Question #{currentIndex + 1}
            </CardDescription>
            <CardTitle className="text-sm font-bold text-foreground">
              {activeQuestion.content}
            </CardTitle>
          </div>
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-extrabold text-[9px] uppercase tracking-wider shrink-0 self-start sm:self-center">
            {activeQuestion.questionType}
          </Badge>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <AnimatePresence mode="wait">
            {!currentEvaluation ? (
              /* INPUT MODE: Answer Input Textarea */
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="user-answer" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                    Your Response
                  </label>
                  <Textarea
                    id="user-answer"
                    placeholder="Type your response to the question in detail..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={8}
                    disabled={isEvaluating}
                    className="rounded-xl border-border/40 bg-background/30 text-xs font-medium leading-relaxed resize-none min-h-[160px] focus-visible:ring-indigo-500/30"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground/80 font-semibold leading-relaxed">
                    <span>Be descriptive. Refer to your project details or work metrics.</span>
                    <span>{answerText.length} characters</span>
                  </div>
                </div>

                {/* Submit trigger button */}
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || answerText.trim().length < 10}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-md shadow-indigo-500/10 cursor-pointer gap-1.5"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Evaluating Response...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Submit Response & Evaluate
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              /* EVALUATION MODE: AI Instant Grading Feedback card */
              <motion.div
                key="evaluation"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {/* Visual score breakdown progress bars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-xl border border-border/20">
                  {/* Overall Answer Score */}
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Answer Score</span>
                    <span className="text-xl font-black text-indigo-400">{currentEvaluation.score}%</span>
                  </div>
                  {/* Communication */}
                  <div className="text-center space-y-1 border-l border-border/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Clarity</span>
                    <span className="text-xl font-black text-teal-400">{currentEvaluation.communication}%</span>
                  </div>
                  {/* Accuracy */}
                  <div className="text-center space-y-1 border-l border-border/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Accuracy</span>
                    <span className="text-xl font-black text-blue-400">{currentEvaluation.technicalAccuracy}%</span>
                  </div>
                  {/* Confidence */}
                  <div className="text-center space-y-1 border-l border-border/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Confidence</span>
                    <span className="text-xl font-black text-amber-400">{currentEvaluation.confidence}%</span>
                  </div>
                </div>

                {/* Instant Feedback Statement */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                    Coaching Feedback
                  </span>
                  <p className="text-xs font-semibold leading-relaxed text-foreground/90">
                    {currentEvaluation.feedback}
                  </p>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="space-y-2 border border-emerald-500/10 bg-emerald-500/5 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Check className="w-4 h-4 shrink-0" />
                      Strengths
                    </span>
                    <ul className="space-y-1.5 text-xs leading-relaxed font-semibold list-disc list-inside text-foreground/90">
                      {currentEvaluation.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="space-y-2 border border-amber-500/10 bg-amber-500/5 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                      <BadgeAlert className="w-4 h-4 shrink-0" />
                      Areas to Improve
                    </span>
                    <ul className="space-y-1.5 text-xs leading-relaxed font-semibold list-disc list-inside text-foreground/90">
                      {currentEvaluation.improvements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Rewritten Answer Blueprint */}
                {currentEvaluation.improvedAnswer && (
                  <div className="space-y-2 border border-indigo-500/10 bg-indigo-500/5 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-1.5 text-indigo-500/10">
                      <Flame className="w-12 h-12" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Ideal Answer Template
                    </span>
                    <p className="text-xs leading-relaxed font-semibold text-foreground/90">
                      {currentEvaluation.improvedAnswer}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                {isLastQuestion ? (
                  <Button
                    onClick={handleFinishInterview}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-md shadow-indigo-500/10 cursor-pointer gap-1.5"
                  >
                    Finish mock Interview
                    <Check className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-md shadow-indigo-500/10 cursor-pointer gap-1.5"
                  >
                    Next Question
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
