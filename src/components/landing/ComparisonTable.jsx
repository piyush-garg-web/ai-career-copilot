"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { PremiumBadge } from "@/components/shared/PremiumBadge";

export default function ComparisonTable() {
  const { t } = useTranslation();

  const floatAnimation = (yOffset = 3, duration = 5, delay = 0) => ({
    y: [0, -yOffset, 0],
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  });

  const pulseAnimation = (scale = 1.02, duration = 4, delay = 0) => ({
    scale: [1, scale, 1],
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  });

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
    <section className="py-16 md:py-24 bg-secondary/15 border-y border-border/40 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-10 md:mb-14 space-y-4"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.85 }}
        >
          <motion.h2
            className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {t("landing.comparison.sectionTitle")}
          </motion.h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {t("landing.comparison.title")}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("landing.comparison.subtitle")}
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl"
          animate={floatAnimation(4, 7, 0)}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          style={{ willChange: "transform" }}
        >
          {/* Header Row */}
          <div className="grid grid-cols-3 bg-secondary/40 border-b border-border/60 items-center min-h-[60px] px-4 sm:px-6">
            <div className="font-bold text-xs sm:text-sm text-foreground uppercase tracking-wider text-left">
              {t("landing.comparison.table.capability")}
            </div>
            <div className="font-bold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider text-center">
              {t("landing.comparison.table.traditional")}
            </div>
            <div className="font-bold text-xs sm:text-sm text-indigo-500 dark:text-indigo-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
              </motion.div>
              {t("landing.comparison.table.copilot")}
            </div>
          </div>

          {/* Body Rows */}
          <div className="divide-y divide-border/50">
            {comparisonData.map((row, idx) => (
              <motion.div
                key={idx}
                animate={floatAnimation(2.5, 4.5 + idx * 0.2, idx * 0.3)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                className="grid grid-cols-3 min-h-[84px] items-center hover:bg-secondary/20 transition-colors duration-200 px-4 sm:px-6 gap-4 group"
                style={{ willChange: "transform" }}
              >
                {/* Feature Name */}
                <div className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2 min-w-0 text-left py-3">
                  <span className="leading-snug">{row.feature}</span>
                  {row.isPremium && <PremiumBadge className="shrink-0" />}
                </div>

                {/* Traditional */}
                <div className="flex flex-col items-center justify-center gap-1 text-center py-3">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5 text-red-500 stroke-[3px] bg-red-500/10 p-0.5 rounded-full shrink-0" />
                  </motion.div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground leading-normal max-w-[150px] inline-block font-medium">
                    {row.traditional}
                  </span>
                </div>

                {/* Copilot */}
                <div className="flex flex-col items-center justify-center gap-1 text-center py-3 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.03] border-x border-border/10 h-full group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/5 transition-colors duration-200">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }}
                    whileHover={{ rotate: 10 }}
                  >
                    <Check className="w-5 h-5 text-green-500 stroke-[3px] bg-green-500/10 p-0.5 rounded-full shrink-0" />
                  </motion.div>
                  <span className="text-[10px] sm:text-xs text-indigo-500 dark:text-indigo-300 font-bold leading-normal max-w-[160px] inline-block">
                    {row.copilot}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
