"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

function AnimatedCounter({ value, duration = 2, suffix = "", decimals = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = parseFloat(value);
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const incrementTime = 30; // ms per update
    const totalSteps = Math.ceil(totalMiliseconds / incrementTime);
    const stepValue = (end - start) / totalSteps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const nextCount = start + stepValue * currentStep;

      if (currentStep >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(nextCount);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  const formatNumber = (num) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return Math.floor(num).toLocaleString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const { t } = useTranslation();

  const floatAnimation = (yOffset = 5, duration = 5, delay = 0) => ({
    y: [0, -yOffset, 0],
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  });

  const pulseAnimation = (scale = 1.03, duration = 4, delay = 0) => ({
    scale: [1, scale, 1],
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  });

  const stats = [
    {
      value: 10000,
      suffix: "+",
      label: t("landing.stats.resumeAnalyses.label"),
      description: t("landing.stats.resumeAnalyses.description"),
      decimals: 0
    },
    {
      value: 95,
      suffix: "%",
      label: t("landing.stats.atsImprovement.label"),
      description: t("landing.stats.atsImprovement.description"),
      decimals: 0
    },
    {
      value: 50000,
      suffix: "+",
      label: t("landing.stats.interviewQuestions.label"),
      description: t("landing.stats.interviewQuestions.description"),
      decimals: 0
    },
    {
      value: 99.9,
      suffix: "%",
      label: t("landing.stats.uptime.label"),
      description: t("landing.stats.uptime.description"),
      decimals: 1
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/35 border-y border-border/40 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              animate={floatAnimation(5, 6 + index * 0.2, index * 0.3)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.12,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -8, 
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
              className="flex flex-col items-center text-center space-y-2 p-6 rounded-2xl hover:bg-card/60 transition-all duration-300 border border-transparent hover:border-border/30 hover:shadow-lg"
              style={{ willChange: "transform" }}
            >
              <motion.span
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-indigo-500"
                animate={pulseAnimation(1.03, 3.5, index * 0.4)}
                style={{ willChange: "transform" }}
              >
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </motion.span>
              <span className="text-sm font-bold text-foreground tracking-wide">
                {stat.label}
              </span>
              <span className="text-xs text-muted-foreground max-w-[200px]">
                {stat.description}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
