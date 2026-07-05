"use client";

import React from "react";
import { Check, X, Sparkles, Crown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function ComparisonTable() {
  const { t } = useTranslation();
  const comparisonData = [
    {
      feature: t("landing.comparison.rows.instantAI.feature"),
      traditional: t("landing.comparison.rows.instantAI.traditional"),
      copilot: t("landing.comparison.rows.instantAI.copilot"),
      supported: true
    },
    {
      feature: t("landing.comparison.rows.ats.feature"),
      traditional: t("landing.comparison.rows.ats.traditional"),
      copilot: t("landing.comparison.rows.ats.copilot"),
      supported: true
    },
    {
      feature: t("landing.comparison.rows.jobMatch.feature"),
      traditional: t("landing.comparison.rows.jobMatch.traditional"),
      copilot: t("landing.comparison.rows.jobMatch.copilot"),
      supported: true
    },
    {
      feature: t("landing.comparison.rows.interview.feature"),
      traditional: t("landing.comparison.rows.interview.traditional"),
      copilot: t("landing.comparison.rows.interview.copilot"),
      supported: true
    },
    {
      feature: t("landing.comparison.rows.actionItems.feature"),
      traditional: t("landing.comparison.rows.actionItems.traditional"),
      copilot: t("landing.comparison.rows.actionItems.copilot"),
      supported: true
    },
    {
      feature: t("landing.comparison.rows.multiResume.feature"),
      traditional: t("landing.comparison.rows.multiResume.traditional"),
      copilot: t("landing.comparison.rows.multiResume.copilot"),
      supported: true
    },
    {
      feature: "AI Voice Mock Interview",
      traditional: "Not Available",
      copilot: "Real-time AI Feedback",
      supported: true,
      isPremium: true
    },
    {
      feature: "AI Video Mock Interview",
      traditional: "Not Available",
      copilot: "Body Language Analysis",
      supported: true,
      isPremium: true
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary/15 border-y border-border/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
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

        {/* Comparison Table Box */}
        <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 bg-secondary/50 p-4 font-bold text-xs sm:text-sm text-foreground uppercase tracking-wider border-b border-border">
            <div className="col-span-4 sm:col-span-5">{t("landing.comparison.table.capability")}</div>
            <div className="col-span-4 sm:col-span-3.5 text-center text-muted-foreground">{t("landing.comparison.table.traditional")}</div>
            <div className="col-span-4 sm:col-span-3.5 text-center text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> {t("landing.comparison.table.copilot")}
            </div>
          </div>

          {/* Body Rows */}
          <div className="divide-y divide-border/60">
            {comparisonData.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 p-4 sm:p-5 items-center hover:bg-secondary/20 transition-all duration-150"
              >
                {/* Feature Name */}
                <div className="col-span-4 sm:col-span-5 font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2">
                  {row.feature}
                  {row.isPremium && <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20" />}
                </div>

                {/* Traditional review metrics */}
                <div className="col-span-4 sm:col-span-3.5 text-center flex flex-col items-center justify-center space-y-1">
                  <X className="w-5 h-5 text-red-500 stroke-[3px] bg-red-500/10 p-0.5 rounded-full" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block text-center">
                    {row.traditional}
                  </span>
                </div>

                {/* Copilot review metrics */}
                <div className="col-span-4 sm:col-span-3.5 text-center flex flex-col items-center justify-center space-y-1">
                  <Check className="w-5 h-5 text-green-500 stroke-[3px] bg-green-500/10 p-0.5 rounded-full" />
                  <span className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-300 font-medium hidden sm:block">
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
