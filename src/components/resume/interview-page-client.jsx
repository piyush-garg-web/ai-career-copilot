"use client";

import React from "react";
import Link from "next/link";
import { Plus, BarChart2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { InterviewSetupForm } from "@/components/resume/interview-setup-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function InterviewPageClient({ dbUser, resumes, jobDescriptions }) {
  const { t } = useTranslation();

  const title = dbUser.firstName
    ? t("interview.setup.pageTitle", { name: dbUser.firstName })
    : t("interview.setup.pageTitleGeneric");

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={t("interview.setup.pageDesc")}
      />

      {resumes.length === 0 ? (
        /* Empty State */
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm py-16">
          <CardContent className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 animate-pulse">
              <BarChart2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">{t("interview.setup.noResumesTitle")}</h3>
              <p className="text-sm text-muted-foreground font-medium">
                {t("interview.setup.noResumesDesc")}
              </p>
            </div>
            <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 h-10 px-5">
              <Link href="/resume/upload">
                <Plus className="w-4 h-4" />
                {t("interview.setup.uploadBtn")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Load Interview Setup Form */
        <InterviewSetupForm resumes={resumes} jobDescriptions={jobDescriptions} />
      )}
    </div>
  );
}
