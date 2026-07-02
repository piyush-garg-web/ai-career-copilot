"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Mic,
  Sparkles,
  Loader2,
  FileText,
  Briefcase,
  History,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function InterviewSetupForm({ resumes, jobDescriptions }) {
  const router = useRouter();
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJobDescId, setSelectedJobDescId] = useState("none");
  const [interviewType, setInterviewType] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState("5");
  const [isInitializing, setIsInitializing] = useState(false);

  // Submit interview config parameters
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedResumeId) {
      toast.error("Please select a resume to base the questions on.");
      return;
    }

    setIsInitializing(true);
    toast.info("Gemini AI is studying your background and formatting personalized questions...");

    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescriptionId: selectedJobDescId === "none" ? null : selectedJobDescId,
          type: interviewType,
          difficulty,
          count: parseInt(questionCount, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize mock interview.");
      }

      const data = await response.json();
      toast.success("Questions generated! Entering session room...");
      
      // Redirect to the newly created dynamic interview flow page
      router.push(`/interview/${data.sessionId}`);
    } catch (err) {
      console.error("Interview setup fail:", err);
      toast.error(err.message || "Failed to generate mock interview questions.");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Loading Overlay during question generation */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 animate-bounce">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1 text-center animate-pulse">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                Crafting Personalized Interview...
              </h3>
              <p className="text-xs text-muted-foreground font-semibold max-w-xs px-4">
                Gemini is researching your competencies, compiling technical scenarios, and configuring evaluation targets.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Setup Form Card */}
      <Card className="border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm rounded-2xl">
        <CardHeader className="pb-4 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Settings2 className="w-4.5 h-4.5 text-indigo-400" />
              Configure Practice Session
            </CardTitle>
            <CardDescription className="text-xs font-semibold leading-relaxed">
              Design a mock interview targeted to your experience levels or pasted requirements.
            </CardDescription>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-border/40 text-xs font-semibold h-8 cursor-pointer gap-1.5"
          >
            <Link href="/interview/history">
              <History className="w-3.5 h-3.5 text-muted-foreground" />
              History
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Resume Selection */}
            <div className="space-y-2">
              <Label htmlFor="resume-select" className="text-xs font-bold text-foreground">
                1. Select Resume Profile
              </Label>
              <Select onValueChange={setSelectedResumeId} value={selectedResumeId}>
                <SelectTrigger id="resume-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                  <SelectValue placeholder="Select one of your resumes..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40 text-xs font-semibold bg-popover/90 backdrop-blur-md">
                  {resumes.map((res) => (
                    <SelectItem
                      key={res.id}
                      value={res.id}
                      className="rounded-lg cursor-pointer"
                      disabled={res.status !== "ANALYZED" && res.status !== "PARSED"}
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{res.fileName}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Job Description Selection */}
            <div className="space-y-2">
              <Label htmlFor="jobdesc-select" className="text-xs font-bold text-foreground">
                2. Target Job Target (Optional)
              </Label>
              <Select onValueChange={setSelectedJobDescId} value={selectedJobDescId}>
                <SelectTrigger id="jobdesc-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                  <SelectValue placeholder="Select a job description target..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40 text-xs font-semibold bg-popover/90 backdrop-blur-md">
                  <SelectItem value="none" className="rounded-lg cursor-pointer font-bold text-indigo-400">
                    General Professional Mock (No target JD)
                  </SelectItem>
                  {jobDescriptions.map((jd) => (
                    <SelectItem
                      key={jd.id}
                      value={jd.id}
                      className="rounded-lg cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{jd.title} {jd.company ? `at ${jd.company}` : ""}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-border/20 my-2" />

            {/* Config parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Interview Type */}
              <div className="space-y-2">
                <Label htmlFor="type-select" className="text-xs font-bold text-foreground">
                  Interview Type
                </Label>
                <Select onValueChange={setInterviewType} value={interviewType}>
                  <SelectTrigger id="type-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 text-xs font-semibold bg-popover/90 backdrop-blur-md">
                    <SelectItem value="Mixed" className="rounded-lg cursor-pointer">Mixed Focus</SelectItem>
                    <SelectItem value="Technical" className="rounded-lg cursor-pointer">Technical Questions</SelectItem>
                    <SelectItem value="Behavioral" className="rounded-lg cursor-pointer">Behavioral Questions (HR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="diff-select" className="text-xs font-bold text-foreground">
                  Difficulty Level
                </Label>
                <Select onValueChange={setDifficulty} value={difficulty}>
                  <SelectTrigger id="diff-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 text-xs font-semibold bg-popover/90 backdrop-blur-md">
                    <SelectItem value="Easy" className="rounded-lg cursor-pointer">Easy (Starter)</SelectItem>
                    <SelectItem value="Medium" className="rounded-lg cursor-pointer">Medium (Standard)</SelectItem>
                    <SelectItem value="Hard" className="rounded-lg cursor-pointer">Hard (Senior)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <Label htmlFor="count-select" className="text-xs font-bold text-foreground">
                  Question Count
                </Label>
                <Select onValueChange={setQuestionCount} value={questionCount}>
                  <SelectTrigger id="count-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 text-xs font-semibold bg-popover/90 backdrop-blur-md">
                    <SelectItem value="5" className="rounded-lg cursor-pointer">5 Questions (Fast)</SelectItem>
                    <SelectItem value="10" className="rounded-lg cursor-pointer">10 Questions (Standard)</SelectItem>
                    <SelectItem value="15" className="rounded-lg cursor-pointer">15 Questions (Deep)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isInitializing}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-md shadow-indigo-500/10 cursor-pointer gap-1.5 mt-4"
            >
              <Mic className="w-4 h-4" />
              Begin AI Practice Session
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
