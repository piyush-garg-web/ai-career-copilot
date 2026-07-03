"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function Faq() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: t("landing.faq.items.one.question"),
      answer: t("landing.faq.items.one.answer")
    },
    {
      question: t("landing.faq.items.two.question"),
      answer: t("landing.faq.items.two.answer")
    },
    {
      question: t("landing.faq.items.three.question"),
      answer: t("landing.faq.items.three.answer")
    },
    {
      question: t("landing.faq.items.four.question"),
      answer: t("landing.faq.items.four.answer")
    },
    {
      question: t("landing.faq.items.five.question"),
      answer: t("landing.faq.items.five.answer")
    }
  ];

  const toggleAccordion = (idx) => {
    if (openIndex === idx) {
      setOpenIndex(null);
    } else {
      setOpenIndex(idx);
    }
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-secondary/15 border-y border-border/40 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {t("landing.faq.sectionTitle")}
          </h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {t("landing.faq.title")}
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("landing.faq.subtitle")}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden transition-all duration-300 hover:border-indigo-500/15"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="flex items-center justify-between w-full p-5 text-left font-semibold text-sm sm:text-base text-foreground transition-all duration-200 select-none hover:bg-secondary/25"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="p-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/30 bg-secondary/5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
