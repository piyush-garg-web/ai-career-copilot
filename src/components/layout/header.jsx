"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Bell, Menu, Search, User, Settings, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getRouteTitle = (path) => {
  if (path === "/dashboard") return "Dashboard";
  if (path === "/resume") return "My Resumes";
  if (path.startsWith("/resume/analysis")) return "Resume Analysis";
  if (path.startsWith("/ats-score")) return "ATS Score";
  if (path.startsWith("/job-match")) return "Job Match";
  if (path.startsWith("/interview/history")) return "Interview History";
  if (path.startsWith("/interview")) return "Interview Coach";
  if (path === "/profile") return "Profile";
  if (path === "/settings") return "Settings";
  
  // Try to extract dynamic routes beautifully
  const segments = path.split("/").filter(Boolean);
  if (segments[0] === "resume" && segments[1]) {
    return "Resume Details";
  }
  if (segments[0] === "job-match" && segments[1]) {
    return "Match Analysis";
  }
  if (segments[0] === "interview" && segments[1]) {
    return "Interview Session";
  }

  return "AI Career Copilot";
};

export function Header({ onMenuClick }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    toast.info("Search functionality is not implemented yet.", {
      description: "This is a frontend UI placeholder.",
    });
  };

  const handleNotificationClick = () => {
    toast.info("No new notifications", {
      description: "You are all caught up!",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left side: Hamburger menu + Page Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden rounded-xl border-border/40 w-9 h-9"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </Button>
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <span className="hover:text-foreground transition-colors cursor-pointer" onClick={() => router.push("/dashboard")}>
            App
          </span>
          <span>/</span>
          <span className="text-foreground font-semibold">
            {getRouteTitle(pathname)}
          </span>
        </div>
        <h1 className="text-lg font-bold text-foreground lg:hidden">
          {getRouteTitle(pathname)}
        </h1>
      </div>

      {/* Right side: Search, Theme, Notifications, Avatar */}
      <div className="flex items-center gap-3">
        {/* Search Bar - Desktop Only */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full max-w-[240px] hidden md:block"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/75" />
          <Input
            type="search"
            placeholder="Quick search..."
            className="w-full h-9 pl-9 pr-4 rounded-xl border-border/40 bg-accent/20 hover:bg-accent/30 focus-visible:bg-background focus-visible:ring-1 transition-all duration-200"
          />
        </form>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Icon */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNotificationClick}
          className="relative rounded-xl border-border/40 w-9 h-9"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border/60 hidden sm:block" />

        {/* User Profile Avatar Dropdown */}
        {isLoaded && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all cursor-pointer p-0"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={user.fullName || "User avatar"}
                  />
                  <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-semibold text-xs">
                    {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl border-border/40 mt-1" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-foreground flex items-center gap-1">
                    {user.fullName}
                    {user.publicMetadata?.role === "admin" && (
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground break-all">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="h-9 w-9 rounded-full bg-accent animate-pulse" />
        )}
      </div>
    </header>
  );
}
