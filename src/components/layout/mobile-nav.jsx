"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationItems } from "./sidebar";

export function MobileNav({ isOpen, onClose }) {
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="w-[280px] p-0 border-r border-border/40 bg-card text-card-foreground"
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

        {/* Navigation Items */}
        <div className="py-6 px-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const active = isLinkActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                    active
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm shadow-blue-600/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-[18px] h-[18px]",
                      active
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
