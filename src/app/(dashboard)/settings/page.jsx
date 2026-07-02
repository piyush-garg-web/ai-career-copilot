"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Settings,
  Sparkles,
  Loader2,
  Save,
  Sun,
  Moon,
  Laptop,
  Mail,
  ShieldAlert,
  Bell,
  Trash2,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("SYSTEM");

  // Notification states (stored in local storage to preserve DB schema integrity)
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: false,
    aiAnalysisTips: true,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch settings from database and local storage
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        if (data.theme) {
          setSelectedTheme(data.theme);
          setTheme(data.theme.toLowerCase());
        }

        // Fetch local storage notifications
        const cachedNotifications = localStorage.getItem("settings_notifications_portfolio");
        if (cachedNotifications) {
          setNotifications(JSON.parse(cachedNotifications));
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not retrieve application settings.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [setTheme]);

  // Handle Theme Selection Change
  const handleThemeChange = (themeName) => {
    setSelectedTheme(themeName);
    setTheme(themeName.toLowerCase());
  };

  // Toggle Notification preferences
  const handleToggleNotification = (key) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("settings_notifications_portfolio", JSON.stringify(next));
      return next;
    });
  };

  // Submit settings updates to database
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: selectedTheme }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save settings");
      }

      toast.success("Settings saved successfully!", {
        description: "Your visual style theme has been saved in the cloud.",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Account deletion demo warning
  const handleDeleteAccount = () => {
    toast.error("Account deletion is disabled for demo portfolios. Please close your account via Clerk dashboards.", {
      duration: 5000,
    });
    setShowDeleteConfirm(false);
  };

  if (loading || !isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold text-muted-foreground animate-pulse">Syncing preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your notifications, email settings, visual theme, and account preferences."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Block: Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Theme Selection */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border/80 transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sun className="w-4 h-4 text-indigo-400" />
                  Appearance Settings
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose a visual mode preference for the application dashboard interface.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: "LIGHT", label: "Light Theme", icon: Sun, color: "text-amber-500 bg-amber-500/10" },
                    { key: "DARK", label: "Dark Theme", icon: Moon, color: "text-blue-400 bg-blue-400/10" },
                    { key: "SYSTEM", label: "System Sync", icon: Laptop, color: "text-muted-foreground bg-muted/30" },
                  ].map((t) => {
                    const ThemeIcon = t.icon;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => handleThemeChange(t.key)}
                        className={`h-24 p-4 text-xs font-bold rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between items-start text-left ${
                          selectedTheme === t.key
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                            : "border-border/40 bg-background/50 text-muted-foreground hover:bg-accent/40 hover:border-border"
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${selectedTheme === t.key ? "bg-white/15 text-white" : t.color}`}>
                          <ThemeIcon className="w-4 h-4" />
                        </div>
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Notification settings */}
            <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  Notifications & Preference Rules
                </CardTitle>
                <CardDescription className="text-xs">
                  Decide how you would like to receive updates on your scores.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-semibold">
                <div
                  onClick={() => handleToggleNotification("emailAlerts")}
                  className="flex items-center justify-between border-b border-border/20 pb-3.5 cursor-pointer select-none"
                >
                  <div>
                    <span className="text-foreground block">Email notifications</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Get notifications when parsing or analysis completes.</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${notifications.emailAlerts ? "bg-indigo-600" : "bg-muted"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notifications.emailAlerts ? "translate-x-4" : ""}`} />
                  </div>
                </div>

                <div
                  onClick={() => handleToggleNotification("weeklyDigest")}
                  className="flex items-center justify-between border-b border-border/20 pb-3.5 cursor-pointer select-none"
                >
                  <div>
                    <span className="text-foreground block">Weekly analytics reports</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Receive weekly summarized insights on your scores.</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${notifications.weeklyDigest ? "bg-indigo-600" : "bg-muted"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notifications.weeklyDigest ? "translate-x-4" : ""}`} />
                  </div>
                </div>

                <div
                  onClick={() => handleToggleNotification("aiAnalysisTips")}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div>
                    <span className="text-foreground block">AI matching tips</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Receive suggestions when keywords match a hot sector role.</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${notifications.aiAnalysisTips ? "bg-indigo-600" : "bg-muted"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notifications.aiAnalysisTips ? "translate-x-4" : ""}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Details (Clerk Auth Context) */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border/80 transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-400" />
                  Account Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Your core authentication account details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-semibold">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/20 pb-3 gap-2">
                  <span className="text-muted-foreground">First Name</span>
                  <span className="text-foreground">{user?.firstName || "N/A"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/20 pb-3 gap-2">
                  <span className="text-muted-foreground">Last Name</span>
                  <span className="text-foreground">{user?.lastName || "N/A"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-muted-foreground">Email Address</span>
                  <span className="text-foreground">{user?.emailAddresses?.[0]?.email_address || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Dangerous deletion zone */}
            <Card className="border border-rose-500/20 bg-rose-500/5 backdrop-blur-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-500">
                  <Trash2 className="w-4.5 h-4.5" />
                  Irreversible Account Deletion
                </CardTitle>
                <CardDescription className="text-xs text-rose-500/80">
                  Deleting your profile will permanently clear all resume uploads, AI matching results, and history metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showDeleteConfirm ? (
                  <div className="p-3 border border-rose-500/30 rounded-xl bg-rose-500/10 flex flex-col gap-2 text-xs font-semibold">
                    <span className="text-rose-500">Are you absolutely sure? This action is permanent and cannot be undone.</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleDeleteAccount}
                        variant="destructive"
                        className="h-8 rounded-xl font-bold text-xs px-4 cursor-pointer"
                      >
                        Yes, delete permanently
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        variant="outline"
                        className="h-8 rounded-xl font-bold text-xs px-4 bg-transparent border-border/40 hover:bg-muted cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="destructive"
                    className="rounded-xl font-bold text-xs h-9 cursor-pointer"
                  >
                    Delete Account & Data
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Block: Safe Deletion & Save action */}
          <div className="space-y-6">
            <Card className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden relative group">
              <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Preferences Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="py-5 space-y-4 text-xs font-semibold leading-relaxed text-muted-foreground">
                <p>
                  Visual theme configuration will apply immediately to your browser layout framework and save your cloud state.
                </p>
                <div className="flex gap-2 items-start border-t border-border/20 pt-4 text-destructive">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Clerk Authentication configurations should be managed in the Clerk widget under your profile account.
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-6">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-md shadow-blue-500/10 cursor-pointer gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
