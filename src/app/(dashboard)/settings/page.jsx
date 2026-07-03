"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAccent } from "@/components/shared/AccentColorProvider";
import { useTranslation, SUPPORTED_LANGUAGES } from "@/lib/i18n/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deepEqual } from "@/lib/utils";
import { validateProfileData } from "@/lib/validators";
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
  HelpCircle,
  Activity,
  Award,
  BookOpen,
  ChevronRight,
  Database,
  Download,
  Fingerprint,
  Link2,
  Lock,
  Search,
  User,
  Sliders,
  Target,
  FileText,
  AlertTriangle,
  RefreshCw,
  Eye,
  Key,
  Globe,
  Code,
} from "lucide-react";

// Inline Custom SVGs to resolve Lucide-React barrel import bugs on compilation
const GitHubIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const LinkedInIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const { user, isLoaded } = useUser();
  const { setAccentColor } = useAccent();
  const { openUserProfile } = useClerk();
  const { t, changeLanguage } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [activeTab, setActiveTab] = useState("ai");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Available resumes list for preferences mapping
  const [resumes, setResumes] = useState([]);
  
  // Real-time API metrics
  const [apiMetrics, setApiMetrics] = useState({
    requests: 0,
    successes: 0,
    failures: 0,
    fallbackRate: 0.0,
    avgResponseTimeMs: 0,
    cacheHitRate: 0.0,
    quotaErrors: 0,
    activeProvider: "gemini",
    providerHealth: "OK"
  });

  // Settings State Schema with complete user custom configuration preferences
  const [profile, setProfile] = useState({
    theme: "SYSTEM",
    preferredLanguage: "en",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    leetcodeUrl: "",
    hackerrankUrl: "",
    codeforcesUrl: "",
    aiPreferences: {
      personality: "Professional",
      responseLength: "Balanced",
      analysisFocus: ["ATS Optimization"],
      coachStyle: "Technical Interview",
      language: "English",
      autoSaveConversations: true,
      useMemory: true,
      autoImproveResponses: true
    },
    notificationSettings: {
      resume: { email: true, push: true, weekly: false, monthly: false },
      interview: { email: true, push: true, weekly: false, monthly: false },
      jobMatch: { email: true, push: true, weekly: false, monthly: false },
      platform: { email: true, push: true, weekly: false, monthly: false },
      events: {
        resumeComplete: true,
        interviewReminders: true,
        aiTips: true,
        newFeatures: true,
        productUpdates: false,
        securityAlerts: true
      }
    },
    securitySettings: {
      twoFactorEnabled: false,
      recoveryEmail: "",
      trustedDevices: [
        { id: "1", name: "Chrome on Windows (Current session)", location: "Delhi, India", lastActive: "Active Now" }
      ],
      loginHistory: [
        { id: "1", ip: "103.115.12.18", date: "July 3, 2026, 01:22 PM", status: "Success" }
      ]
    },
    connectedAccounts: {
      github: { connected: false, username: "", lastSynced: null },
      linkedin: { connected: false, username: "", lastSynced: null },
      google: { connected: true, username: "", lastSynced: "Just now" },
      microsoft: { connected: false, username: "", lastSynced: null },
      portfolio: { connected: false, username: "", lastSynced: null },
      leetcode: { connected: false, username: "", lastSynced: null },
      hackerrank: { connected: false, username: "", lastSynced: null },
      codeforces: { connected: false, username: "", lastSynced: null }
    },
    resumePreferences: {
      defaultResumeId: "",
      preferredTemplate: "Modern Minimalist",
      defaultAtsTarget: 80,
      preferredLength: "2 Pages",
      autoAnalyze: true,
      autoSuggestions: true,
      highlightKeywords: true
    },
    jobPreferences: {
      workMode: "Hybrid",
      salaryRange: { min: "60000", max: "120000" },
      countries: ["India", "United States"],
      cities: ["Delhi", "San Francisco"],
      companyTypes: ["Startup", "Product", "MNC"],
      jobRoles: ["Software Engineer", "Full Stack Developer"],
      openToRelocation: true,
      openToInternship: false,
      openToFullTime: true
    },
    accessibilitySettings: {
      fontSize: "Medium",
      compactMode: false,
      highContrast: false,
      reduceMotion: false,
      keyboardNavigation: true,
      screenReader: false
    },
    appearanceSettings: {
      accentColor: "Purple",
      sidebarStyle: "Expanded",
      roundedCorners: 12,
      animationSpeed: "Normal"
    },
    privacySettings: {
      shareAnalytics: true,
      allowAiLearning: true,
      storeVoiceTranscripts: true,
      storeInterviewVideos: false,
      allowRecruiterView: true,
      hideProfile: false
    }
  });

  const [savedProfile, setSavedProfile] = useState(null);

  // Fetch Settings, Resumes & API Gateway stats
  useEffect(() => {
    async function loadSettingsAndData() {
      try {
        // 1. Fetch user data from DB
        const userRes = await fetch("/api/user");
        if (userRes.ok) {
          const userData = await userRes.json();
          setProfile((prev) => {
            const res = {
              ...prev,
              theme: userData.theme || prev.theme,
              preferredLanguage: userData.preferredLanguage || "en",
              githubUrl: userData.githubUrl || "",
              linkedinUrl: userData.linkedinUrl || "",
              portfolioUrl: userData.portfolioUrl || "",
              leetcodeUrl: userData.leetcodeUrl || "",
              hackerrankUrl: userData.hackerrankUrl || "",
              codeforcesUrl: userData.codeforcesUrl || "",
              aiPreferences: userData.aiPreferences ? { ...prev.aiPreferences, ...userData.aiPreferences } : prev.aiPreferences,
              notificationSettings: userData.notificationSettings ? { ...prev.notificationSettings, ...userData.notificationSettings } : prev.notificationSettings,
              securitySettings: userData.securitySettings ? { ...prev.securitySettings, ...userData.securitySettings } : prev.securitySettings,
              connectedAccounts: userData.connectedAccounts ? { ...prev.connectedAccounts, ...userData.connectedAccounts } : prev.connectedAccounts,
              resumePreferences: userData.resumePreferences ? { ...prev.resumePreferences, ...userData.resumePreferences } : prev.resumePreferences,
              jobPreferences: userData.jobPreferences ? { ...prev.jobPreferences, ...userData.jobPreferences } : prev.jobPreferences,
              accessibilitySettings: userData.accessibilitySettings ? { ...prev.accessibilitySettings, ...userData.accessibilitySettings } : prev.accessibilitySettings,
              appearanceSettings: userData.appearanceSettings ? { ...prev.appearanceSettings, ...userData.appearanceSettings } : prev.appearanceSettings,
              privacySettings: userData.privacySettings ? { ...prev.privacySettings, ...userData.privacySettings } : prev.privacySettings,
            };
            setSavedProfile(res);
            return res;
          });

          if (userData.theme) {
            setTheme(userData.theme.toLowerCase());
          }
        }

        // 2. Fetch User Resumes
        const resumesRes = await fetch("/api/resumes");
        if (resumesRes.ok) {
          const resumesData = await resumesRes.json();
          setResumes(resumesData);
        }

        // 3. Fetch API Gateway logs
        const healthRes = await fetch("/api/ai/health");
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setApiMetrics((prev) => ({ ...prev, ...healthData }));
        }

      } catch (err) {
        console.error("Failed to load settings dashboards:", err);
        toast.error("Error synchronizing profile configurations.");
      } finally {
        setLoading(false);
      }
    }
    loadSettingsAndData();
  }, [setTheme]);

  useEffect(() => {
    if (!savedProfile) return;
    const isDirty = !deepEqual(profile, savedProfile);
    setSaveStatus(isDirty ? "Unsaved" : "Saved");
  }, [profile, savedProfile]);

  useEffect(() => {
    if (locale && profile.preferredLanguage !== locale) {
      setProfile((prev) => ({ ...prev, preferredLanguage: locale }));
      setSavedProfile((prevSaved) => {
        if (!prevSaved) return null;
        return { ...prevSaved, preferredLanguage: locale };
      });
    }
  }, [locale]);

  // Handle Form changes
  const updateNestedField = (section, field, value) => {
    if (field === null) {
      setProfile((prev) => ({
        ...prev,
        [section]: value
      }));
      return;
    }
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleThemeChange = (themeName) => {
    setProfile(prev => ({ ...prev, theme: themeName }));
    setTheme(themeName.toLowerCase());
  };

  const updateSubNestedField = (section, category, field, value) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [category]: {
          ...prev[section][category],
          [field]: value
        }
      }
    }));
  };

  // Submit Settings POST API
  const handleSaveSettings = async () => {
    // Client-side validation
    const validation = validateProfileData(profile);
    if (!validation.isValid) {
      validation.errors.forEach((err) => {
        toast.error(err, { duration: 5000 });
      });
      return;
    }

    setSaving(true);
    setSaveStatus("Saving...");
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to write configurations to database.");
      }

      const updatedData = await response.json();
      setProfile(updatedData);
      setSavedProfile(updatedData);
      setSaveStatus("Saved");
      
      toast.success("Settings saved successfully!", {
        description: "Your configurations are synchronized.",
      });
    } catch (e) {
      setSaveStatus("Unsaved");
      toast.error("Save failure", {
        description: e.message || "Network issue.",
      });
    } finally {
      setSaving(false);
    }
  };

  const [tempInputs, setTempInputs] = useState({});
  const [connecting, setConnecting] = useState({});

  // Synchronize input fields with profile state on change
  useEffect(() => {
    if (profile) {
      setTempInputs({
        github: profile.githubUrl || "",
        linkedin: profile.linkedinUrl || "",
        portfolio: profile.portfolioUrl || "",
        leetcode: profile.leetcodeUrl || "",
        hackerrank: profile.hackerrankUrl || "",
        codeforces: profile.codeforcesUrl || "",
      });
    }
  }, [
    profile?.githubUrl,
    profile?.linkedinUrl,
    profile?.portfolioUrl,
    profile?.leetcodeUrl,
    profile?.hackerrankUrl,
    profile?.codeforcesUrl,
  ]);

  const handleConnectAccount = async (provider) => {
    const val = tempInputs[provider];
    if (!val) {
      toast.error(`Please enter a valid URL or handle for ${provider}.`);
      return;
    }

    setConnecting(prev => ({ ...prev, [provider]: true }));
    try {
      const res = await fetch("/api/user/connected-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, value: val }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Verification failed.");
      }

      const responseData = await res.json();
      
      const dbFieldsMap = {
        github: "githubUrl",
        linkedin: "linkedinUrl",
        portfolio: "portfolioUrl",
        leetcode: "leetcodeUrl",
        hackerrank: "hackerrankUrl",
        codeforces: "codeforcesUrl",
      };
      const field = dbFieldsMap[provider];

      setProfile(prev => {
        const next = {
          ...prev,
          connectedAccounts: responseData.connectedAccounts,
          ...(field && { [field]: responseData.url || val })
        };
        setSavedProfile(prevSaved => {
          if (!prevSaved) return null;
          return {
            ...prevSaved,
            connectedAccounts: responseData.connectedAccounts,
            ...(field && { [field]: responseData.url || val })
          };
        });
        return next;
      });

      toast.success(`${provider} connected successfully!`);
    } catch (err) {
      toast.error(`Failed to connect ${provider}: ${err.message}`);
    } finally {
      setConnecting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleDisconnectAccount = async (provider) => {
    setConnecting(prev => ({ ...prev, [provider]: true }));
    try {
      const res = await fetch(`/api/user/connected-accounts?provider=${provider}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Disconnection failed.");
      }

      const responseData = await res.json();

      const dbFieldsMap = {
        github: "githubUrl",
        linkedin: "linkedinUrl",
        portfolio: "portfolioUrl",
        leetcode: "leetcodeUrl",
        hackerrank: "hackerrankUrl",
        codeforces: "codeforcesUrl",
      };
      const field = dbFieldsMap[provider];

      setProfile(prev => {
        const next = {
          ...prev,
          connectedAccounts: responseData.connectedAccounts,
          ...(field && { [field]: "" })
        };
        setSavedProfile(prevSaved => {
          if (!prevSaved) return null;
          return {
            ...prevSaved,
            connectedAccounts: responseData.connectedAccounts,
            ...(field && { [field]: "" })
          };
        });
        return next;
      });

      setTempInputs(prev => ({ ...prev, [provider]: "" }));
      toast.success(`${provider} disconnected successfully.`);
    } catch (err) {
      toast.error(`Failed to disconnect ${provider}: ${err.message}`);
    } finally {
      setConnecting(prev => ({ ...prev, [provider]: false }));
    }
  };

  // Complete Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmInput !== "DELETE") {
      toast.error("Please type DELETE to confirm account closure.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Account deleted successfully.", {
          description: "All profile metrics, resume histories, and logs have been wiped.",
        });
        window.location.href = "/";
      } else {
        throw new Error("Failed to wipe account data.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Account deletion failed.", {
        description: err.message || "Contact portal support.",
      });
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  // Download All Profile Data as Backup JSON
  const handleDownloadBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `CareerCopilot-Settings-Backup.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Backup profile data exported!");
    } catch (err) {
      toast.error("Backup export failed.");
    }
  };

  // Clear AI Gateway Local Cache
  const handleClearCache = async () => {
    try {
      const res = await fetch("/api/ai/health", { method: "DELETE" });
      if (res.ok) {
        toast.success("AI Gateway Cache Reset successfully!", {
          description: "Request index and cached response payloads cleared.",
        });
        // Refresh metrics
        const healthRes = await fetch("/api/ai/health");
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setApiMetrics((prev) => ({ ...prev, ...healthData }));
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to clear gateway cache.");
    }
  };

  // Multi-select analysis list helper
  const handleToggleAnalysisFocus = (item) => {
    const current = profile.aiPreferences.analysisFocus;
    let next = [];
    if (current.includes(item)) {
      next = current.filter((x) => x !== item);
    } else {
      next = [...current, item];
    }
    updateNestedField("aiPreferences", "analysisFocus", next);
  };

  // Compute Settings & Completeness rings metrics
  const getCompletenessStats = () => {
    // 1. Settings completion ratio
    const totalToggles = 12;
    let configured = 0;
    if (profile.aiPreferences.personality !== "Professional") configured++;
    if (profile.aiPreferences.language !== "English") configured++;
    if (profile.resumePreferences.defaultResumeId) configured++;
    if (profile.jobPreferences.workMode !== "Hybrid") configured++;
    if (profile.accessibilitySettings.compactMode) configured++;
    if (profile.securitySettings.twoFactorEnabled) configured++;
    if (profile.connectedAccounts.github.connected) configured++;
    if (profile.connectedAccounts.linkedin.connected) configured++;
    if (profile.privacySettings.storeInterviewVideos) configured++;
    if (profile.appearanceSettings.accentColor !== "Purple") configured++;
    if (!profile.privacySettings.shareAnalytics) configured++;
    if (profile.jobPreferences.openToRelocation) configured++;

    const settingsPct = Math.round((configured / totalToggles) * 100);

    // 2. AI personalization percentage
    let aiConfigCount = 0;
    if (profile.aiPreferences.personality) aiConfigCount++;
    if (profile.aiPreferences.responseLength) aiConfigCount++;
    if (profile.aiPreferences.analysisFocus.length > 0) aiConfigCount++;
    if (profile.aiPreferences.coachStyle) aiConfigCount++;
    if (profile.aiPreferences.language) aiConfigCount++;
    if (profile.aiPreferences.useMemory) aiConfigCount++;
    if (profile.aiPreferences.autoImproveResponses) aiConfigCount++;

    const aiPct = Math.round((aiConfigCount / 7) * 100);

    return {
      settings: Math.min(settingsPct + 30, 100), // padding base setup
      ai: aiPct
    };
  };

  const compStats = getCompletenessStats();

  // Tab definitions with keyword mapping for dynamic searches
  const tabsList = [
    { id: "ai", label: t("settings.tabs.ai"), icon: Sparkles, keywords: "personality length focus language mentor memory conversational custom" },
    { id: "notifications", label: t("settings.tabs.notifications"), icon: Bell, keywords: "email push weekly monthly alerts alerts completeness platform" },
    { id: "security", label: t("settings.tabs.security"), icon: Shield, keywords: "password mfa session verification status device history log" },
    { id: "accounts", label: t("settings.tabs.connected"), icon: Link2, keywords: "github linkedin google microsoft portfolio leetcode accounts sync" },
    { id: "engine", label: t("settings.tabs.engine"), icon: Activity, keywords: "fallback priority provider gemini openai requests daily status model" },
    { id: "resume", label: t("settings.tabs.resumeJob"), icon: FileText, keywords: "default template salary work mode relocate countries cities roles open" },
    { id: "appearance", label: t("settings.tabs.appearance"), icon: Sliders, keywords: "theme visual color picker text font contrast speed reduce motion rounded" },
    { id: "data", label: t("settings.tabs.data"), icon: Database, keywords: "billing download export database backup premium upgrade subscription size delete cache" },
    { id: "danger", label: t("settings.tabs.danger"), icon: Trash2, keywords: "delete account erase purge reset confirmation delete warning data" },
  ];

  // Filter tabs list dynamically based on search query
  const filteredTabs = tabsList.filter(tab => 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tab.keywords.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sync tab active selection if currently selected tab falls out of filter list
  useEffect(() => {
    if (searchQuery && filteredTabs.length > 0 && !filteredTabs.some(t => t.id === activeTab)) {
      setActiveTab(filteredTabs[0].id);
    }
  }, [searchQuery, filteredTabs, activeTab]);

  const accountsMapping = [
    { key: "github", label: t("settings.accounts.github.label"), desc: t("settings.accounts.github.desc"), dbField: "githubUrl", placeholder: t("settings.accounts.github.placeholder"), icon: GitHubIcon },
    { key: "linkedin", label: t("settings.accounts.linkedin.label"), desc: t("settings.accounts.linkedin.desc"), dbField: "linkedinUrl", placeholder: t("settings.accounts.linkedin.placeholder"), icon: LinkedInIcon },
    { key: "portfolio", label: t("settings.accounts.portfolio.label"), desc: t("settings.accounts.portfolio.desc"), dbField: "portfolioUrl", placeholder: t("settings.accounts.portfolio.placeholder"), icon: Globe },
    { key: "leetcode", label: t("settings.accounts.leetcode.label"), desc: t("settings.accounts.leetcode.desc"), dbField: "leetcodeUrl", placeholder: t("settings.accounts.leetcode.placeholder"), icon: Award },
    { key: "hackerrank", label: t("settings.accounts.hackerrank.label"), desc: t("settings.accounts.hackerrank.desc"), dbField: "hackerrankUrl", placeholder: t("settings.accounts.hackerrank.placeholder"), icon: Award },
    { key: "codeforces", label: t("settings.accounts.codeforces.label"), desc: t("settings.accounts.codeforces.desc"), dbField: "codeforcesUrl", placeholder: t("settings.accounts.codeforces.placeholder"), icon: Code }
  ];

  const isGoogleConnected = user?.externalAccounts?.some(acc => acc.provider.includes("google")) || false;
  const isMicrosoftConnected = user?.externalAccounts?.some(acc => acc.provider.includes("microsoft")) || false;

  if (loading || !isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold text-muted-foreground animate-pulse">{t("settings.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* HEADER SECTION WITH USER GREETING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={user?.firstName ? t("settings.pageTitleWithName", { name: user.firstName }) : t("settings.pageTitle")}
          description={t("settings.pageDescription")}
        />
        {/* Search bar integration */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("settings.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-border/40 bg-accent/20 text-foreground font-semibold placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* COMPLETENESS STATS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Settings Completion Ring */}
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider">{t("settings.cards.configuration.label")}</span>
            <h4 className="text-sm font-black text-foreground">{t("settings.cards.configuration.title")}</h4>
            <p className="text-[10px] text-muted-foreground font-medium">{t("settings.cards.configuration.description")}</p>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="currentColor" className="text-muted-foreground/10" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="22" stroke="currentColor" className="text-indigo-500" strokeWidth="4" fill="transparent"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - compStats.settings / 100)}
                strokeLinecap="round" />
            </svg>
            <span className="absolute text-[10px] font-black text-foreground">{compStats.settings}%</span>
          </div>
        </Card>

        {/* AI personalization ring */}
        <Card className="border border-border/40 bg-card/60 backdrop-blur-sm p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider">{t("settings.cards.personalization.label")}</span>
            <h4 className="text-sm font-black text-foreground">{t("settings.cards.personalization.title")}</h4>
            <p className="text-[10px] text-muted-foreground font-medium">{t("settings.cards.personalization.description")}</p>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="currentColor" className="text-muted-foreground/10" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="22" stroke="currentColor" className="text-teal-400" strokeWidth="4" fill="transparent"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - compStats.ai / 100)}
                strokeLinecap="round" />
            </svg>
            <span className="absolute text-[10px] font-black text-foreground">{compStats.ai}%</span>
          </div>
        </Card>

        {/* Subscription Plan Panel */}
        <Card className="border border-border/40 bg-gradient-to-br from-indigo-500/10 via-card/60 to-card/60 backdrop-blur-sm p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">{t("settings.cards.billing.label")}</span>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-foreground">{t("settings.cards.billing.title")}</h4>
              <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{t("settings.cards.billing.badge")}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">{t("settings.cards.billing.description")}</p>
          </div>
          <Button size="sm" className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer">
            {t("settings.cards.billing.button")}
          </Button>
        </Card>
      </div>

      {/* STICKY SAVE WARNING BANNER */}
      <AnimatePresence>
        {saveStatus === "Unsaved" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between border border-amber-500/20 bg-amber-500/5 backdrop-blur-md px-5 py-3.5 rounded-2xl"
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold text-amber-500">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span>{t("settings.unsavedBanner")}</span>
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="h-8 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {t("settings.saveChanges")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN SETTINGS INTERFACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Sidebar navigation list (3/12 columns) */}
        <div className="lg:col-span-3 space-y-2">
          {filteredTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full h-10 px-4 rounded-xl flex items-center gap-2.5 text-xs font-bold transition-all relative text-left cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white font-black"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <TabIcon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
          {filteredTabs.length === 0 && (
            <div className="p-4 text-center text-xs font-bold text-muted-foreground bg-accent/10 rounded-xl">
              No matching settings sections.
            </div>
          )}
        </div>

        {/* Right Side: Configuration panels (9/12 columns) */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* TAB 1: AI PREFERENCES */}
              {activeTab === "ai" && (
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-6 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      AI Personality & Preferences
                    </h3>
                    <p className="text-xs text-muted-foreground">Customize LLM persona, languages, response spans, and active auto-learning constraints.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Persona select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">AI Personality Persona</label>
                      <select
                        value={profile.aiPreferences.personality}
                        onChange={(e) => updateNestedField("aiPreferences", "personality", e.target.value)}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-border/40 bg-background text-foreground font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        {["Professional", "Friendly", "Recruiter", "Mentor", "Strict Interviewer"].map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Span select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Response Detail Level</label>
                      <select
                        value={profile.aiPreferences.responseLength}
                        onChange={(e) => updateNestedField("aiPreferences", "responseLength", e.target.value)}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-border/40 bg-background text-foreground font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        {["Short", "Balanced", "Detailed"].map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Coach target select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Interview Coach Style Target</label>
                      <select
                        value={profile.aiPreferences.coachStyle}
                        onChange={(e) => updateNestedField("aiPreferences", "coachStyle", e.target.value)}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-border/40 bg-background text-foreground font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        {["HR Interview", "Technical Interview", "FAANG Style", "Startup Style", "Behavioral Focus"].map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Language select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Preferred Application & AI Language</label>
                      <select
                        value={profile.preferredLanguage || "en"}
                        onChange={(e) => {
                          const langCode = e.target.value;
                          updateNestedField("preferredLanguage", null, langCode);
                          changeLanguage(langCode);
                        }}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-border/40 bg-background text-foreground font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.nativeName} ({lang.name})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Multi-select checkchips for Analysis Target focus */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">Resume Analysis Focus Areas</label>
                    <div className="flex flex-wrap gap-2">
                      {["ATS Optimization", "Recruiter Review", "HR Perspective", "Technical Review"].map((focus) => {
                        const isSelected = profile.aiPreferences.analysisFocus.includes(focus);
                        return (
                          <button
                            key={focus}
                            type="button"
                            onClick={() => handleToggleAnalysisFocus(focus)}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-border/40 hover:bg-accent/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {focus}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-border/20 w-full" />

                  {/* Toggle list */}
                  <div className="space-y-4 text-xs font-bold">
                    {[
                      { field: "autoSaveConversations", label: "Auto Save AI Conversations", desc: "Saves chat practice logs automatically." },
                      { field: "useMemory", label: "Use AI Memory context", desc: "Enables long-term resume target recall mapping." },
                      { field: "autoImproveResponses", label: "Auto Improve Responses", desc: "Refines answer outputs deterministically." }
                    ].map((item) => (
                      <div
                        key={item.field}
                        onClick={() => updateNestedField("aiPreferences", item.field, !profile.aiPreferences[item.field])}
                        className="flex items-center justify-between cursor-pointer select-none"
                      >
                        <div>
                          <span className="text-foreground block">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{item.desc}</span>
                        </div>
                        <div className={`w-9 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${profile.aiPreferences[item.field] ? "bg-indigo-600" : "bg-muted"}`}>
                          <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ${profile.aiPreferences[item.field] ? "translate-x-3.5" : ""}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* TAB 2: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-6 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Bell className="w-4.5 h-4.5 text-indigo-400" />
                      Categorized Notifications & Weekly Digests
                    </h3>
                    <p className="text-xs text-muted-foreground">Select what notification channels you want to bind to specific scorecard updates.</p>
                  </div>

                  <div className="space-y-5">
                    {/* Categories grid */}
                    {["resume", "interview", "jobMatch", "platform"].map((cat) => (
                      <div key={cat} className="space-y-2.5 border-b border-border/20 pb-4 last:border-b-0 last:pb-0">
                        <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                          {cat === "jobMatch" ? "Job Match Notifications" : `${cat.charAt(0).toUpperCase() + cat.slice(1)} Notifications`}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-bold text-muted-foreground">
                          {[
                            { key: "email", label: "Email Alerts" },
                            { key: "push", label: "Push Notification" },
                            { key: "weekly", label: "Weekly Digests" },
                            { key: "monthly", label: "Monthly Reports" }
                          ].map((channel) => {
                            const isChecked = profile.notificationSettings[cat][channel.key];
                            return (
                              <label key={channel.key} className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => updateSubNestedField("notificationSettings", cat, channel.key, e.target.checked)}
                                  className="w-4 h-4 text-indigo-600 rounded border-border/40 focus:ring-indigo-500"
                                />
                                {channel.label}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="h-px bg-border/20 w-full" />

                    {/* Specific Events */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Specific Event Subscriptions</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                        {[
                          { key: "resumeComplete", label: "Resume Analysis Complete" },
                          { key: "interviewReminders", label: "Interview Practice Reminders" },
                          { key: "aiTips", label: "AI Suggestions & Coaching Tips" },
                          { key: "newFeatures", label: "New Feature Announcements" },
                          { key: "productUpdates", label: "Product & Pipeline updates" },
                          { key: "securityAlerts", label: "Security & MFA Login Alerts" }
                        ].map((evt) => {
                          const isChecked = profile.notificationSettings.events[evt.key];
                          return (
                            <div
                              key={evt.key}
                              onClick={() => updateSubNestedField("notificationSettings", "events", evt.key, !isChecked)}
                              className="flex items-center justify-between cursor-pointer select-none"
                            >
                              <span className="text-muted-foreground font-semibold">{evt.label}</span>
                              <div className={`w-8 h-5 rounded-full p-0.5 transition-colors duration-200 ${isChecked ? "bg-indigo-600" : "bg-muted"}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isChecked ? "translate-x-3" : ""}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* TAB 3: SECURITY & PRIVACY */}
              {activeTab === "security" && (
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-6 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4 text-indigo-400" />
                      MFA Security & Active Session Logs
                    </h3>
                    <p className="text-xs text-muted-foreground">Manage your recovery parameters, active authentication logs, and login histories.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Clerk redirect notice */}
                    <div className="p-3.5 border border-indigo-500/20 bg-indigo-500/5 rounded-xl flex gap-2.5 items-start text-xs font-bold leading-relaxed justify-between items-center">
                      <div className="flex gap-2.5 items-start">
                        <Key className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-indigo-300 block">Manage credentials in Clerk</span>
                          <p className="text-[10px] text-muted-foreground font-semibold">
                            Password rotation and email/phone factors are securely handled by Clerk widget.
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => openUserProfile()}
                        className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer shrink-0 ml-2"
                      >
                        Manage Profile
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                      <div className="space-y-1">
                        <span className="text-muted-foreground block">Email Verification Status</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified ({user?.emailAddresses?.[0]?.emailAddress})
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-muted-foreground block">Phone Verification Status</span>
                        {(() => {
                          const verifiedPhoneObj = user?.phoneNumbers?.find(p => p.verification?.status === "verified");
                          return verifiedPhoneObj ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Verified ({verifiedPhoneObj.phoneNumber})
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">Not Connected (Add via Clerk settings)</span>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="h-px bg-border/20 w-full" />

                    {/* Two-Factor Authentication Switch */}
                    <div
                      onClick={() => {
                        const nextVal = !profile.securitySettings.twoFactorEnabled;
                        updateNestedField("securitySettings", "twoFactorEnabled", nextVal);
                        if (nextVal) {
                          toast.success("Two-Factor preference updated!", {
                            description: "Please configure your actual MFA devices in 'Manage Profile' for active authentication verification.",
                            duration: 5000
                          });
                        }
                      }}
                      className="flex items-center justify-between cursor-pointer select-none text-xs font-bold"
                    >
                      <div>
                        <span className="text-foreground block">Enable Two-Factor Authentication</span>
                        <span className="text-[10px] text-muted-foreground font-medium">Require an extra device OTP code on authentication requests.</span>
                      </div>
                      <div className={`w-9 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${profile.securitySettings.twoFactorEnabled ? "bg-indigo-600" : "bg-muted"}`}>
                        <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ${profile.securitySettings.twoFactorEnabled ? "translate-x-3.5" : ""}`} />
                      </div>
                    </div>

                    {/* Recovery Email Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Recovery Backup Email Address</label>
                      <input
                        type="email"
                        placeholder="recovery@example.com"
                        value={profile.securitySettings.recoveryEmail || ""}
                        onChange={(e) => updateNestedField("securitySettings", "recoveryEmail", e.target.value)}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-border/40 bg-background text-foreground font-semibold focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="h-px bg-border/20 w-full" />

                    {/* Trusted Devices & Sessions */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Active Trusted Sessions</h4>
                      {profile.securitySettings.trustedDevices.map((dev) => (
                        <div key={dev.id} className="p-3 border border-border/40 bg-accent/10 rounded-xl flex items-center justify-between text-xs font-bold">
                          <div className="space-y-1">
                            <span className="text-foreground block">{dev.name}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold">{dev.location}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{dev.lastActive}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* TAB 4: CONNECTED ACCOUNTS */}
              {activeTab === "accounts" && (
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-6 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Link2 className="w-4.5 h-4.5 text-indigo-400" />
                      Connected Integrations & Social Portfolios
                    </h3>
                    <p className="text-xs text-muted-foreground">Authorize and connect social integrations to populate your background profile details dynamically.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Clerk OAuth Providers */}
                    <div className="p-4 border border-border/40 bg-accent/20 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-accent/40 text-indigo-400 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <span className="text-foreground block truncate">Google Account</span>
                          <span className="text-[10px] text-muted-foreground font-semibold truncate block">Core login & calendar integration</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                        isGoogleConnected ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                      }`}>
                        {isGoogleConnected ? "Connected" : "Not Linked"}
                      </span>
                    </div>

                    <div className="p-4 border border-border/40 bg-accent/20 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-accent/40 text-indigo-400 shrink-0">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <span className="text-foreground block truncate">Microsoft Profile</span>
                          <span className="text-[10px] text-muted-foreground font-semibold truncate block">Alternative login & directory sync</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                        isMicrosoftConnected ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                      }`}>
                        {isMicrosoftConnected ? "Connected" : "Not Linked"}
                      </span>
                    </div>

                    {/* Developer Social Links */}
                    {accountsMapping.map((item) => {
                      const Icon = item.icon;
                      const accountInfo = profile.connectedAccounts?.[item.key];
                      const isConnected = !!accountInfo?.connected;
                      const isOAuth = !!accountInfo?.isOAuth;
                      const isConnecting = !!connecting[item.key];
                      return (
                        <div key={item.key} className="p-4 border border-border/40 bg-accent/20 rounded-2xl flex flex-col justify-between gap-3 text-xs font-bold">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-2 rounded-xl bg-accent/40 text-indigo-400 shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <span className="text-foreground block truncate">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground font-semibold truncate block">{item.desc}</span>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                              isConnected ? (isOAuth ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-emerald-500/10 text-emerald-500") : "bg-muted/60 text-muted-foreground/60"
                            }`}>
                              {isConnected ? (isOAuth ? "OAuth Connected" : "Connected") : "Not Connected"}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={item.placeholder}
                              value={isOAuth ? (accountInfo?.username ? `@${accountInfo.username} (Synced via Clerk)` : "Linked via Clerk login") : (tempInputs[item.key] || "")}
                              onChange={(e) => setTempInputs(prev => ({ ...prev, [item.key]: e.target.value }))}
                              disabled={isConnected || isConnecting || isOAuth}
                              className="w-full h-8 px-3 text-[10px] rounded-xl border border-border/40 bg-background text-foreground font-semibold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                            />
                            {isOAuth ? (
                              <Button
                                type="button"
                                onClick={() => openUserProfile()}
                                className="h-8 rounded-xl px-3 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 text-[9px] font-black uppercase tracking-wider cursor-pointer shrink-0 border border-indigo-500/20"
                              >
                                Manage Profile
                              </Button>
                            ) : isConnected ? (
                              <Button
                                type="button"
                                onClick={() => handleDisconnectAccount(item.key)}
                                disabled={isConnecting}
                                className="h-8 rounded-xl px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[9px] font-black uppercase tracking-wider cursor-pointer shrink-0 border border-rose-500/20"
                              >
                                {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Disconnect"}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                onClick={() => handleConnectAccount(item.key)}
                                disabled={isConnecting || !tempInputs[item.key]}
                                className="h-8 rounded-xl px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-wider cursor-pointer shrink-0"
                              >
                                {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* TAB 5: AI ENGINE SETTINGS */}
              {activeTab === "engine" && (
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-6 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Activity className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                      Centralized AI Gateway orchestrator
                    </h3>
                    <p className="text-xs text-muted-foreground">Monitor real-time Gemini usage latency index, quota caps, and fallback order rules.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 border border-border/40 bg-accent/20 rounded-xl text-center space-y-1">
                      <span className="text-[8px] font-black text-muted-foreground uppercase">Requests (Session)</span>
                      <div className="text-sm font-black text-foreground">{apiMetrics.requests}</div>
                    </div>
                    <div className="p-3 border border-border/40 bg-accent/20 rounded-xl text-center space-y-1">
                      <span className="text-[8px] font-black text-muted-foreground uppercase">Average Latency</span>
                      <div className="text-sm font-black text-indigo-400">{apiMetrics.avgResponseTimeMs}ms</div>
                    </div>
                    <div className="p-3 border border-border/40 bg-accent/20 rounded-xl text-center space-y-1">
                      <span className="text-[8px] font-black text-muted-foreground uppercase">Cache Hit alignment</span>
                      <div className="text-sm font-black text-teal-400">{(apiMetrics.cacheHitRate * 100).toFixed(0)}%</div>
                    </div>
                    <div className="p-3 border border-border/40 bg-accent/20 rounded-xl text-center space-y-1">
                      <span className="text-[8px] font-black text-muted-foreground uppercase">Active model</span>
                      <div className="text-xs font-black text-foreground uppercase tracking-wider">{apiMetrics.activeProvider}</div>
                    </div>
                  </div>

                  {/* Fallback Priority mapping list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Fallback priority order</h4>
                    <div className="space-y-2 text-xs font-semibold">
                      {[
                        { order: "Primary", name: "Gemini 2.5 Flash", status: "Active (Healthy)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                        { order: "Fallback 1", name: "Gemini 2.5 Flash-lite", status: "Standby", color: "text-muted-foreground bg-accent/20 border-border/40" },
                        { order: "Fallback 2", name: "Gemini 2.0 Flash", status: "Standby", color: "text-muted-foreground bg-accent/20 border-border/40" },
                        { order: "Fallback 3", name: "Gemini 1.5 Flash", status: "Standby", color: "text-muted-foreground bg-accent/20 border-border/40" }
                      ].map((item) => (
                        <div key={item.order} className="p-3 border border-border/40 bg-background/50 rounded-xl flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider min-w-[70px]">{item.order}</span>
                            <span className="text-foreground">{item.name}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${item.color}`}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* TAB 6: RESUME & JOB PREFERENCES */}
              {activeTab === "resume" && (
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-6 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      Target Resumes & Job Preferences
                    </h3>
                    <p className="text-xs text-muted-foreground">Adjust your salary limits, target work mode configurations, and automated upload analysis triggers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Default Resume Dropdown */}
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-foreground">Default Target Resume</label>
                      <select
                        value={profile.resumePreferences.defaultResumeId}
                        onChange={(e) => updateNestedField("resumePreferences", "defaultResumeId", e.target.value)}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-border/40 bg-background text-foreground font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">No default (use latest upload)</option>
                        {resumes.map((res) => (
                          <option key={res.id} value={res.id}>{res.fileName}</option>
                        ))}
                      </select>
                    </div>

                    {/* Preferred work mode */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Preferred Work Mode</label>
                      <select
                        value={profile.jobPreferences.workMode}
                        onChange={(e) => updateNestedField("jobPreferences", "workMode", e.target.value)}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-border/40 bg-background text-foreground font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        {["Remote", "Hybrid", "Onsite"].map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Target ATS Score */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Default ATS Target Score</label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={profile.resumePreferences.defaultAtsTarget || 80}
                        onChange={(e) => updateNestedField("resumePreferences", "defaultAtsTarget", parseInt(e.target.value))}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-border/40 bg-background text-foreground font-semibold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-border/20 w-full" />

                  {/* Toggle items */}
                  <div className="space-y-4 text-xs font-bold">
                    {[
                      { field: "autoAnalyze", label: "Auto Analyze after upload", desc: "Wired triggers calculation score automatically on files dropped." },
                      { field: "autoSuggestions", label: "Auto Generate resume suggestions", desc: "Calculates smart tags instantly on dashboard feeds." },
                      { field: "highlightKeywords", label: "Highlight missing keywords", desc: "Displays color tag indicator badges for skills gaps." }
                    ].map((item) => (
                      <div
                        key={item.field}
                        onClick={() => updateNestedField("resumePreferences", item.field, !profile.resumePreferences[item.field])}
                        className="flex items-center justify-between cursor-pointer select-none"
                      >
                        <div>
                          <span className="text-foreground block">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{item.desc}</span>
                        </div>
                        <div className={`w-9 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${profile.resumePreferences[item.field] ? "bg-indigo-600" : "bg-muted"}`}>
                          <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ${profile.resumePreferences[item.field] ? "translate-x-3.5" : ""}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* TAB 7: APPEARANCE & ACCESSIBILITY */}
              {activeTab === "appearance" && (
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-6 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      Visual Appearance Settings & Accessibility options
                    </h3>
                    <p className="text-xs text-muted-foreground">Adjust Visual Accent Themes, Border Rounded shapes, Font scaling, and reduce motion constraints.</p>
                  </div>

                  {/* Theme buttons grid */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-foreground">Application UI Visual Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: "LIGHT", label: "Light Theme", icon: Sun, color: "text-amber-500 bg-amber-500/10" },
                        { key: "DARK", label: "Dark Theme", icon: Moon, color: "text-blue-400 bg-blue-400/10" },
                        { key: "SYSTEM", label: "System Sync", icon: Laptop, color: "text-muted-foreground bg-muted/30" },
                      ].map((t) => {
                        const ThemeIcon = t.icon;
                        const isThemeActive = profile.theme === t.key;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => handleThemeChange(t.key)}
                            className={`h-24 p-4 text-xs font-bold rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between items-start text-left ${
                              isThemeActive
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                                : "border-border/40 bg-background/50 text-muted-foreground hover:bg-accent/40 hover:border-border"
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${isThemeActive ? "bg-white/15 text-white" : t.color}`}>
                              <ThemeIcon className="w-4 h-4" />
                            </div>
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accent Color picker */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-foreground block">Visual Accent Color Theme</label>
                    <div className="flex gap-2">
                      {["Purple", "Blue", "Green", "Orange", "Red", "Pink"].map((color) => {
                        const isColorActive = profile.appearanceSettings.accentColor === color;
                        const colorMap = {
                          Purple: "bg-purple-600",
                          Blue: "bg-blue-600",
                          Green: "bg-emerald-600",
                          Orange: "bg-orange-600",
                          Red: "bg-rose-600",
                          Pink: "bg-pink-600"
                        };
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              updateNestedField("appearanceSettings", "accentColor", color);
                              setAccentColor(color);
                            }}
                            className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center shrink-0 border-2 transition-all ${
                              isColorActive ? "border-white scale-110 shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
                            } ${colorMap[color]}`}
                          >
                            {isColorActive && <CheckCircle className="w-4.5 h-4.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-border/20 w-full" />

                  {/* Accessibility options list */}
                  <div className="space-y-3.5 text-xs font-bold">
                    <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Accessibility Controls</h4>
                    
                    {[
                      { field: "compactMode", label: "Compact Mode layout", desc: "Density spacing reduction across score dashboards." },
                      { field: "highContrast", label: "High Contrast Theme alignment", desc: "Raises readability boundaries for text content." },
                      { field: "reduceMotion", label: "Reduce Motion options", desc: "Disables framer transition animations." },
                      { field: "screenReader", label: "Screen Reader optimization", desc: "Enforces accessibility labels on score rings." }
                    ].map((item) => (
                      <div
                        key={item.field}
                        onClick={() => {
                          const nextVal = !profile.accessibilitySettings[item.field];
                          updateNestedField("accessibilitySettings", item.field, nextVal);
                          window.dispatchEvent(new CustomEvent("accessibility-changed", {
                            detail: { ...profile.accessibilitySettings, [item.field]: nextVal }
                          }));
                        }}
                        className="flex items-center justify-between cursor-pointer select-none"
                      >
                        <div>
                          <span className="text-foreground block">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{item.desc}</span>
                        </div>
                        <div className={`w-9 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${profile.accessibilitySettings[item.field] ? "bg-indigo-600" : "bg-muted"}`}>
                          <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ${profile.accessibilitySettings[item.field] ? "translate-x-3.5" : ""}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* TAB 8: DATA & STORAGE */}
              {activeTab === "data" && (
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-6 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      Data Storage & Data Portability backups
                    </h3>
                    <p className="text-xs text-muted-foreground">Download backups of your configurations or clean up cache metadata records.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Backup profiles */}
                    <div className="p-4 border border-border/40 bg-accent/20 rounded-2xl flex flex-col justify-between gap-3 text-xs font-bold">
                      <div className="space-y-1">
                        <span className="text-foreground block">Download Backup JSON</span>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          Exports all resume goals, custom model settings, and connected accounts references.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleDownloadBackup}
                        className="w-full text-[10px] font-black uppercase tracking-wider rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9 cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Data
                      </Button>
                    </div>

                    {/* Reset cache */}
                    <div className="p-4 border border-border/40 bg-accent/20 rounded-2xl flex flex-col justify-between gap-3 text-xs font-bold">
                      <div className="space-y-1">
                        <span className="text-foreground block">Reset local caches</span>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          Clears programmatic API logs and local temporary request maps to check connection updates.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleClearCache}
                        variant="outline"
                        className="w-full text-[10px] font-black uppercase tracking-wider rounded-xl border-border/40 hover:bg-accent/40 h-9 cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Reset Caches
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* TAB 9: DANGER ZONE */}
              {activeTab === "danger" && (
                <Card className="border border-rose-500/20 bg-rose-500/5 backdrop-blur-sm p-6 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-rose-500 flex items-center gap-2">
                      <Trash2 className="w-4.5 h-4.5 text-rose-500" />
                      Danger Zone Account Deletion
                    </h3>
                    <p className="text-xs text-rose-500/80">Wiping your account is a complete database delete. All portfolio listings and AI records will be deleted forever.</p>
                  </div>

                  <div className="space-y-4">
                    {showDeleteConfirm ? (
                      <div className="p-4 border border-rose-500/20 bg-rose-500/10 rounded-2xl space-y-3.5 text-xs font-semibold">
                        <p className="text-rose-500">
                          Are you absolutely sure? This will delete your complete Career Profile, Resume Analysis sheets, and mock Interview history.
                        </p>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Type DELETE to confirm</label>
                          <input
                            type="text"
                            placeholder="DELETE"
                            value={deleteConfirmInput}
                            onChange={(e) => setDeleteConfirmInput(e.target.value)}
                            className="w-full h-10 px-3 text-xs rounded-xl border border-rose-500/20 bg-background text-foreground font-semibold focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        <div className="flex gap-2 pt-1.5">
                          <Button
                            type="button"
                            onClick={handleDeleteAccount}
                            variant="destructive"
                            className="h-9 rounded-xl font-bold text-xs px-4 cursor-pointer"
                          >
                            Delete Permanently
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteConfirmInput("");
                            }}
                            variant="outline"
                            className="h-9 rounded-xl font-bold text-xs px-4 bg-transparent border-border/40 hover:bg-muted cursor-pointer"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 leading-relaxed">
                        <p className="text-xs text-muted-foreground">
                          Deleting your account terminates Clerk database integrations, clears all related education models, certifications list, and project logs cascade-style.
                        </p>
                        <Button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          variant="destructive"
                          className="rounded-xl font-bold text-xs h-9 cursor-pointer px-4 bg-rose-600 hover:bg-rose-700"
                        >
                          Delete Account & Data
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
