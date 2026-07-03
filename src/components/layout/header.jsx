"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Bell, Menu, Search, User, Settings, LogOut, Sparkles, FileText, CheckCircle2, Target, Mic } from "lucide-react";
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

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [resumes, setResumes] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [readNotifIds, setReadNotifIds] = useState([]);
  const [dismissedNotifIds, setDismissedNotifIds] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  const staticPages = [
    { name: "Dashboard", href: "/dashboard", description: "Main metrics and coaching overview" },
    { name: "My Resumes", href: "/resume", description: "Upload and list resume documents" },
    { name: "ATS Score Optimizer", href: "/ats-score", description: "Scoring check and optimization history" },
    { name: "AI Interview Coach", href: "/interview", description: "Start custom mock sessions" },
    { name: "Interview History", href: "/interview/history", description: "Review practice scorecards" },
    { name: "My Profile", href: "/profile", description: "Career target roles and details" },
    { name: "Settings", href: "/settings", description: "Appearance settings and theme" },
  ];

  // Fetch resumes and notifications
  useEffect(() => {
    async function fetchData() {
      try {
        const [resumesRes, notifRes] = await Promise.all([
          fetch("/api/resumes"),
          fetch("/api/notifications"),
        ]);
        if (resumesRes.ok) {
          const resumesData = await resumesRes.json();
          setResumes(resumesData);
        }
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData);
        }
      } catch (err) {
        console.error("Header data fetch error:", err);
      }
    }

    if (isLoaded && user) {
      fetchData();
      // Load read notification IDs from localStorage
      const stored = localStorage.getItem("read_notifications");
      if (stored) {
        setReadNotifIds(JSON.parse(stored));
      }
      // Load dismissed notification IDs from localStorage
      const storedDismissed = localStorage.getItem("dismissed_notifications");
      if (storedDismissed) {
        setDismissedNotifIds(JSON.parse(storedDismissed));
      }
    }
  }, [isLoaded, user]);

  // Click outside handlers for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter search results
  const filteredPages = searchQuery
    ? staticPages.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredResumes = searchQuery
    ? resumes.filter((r) => r.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredPages.length > 0) {
      router.push(filteredPages[0].href);
      setShowSearchDropdown(false);
    } else if (filteredResumes.length > 0) {
      router.push(`/resume/${filteredResumes[0].id}`);
      setShowSearchDropdown(false);
    } else {
      toast.error("No search results found.");
    }
  };

  const handleNotificationClick = (notif) => {
    // Mark as read in local state and localStorage
    const nextRead = [...new Set([...readNotifIds, notif.id])];
    setReadNotifIds(nextRead);
    localStorage.setItem("read_notifications", JSON.stringify(nextRead));
    setShowNotifDropdown(false);
    router.push(notif.link);
  };

  const visibleNotifications = notifications.filter((n) => !dismissedNotifIds.includes(n.id));
  const unreadNotifications = visibleNotifications.filter((n) => !readNotifIds.includes(n.id));

  const handleMarkAllAsRead = () => {
    const allIds = visibleNotifications.map((n) => n.id);
    const nextRead = [...new Set([...readNotifIds, ...allIds])];
    setReadNotifIds(nextRead);
    localStorage.setItem("read_notifications", JSON.stringify(nextRead));
    toast.success("All notifications marked as read.");
  };

  const handleClearAll = () => {
    const allIds = visibleNotifications.map((n) => n.id);
    const nextDismissed = [...new Set([...dismissedNotifIds, ...allIds])];
    setDismissedNotifIds(nextDismissed);
    localStorage.setItem("dismissed_notifications", JSON.stringify(nextDismissed));
    toast.success("All notifications cleared.");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  // Helper relative time display
  const getRelativeTimeText = (date) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
        <div ref={searchRef} className="relative w-full max-w-[240px] hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/75" />
            <Input
              type="search"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border-border/40 bg-accent/20 hover:bg-accent/30 focus-visible:bg-background focus-visible:ring-1 transition-all duration-200 text-xs font-semibold"
            />
          </form>

          {/* Search Dropdown Results */}
          {showSearchDropdown && searchQuery && (
            <div className="absolute right-0 top-11 w-80 rounded-2xl border border-border/40 bg-card p-3 shadow-lg z-50 space-y-2.5 max-h-[360px] overflow-y-auto">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">Results</h4>
              
              {filteredPages.length === 0 && filteredResumes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic px-2 py-1">No matching results found.</p>
              ) : (
                <div className="space-y-1">
                  {/* Pages */}
                  {filteredPages.map((page) => (
                    <button
                      key={page.href}
                      type="button"
                      onClick={() => {
                        router.push(page.href);
                        setShowSearchDropdown(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-accent/50 transition-colors flex flex-col cursor-pointer"
                    >
                      <span className="text-xs font-bold text-foreground">{page.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{page.description}</span>
                    </button>
                  ))}

                  {/* Resumes */}
                  {filteredResumes.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => {
                        router.push(`/resume/${res.id}`);
                        setShowSearchDropdown(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-accent/50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">{res.fileName}</span>
                        <span className="text-[10px] text-muted-foreground">Document details</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Icon */}
        <div ref={notifRef} className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative rounded-xl border-border/40 w-9 h-9 cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 text-foreground" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </Button>

          {/* Notifications Dropdown Drawer */}
          {showNotifDropdown && (
            <div className="absolute right-0 top-11 w-80 rounded-2xl border border-border/40 bg-card p-3 shadow-lg z-50 space-y-2">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-border/20">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  Notifications
                  {unreadNotifications.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black">
                      {unreadNotifications.length}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1.5">
                  {unreadNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-blue-500 hover:text-blue-600 font-bold transition-colors cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                  {unreadNotifications.length > 0 && visibleNotifications.length > 0 && (
                    <span className="text-[10px] text-muted-foreground/40 font-semibold">|</span>
                  )}
                  {visibleNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[10px] text-muted-foreground hover:text-foreground font-bold transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {visibleNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground font-semibold">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {visibleNotifications.map((notif) => {
                    const isRead = readNotifIds.includes(notif.id);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-2.5 rounded-xl hover:bg-accent/40 transition-colors flex gap-2.5 cursor-pointer relative ${
                          !isRead ? "bg-muted/10" : ""
                        }`}
                      >
                        {!isRead && (
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                        <div className="flex-1 space-y-0.5 min-w-0 pr-2">
                          <p className="text-xs font-bold text-foreground truncate">
                            {notif.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                            {notif.description}
                          </p>
                          <span className="text-[9px] text-muted-foreground/60 block pt-0.5">
                            {getRelativeTimeText(notif.time)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

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
