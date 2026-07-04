"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  Sparkles,
  Loader2,
  Briefcase,
  AlertCircle,
  FileCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

export function JobMatchForm({ resumes }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isMatching, setIsMatching] = useState(false);

  // Submit form payload to compare resume & job description
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedResumeId) {
      toast.error(t("jobMatch.toasts.selectResume"));
      return;
    }

    if (!jobDescription || !jobDescription.trim()) {
      toast.error(t("jobMatch.toasts.pasteDesc"));
      return;
    }

    if (jobDescription.trim().length < 100) {
      toast.error(t("jobMatch.toasts.tooShort"));
      return;
    }

    setIsMatching(true);
    toast.info(t("jobMatch.toasts.analyzing"));

    try {
      const response = await fetch("/api/job-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          content: jobDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("jobMatch.toasts.error"));
      }

      const data = await response.json();
      toast.success(t("jobMatch.toasts.success"));
      
      // Redirect to the newly created match results dashboard
      router.push(`/job-match/${data.matchId}`);
    } catch (err) {
      console.error("Job Match request failure:", err);
      toast.error(err.message || t("jobMatch.toasts.unexpected"));
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Loading Overlay during comparison calculation */}
      <AnimatePresence>
        {isMatching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 animate-bounce">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                {t("jobMatch.form.matching")}
              </h3>
              <p className="text-xs text-muted-foreground font-semibold max-w-xs px-4">
                {t("jobMatch.form.matchingDesc")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            {t("jobMatch.form.title")}
          </CardTitle>
          <CardDescription className="text-xs font-semibold leading-relaxed">
            {t("jobMatch.form.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Resume Selector */}
            <div className="space-y-2">
              <Label htmlFor="resume-select" className="text-xs font-bold text-foreground">
                {t("jobMatch.form.selectResumeLabel")}
              </Label>
              <Select onValueChange={setSelectedResumeId} value={selectedResumeId}>
                <SelectTrigger id="resume-select" className="rounded-xl border-border/40 bg-background/40 h-10 text-xs font-semibold cursor-pointer">
                  <SelectValue placeholder={t("jobMatch.form.selectResumePlaceholder")} />
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
                        {res.status === "ANALYZED" || res.status === "PARSED" ? (
                          <FileCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span>{res.fileName}</span>
                        {res.status !== "ANALYZED" && res.status !== "PARSED" && (
                          <span className="text-[9px] font-bold text-amber-500 uppercase shrink-0">
                            {t("jobMatch.form.requiresParsing")}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Description Textarea */}
            <div className="space-y-2">
              <Label htmlFor="job-description" className="text-xs font-bold text-foreground">
                {t("jobMatch.form.pasteDescLabel")}
              </Label>
              <Textarea
                id="job-description"
                placeholder={t("jobMatch.form.pasteDescPlaceholder")}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="rounded-xl border-border/40 bg-background/40 text-xs font-medium leading-relaxed resize-y min-h-[220px]"
              />
              <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1 font-semibold leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                {t("jobMatch.form.minLength")}
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isMatching}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-md shadow-indigo-500/10 cursor-pointer gap-1.5 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              {t("jobMatch.form.submitBtn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
