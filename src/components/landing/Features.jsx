"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Target,
  Activity,
  Zap,
  Briefcase,
  AlertCircle,
  Bot,
  History,
  LayoutDashboard,
  Moon,
  Smartphone
} from "lucide-react";

export default function Features({ onFeatureClick }) {
  const featureList = [
    {
      icon: FileText,
      title: "AI Resume Analysis",
      description: "Generates thorough section audits for experience, project impact, structure, and formatting metrics.",
      color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400"
    },
    {
      icon: Target,
      title: "ATS Score",
      description: "Calculates an industry compliance rating to guarantee your resume passes automatic HR screening systems.",
      color: "from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400"
    },
    {
      icon: Activity,
      title: "Resume Health",
      description: "Grades grammar completeness, section structure, formatting polish, and document readability rules.",
      color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400"
    },
    {
      icon: Zap,
      title: "AI Suggestions",
      description: "Offers word-by-word replacement ideas, active verb suggestions, and spelling corrections in real-time.",
      color: "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400"
    },
    {
      icon: Briefcase,
      title: "Job Match",
      description: "Compares your skills directly with target job postings to compute overall alignment index.",
      color: "from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400"
    },
    {
      icon: AlertCircle,
      title: "Missing Skills Detection",
      description: "Pinpoints exactly which programming frameworks, certifications, or toolkits you need to list.",
      color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400"
    },
    {
      icon: Bot,
      title: "Interview Coach",
      description: "Conduct interactive oral mock sessions tailored directly to your background and preferred difficulty.",
      color: "from-fuchsia-500/10 to-purple-500/10 text-fuchsia-600 dark:text-fuchsia-400"
    },
    {
      icon: History,
      title: "Interview History",
      description: "Revisit and review previously completed sessions to compare answer ratings and track performance.",
      color: "from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400"
    },
    {
      icon: LayoutDashboard,
      title: "Analytics Dashboard",
      description: "A centralized hub featuring graphs, current task lists, and recent matching progress checks.",
      color: "from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400"
    },
    {
      icon: Moon,
      title: "Dark Mode",
      description: "A fully integrated dark and light mode UI supporting automatic operating system overrides.",
      color: "from-slate-500/15 to-zinc-500/15 text-slate-700 dark:text-slate-300"
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description: "Optimized grid alignments providing standard support for mobile phones, tablets, and large screens.",
      color: "from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-background relative">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-500/3 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Features
          </h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Packed with Powerful Tools
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Everything you need to bypass applicant tracking filters, prepare answers, and accelerate your job search lifecycle in one workspace.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featureList.map((feat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              onClick={() => onFeatureClick?.("Please sign in to use this feature.")}
              className="group p-6 rounded-2xl border border-border/50 bg-card/40 hover:bg-card/75 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/35 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/10 flex items-center justify-end text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                Explore &rarr;
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
