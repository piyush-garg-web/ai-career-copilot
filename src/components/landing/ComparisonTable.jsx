"use client";

import React from "react";
import { Check, X, Sparkles } from "lucide-react";

export default function ComparisonTable() {
  const comparisonData = [
    {
      feature: "Instant AI Analysis",
      traditional: "Days/Weeks waiting for feedback",
      copilot: "Real-time feedback under 10 seconds",
      supported: true
    },
    {
      feature: "ATS Optimization Scoring",
      traditional: "Guesswork based on generic templates",
      copilot: "Precision calculation matching 85+ parsing filters",
      supported: true
    },
    {
      feature: "Tailored Job Matching",
      traditional: "Manual comparison with job listings",
      copilot: "Semantic skill-gap detection highlighting missing keywords",
      supported: true
    },
    {
      feature: "AI Mock Interview Coaching",
      traditional: "Costly professional review coaches",
      copilot: "Dynamic STAR-based sessions with grading logs",
      supported: true
    },
    {
      feature: "Context-Aware Action Items",
      traditional: "Vague templates (\"make verbs stronger\")",
      copilot: "Precise word-by-word active verb replacement tips",
      supported: true
    },
    {
      feature: "Multi-Resume Version Checks",
      traditional: "Scattered files on personal computers",
      copilot: "Centralized storage database to compare versions",
      supported: true
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary/15 border-y border-border/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Comparison
          </h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Why Choose AI Career Copilot?
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            See how our intelligent Generative AI engine outperforms traditional, outdated resume review and interview preparation workflows.
          </p>
        </div>

        {/* Comparison Table Box */}
        <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 bg-secondary/50 p-4 font-bold text-xs sm:text-sm text-foreground uppercase tracking-wider border-b border-border">
            <div className="col-span-4 sm:col-span-5">Capability</div>
            <div className="col-span-4 sm:col-span-3.5 text-center text-muted-foreground">Traditional Review</div>
            <div className="col-span-4 sm:col-span-3.5 text-center text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> Copilot
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
                <div className="col-span-4 sm:col-span-5 font-semibold text-xs sm:text-sm text-foreground">
                  {row.feature}
                </div>

                {/* Traditional review metrics */}
                <div className="col-span-4 sm:col-span-3.5 text-center flex flex-col items-center justify-center space-y-1">
                  <X className="w-5 h-5 text-red-500 stroke-[3px] bg-red-500/10 p-0.5 rounded-full" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
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
