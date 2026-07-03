"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { Upload, Cpu, Eye, FileSearch, MessageSquare, Award } from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation();
  const steps = [
    {
      icon: Upload,
      title: t("landing.howItWorks.steps.one.title"),
      description: t("landing.howItWorks.steps.one.description"),
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    },
    {
      icon: Cpu,
      title: t("landing.howItWorks.steps.two.title"),
      description: t("landing.howItWorks.steps.two.description"),
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
    },
    {
      icon: Eye,
      title: t("landing.howItWorks.steps.three.title"),
      description: t("landing.howItWorks.steps.three.description"),
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    },
    {
      icon: FileSearch,
      title: t("landing.howItWorks.steps.four.title"),
      description: t("landing.howItWorks.steps.four.description"),
      color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
    },
    {
      icon: MessageSquare,
      title: t("landing.howItWorks.steps.five.title"),
      description: t("landing.howItWorks.steps.five.description"),
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
    },
    {
      icon: Award,
      title: t("landing.howItWorks.steps.six.title"),
      description: t("landing.howItWorks.steps.six.description"),
      color: "bg-green-500/10 text-green-600 dark:text-green-400"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-secondary/20 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.01]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {t("landing.howItWorks.sectionTitle")}
          </h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {t("landing.howItWorks.title")}
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("landing.howItWorks.subtitle")}
          </p>
        </div>

        {/* Timeline Content */}
        <div className="relative">
          {/* Vertical Center Line for Desktop */}
          <div className="absolute left-8 lg:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-green-500/20 lg:-translate-x-1/2 pointer-events-none opacity-40" />

          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`flex flex-col lg:flex-row items-start ${
                    isEven ? "lg:flex-row-reverse" : ""
                  } relative`}
                >
                  {/* Timeline Badge (Circle) */}
                  <div className="absolute left-8 lg:left-1/2 top-4 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-background shadow-md z-20">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {index + 1}
                    </span>
                  </div>

                  {/* Left Spacer / Right Panel wrapper */}
                  <div className="w-full lg:w-1/2 pl-16 lg:pl-0 lg:px-8">
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                      className="bg-card/45 hover:bg-card/85 backdrop-blur-sm border border-border/40 hover:border-indigo-500/25 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Right Spacer for Desktop (alignment helper) */}
                  <div className="hidden lg:block lg:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
