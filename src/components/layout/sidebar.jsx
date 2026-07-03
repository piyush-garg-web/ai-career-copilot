"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Gauge,
  Target,
  Mic,
  History,
  User,
  Settings,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "My Resumes",
    href: "/resume",
    icon: FileText,
  },
  {
    name: "Resume Analysis",
    href: "/resume/analysis",
    icon: Sparkles,
  },
  {
    name: "ATS Score",
    href: "/ats-score",
    icon: Gauge,
  },
  {
    name: "Job Match",
    href: "/job-match",
    icon: Target,
  },
  {
    name: "Interview Coach",
    href: "/interview",
    icon: Mic,
  },
  {
    name: "Interview History",
    href: "/interview/history",
    icon: History,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ className }) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const isLinkActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    if (item.href === "/resume" && pathname.startsWith("/resume/analysis")) {
      return false;
    }
    if (item.href === "/interview" && pathname.startsWith("/interview/history")) {
      return false;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen fixed left-0 top-0 w-64 border-r border-border/40 bg-card/60 backdrop-blur-md text-card-foreground hidden lg:flex z-30 transition-all duration-300",
        className
      )}
    >
      {/* Branding Logo Section */}
      <div className="flex items-center gap-2.5 h-16 px-6 border-b border-border/40">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10">
          <Briefcase className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-foreground leading-none tracking-tight">
            CareerCopilot
          </span>
          <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mt-0.5">
            AI Platform
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const active = isLinkActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.name}
                className={cn(
                  "relative flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 group",
                  active
                    ? "text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                )}
              >
                {/* Active indicator pill */}
                {active && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl -z-10 shadow-sm shadow-blue-600/15"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                <Icon
                  className={cn(
                    "w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-105",
                    active
                      ? "text-white"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="relative">
                  {(() => {
                    const nameMap = {
                      "Dashboard": "dashboard.sidebar.dashboard",
                      "My Resumes": "dashboard.sidebar.resumeUpload",
                      "Resume Analysis": "dashboard.sidebar.resumeAnalysis",
                      "ATS Score": "dashboard.sidebar.atsScore",
                      "Job Match": "dashboard.sidebar.jobMatch",
                      "Interview Coach": "dashboard.sidebar.interviewCoach",
                      "Interview History": "dashboard.sidebar.interviewHistory",
                      "Profile": "dashboard.sidebar.profile",
                      "Settings": "dashboard.sidebar.settings"
                    };
                    return nameMap[item.name] ? t(nameMap[item.name]) : item.name;
                  })()}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding/Version */}
      <div className="p-4 border-t border-border/40 text-center">
        <p className="text-[11px] font-medium text-muted-foreground/60">
          AI Career Copilot v1.0
        </p>
      </div>
    </aside>
  );
}
