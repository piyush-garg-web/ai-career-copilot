"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Bot, TrendingUp, Mic, Video } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { PremiumRequiredModal } from "@/components/shared/PremiumRequiredModal";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { usePremium } from "@/hooks/use-premium";

const CARD_BASE =
  "relative w-full rounded-2xl border border-border/50 bg-card/85 backdrop-blur-md shadow-xl p-5 flex flex-col gap-3 overflow-hidden transition-shadow duration-300 hover:shadow-2xl";

export default function Hero() {
  const { t } = useTranslation();
  const { isPremium, loading } = usePremium();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleInterviewClick = (e) => {
    e.preventDefault();
    window.location.href = "/voice-mock-interview";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const floatAnimation = (yOffset = 8, duration = 6, delay = 0) => ({
    y: [0, -yOffset, 0],
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  });

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full filter blur-[80px] sm:blur-[120px] translate-x-[-20%] translate-y-[-20%]" />
        <div className="absolute top-1/3 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-violet-500/10 dark:bg-violet-500/5 rounded-full filter blur-[80px] sm:blur-[100px] translate-x-[20%]" />
        <div className="absolute bottom-10 left-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full filter blur-[80px] sm:blur-[100px] translate-x-[-50%]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Hero Content */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] md:leading-[1.05]"
            >
              {t("landing.hero.title")}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-normal"
            >
              {t("landing.hero.subtitle")}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base font-semibold px-8 py-6 rounded-xl bg-primary hover:bg-primary/95 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200 group"
                >
                  {t("landing.hero.cta")}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Feature Cards */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              {/* Ambient glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-indigo-500/15 dark:bg-indigo-500/10 blur-[60px]" />
              </div>

              {/* Decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-[90%] max-w-[420px] aspect-square rounded-full border border-dashed border-indigo-500/20 animate-[spin_60s_linear_infinite]" />
              </div>

              {/* Cards grid — balanced, non-overlapping */}
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Card 1: Resume Analysis */}
                <motion.div
                  className={`${CARD_BASE} sm:col-span-2 min-h-[148px]`}
                  animate={floatAnimation(6, 5.5, 0)}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-green-500/15 text-green-600 dark:text-green-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground leading-snug">
                        {t("landing.hero.cards.resumeTitle")}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {t("landing.hero.cards.resumeDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">{t("landing.hero.cards.optimization")}</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">87%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: "87%" }} />
                    </div>
                  </div>
                </motion.div>

                {/* Card 2: Interview Coach */}
                <motion.div
                  className={`${CARD_BASE} min-h-[200px]`}
                  animate={floatAnimation(7, 6.5, 0.4)}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground leading-snug">
                      {t("landing.hero.cards.interviewTitle")}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {t("landing.hero.cards.interviewPrompt")}
                  </p>
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs leading-relaxed">
                    <strong>{t("landing.hero.cards.tipLabel")}</strong> {t("landing.hero.cards.tipText")}
                  </div>
                </motion.div>

                {/* Card 3: AI Mock Interview */}
                <motion.div
                  className={`${CARD_BASE} min-h-[200px] border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 shadow-yellow-500/10`}
                  animate={floatAnimation(5, 5, 0.8)}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-600 dark:text-yellow-400 shrink-0">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">AI Mock Interview</p>
                        <p className="text-sm font-bold text-foreground leading-tight">Voice + Video</p>
                      </div>
                    </div>
                    <PremiumBadge />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Video className="w-3 h-3 shrink-0" />
                      Real-time AI
                    </span>
                    <span className="text-border">•</span>
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      Smart Feedback
                    </span>
                  </div>
                  <Button
                    onClick={handleInterviewClick}
                    className="w-full mt-auto bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold text-xs h-9 rounded-xl shadow-md"
                  >
                    <Video className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    Start Interview
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PremiumRequiredModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="AI Mock Interview"
      />
    </div>
  );
}
