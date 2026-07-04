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
  Clock,
  BookOpen,
  HelpCircle,
  Sliders,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function InterviewSetupForm({ resumes, jobDescriptions }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJobDescId, setSelectedJobDescId] = useState("none");
  const [interviewType, setInterviewType] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState("5");
  const [isInitializing, setIsInitializing] = useState(false);

  // Compute config details dynamically
  const estDuration =
    questionCount === "3"
      ? t("interview.setup.durationExpress")
      : questionCount === "5"
      ? t("interview.setup.durationFast")
      : questionCount === "10"
      ? t("interview.setup.durationStandard")
      : t("interview.setup.durationDeep");
  const diffDescription = difficulty === "Easy"
    ? t("interview.setup.easyDesc")
    : difficulty === "Medium"
    ? t("interview.setup.mediumDesc")
    : t("interview.setup.hardDesc");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedResumeId) {
      toast.error(t("interview.toasts.selectResume"));
      return;
    }

    setIsInitializing(true);
    toast.info(t("interview.toasts.studying"));

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
        throw new Error(errorData.error || t("interview.toasts.setupFailed"));
      }

      const data = await response.json();
      toast.success(t("interview.toasts.sessionEntering"));
      router.push(`/interview/${data.sessionId}`);
    } catch (err) {
      console.error("Interview setup fail:", err);
      toast.error(err.message || t("interview.toasts.setupFailed"));
    } finally {
      setIsInitializing(false);
    }
  };

  const activeResume = resumes.find(r => r.id === selectedResumeId);
  const activeJob = jobDescriptions.find(j => j.id === selectedJobDescId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Loading Overlay */}
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
                {t("interview.setup.crafting")}
              </h3>
              <p className="text-xs text-muted-foreground font-semibold max-w-xs px-4">
                {t("interview.setup.craftingDesc")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Setup Form Card */}
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm rounded-2xl lg:col-span-8">
          <CardHeader className="pb-4 flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Settings2 className="w-4.5 h-4.5 text-indigo-400" />
                {t("interview.setup.title")}
              </CardTitle>
              <CardDescription className="text-xs font-semibold leading-relaxed">
                {t("interview.setup.desc")}
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
                {t("interview.setup.historyBtn")}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Resume Selection */}
              <div className="space-y-2">
                <Label htmlFor="resume-select" className="text-xs font-bold text-foreground">
                  {t("interview.setup.resumeLabel")}
                </Label>
                <Select onValueChange={setSelectedResumeId} value={selectedResumeId}>
                  <SelectTrigger id="resume-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                    <SelectValue placeholder={t("interview.setup.resumePlaceholder")} />
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
                  {t("interview.setup.jobLabel")}
                </Label>
                <Select onValueChange={setSelectedJobDescId} value={selectedJobDescId}>
                  <SelectTrigger id="jobdesc-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                    <SelectValue placeholder={t("interview.setup.jobPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 text-xs font-semibold bg-popover/90 backdrop-blur-md">
                    <SelectItem value="none" className="rounded-lg cursor-pointer font-bold text-indigo-400">
                      {t("interview.setup.generalMock")}
                    </SelectItem>
                    {jobDescriptions.map((jd) => (
                      <SelectItem
                        key={jd.id}
                        value={jd.id}
                        className="rounded-lg cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>{jd.title} {jd.company ? t("interview.setup.jobAt", { company: jd.company }) : ""}</span>
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
                    {t("interview.setup.typeLabel")}
                  </Label>
                  <Select onValueChange={setInterviewType} value={interviewType}>
                    <SelectTrigger id="type-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/40 text-xs font-semibold bg-popover/90 backdrop-blur-md">
                      <SelectItem value="Mixed" className="rounded-lg cursor-pointer">{t("interview.setup.typeMixed")}</SelectItem>
                      <SelectItem value="Technical" className="rounded-lg cursor-pointer">{t("interview.setup.typeTech")}</SelectItem>
                      <SelectItem value="Behavioral" className="rounded-lg cursor-pointer">{t("interview.setup.typeBeh")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label htmlFor="diff-select" className="text-xs font-bold text-foreground">
                    {t("interview.setup.diffLabel")}
                  </Label>
                  <Select onValueChange={setDifficulty} value={difficulty}>
                    <SelectTrigger id="diff-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/40 text-xs font-semibold bg-popover/90 backdrop-blur-md">
                      <SelectItem value="Easy" className="rounded-lg cursor-pointer">{t("interview.setup.diffEasy")}</SelectItem>
                      <SelectItem value="Medium" className="rounded-lg cursor-pointer">{t("interview.setup.diffMedium")}</SelectItem>
                      <SelectItem value="Hard" className="rounded-lg cursor-pointer">{t("interview.setup.diffHard")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-2">
                  <Label htmlFor="count-select" className="text-xs font-bold text-foreground">
                    {t("interview.setup.countLabel")}
                  </Label>
                  <Select onValueChange={setQuestionCount} value={questionCount}>
                    <SelectTrigger id="count-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/40 text-xs font-semibold bg-popover/90 backdrop-blur-md">
                      <SelectItem value="3" className="rounded-lg cursor-pointer">{t("interview.setup.countExpress")}</SelectItem>
                      <SelectItem value="5" className="rounded-lg cursor-pointer">{t("interview.setup.countFast")}</SelectItem>
                      <SelectItem value="10" className="rounded-lg cursor-pointer">{t("interview.setup.countStandard")}</SelectItem>
                      <SelectItem value="15" className="rounded-lg cursor-pointer">{t("interview.setup.countDeep")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isInitializing}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-md shadow-indigo-500/10 cursor-pointer gap-1.5 mt-4"
              >
                <Mic className="w-4 h-4" />
                {t("interview.setup.beginBtn")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar Info Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-border/40 bg-card/60 backdrop-blur-sm p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              {t("interview.setup.sessionSummary")}
            </h4>
            
            <div className="space-y-3 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-muted-foreground/60 uppercase">{t("interview.setup.estDuration")}</span>
                  <span className="text-foreground">{estDuration}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-muted-foreground/60 uppercase">{t("interview.setup.questionFocus")}</span>
                  <span className="text-foreground">{interviewType} Questions</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-muted-foreground/60 uppercase">{t("interview.setup.diffSetting")}</span>
                  <span className="text-foreground">{difficulty}</span>
                </div>
              </div>
            </div>

            <Separator className="bg-border/20" />

            <div className="space-y-1.5 text-[10px] font-bold text-muted-foreground">
              <span className="uppercase text-muted-foreground/60 block">{t("interview.setup.diffDescLabel")}</span>
              <p className="leading-relaxed font-semibold italic">{diffDescription}</p>
            </div>
          </Card>

          {/* Question categories checklist summary */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-sm p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-foreground">{t("interview.setup.scoredCategoriesTitle")}</h4>
            <div className="space-y-2 text-[11px] font-semibold text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{t("interview.setup.scoredCategories.tech")}</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{t("interview.setup.scoredCategories.comm")}</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{t("interview.setup.scoredCategories.star")}</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{t("interview.setup.scoredCategories.solve")}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
