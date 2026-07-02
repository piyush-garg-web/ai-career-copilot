"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does AI analysis work?",
      answer: "When you upload your resume, our local parser extracts the raw text from your document (PDF or DOCX). This text is then securely processed by our Google Gemini AI pipeline, which compares it against industry-standard ATS filtering rules and grades sections on grammar, formatting completeness, and keyword strength."
    },
    {
      question: "Is my resume secure?",
      answer: "Yes, your resume files are handled securely. We upload the documents to a private bucket hosted by UploadThing, and only authenticated user accounts can retrieve or parse them. Your personal information is protected at all times."
    },
    {
      question: "Which file formats are supported?",
      answer: "We fully support standard PDF (.pdf) and Microsoft Word (.docx) document uploads up to 10MB. We parse formatting data locally to extract clean text for AI evaluation."
    },
    {
      question: "Can I analyze multiple resumes?",
      answer: "Absolutely! You can upload multiple resumes or version drafts to your dashboard. You can toggle any upload to be your 'Primary' resume, which will then serve as the base document for job descriptions matching and mock interview sessions."
    },
    {
      question: "Is my data private?",
      answer: "Yes, your data is private and locked to your personal account. We do not sell your resume details, performance reports, or mock interview transcripts to third-party databases. All auth gates are guarded by Clerk middleware authentication tokens."
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
            Support
          </h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Quick answers to standard questions about our AI pipeline, security models, file support, and data privacy policies.
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
