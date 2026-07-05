"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { Upload, Cpu, Eye, FileSearch, MessageSquare, Award, Mic, Video } from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation();

  const floatAnimation = (yOffset = 5, duration = 5, delay = 0) => ({
    y: [0, -yOffset, 0],
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  });

  const pulseAnimation = (scale = 1.02, duration = 4, delay = 0) => ({
    scale: [1, scale, 1],
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  });

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
    },
    {
      icon: Mic,
      title: "AI Mock Interview Practice",
      description: "Practice realistic voice and video interviews with AI-powered speech recognition, real-time feedback, and detailed communication analysis.",
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    },
    {
      icon: Video,
      title: "Video Interview Analytics",
      description: "Get AI analysis of your body language, presentation skills, and confidence levels with personalized improvement suggestions.",
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.01]" />
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, -60, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9 }}
        >
          <motion.h2
            className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {t("landing.howItWorks.sectionTitle")}
          </motion.h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {t("landing.howItWorks.title")}
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("landing.howItWorks.subtitle")}
          </p>
        </motion.div>

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
                  <motion.div 
                    className="absolute left-8 lg:left-1/2 top-4 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border border-border bg-background shadow-md z-20"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                    style={{ willChange: "transform" }}
                  >
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {index + 1}
                    </span>
                  </motion.div>

                  {/* Left Spacer / Right Panel wrapper */}
                  <div className="w-full lg:w-1/2 pl-16 lg:pl-0 lg:px-8">
                    <motion.div
                      animate={floatAnimation(5, 6 + index * 0.2, index * 0.3)}
                      initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.7, type: "spring", stiffness: 110, damping: 16, delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.03, 
                        y: -4,
                        transition: { duration: 0.25 }
                      }}
                      className="bg-card/45 hover:bg-card/85 backdrop-blur-sm border border-border/40 hover:border-indigo-500/30 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-350 group relative overflow-hidden"
                      style={{ willChange: "transform" }}
                    >
                      {/* Hover glow */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      <div className="flex items-center gap-4 mb-3 relative z-10">
                        <motion.div
                          className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center group-hover:scale-115 transition-transform duration-250 shadow-sm`}
                          animate={pulseAnimation(1.06, 4.5, index * 0.4)}
                          whileHover={{ rotate: 10 }}
                          style={{ willChange: "transform" }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 8, -8, 0] }}
                            transition={{ duration: 5 + index * 0.6, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <step.icon className="w-5 h-5" />
                          </motion.div>
                        </motion.div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
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
