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
      transition: { staggerChildren: 0.25, delayChildren: 0.2 },
    },
  };

  const leftSectionVariants = {
    hidden: { opacity: 0, x: -50, y: 30 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 18, duration: 0.8 },
    },
  };

  const floatSwirlAnimation = (
    xOffset = 8,
    yOffset = 12,
    rotateOffset = 2.5,
    scaleOffset = 1.015,
    xDuration = 8,
    yDuration = 10,
    rotateDuration = 14,
    scaleDuration = 7,
    delay = 0
  ) => ({
    x: [0, -xOffset, 0, xOffset, 0],
    y: [0, -yOffset, 0, yOffset, 0],
    rotate: [0, rotateOffset, 0, -rotateOffset, 0],
    scale: [1, scaleOffset, 1, scaleOffset * 0.985, 1],
    transition: {
      x: {
        duration: xDuration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      },
      y: {
        duration: yDuration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      },
      rotate: {
        duration: rotateDuration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      },
      scale: {
        duration: scaleDuration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      },
    },
  });

  const pulseAnimation = (scale = 1.05, duration = 3, delay = 0) => ({
    scale: [1, scale, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 90, damping: 16, duration: 0.95 },
    },
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden bg-background">
      {/* Enhanced Background Gradients & Blobs */}
      <motion.div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full filter blur-[80px] sm:blur-[120px] translate-x-[-20%] translate-y-[-20%]"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ willChange: "transform" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-violet-500/10 dark:bg-violet-500/5 rounded-full filter blur-[80px] sm:blur-[100px] translate-x-[20%]"
          animate={{
            x: [0, -20, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ willChange: "transform" }}
        />
        <motion.div
          className="absolute bottom-10 left-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full filter blur-[80px] sm:blur-[100px] translate-x-[-50%]"
          animate={{
            x: [-20, 20, -20],
            y: [0, 20, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ willChange: "transform" }}
        />
        {/* Additional subtle blobs */}
        <motion.div
          className="absolute top-2/3 left-10 w-[200px] h-[200px] bg-purple-500/8 dark:bg-purple-500/3 rounded-full filter blur-[60px]"
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ willChange: "transform" }}
        />
        <motion.div
          className="absolute top-1/4 right-20 w-[250px] h-[250px] bg-pink-500/8 dark:bg-pink-500/3 rounded-full filter blur-[70px]"
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ willChange: "transform" }}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Hero Content */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8"
            variants={leftSectionVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              animate={floatSwirlAnimation(6, 8, 1.8, 1.012, 8, 10, 14, 7, 0)}
              style={{ willChange: "transform" }}
            >
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] md:leading-[1.05]"
              >
                {t("landing.hero.title")}
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-normal mt-4"
              >
                {t("landing.hero.subtitle")}
              </motion.p>

              <motion.div className="mt-6 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2, boxShadow: "0 0 25px rgba(99,102,241,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(99, 102, 241, 0.15)",
                        "0 0 35px rgba(99, 102, 241, 0.25)",
                        "0 0 20px rgba(99, 102, 241, 0.15)",
                      ],
                    }}
                    transition={{
                      boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    }}
                  >
                    <Button
                      size="lg"
                      className="w-full sm:w-auto text-base font-semibold px-8 py-6 rounded-xl bg-primary hover:bg-primary/95 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all duration-300 group"
                    >
                      {t("landing.hero.cta")}
                      <motion.span
                        animate={{ x: [0, 6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                      </motion.span>
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floating Feature Cards */}
          <motion.div
            className="lg:col-span-5 relative w-full flex justify-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="relative w-full max-w-md space-y-5">
              {/* Ambient glow */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={pulseAnimation(1.35, 9, 0)}
                style={{ willChange: "transform" }}
              >
                <div className="w-80 h-80 rounded-full bg-indigo-500/12 dark:bg-indigo-500/6 blur-[90px]" />
              </motion.div>

              {/* Decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                <motion.div
                  className="w-[100%] aspect-square rounded-full border border-dashed border-indigo-500/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                  style={{ willChange: "transform" }}
                />
                <motion.div
                  className="w-[85%] aspect-square rounded-full border border-dotted border-violet-500/15 absolute"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                  style={{ willChange: "transform" }}
                />
              </div>

              {/* Cards vertical stack — balanced, non-overlapping */}
              <div className="relative flex flex-col gap-5">
                {/* Card 1: Resume Analysis */}
                <motion.div
                  className={CARD_BASE}
                  variants={cardVariants}
                  animate={floatSwirlAnimation(10, 14, 2.8, 1.02, 9, 11, 15, 8, 0)}
                  whileHover={{ scale: 1.06, y: -8, boxShadow: "0 30px 40px -5px rgba(0, 0, 0, 0.18), 0 18px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ willChange: "transform" }}
                >
                  <div className="flex items-start gap-3">
                    <motion.div 
                      className="p-2.5 rounded-xl bg-green-500/10 text-green-500 dark:text-green-400 shrink-0 border border-green-500/20"
                      animate={pulseAnimation(1.05, 3, 0)}
                      style={{ willChange: "transform" }}
                    >
                      <FileText className="w-5 h-5" />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-foreground leading-snug">
                        {t("landing.hero.cards.resumeTitle")}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {t("landing.hero.cards.resumeDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">{t("landing.hero.cards.optimization")}</span>
                      <span className="text-green-500 dark:text-green-400 font-bold">87%</span>
                    </div>
                    <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden border border-border/30">
                      <motion.div 
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "87%" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Card 2: Interview Coach */}
                <motion.div
                  className={CARD_BASE}
                  variants={cardVariants}
                  animate={floatSwirlAnimation(8, 12, 2.2, 1.018, 10, 13, 16, 9, 0.3)}
                  whileHover={{ scale: 1.06, y: -8, boxShadow: "0 30px 40px -5px rgba(0, 0, 0, 0.18), 0 18px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ willChange: "transform" }}
                >
                  <div className="flex items-start gap-3">
                    <motion.div 
                      className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 shrink-0 border border-purple-500/20"
                      animate={pulseAnimation(1.05, 3, 0.2)}
                      style={{ willChange: "transform" }}
                    >
                      <Bot className="w-5 h-5" />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-foreground leading-snug">
                        {t("landing.hero.cards.interviewTitle")}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {t("landing.hero.cards.interviewPrompt")}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-xs leading-relaxed mt-1">
                    <strong className="text-indigo-400 font-bold">{t("landing.hero.cards.tipLabel")}:</strong>{" "}
                    <span className="text-muted-foreground font-medium">{t("landing.hero.cards.tipText")}</span>
                  </div>
                </motion.div>

                {/* Card 3: AI Mock Interview */}
                <motion.div
                  className={`${CARD_BASE} border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 shadow-yellow-500/5`}
                  variants={cardVariants}
                  animate={floatSwirlAnimation(12, 16, 3.2, 1.022, 11, 14, 17, 10, 0.6)}
                  whileHover={{ scale: 1.06, y: -8, boxShadow: "0 30px 40px -5px rgba(0, 0, 0, 0.18), 0 18px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ willChange: "transform" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <motion.div 
                        className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-500 dark:text-yellow-400 shrink-0 border border-yellow-500/20"
                        animate={pulseAnimation(1.08, 2.5, 0.1)}
                        style={{ willChange: "transform" }}
                      >
                        <Mic className="w-5 h-5" />
                      </motion.div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Mock Interview</p>
                        <p className="text-sm font-black text-foreground leading-tight mt-0.5">Voice + Video</p>
                      </div>
                    </div>
                    <PremiumBadge />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground mt-2">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Video className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      Real-time AI
                    </span>
                    <span className="text-border/60">•</span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <TrendingUp className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      Smart Feedback
                    </span>
                  </div>
                  <Button
                    onClick={handleInterviewClick}
                    className="w-full mt-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold text-xs h-10 rounded-xl shadow-md border-0 transition-all duration-200"
                  >
                    <Video className="w-4 h-4 mr-2 shrink-0" />
                    Start Interview
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
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
