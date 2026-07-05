"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
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
  Smartphone,
  Mic,
  Video
} from "lucide-react";

export default function Features({ onFeatureClick }) {
  const { t } = useTranslation();

  const floatAnimation = (yOffset = 6, duration = 5, delay = 0) => ({
    y: [0, -yOffset, 0],
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  });

  const pulseAnimation = (scale = 1.02, duration = 4, delay = 0) => ({
    scale: [1, scale, 1],
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  });

  const featureList = [
    {
      icon: FileText,
      title: t("landing.features.items.resume.title"),
      description: t("landing.features.items.resume.description"),
      color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400"
    },
    {
      icon: Target,
      title: t("landing.features.items.ats.title"),
      description: t("landing.features.items.ats.description"),
      color: "from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400"
    },
    {
      icon: Activity,
      title: t("landing.features.items.health.title"),
      description: t("landing.features.items.health.description"),
      color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400"
    },
    {
      icon: Zap,
      title: t("landing.features.items.suggestions.title"),
      description: t("landing.features.items.suggestions.description"),
      color: "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400"
    },
    {
      icon: Briefcase,
      title: t("landing.features.items.jobMatch.title"),
      description: t("landing.features.items.jobMatch.description"),
      color: "from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400"
    },
    {
      icon: AlertCircle,
      title: t("landing.features.items.missingSkills.title"),
      description: t("landing.features.items.missingSkills.description"),
      color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400"
    },
    {
      icon: Bot,
      title: t("landing.features.items.interview.title"),
      description: t("landing.features.items.interview.description"),
      color: "from-fuchsia-500/10 to-purple-500/10 text-fuchsia-600 dark:text-fuchsia-400"
    },
    {
      icon: History,
      title: t("landing.features.items.history.title"),
      description: t("landing.features.items.history.description"),
      color: "from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400"
    },
    {
      icon: LayoutDashboard,
      title: t("landing.features.items.analytics.title"),
      description: t("landing.features.items.analytics.description"),
      color: "from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400"
    },
    {
      icon: Moon,
      title: t("landing.features.items.darkMode.title"),
      description: t("landing.features.items.darkMode.description"),
      color: "from-slate-500/15 to-zinc-500/15 text-slate-700 dark:text-slate-300"
    },
    {
      icon: Smartphone,
      title: t("landing.features.items.responsive.title"),
      description: t("landing.features.items.responsive.description"),
      color: "from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400"
    },
    {
      icon: Mic,
      title: "AI Voice Mock Interview",
      description: "Practice realistic voice interviews with AI-powered speech recognition and intelligent feedback on your communication skills.",
      color: "from-yellow-500/10 to-orange-500/10 text-yellow-600 dark:text-yellow-400",
      isPremium: true
    },
    {
      icon: Video,
      title: "AI Video Mock Interview",
      description: "Experience video interviews with AI analysis of your body language, presentation skills, and confidence levels.",
      color: "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400",
      isPremium: true
    }
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-background relative">
      {/* Background radial accent */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-500/3 rounded-full filter blur-[120px] pointer-events-none"
        animate={pulseAnimation(1.1, 8, 0)}
        style={{ willChange: "transform" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Features
          </motion.h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Packed with Powerful Tools
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Everything you need to bypass applicant tracking filters, prepare answers, and accelerate your job search lifecycle in one workspace.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featureList.map((feat, index) => (
            <motion.div
              key={index}
              animate={floatAnimation(5, 5 + index * 0.3, index * 0.2)}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              onClick={() => onFeatureClick?.(t("landing.features.loginPrompt"))}
              className="group p-6 rounded-2xl border border-border/50 bg-card/40 hover:bg-card/75 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/35 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              style={{ willChange: "transform" }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center`}
                    animate={pulseAnimation(1.05, 4, index * 0.3)}
                    style={{ willChange: "transform" }}
                  >
                    <feat.icon className="w-6 h-6" />
                  </motion.div>
                  {feat.isPremium && <PremiumBadge size="sm" />}
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
              <motion.div
                className="mt-4 pt-4 border-t border-border/10 flex items-center justify-end text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
              >
                {t("landing.features.explore")}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
