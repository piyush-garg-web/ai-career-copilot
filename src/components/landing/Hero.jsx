"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, FileText, Bot, Briefcase, TrendingUp, Mic, Video } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const heroHighlights = ["hero.badge", "hero.cards.resume", "hero.cards.interview", "hero.cards.jobMatch"];

export default function Hero() {
  const { t } = useTranslation();
  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full filter blur-[80px] sm:blur-[120px] translate-x-[-20%] translate-y-[-20%]" />
        <div className="absolute top-1/3 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-violet-500/10 dark:bg-violet-500/5 rounded-full filter blur-[80px] sm:blur-[100px] translate-x-[20%]" />
        <div className="absolute bottom-10 left-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full filter blur-[80px] sm:blur-[100px] translate-x-[-50%]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Content */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {t("landing.hero.badge")}
            </motion.div>

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

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base font-semibold px-8 py-6 rounded-xl bg-primary hover:bg-primary/95 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200 group">
                  {t("landing.hero.cta")}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToFeatures}
                className="w-full sm:w-auto text-base font-semibold px-8 py-6 rounded-xl border-border/80 hover:bg-secondary/60 hover:text-foreground transition-all duration-200"
              >
                {t("landing.hero.secondaryCta")}
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Illustration */}
          <div className="lg:col-span-5 relative w-full h-[350px] sm:h-[450px] flex items-center justify-center">
            {/* Ambient Backlight */}
            <div className="absolute w-[280px] h-[280px] rounded-full bg-indigo-500/20 dark:bg-indigo-500/10 blur-[60px]" />

            {/* Floating Container */}
            <div className="relative w-full max-w-[400px] h-[340px] sm:h-[380px]">
              {/* Card 1: Resume Analysis */}
              <motion.div
                className="absolute top-0 left-4 sm:left-0 right-4 sm:right-auto sm:w-[260px] p-4 rounded-xl border border-border/50 bg-card/85 backdrop-blur-md shadow-xl z-20"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-500/15 text-green-600 dark:text-green-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-foreground">{t("landing.hero.cards.resumeTitle")}</h3>
                    <p className="text-[10px] text-muted-foreground">{t("landing.hero.cards.resumeDesc")}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{t("landing.hero.cards.optimization")}</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">87%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: "87%" }} />
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Interview Coach */}
              <motion.div
                className="absolute bottom-4 right-4 sm:right-0 left-4 sm:left-auto sm:w-[280px] p-4 rounded-xl border border-border/50 bg-card/85 backdrop-blur-md shadow-xl z-10"
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-xs text-foreground">{t("landing.hero.cards.interviewTitle")}</h3>
                </div>
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div className="p-2 rounded bg-secondary/50 text-muted-foreground">
                    {t("landing.hero.cards.interviewPrompt")}
                  </div>
                  <div className="p-2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-medium">
                    💡 <strong>{t("landing.hero.cards.tipLabel")}</strong> {t("landing.hero.cards.tipText")}
                  </div>
                </div>
              </motion.div>

              {/* Card 3: AI Mock Interview */}
              <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[240px] p-3 rounded-lg border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md shadow-lg shadow-yellow-500/10 z-30"
                animate={{
                  scale: [1, 1.03, 1],
                  y: [0, 5, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-600 dark:text-yellow-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">AI Mock Interview</p>
                    <p className="text-xs font-bold text-foreground">Voice + Video</p>
                  </div>
                  <div className="text-[9px] font-extrabold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 py-0.5 px-1.5 rounded-full border border-yellow-500/20">
                    👑 Premium
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>Real-time AI</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Smart Feedback</span>
                  </div>
                </div>
              </motion.div>

              {/* Background Glow Ring */}
              <div className="absolute inset-4 rounded-full border border-dashed border-indigo-500/20 dark:border-indigo-500/10 animate-[spin_60s_linear_infinite] pointer-events-none" />
              <div className="absolute inset-16 rounded-full border border-dashed border-violet-500/20 dark:border-violet-500/10 animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
