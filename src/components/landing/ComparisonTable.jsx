"use client";

import React from "react";
import { Check, X, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { PremiumBadge } from "@/components/shared/PremiumBadge";

export default function ComparisonTable() {
  const { t } = useTranslation();

  const comparisonData = [
    {
      feature: t("landing.comparison.rows.instantAI.feature"),
      traditional: t("landing.comparison.rows.instantAI.traditional"),
      copilot: t("landing.comparison.rows.instantAI.copilot"),
    },
    {
      feature: t("landing.comparison.rows.ats.feature"),
      traditional: t("landing.comparison.rows.ats.traditional"),
      copilot: t("landing.comparison.rows.ats.copilot"),
    },
    {
      feature: t("landing.comparison.rows.jobMatch.feature"),
      traditional: t("landing.comparison.rows.jobMatch.traditional"),
      copilot: t("landing.comparison.rows.jobMatch.copilot"),
    },
    {
      feature: t("landing.comparison.rows.interview.feature"),
      traditional: t("landing.comparison.rows.interview.traditional"),
      copilot: t("landing.comparison.rows.interview.copilot"),
    },
    {
      feature: t("landing.comparison.rows.actionItems.feature"),
      traditional: t("landing.comparison.rows.actionItems.traditional"),
      copilot: t("landing.comparison.rows.actionItems.copilot"),
    },
    {
      feature: t("landing.comparison.rows.multiResume.feature"),
      traditional: t("landing.comparison.rows.multiResume.traditional"),
      copilot: t("landing.comparison.rows.multiResume.copilot"),
    },
    {
      feature: "AI Voice + Video Mock Interview",
      traditional: "Not Available",
      copilot: "Real-time AI voice & video feedback",
      isPremium: true,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/15 border-y border-border/40 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
            {t("landing.comparison.sectionTitle")}
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {t("landing.comparison.title")}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("landing.comparison.subtitle")}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
          {/* Header Row */}
          <div className="grid grid-cols-3 bg-secondary/40 border-b border-border/60 items-center min-h-[60px] px-4 sm:px-6">
            <div className="font-bold text-xs sm:text-sm text-foreground uppercase tracking-wider text-left">
              {t("landing.comparison.table.capability")}
            </div>
            <div className="font-bold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider text-center">
              {t("landing.comparison.table.traditional")}
            </div>
            <div className="font-bold text-xs sm:text-sm text-indigo-500 dark:text-indigo-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
              {t("landing.comparison.table.copilot")}
            </div>
          </div>

          {/* Body Rows */}
          <div className="divide-y divide-border/50">
            {comparisonData.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 min-h-[84px] items-center hover:bg-secondary/10 transition-colors duration-150 px-4 sm:px-6 gap-4"
              >
                {/* Feature Name */}
                <div className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2 min-w-0 text-left py-3">
                  <span className="leading-snug">{row.feature}</span>
                  {row.isPremium && <PremiumBadge className="shrink-0" />}
                </div>

                {/* Traditional */}
                <div className="flex flex-col items-center justify-center gap-1 text-center py-3">
                  <X className="w-5 h-5 text-red-500 stroke-[3px] bg-red-500/10 p-0.5 rounded-full shrink-0" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground leading-normal max-w-[150px] inline-block font-medium">
                    {row.traditional}
                  </span>
                </div>

                {/* Copilot */}
                <div className="flex flex-col items-center justify-center gap-1 text-center py-3 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.03] border-x border-border/10 h-full">
                  <Check className="w-5 h-5 text-green-500 stroke-[3px] bg-green-500/10 p-0.5 rounded-full shrink-0" />
                  <span className="text-[10px] sm:text-xs text-indigo-500 dark:text-indigo-300 font-bold leading-normal max-w-[160px] inline-block">
                    {row.copilot}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
