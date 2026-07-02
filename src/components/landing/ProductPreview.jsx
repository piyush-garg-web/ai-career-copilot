"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, CheckCircle2, Briefcase, Bot } from "lucide-react";

export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      imagePath: "/screenshots/dashboard.png",
      url: "ai-career-copilot.vercel.app/dashboard"
    },
    {
      id: "resume-analysis",
      label: "Resume Analysis",
      icon: FileText,
      imagePath: "/screenshots/resume-analysis.png",
      url: "ai-career-copilot.vercel.app/resume"
    },
    {
      id: "ats-score",
      label: "ATS Score & Health",
      icon: CheckCircle2,
      imagePath: "/screenshots/ats-score.png",
      url: "ai-career-copilot.vercel.app/ats-score"
    },
    {
      id: "job-match",
      label: "Job Match",
      icon: Briefcase,
      imagePath: "/screenshots/job-match.png",
      url: "ai-career-copilot.vercel.app/job-match"
    },
    {
      id: "interview-coach",
      label: "Interview Coach",
      icon: Bot,
      imagePath: "/screenshots/interview-coach.png",
      url: "ai-career-copilot.vercel.app/interview"
    }
  ];

  const activeTabObject = tabs.find((t) => t.id === activeTab);

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background grids and shapes */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Product Tour
          </h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            See the Platform in Action
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Take a virtual tour through the high-fidelity features and AI interfaces built to optimize your career path.
          </p>
        </div>

        {/* Custom Nav Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-12 max-w-4xl mx-auto bg-secondary/30 p-2 rounded-2xl border border-border/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-background text-foreground shadow-md border border-border/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/45"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-500" : "text-muted-foreground"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Interactive Browser Frame Mockup */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden relative group">
          {/* Browser Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/45 border-b border-border/45">
            {/* Control buttons */}
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 opacity-80" />
              <span className="w-3 h-3 rounded-full bg-amber-500 opacity-80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-80" />
            </div>

            {/* URL input bar */}
            <div className="hidden sm:flex items-center justify-center bg-background/85 px-4 py-1.5 rounded-lg border border-border/30 text-xs text-muted-foreground w-1/2 font-medium tracking-wide">
              {activeTabObject.url}
            </div>

            {/* Empty space placeholder for spacing layout alignment */}
            <div className="w-14" />
          </div>

          {/* Browser Content Showcase */}
          <div className="relative aspect-[16/10] bg-secondary/15 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -5 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full h-full relative p-2"
              >
                <img
                  src={activeTabObject.imagePath}
                  alt={activeTabObject.label}
                  className="w-full h-full object-cover rounded-lg shadow-md border border-border/10 group-hover:scale-[1.005] transition-transform duration-500"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
