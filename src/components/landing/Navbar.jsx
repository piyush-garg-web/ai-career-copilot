"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";

import { useRouter, usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
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

export default function Navbar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    if (pathname !== "/") {
      router.push(`/#${id}`);
    } else {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80; // height of sticky navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/40 py-3 shadow-sm shadow-accent/5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/25 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              AI Career Copilot
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {t("nav.features")}
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {t("nav.howItWorks")}
            </button>
            <button
              onClick={() => scrollToSection("reviews")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {t("nav.reviews")}
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {t("nav.faq")}
            </button>
            <Link
              href="https://github.com/piyushgarg6702-cyber/ai-career-copilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors duration-200"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub
            </Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />

            {isLoaded && isSignedIn && user ? (
              <>
                <Link href="/dashboard">
                  <Button className="font-medium text-sm bg-primary hover:bg-primary/95 shadow-md hover:shadow-lg transition-all duration-200">
                    {t("nav.dashboard")}
                  </Button>
                </Link>
                <div className="pl-2 flex items-center border-l border-border/50 h-8">
                  <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer rounded-xl h-8 px-2"
                  >
                    {t("nav.logout")}
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/sign-in">
                <Button className="font-medium text-sm bg-primary hover:bg-primary/95 shadow-md hover:shadow-lg transition-all duration-200">
                  {t("nav.signIn")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-foreground hover:bg-secondary transition-colors"
              aria-label={t("common.toggleMenu")}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 border-b border-border/40 py-4 px-4 space-y-4 shadow-xl backdrop-blur-lg">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => scrollToSection("features")}
              className="text-left py-2 px-3 rounded-md hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              {t("nav.features")}
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-left py-2 px-3 rounded-md hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              {t("nav.howItWorks")}
            </button>
            <button
              onClick={() => scrollToSection("reviews")}
              className="text-left py-2 px-3 rounded-md hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              {t("nav.reviews")}
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-left py-2 px-3 rounded-md hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              FAQ
            </button>
            <Link
              href="https://github.com/piyushgarg6702-cyber/ai-career-copilot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub
            </Link>
          </div>
          <div className="border-t border-border pt-4 flex flex-col sm:flex-row gap-3">
            {isLoaded && isSignedIn && user ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-xl mb-1">
                  <span className="text-xs font-bold text-muted-foreground truncate max-w-[180px]">
                    {user.fullName || user.primaryEmailAddress?.emailAddress}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="text-[11px] font-bold text-red-500 hover:text-red-600 h-6 px-2 cursor-pointer"
                  >
                    {t("nav.logout")}
                  </Button>
                </div>
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full font-medium bg-primary hover:bg-primary/95">
                    {t("nav.dashboard")}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/sign-in" className="w-full">
                <Button className="w-full font-medium bg-primary hover:bg-primary/95">
                  {t("nav.signIn")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
