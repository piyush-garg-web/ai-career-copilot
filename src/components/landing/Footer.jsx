"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Sparkles, Mail, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

// Inline Custom SVG for GitHub
const GithubIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border/40 relative">
      {/* Final CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 dark:from-violet-900/40 dark:to-indigo-950/40 p-8 sm:p-12 md:p-16 border border-indigo-500/20 text-center space-y-6 sm:space-y-8 shadow-xl">
          {/* Accent light spots */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none opacity-20" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {t("landing.footer.ctaTitle")}
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 dark:text-indigo-200 leading-relaxed font-normal">
              {t("landing.footer.ctaDescription")}
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base font-semibold px-8 py-6 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg transition-all duration-200">
                {t("landing.footer.ctaButton")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Links & Credits */}
        <div className="mt-16 md:mt-24 pt-8 border-t border-border/40 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Logo & Description */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Sparkles className="w-4.5 h-4.5 text-yellow-400 fill-yellow-400" />
              </div>
              <span className="font-bold text-base tracking-tight text-foreground">
                AI Career Copilot
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              {t("landing.footer.description")}
            </p>
          </div>

          {/* Quick links & categories */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-3">
              <h4 className="font-bold text-xs sm:text-sm text-foreground tracking-wider uppercase">{t("landing.footer.product")}</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">{t("landing.footer.features")}</Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-foreground transition-colors">{t("landing.footer.howItWorks")}</Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-xs sm:text-sm text-foreground tracking-wider uppercase">{t("landing.footer.developers")}</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link
                    href="https://github.com/piyushgarg6702-cyber/ai-career-copilot"
                    target="_blank"
                    className="hover:text-foreground flex items-center gap-1.5 transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" /> GitHub
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-foreground transition-colors">FAQs</Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-bold text-xs sm:text-sm text-foreground tracking-wider uppercase">{t("landing.footer.legal")}</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t("nav.privacy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    {t("nav.terms")}
                  </Link>
                </li>
                <li>
                  <Link href="mailto:support@aicareercopilot.app" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                    <Mail className="w-3.5 h-3.5" /> {t("landing.footer.contactSupport")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright and toggler alignment */}
        <div className="mt-12 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {currentYear} AI Career Copilot. All rights reserved. Distributed under MIT License.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">{t("landing.footer.changeAppearance")}</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
