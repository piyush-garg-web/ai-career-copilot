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
    <section className="py-20 md:py-28 bg-secondary/15 border-y border-border/40 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {t("landing.comparison.sectionTitle")}
          </h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {t("landing.comparison.title")}
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("landing.comparison.subtitle")}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
          {/* Header Row */}
          <div className="grid grid-cols-3 bg-secondary/50 border-b border-border/60">
            <div className="px-4 sm:px-6 py-4 font-bold text-xs sm:text-sm text-foreground uppercase tracking-wider">
              {t("landing.comparison.table.capability")}
            </div>
            <div className="px-4 sm:px-6 py-4 font-bold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider text-center">
              {t("landing.comparison.table.traditional")}
            </div>
            <div className="px-4 sm:px-6 py-4 font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
              {t("landing.comparison.table.copilot")}
            </div>
          </div>

          {/* Body Rows */}
          <div className="divide-y divide-border/60">
            {comparisonData.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 min-h-[72px] items-center hover:bg-secondary/20 transition-colors duration-150"
              >
                {/* Feature Name */}
                <div className="px-4 sm:px-6 py-4 font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2 min-w-0">
                  <span className="leading-snug">{row.feature}</span>
                  {row.isPremium && <PremiumBadge className="shrink-0" />}
                </div>

                {/* Traditional */}
                <div className="px-4 sm:px-6 py-4 flex flex-col items-center justify-center gap-1.5 text-center">
                  <X className="w-5 h-5 text-red-500 stroke-[3px] bg-red-500/10 p-0.5 rounded-full shrink-0" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground leading-snug hidden sm:block">
                    {row.traditional}
                  </span>
                </div>

                {/* Copilot */}
                <div className="px-4 sm:px-6 py-4 flex flex-col items-center justify-center gap-1.5 text-center">
                  <Check className="w-5 h-5 text-green-500 stroke-[3px] bg-green-500/10 p-0.5 rounded-full shrink-0" />
                  <span className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-300 font-medium leading-snug hidden sm:block">
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
