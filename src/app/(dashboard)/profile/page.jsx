// src/app/(dashboard)/profile/page.jsx

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Sparkles,
  MapPin,
  Link2,
  Briefcase,
  Award,
  Loader2,
  Save,
  Activity,
  CheckCircle,
  HelpCircle,
  FileCode,
  Shield,
  Bell,
  Lock,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Globe,
  Settings2,
  Star,
  ExternalLink,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText,
  BadgeAlert,
  Menu,
  Sliders,
  Target,
  Mic,
} from "lucide-react";

// Inline Custom SVG for GitHub to resolve lucide-react package version mapping errors
const Github = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Constant categories for skill autocomplete/chips re-ordering
const SKILL_CATEGORIES = [
  { id: "languages", label: "Languages" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "databases", label: "Databases" },
  { id: "cloud", label: "Cloud Platforms" },
  { id: "devops", label: "DevOps & CI/CD" },
  { id: "aiml", label: "AI & Machine Learning" },
  { id: "tools", label: "Developer Tools" },
  { id: "soft", label: "Soft Skills" },
];

export default function ProfilePage() {
  const router = useRouter();

  // Loading and Save Tracking states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved"); // "Saved" | "Unsaved" | "Saving..."
  const [resumes, setResumes] = useState([]);

  // Active Collapsible Accordion sections state
  const [openSections, setOpenSections] = useState({
    personal: true,
    preferences: false,
    experience: false,
    education: false,
    projects: false,
    skills: false,
    certifications: false,
    languages: false,
    goals: false,
    ai: false,
    privacy: false,
  });

  // Main profile form state (mirrors updated Prisma schema)
  const [profile, setProfile] = useState({
    bio: "",
    location: "",
    country: "",
    timezone: "UTC",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    leetcodeUrl: "",
    hackerrankUrl: "",
    codeforcesUrl: "",
    twitterUrl: "",
    mediumUrl: "",
    behanceUrl: "",
    dribbbleUrl: "",
    dob: "",
    preferredContact: "EMAIL",
    phone: "",
    targetRole: "",
    dreamCompany: "",
    preferredIndustry: "",
    employmentType: "FULL_TIME",
    expectedSalary: "",
    prefWorkLocation: "",
    openToRelocation: false,
    yearsOfExperience: "",
    noticePeriod: "IMMEDIATE",
    currentStatus: "FRESHER",
    experienceLevel: "ENTRY",
    skills: {
      languages: [],
      frontend: [],
      backend: [],
      databases: [],
      cloud: [],
      devops: [],
      aiml: [],
      tools: [],
      soft: [],
    },
    aiPreferences: {
      interviewStyle: "Professional",
      difficulty: "Medium",
      focusAreas: ["DSA", "Behavioral"],
      answerLength: "Medium",
      enableTips: true,
      enableWeekly: true,
    },
    notificationSettings: {
      emailAlerts: true,
      reminders: true,
      reports: true,
      tips: true,
      resumeAlerts: true,
    },
    privacySettings: {
      public: false,
      allowAiPersonalization: true,
      anonymousAnalytics: true,
    },
    careerGoalsTimeline: {
      m6: "",
      y1: "",
      y3: "",
      y5: "",
      targetSalary: "",
      targetRole: "",
      targetCountry: "",
      dreamCompanies: [],
    },
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    languages: [],
    achievements: [],
  });

  // Auxiliary UI state
  const [skillsInput, setSkillsInput] = useState({ category: "languages", text: "" });
  const [newDreamCompany, setNewDreamCompany] = useState("");
  
  // List sub-form modal inputs (holding temp edit values)
  const [experienceForm, setExperienceForm] = useState({ company: "", role: "", employmentType: "Full-time", startDate: "", endDate: "", currentJob: false, responsibilities: "", achievements: "", technologies: [] });
  const [educationForm, setEducationForm] = useState({ college: "", degree: "", branch: "", cgpa: "", startYear: "", endYear: "", achievements: "" });
  const [projectForm, setProjectForm] = useState({ name: "", description: "", techStack: [], githubLink: "", liveDemo: "", role: "", duration: "", achievements: "", highlighted: false });
  const [certForm, setCertForm] = useState({ name: "", issuer: "", issueDate: "", credentialUrl: "", expiry: "" });
  const [langForm, setLangForm] = useState({ language: "", proficiency: "Intermediate" });
  const [achForm, setAchForm] = useState({ title: "", category: "Hackathons", description: "", date: "" });

  const isInitialMount = useRef(true);
  const autoSaveTimer = useRef(null);

  // Fetch complete profile & resumes
  useEffect(() => {
    async function loadProfile() {
      try {
        const [userRes, resumesRes] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/resumes"),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setProfile((prev) => {
            const normalizedSkills = userData.skills && typeof userData.skills === "object"
              ? { ...prev.skills, ...userData.skills }
              : prev.skills;

            const normalizedAi = userData.aiPreferences && typeof userData.aiPreferences === "object"
              ? { ...prev.aiPreferences, ...userData.aiPreferences }
              : prev.aiPreferences;

            const normalizedNotif = userData.notificationSettings && typeof userData.notificationSettings === "object"
              ? { ...prev.notificationSettings, ...userData.notificationSettings }
              : prev.notificationSettings;

            const normalizedPrivacy = userData.privacySettings && typeof userData.privacySettings === "object"
              ? { ...prev.privacySettings, ...userData.privacySettings }
              : prev.privacySettings;

            const normalizedTimeline = userData.careerGoalsTimeline && typeof userData.careerGoalsTimeline === "object"
              ? { ...prev.careerGoalsTimeline, ...userData.careerGoalsTimeline }
              : prev.careerGoalsTimeline;

            return {
              ...prev,
              ...userData,
              skills: normalizedSkills,
              aiPreferences: normalizedAi,
              notificationSettings: normalizedNotif,
              privacySettings: normalizedPrivacy,
              careerGoalsTimeline: normalizedTimeline,
              education: userData.education || [],
              experience: userData.experience || [],
              projects: userData.projects || [],
              certifications: userData.certifications || [],
              languages: userData.languages || [],
              achievements: userData.achievements || [],
            };
          });
        }
        if (resumesRes.ok) {
          const resumesData = await resumesRes.json();
          setResumes(resumesData);
        }
      } catch (err) {
        console.error("Profile load fail:", err);
        toast.error("Could not load profile data.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Trigger POST submission to `/api/user` (Manual Save)
  const triggerSave = async () => {
    setSaveStatus("Saving...");
    setSaving(true);
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        throw new Error("API failed to save profile modifications.");
      }
      setSaveStatus("Saved");
      toast.success("Profile saved successfully!", {
        description: "Your settings are updated and synchronized.",
      });
    } catch (e) {
      setSaveStatus("Unsaved");
      toast.error("Failed to save changes", {
        description: e.message || "Network issue.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Monitor modifications to flag unsaved status
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setSaveStatus("Unsaved");
  }, [
    profile.bio,
    profile.location,
    profile.country,
    profile.timezone,
    profile.linkedinUrl,
    profile.githubUrl,
    profile.portfolioUrl,
    profile.leetcodeUrl,
    profile.hackerrankUrl,
    profile.codeforcesUrl,
    profile.twitterUrl,
    profile.mediumUrl,
    profile.behanceUrl,
    profile.dribbbleUrl,
    profile.dob,
    profile.preferredContact,
    profile.phone,
    profile.targetRole,
    profile.dreamCompany,
    profile.preferredIndustry,
    profile.employmentType,
    profile.expectedSalary,
    profile.prefWorkLocation,
    profile.openToRelocation,
    profile.yearsOfExperience,
    profile.noticePeriod,
    profile.currentStatus,
    profile.experienceLevel,
    profile.skills,
    profile.aiPreferences,
    profile.notificationSettings,
    profile.privacySettings,
    profile.careerGoalsTimeline,
    profile.education,
    profile.experience,
    profile.projects,
    profile.certifications,
    profile.languages,
    profile.achievements,
  ]);

  // Warning check for unsaved pages navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === "Unsaved") {
        e.preventDefault();
        e.returnValue = "You have unsaved profile parameters. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // Section toggle controller
  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Input bindings
  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === "checkbox" ? checked : value;
    setProfile((prev) => ({ ...prev, [name]: finalVal }));
  };

  // Nested nested state setters
  const handleNestedFieldChange = (parentKey, fieldName, val) => {
    setProfile((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [fieldName]: val,
      },
    }));
  };

  // Dynamic Skill Management
  const handleAddSkillChip = () => {
    const category = skillsInput.category;
    const text = skillsInput.text.trim();
    if (!text) return;

    const list = profile.skills[category] || [];
    if (!list.includes(text)) {
      const updatedList = [...list, text];
      setProfile((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [category]: updatedList,
        },
      }));
    }
    setSkillsInput((prev) => ({ ...prev, text: "" }));
  };

  const handleRemoveSkillChip = (category, chip) => {
    const list = profile.skills[category] || [];
    const updatedList = list.filter((s) => s !== chip);
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: updatedList,
      },
    }));
  };

  // Dynamic Array Adders
  const addEducationItem = () => {
    if (!educationForm.college || !educationForm.degree) {
      toast.error("College and Degree fields are required.");
      return;
    }
    setProfile((prev) => ({
      ...prev,
      education: [...prev.education, { ...educationForm, id: `edu-temp-${Date.now()}` }],
    }));
    setEducationForm({ college: "", degree: "", branch: "", cgpa: "", startYear: "", endYear: "", achievements: "" });
    toast.success("Education entry added.");
  };

  const addExperienceItem = () => {
    if (!experienceForm.company || !experienceForm.role) {
      toast.error("Company and Role fields are required.");
      return;
    }
    setProfile((prev) => ({
      ...prev,
      experience: [...prev.experience, { ...experienceForm, id: `exp-temp-${Date.now()}` }],
    }));
    setExperienceForm({ company: "", role: "", employmentType: "Full-time", startDate: "", endDate: "", currentJob: false, responsibilities: "", achievements: "", technologies: [] });
    toast.success("Work experience added.");
  };

  const addProjectItem = () => {
    if (!projectForm.name || !projectForm.description) {
      toast.error("Project Name and Description fields are required.");
      return;
    }
    setProfile((prev) => ({
      ...prev,
      projects: [...prev.projects, { ...projectForm, id: `proj-temp-${Date.now()}` }],
    }));
    setProjectForm({ name: "", description: "", techStack: [], githubLink: "", liveDemo: "", role: "", duration: "", achievements: "", highlighted: false });
    toast.success("Project added.");
  };

  const addCertificationItem = () => {
    if (!certForm.name || !certForm.issuer) {
      toast.error("Certificate Name and Issuer are required.");
      return;
    }
    setProfile((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { ...certForm, id: `cert-temp-${Date.now()}` }],
    }));
    setCertForm({ name: "", issuer: "", issueDate: "", credentialUrl: "", expiry: "" });
    toast.success("Certification added.");
  };

  const addLanguageItem = () => {
    if (!langForm.language) return;
    setProfile((prev) => ({
      ...prev,
      languages: [...prev.languages, { ...langForm, id: `lang-temp-${Date.now()}` }],
    }));
    setLangForm({ language: "", proficiency: "Intermediate" });
    toast.success("Language added.");
  };

  const addAchievementItem = () => {
    if (!achForm.title) return;
    setProfile((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { ...achForm, id: `ach-temp-${Date.now()}` }],
    }));
    setAchForm({ title: "", category: "Hackathons", description: "", date: "" });
    toast.success("Achievement added.");
  };

  // Dynamic Array Removers
  const removeListItem = (key, itemId) => {
    setProfile((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item.id !== itemId),
    }));
    toast.info("Item removed.");
  };

  // Profile Completeness math (Calculates % complete out of 100 based on fields filled)
  const calculateCompletenessQuotient = () => {
    let score = 0;
    
    // Core scalars (25%)
    if (profile.bio?.trim()) score += 5;
    if (profile.location?.trim()) score += 5;
    if (profile.phone?.trim()) score += 5;
    if (profile.country?.trim()) score += 5;
    if (profile.linkedinUrl?.trim() || profile.githubUrl?.trim()) score += 5;

    // Career Preferences (20%)
    if (profile.targetRole?.trim()) score += 5;
    if (profile.dreamCompany?.trim() || profile.preferredIndustry?.trim()) score += 5;
    if (profile.yearsOfExperience) score += 5;
    if (profile.currentStatus) score += 5;

    // Dynamic Lists (35%)
    if (profile.experience && profile.experience.length > 0) score += 10;
    if (profile.education && profile.education.length > 0) score += 10;
    if (profile.projects && profile.projects.length > 0) score += 10;
    if (profile.certifications && profile.certifications.length > 0) score += 5;

    // Skills & AI config (20%)
    const skillCount = Object.values(profile.skills).reduce((acc, curr) => acc + curr.length, 0);
    if (skillCount > 0) score += 10;
    if (profile.aiPreferences?.interviewStyle) score += 10;

    return Math.min(score, 100);
  };

  const completeness = calculateCompletenessQuotient();

  // Dynamic remaining tasks list
  const getRemainingTasks = () => {
    const tasks = [];
    if (!profile.bio) tasks.push({ label: "Write a short Biography", section: "personal" });
    if (!profile.phone) tasks.push({ label: "Add Phone Number", section: "personal" });
    if (!profile.linkedinUrl) tasks.push({ label: "Connect LinkedIn URL", section: "personal" });
    if (!profile.githubUrl) tasks.push({ label: "Link GitHub URL", section: "personal" });
    if (!profile.targetRole) tasks.push({ label: "Set Target Career Role", section: "preferences" });
    if (profile.experience.length === 0) tasks.push({ label: "Add Work Experience", section: "experience" });
    if (profile.education.length === 0) tasks.push({ label: "Add Education Details", section: "education" });
    if (profile.projects.length === 0) tasks.push({ label: "Upload portfolio projects", section: "projects" });
    if (profile.certifications.length === 0) tasks.push({ label: "Add Certifications", section: "certifications" });
    
    const skillCount = Object.values(profile.skills).reduce((acc, curr) => acc + (curr?.length || 0), 0);
    if (skillCount === 0) tasks.push({ label: "Define Portfolio Skills", section: "skills" });

    return tasks;
  };

  const remainingTasks = getRemainingTasks();

  // Calculate dynamic AI Suggestions list
  const getAISuggestions = () => {
    const suggestions = [];
    const skillCount = Object.values(profile.skills).reduce((acc, curr) => acc + curr.length, 0);
    
    if (skillCount < 5) {
      suggestions.push({ text: "Add at least 5 technical skills to improve ATS keyword scanning matching scores.", severity: "high" });
    }
    if (!profile.githubUrl) {
      suggestions.push({ text: "Add your GitHub link so the AI matching engine can scan public developer activities.", severity: "medium" });
    }
    if (profile.projects.length === 0) {
      suggestions.push({ text: "Add a highlight project showcasing your active tech stack to provide mock interview talking points.", severity: "high" });
    }
    if (profile.experience.length > 0 && !profile.yearsOfExperience) {
      suggestions.push({ text: "Define your total Years of Experience under preferences to optimize mock interview coach difficulty.", severity: "medium" });
    }
    if (profile.certifications.length === 0) {
      suggestions.push({ text: "Add industry certifications (e.g. AWS, Kubernetes) to validate expertise on ATS pipelines.", severity: "low" });
    }
    if (!profile.careerGoalsTimeline.y1) {
      suggestions.push({ text: "Define your 1-Year Career Goals to enable personalized weekly action recommendations.", severity: "low" });
    }

    if (suggestions.length === 0) {
      suggestions.push({ text: "Your profile is fully optimized! Upload newer resumes or practice custom interviews to proceed.", severity: "info" });
    }
    return suggestions;
  };

  const aiSuggestions = getAISuggestions();

  // Navigation Shortcut Links
  const handleQuickAction = (route) => {
    router.push(route);
  };

  // Helper count variables for Stats Dashboard
  const experienceCount = profile.experience.length;
  const projectCount = profile.projects.length;
  const educationCount = profile.education.length;
  const skillsCount = Object.values(profile.skills).reduce((acc, curr) => acc + curr.length, 0);
  const resumesCount = resumes.length;
  const primaryResume = resumes.find(r => r.isPrimary) || resumes[0];
  const primaryAtsScore = primaryResume?.analysis?.atsScore || 0;
  const primaryOverallScore = primaryResume?.analysis?.overallScore || 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold text-muted-foreground animate-pulse">Syncing AI Profile Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={`Hey ${profile.firstName || "there"}! Welcome to your AI Career Profile`}
        description="Configure your detailed resume profiles, timeline career goals, and model settings to personalize the AI Copilot."
      />

      {/* Save status notification bar */}
      <div className="flex items-center justify-between border border-border/40 bg-card/40 backdrop-blur-md px-5 py-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Status: </span>
          <span className={`font-black uppercase tracking-wider ${saveStatus === "Saved" ? "text-emerald-400" : saveStatus === "Saving..." ? "text-amber-400 animate-pulse" : "text-rose-400"}`}>
            {saveStatus}
          </span>
        </div>
        <div>
          {saveStatus === "Unsaved" ? (
            <Button
              type="button"
              onClick={triggerSave}
              disabled={saving}
              className="h-8 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </Button>
          ) : (
            <span className="text-[10px] text-muted-foreground/60 font-black uppercase flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Settings synchronized
            </span>
          )}
        </div>
      </div>

      {/* Main SaaS Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Dynamic Profile Sections (8/12 column) */}
        <div className="lg:col-span-8 space-y-6">

          {/* SECTION 1: PROFILE COMPLETENESS DASHBOARD CARD */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md rounded-2xl p-5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* SVG Completion Ring */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-muted-foreground/10" strokeWidth="6" fill="transparent" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-indigo-500" strokeWidth="6" fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - completeness / 100)}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-foreground">{completeness}%</span>
                  <span className="text-[8px] uppercase text-muted-foreground/80 font-black">Complete</span>
                </div>
              </div>

              {/* Outstanding checklist tasks */}
              <div className="flex-1 space-y-3">
                <h4 className="text-xs font-bold text-foreground">Outstanding Setup Checklist</h4>
                {remainingTasks.length === 0 ? (
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> All checklist tasks complete! Your profile context is optimized.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {remainingTasks.slice(0, 5).map((task, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          toggleSection(task.section);
                          const el = document.getElementById(`section-header-${task.section}`);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-accent hover:bg-indigo-500/10 border border-border/40 hover:border-indigo-500/30 text-muted-foreground hover:text-indigo-400 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        {task.label}
                      </button>
                    ))}
                    {remainingTasks.length > 5 && (
                      <span className="text-[10px] font-bold text-muted-foreground/50 self-center">
                        +{remainingTasks.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* INTERACTIVE STATS SUMMARY DASHBOARD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Resumes", count: resumesCount, color: "text-indigo-400", bg: "bg-indigo-500/5" },
              { label: "Key Skills", count: skillsCount, color: "text-teal-400", bg: "bg-teal-500/5" },
              { label: "Projects", count: projectCount, color: "text-pink-400", bg: "bg-pink-500/5" },
              { label: "Experience", count: experienceCount, color: "text-amber-400", bg: "bg-amber-500/5" },
            ].map((stat, idx) => (
              <Card key={idx} className={`border border-border/40 p-4 rounded-2xl flex flex-col items-center justify-center ${stat.bg}`}>
                <span className="text-2xl font-black text-foreground">{stat.count}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${stat.color} mt-1`}>{stat.label}</span>
              </Card>
            ))}
          </div>

          {/* DYNAMIC COLLAPSIBLE ACCORDION SECTIONS */}

          {/* Accordion 1: Personal Info & Socials */}
          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
            <button
              id="section-header-personal"
              onClick={() => toggleSection("personal")}
              className="w-full flex items-center justify-between p-5 text-sm font-bold text-foreground hover:bg-muted/10 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <User className="w-4.5 h-4.5 text-indigo-400" />
                Personal Information & Social Links
              </span>
              {openSections.personal ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {openSections.personal && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Full Name</label>
                        <input
                          name="firstName" // Note: we sync back using clerk data via webhook or fields
                          type="text"
                          placeholder="your full name"
                          value={`${profile.firstName || ""} ${profile.lastName || ""}`.trim()}
                          disabled
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-accent/20 cursor-not-allowed font-semibold text-muted-foreground"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Email Address (Read-only)</label>
                        <input
                          type="email"
                          value={profile.email || ""}
                          disabled
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-accent/20 cursor-not-allowed font-semibold text-muted-foreground"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Phone Number</label>
                        <input
                          name="phone"
                          type="text"
                          placeholder="e.g. +1 555-0199"
                          value={profile.phone || ""}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                      </div>

                      {/* DOB */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Date of Birth</label>
                        <input
                          name="dob"
                          type="date"
                          value={profile.dob || ""}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground"
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Location (City, State)</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                          <input
                            name="location"
                            type="text"
                            placeholder="e.g. San Francisco, CA"
                            value={profile.location || ""}
                            onChange={handleFieldChange}
                            className="w-full h-10 pl-9 pr-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                          />
                        </div>
                      </div>

                      {/* Country */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Country</label>
                        <input
                          name="country"
                          type="text"
                          placeholder="e.g. United States"
                          value={profile.country || ""}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                      </div>

                      {/* Timezone */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Preferred Timezone</label>
                        <select
                          name="timezone"
                          value={profile.timezone || "UTC"}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground"
                        >
                          <option value="UTC">UTC (Greenwich Mean Time)</option>
                          <option value="EST">EST (Eastern Standard Time)</option>
                          <option value="PST">PST (Pacific Standard Time)</option>
                          <option value="IST">IST (Indian Standard Time)</option>
                          <option value="CET">CET (Central European Time)</option>
                        </select>
                      </div>

                      {/* Preferred Contact Method */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Preferred Contact Method</label>
                        <select
                          name="preferredContact"
                          value={profile.preferredContact || "EMAIL"}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground"
                        >
                          <option value="EMAIL">Email</option>
                          <option value="PHONE">Phone / Call</option>
                          <option value="WHATSAPP">WhatsApp</option>
                          <option value="LINKEDIN">LinkedIn DM</option>
                        </select>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-foreground">Biography / Executive Summary</label>
                        <span className="text-[10px] text-muted-foreground font-black">
                          {profile.bio?.length || 0} / 500 characters
                        </span>
                      </div>
                      <textarea
                        name="bio"
                        rows={4}
                        maxLength={500}
                        placeholder="Write a professional summary that outlines your technical focus areas and major successes..."
                        value={profile.bio || ""}
                        onChange={handleFieldChange}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold resize-none text-foreground"
                      />
                    </div>

                    <div className="h-px bg-border/20 w-full" />

                    {/* SOCIAL LINKS LIST */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Globe className="w-4 h-4 text-teal-400" />
                        Professional Profiles & Portfolio URLs
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { name: "linkedinUrl", label: "LinkedIn Link", icon: <Link2 className="w-3.5 h-3.5" />, placeholder: "https://linkedin.com/in/username" },
                          { name: "githubUrl", label: "GitHub Profile", icon: <Github className="w-3.5 h-3.5" />, placeholder: "https://github.com/username" },
                          { name: "portfolioUrl", label: "Personal Portfolio", icon: <Globe className="w-3.5 h-3.5" />, placeholder: "https://username.dev" },
                          { name: "leetcodeUrl", label: "LeetCode Link", icon: <FileCode className="w-3.5 h-3.5" />, placeholder: "https://leetcode.com/u/username" },
                          { name: "hackerrankUrl", label: "HackerRank Profile", icon: <Globe className="w-3.5 h-3.5" />, placeholder: "https://hackerrank.com/username" },
                          { name: "codeforcesUrl", label: "Codeforces Handle", icon: <Globe className="w-3.5 h-3.5" />, placeholder: "https://codeforces.com/profile/username" },
                          { name: "twitterUrl", label: "Twitter / X Profile", icon: <Link2 className="w-3.5 h-3.5" />, placeholder: "https://x.com/username" },
                          { name: "mediumUrl", label: "Medium Blog", icon: <Globe className="w-3.5 h-3.5" />, placeholder: "https://medium.com/@username" },
                        ].map((link, idx) => (
                          <div key={idx} className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground/80">{link.label}</label>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-muted-foreground/60">{link.icon}</span>
                              <input
                                name={link.name}
                                type="url"
                                placeholder={link.placeholder}
                                value={profile[link.name] || ""}
                                onChange={handleFieldChange}
                                className={`w-full h-9 pl-9 pr-3 py-2 text-xs rounded-xl border bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/50 font-semibold text-foreground ${
                                  profile[link.name] && !profile[link.name].startsWith("http") ? "border-rose-500/40" : "border-border/40"
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 2: Career Preferences & Timelines */}
          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
            <button
              id="section-header-preferences"
              onClick={() => toggleSection("preferences")}
              className="w-full flex items-center justify-between p-5 text-sm font-bold text-foreground hover:bg-muted/10 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Briefcase className="w-4.5 h-4.5 text-teal-400" />
                Career Preferences & Timelines
              </span>
              {openSections.preferences ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {openSections.preferences && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Target Role */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Target Role</label>
                        <input
                          name="targetRole"
                          type="text"
                          placeholder="e.g. Lead React Developer"
                          value={profile.targetRole || ""}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                      </div>

                      {/* Dream Company */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Dream Company</label>
                        <input
                          name="dreamCompany"
                          type="text"
                          placeholder="e.g. Google, Stripe"
                          value={profile.dreamCompany || ""}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                      </div>

                      {/* Preferred Industry */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Preferred Industry</label>
                        <input
                          name="preferredIndustry"
                          type="text"
                          placeholder="e.g. SaaS, Fintech"
                          value={profile.preferredIndustry || ""}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                      </div>

                      {/* Expected Salary Range */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Expected Salary Range ($)</label>
                        <input
                          name="expectedSalary"
                          type="text"
                          placeholder="e.g. $120,000 - $140,000"
                          value={profile.expectedSalary || ""}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                      </div>

                      {/* Preferred Work Location */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Preferred Work Location</label>
                        <input
                          name="prefWorkLocation"
                          type="text"
                          placeholder="e.g. New York or Remote"
                          value={profile.prefWorkLocation || ""}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                      </div>

                      {/* Years of Experience */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Years of Experience</label>
                        <input
                          name="yearsOfExperience"
                          type="number"
                          step="0.5"
                          placeholder="e.g. 3.5"
                          value={profile.yearsOfExperience || ""}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Notice Period */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Notice Period</label>
                        <select
                          name="noticePeriod"
                          value={profile.noticePeriod || "IMMEDIATE"}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground"
                        >
                          <option value="IMMEDIATE">Immediate (Serving notice)</option>
                          <option value="DAYS_15">15 Days</option>
                          <option value="MONTH_1">1 Month</option>
                          <option value="MONTHS_2">2 Months</option>
                          <option value="MONTHS_3">3 Months</option>
                        </select>
                      </div>

                      {/* Current Status */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Current Status</label>
                        <select
                          name="currentStatus"
                          value={profile.currentStatus || "FRESHER"}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="FRESHER">Fresher (Searching)</option>
                          <option value="PROFESSIONAL">Working Professional</option>
                          <option value="OPEN_TO_WORK">Open to Work (Actively looking)</option>
                        </select>
                      </div>

                      {/* Employment Type */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Preferred Employment Type</label>
                        <select
                          name="employmentType"
                          value={profile.employmentType || "FULL_TIME"}
                          onChange={handleFieldChange}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground"
                        >
                          <option value="FULL_TIME">Full-time Contract</option>
                          <option value="PART_TIME">Part-time Work</option>
                          <option value="CONTRACT">Contract Basis</option>
                          <option value="INTERNSHIP">Internship</option>
                        </select>
                      </div>
                    </div>

                    {/* Workplace settings & relocation */}
                    <div className="flex flex-wrap gap-6 items-center bg-accent/20 p-4 rounded-xl">
                      <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                        <input
                          name="openToRelocation"
                          type="checkbox"
                          checked={!!profile.openToRelocation}
                          onChange={handleFieldChange}
                          className="w-4 h-4 text-indigo-600 border-border/40 rounded focus:ring-indigo-500"
                        />
                        Open to Relocation
                      </label>
                    </div>

                    <div className="h-px bg-border/20 w-full" />

                    {/* CAREER TIMELINE PLANNER */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-indigo-400" />
                        AI Career Timeline Planner
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">6 Months target</label>
                          <input
                            type="text"
                            placeholder="e.g. Master system designs, get AWS Cloud cert"
                            value={profile.careerGoalsTimeline.m6 || ""}
                            onChange={(e) => handleNestedFieldChange("careerGoalsTimeline", "m6", e.target.value)}
                            className="w-full h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">1 Year target</label>
                          <input
                            type="text"
                            placeholder="e.g. Land a Senior Dev position in FinTech"
                            value={profile.careerGoalsTimeline.y1 || ""}
                            onChange={(e) => handleNestedFieldChange("careerGoalsTimeline", "y1", e.target.value)}
                            className="w-full h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">3 Years target</label>
                          <input
                            type="text"
                            placeholder="e.g. Transition into technical product manager / staff engineer"
                            value={profile.careerGoalsTimeline.y3 || ""}
                            onChange={(e) => handleNestedFieldChange("careerGoalsTimeline", "y3", e.target.value)}
                            className="w-full h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">5 Years target</label>
                          <input
                            type="text"
                            placeholder="e.g. Bootstrapping my own SaaS startup"
                            value={profile.careerGoalsTimeline.y5 || ""}
                            onChange={(e) => handleNestedFieldChange("careerGoalsTimeline", "y5", e.target.value)}
                            className="w-full h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 3: Work Experience */}
          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
            <button
              id="section-header-experience"
              onClick={() => toggleSection("experience")}
              className="w-full flex items-center justify-between p-5 text-sm font-bold text-foreground hover:bg-muted/10 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Briefcase className="w-4.5 h-4.5 text-pink-400" />
                Work Experience ({profile.experience.length})
              </span>
              {openSections.experience ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {openSections.experience && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="p-5 space-y-6">
                    {/* List of current experiences */}
                    {profile.experience.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic font-semibold text-center py-4 bg-accent/10 rounded-xl">
                        No work experience records added yet. Add one below.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {profile.experience.map((exp) => (
                          <div key={exp.id} className="border border-border/40 p-4 rounded-xl bg-background/30 flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h5 className="text-xs font-black text-foreground">{exp.role} at <span className="text-indigo-400">{exp.company}</span></h5>
                              <p className="text-[10px] text-muted-foreground font-bold">{exp.startDate} - {exp.currentJob ? "Present" : exp.endDate} | {exp.employmentType}</p>
                              {exp.responsibilities && <p className="text-[10px] text-muted-foreground/80 leading-relaxed mt-1">{exp.responsibilities}</p>}
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeListItem("experience", exp.id)}
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-rose-500 rounded-lg shrink-0 cursor-pointer w-7 h-7"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="h-px bg-border/20 w-full" />

                    {/* Add Experience Sub-Form */}
                    <div className="space-y-4 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5">
                      <h4 className="text-xs font-bold text-foreground">Add Work Experience</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Company name"
                          value={experienceForm.company}
                          onChange={(e) => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Role (e.g. Frontend Intern)"
                          value={experienceForm.role}
                          onChange={(e) => setExperienceForm(prev => ({ ...prev, role: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Start Date (e.g. June 2024)"
                          value={experienceForm.startDate}
                          onChange={(e) => setExperienceForm(prev => ({ ...prev, startDate: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="End Date (e.g. May 2025)"
                          value={experienceForm.endDate}
                          disabled={experienceForm.currentJob}
                          onChange={(e) => setExperienceForm(prev => ({ ...prev, endDate: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground disabled:opacity-40"
                        />
                      </div>
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={experienceForm.currentJob}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, currentJob: e.target.checked }))}
                            className="w-4 h-4 text-indigo-600 rounded border-border/40 focus:ring-indigo-500"
                          />
                          I currently work here
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Responsibilities and key contributions..."
                        value={experienceForm.responsibilities}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, responsibilities: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold resize-none text-foreground"
                      />
                      <Button
                        type="button"
                        onClick={addExperienceItem}
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 cursor-pointer gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Experience Record
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 4: Education */}
          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
            <button
              id="section-header-education"
              onClick={() => toggleSection("education")}
              className="w-full flex items-center justify-between p-5 text-sm font-bold text-foreground hover:bg-muted/10 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4.5 h-4.5 text-amber-400" />
                Education ({profile.education.length})
              </span>
              {openSections.education ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {openSections.education && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="p-5 space-y-6">
                    {/* List of current education items */}
                    {profile.education.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic font-semibold text-center py-4 bg-accent/10 rounded-xl">
                        No education records added yet. Add one below.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {profile.education.map((edu) => (
                          <div key={edu.id} className="border border-border/40 p-4 rounded-xl bg-background/30 flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h5 className="text-xs font-black text-foreground">{edu.degree} in {edu.branch} at <span className="text-indigo-400">{edu.college}</span></h5>
                              <p className="text-[10px] text-muted-foreground font-bold">{edu.startYear} - {edu.endYear} | CGPA/Grade: {edu.cgpa}</p>
                              {edu.achievements && <p className="text-[10px] text-muted-foreground/80 leading-relaxed mt-1">{edu.achievements}</p>}
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeListItem("education", edu.id)}
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-rose-500 rounded-lg shrink-0 cursor-pointer w-7 h-7"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="h-px bg-border/20 w-full" />

                    {/* Add Education Sub-Form */}
                    <div className="space-y-4 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5">
                      <h4 className="text-xs font-bold text-foreground">Add Education Record</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="College / School"
                          value={educationForm.college}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, college: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Degree (e.g. B.Tech)"
                          value={educationForm.degree}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Branch / Stream (e.g. CS)"
                          value={educationForm.branch}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, branch: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="CGPA / Grade (e.g. 9.1)"
                          value={educationForm.cgpa}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, cgpa: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Start Year"
                          value={educationForm.startYear}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, startYear: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="End Year"
                          value={educationForm.endYear}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, endYear: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Academic achievements, awards, or extra-curriculars..."
                        value={educationForm.achievements}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, achievements: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold resize-none text-foreground"
                      />
                      <Button
                        type="button"
                        onClick={addEducationItem}
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 cursor-pointer gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Education Record
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 5: Projects */}
          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
            <button
              id="section-header-projects"
              onClick={() => toggleSection("projects")}
              className="w-full flex items-center justify-between p-5 text-sm font-bold text-foreground hover:bg-muted/10 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <FileCode className="w-4.5 h-4.5 text-pink-400" />
                Featured Projects ({profile.projects.length})
              </span>
              {openSections.projects ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {openSections.projects && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="p-5 space-y-6">
                    {/* List of current projects */}
                    {profile.projects.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic font-semibold text-center py-4 bg-accent/10 rounded-xl">
                        No projects showcased yet. Show off your work below.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {profile.projects.map((proj) => (
                          <div key={proj.id} className="border border-border/40 p-4 rounded-xl bg-background/30 flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-black text-foreground">{proj.name}</h5>
                                {proj.highlighted && <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-black uppercase rounded py-0.5">Featured</Badge>}
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{proj.description}</p>
                              <div className="flex gap-4 pt-1">
                                {proj.githubLink && <a href={proj.githubLink} target="_blank" className="text-[9px] text-indigo-400 hover:underline font-bold flex items-center gap-1"><Github className="w-3 h-3" /> GitHub</a>}
                                {proj.liveDemo && <a href={proj.liveDemo} target="_blank" className="text-[9px] text-emerald-400 hover:underline font-bold flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Live Demo</a>}
                              </div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeListItem("projects", proj.id)}
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-rose-500 rounded-lg shrink-0 cursor-pointer w-7 h-7"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="h-px bg-border/20 w-full" />

                    {/* Add Project Sub-Form */}
                    <div className="space-y-4 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5">
                      <h4 className="text-xs font-bold text-foreground">Add Project Entry</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Project Name"
                          value={projectForm.name}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Duration / Timeline (e.g. 3 Months)"
                          value={projectForm.duration}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, duration: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="GitHub Repository URL"
                          value={projectForm.githubLink}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, githubLink: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Live Demo URL"
                          value={projectForm.liveDemo}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, liveDemo: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Detailed project description and key features..."
                        value={projectForm.description}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold resize-none text-foreground"
                      />
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={projectForm.highlighted}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, highlighted: e.target.checked }))}
                            className="w-4 h-4 text-indigo-600 rounded border-border/40 focus:ring-indigo-500"
                          />
                          Highlight Project on Portfolio
                        </label>
                      </div>
                      <Button
                        type="button"
                        onClick={addProjectItem}
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 cursor-pointer gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Project to List
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 6: Skills */}
          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
            <button
              id="section-header-skills"
              onClick={() => toggleSection("skills")}
              className="w-full flex items-center justify-between p-5 text-sm font-bold text-foreground hover:bg-muted/10 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Sliders className="w-4.5 h-4.5 text-indigo-400" />
                Categorized Portfolio Skills ({skillsCount})
              </span>
              {openSections.skills ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {openSections.skills && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="p-5 space-y-6">
                    {/* Add Skill Input Row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={skillsInput.category}
                        onChange={(e) => setSkillsInput(prev => ({ ...prev, category: e.target.value }))}
                        className="h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground shrink-0 sm:w-44"
                      >
                        {SKILL_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type skill (e.g. Next.js, Docker) and press Enter"
                          value={skillsInput.text}
                          onChange={(e) => setSkillsInput(prev => ({ ...prev, text: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleAddSkillChip()}
                          className="flex-1 h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <Button
                          type="button"
                          onClick={handleAddSkillChip}
                          className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 cursor-pointer"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Skill Categories Cloud Display */}
                    <div className="space-y-4">
                      {SKILL_CATEGORIES.map((cat) => {
                        const list = profile.skills[cat.id] || [];
                        return (
                          <div key={cat.id} className="space-y-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase block">{cat.label}</span>
                            {list.length === 0 ? (
                              <p className="text-[10px] text-muted-foreground/30 font-semibold italic">No skills listed under this category.</p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {list.map((skill, sIdx) => (
                                  <Badge
                                    key={sIdx}
                                    variant="secondary"
                                    className="rounded-lg px-2.5 py-1 text-xs font-semibold border-indigo-500/10 bg-indigo-500/5 text-indigo-500 gap-1 flex items-center"
                                  >
                                    {skill}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSkillChip(cat.id, skill)}
                                      className="hover:text-rose-500 font-bold ml-0.5"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 7: Certifications & Languages */}
          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
            <button
              id="section-header-certifications"
              onClick={() => toggleSection("certifications")}
              className="w-full flex items-center justify-between p-5 text-sm font-bold text-foreground hover:bg-muted/10 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Award className="w-4.5 h-4.5 text-teal-400" />
                Certifications & Languages ({profile.certifications.length + profile.languages.length})
              </span>
              {openSections.certifications ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {openSections.certifications && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="p-5 space-y-6">
                    
                    {/* Certifications Block */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-foreground">Certifications</h4>
                      {profile.certifications.length > 0 && (
                        <div className="space-y-3">
                          {profile.certifications.map((cert) => (
                            <div key={cert.id} className="border border-border/40 p-3 rounded-xl bg-background/20 flex justify-between items-center gap-4">
                              <div className="min-w-0">
                                <h6 className="text-xs font-bold text-foreground truncate">{cert.name}</h6>
                                <p className="text-[10px] text-muted-foreground font-semibold">{cert.issuer} | Issued: {cert.issueDate}</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeListItem("certifications", cert.id)}
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-rose-500 rounded-lg cursor-pointer w-7 h-7"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5">
                        <input
                          type="text"
                          placeholder="Certificate Name"
                          value={certForm.name}
                          onChange={(e) => setCertForm(prev => ({ ...prev, name: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Issuer (e.g. AWS)"
                          value={certForm.issuer}
                          onChange={(e) => setCertForm(prev => ({ ...prev, issuer: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Issue Date (e.g. Oct 2025)"
                          value={certForm.issueDate}
                          onChange={(e) => setCertForm(prev => ({ ...prev, issueDate: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <Button
                          type="button"
                          onClick={addCertificationItem}
                          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 cursor-pointer gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Cert
                        </Button>
                      </div>
                    </div>

                    <div className="h-px bg-border/20 w-full" />

                    {/* Languages Block */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-foreground">Language Proficiencies</h4>
                      {profile.languages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {profile.languages.map((lang) => (
                            <Badge key={lang.id} variant="secondary" className="rounded-lg px-2.5 py-1 text-xs font-semibold border-indigo-500/10 bg-indigo-500/5 text-indigo-400 gap-1 flex items-center">
                              {lang.language} - <span className="text-foreground italic">{lang.proficiency}</span>
                              <button type="button" onClick={() => removeListItem("languages", lang.id)} className="hover:text-rose-500 font-bold ml-1">×</button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5">
                        <input
                          type="text"
                          placeholder="Language (e.g. German)"
                          value={langForm.language}
                          onChange={(e) => setLangForm(prev => ({ ...prev, language: e.target.value }))}
                          className="flex-1 h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                        />
                        <select
                          value={langForm.proficiency}
                          onChange={(e) => setLangForm(prev => ({ ...prev, proficiency: e.target.value }))}
                          className="h-9 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Professional">Professional</option>
                          <option value="Native">Native</option>
                        </select>
                        <Button type="button" onClick={addLanguageItem} className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 cursor-pointer">
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 8: AI Customizations & Goals */}
          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
            <button
              id="section-header-ai"
              onClick={() => toggleSection("ai")}
              className="w-full flex items-center justify-between p-5 text-sm font-bold text-foreground hover:bg-muted/10 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                AI Personalization Preferences
              </span>
              {openSections.ai ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {openSections.ai && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Preferred Interview Style */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Mock Interview Coach Style</label>
                        <select
                          value={profile.aiPreferences.interviewStyle || "Professional"}
                          onChange={(e) => handleNestedFieldChange("aiPreferences", "interviewStyle", e.target.value)}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground"
                        >
                          <option value="Friendly">Friendly & Encouraging</option>
                          <option value="Professional">Professional Panel</option>
                          <option value="Strict">Strict (FAANG-style stress)</option>
                        </select>
                      </div>

                      {/* Difficulty */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Target AI Difficulty</label>
                        <select
                          value={profile.aiPreferences.difficulty || "Medium"}
                          onChange={(e) => handleNestedFieldChange("aiPreferences", "difficulty", e.target.value)}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground"
                        >
                          <option value="Easy">Easy (Conceptual)</option>
                          <option value="Medium">Medium (Industry average)</option>
                          <option value="Hard">Hard (Deep architecture)</option>
                        </select>
                      </div>

                      {/* Preferred Answer Length */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Preferred AI Response Depth</label>
                        <select
                          value={profile.aiPreferences.answerLength || "Medium"}
                          onChange={(e) => handleNestedFieldChange("aiPreferences", "answerLength", e.target.value)}
                          className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none font-semibold text-foreground"
                        >
                          <option value="Short">Short & Concise</option>
                          <option value="Medium">Standard Feedback</option>
                          <option value="Detailed">Detailed code/STAR breakdown</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-foreground">AI Custom Modules & Notifications</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-accent/20 p-4 rounded-xl">
                        <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!profile.aiPreferences.enableTips}
                            onChange={(e) => handleNestedFieldChange("aiPreferences", "enableTips", e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-border/40 focus:ring-indigo-500"
                          />
                          Enable Personalized AI Career Suggestions
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!profile.aiPreferences.enableWeekly}
                            onChange={(e) => handleNestedFieldChange("aiPreferences", "enableWeekly", e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-border/40 focus:ring-indigo-500"
                          />
                          Enable Weekly Progress Suggestion Reports
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 9: Privacy & Security settings */}
          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
            <button
              id="section-header-privacy"
              onClick={() => toggleSection("privacy")}
              className="w-full flex items-center justify-between p-5 text-sm font-bold text-foreground hover:bg-muted/10 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Shield className="w-4.5 h-4.5 text-rose-400" />
                Privacy & Notification Preferences
              </span>
              {openSections.privacy ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {openSections.privacy && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="p-5 space-y-4">
                    {/* Privacy */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-foreground">Profile Visibility</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-accent/20 p-4 rounded-xl">
                        <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!profile.privacySettings.public}
                            onChange={(e) => handleNestedFieldChange("privacySettings", "public", e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-border/40 focus:ring-indigo-500"
                          />
                          Public Profile (Searchable)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!profile.privacySettings.allowAiPersonalization}
                            onChange={(e) => handleNestedFieldChange("privacySettings", "allowAiPersonalization", e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-border/40 focus:ring-indigo-500"
                          />
                          Allow AI Context personalization
                        </label>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-foreground">Email Notifications</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-accent/20 p-4 rounded-xl">
                        <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!profile.notificationSettings.emailAlerts}
                            onChange={(e) => handleNestedFieldChange("notificationSettings", "emailAlerts", e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-border/40 focus:ring-indigo-500"
                          />
                          Direct email alerts on scorecard checks
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!profile.notificationSettings.reminders}
                            onChange={(e) => handleNestedFieldChange("notificationSettings", "reminders", e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-border/40 focus:ring-indigo-500"
                          />
                          Practice reminders & scheduling
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Side: Quick Actions & SVG AI Profile Insights (4/12 Column) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* SAVE CHANGES CARD */}
          <Card className="border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm p-5 space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                <Save className="w-4 h-4 text-indigo-400" />
                Save Changes
              </h4>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Commit your updated background details to target with the AI Copilot.
              </p>
            </div>
            <Button
              type="button"
              onClick={triggerSave}
              disabled={saving}
              className="w-full text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer h-10 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile Settings
                </>
              )}
            </Button>
          </Card>

          {/* STICKY QUICK ACTIONS SIDEBAR PANEL */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm p-5 space-y-4">
            <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              Quick Actions
            </h4>
            <div className="flex flex-col gap-2.5">
              <Button
                onClick={() => handleQuickAction("/resume")}
                className="w-full text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer h-10 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Analyze Resume
              </Button>
              <Button
                onClick={() => handleQuickAction("/ats-score")}
                variant="outline"
                className="w-full text-xs font-bold rounded-xl border-border/40 hover:bg-accent/40 cursor-pointer h-10 flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Improve ATS Score
              </Button>
              <Button
                onClick={() => handleQuickAction("/job-match")}
                variant="outline"
                className="w-full text-xs font-bold rounded-xl border-border/40 hover:bg-accent/40 cursor-pointer h-10 flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-teal-400" /> Find Job Matches
              </Button>
              <Button
                onClick={() => handleQuickAction("/interview")}
                variant="outline"
                className="w-full text-xs font-bold rounded-xl border-border/40 hover:bg-accent/40 cursor-pointer h-10 flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-pink-400" /> Start AI Interview Practice
              </Button>
            </div>
          </Card>

          {/* DYNAMIC SVG CHARTS (AI INSIGHTS & READY STATE) */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-sm p-5 space-y-4">
            <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
              AI Readiness Scorecard
            </h4>

            {/* ATS Readiness Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">ATS Compliance Alignment</span>
                <span className="text-foreground font-black">{primaryAtsScore}%</span>
              </div>
              <div className="w-full bg-accent/20 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${primaryAtsScore}%` }} />
              </div>
            </div>

            {/* Profile Context Readiness */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">Profile Context Completeness</span>
                <span className="text-foreground font-black">{completeness}%</span>
              </div>
              <div className="w-full bg-accent/20 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
              </div>
            </div>

            {/* Interview readiness computed mathematically */}
            {/* Base score derived from profile lists completed */}
            <div className="space-y-1.5">
              {(() => {
                const totalProjects = profile.projects.length;
                const totalExp = profile.experience.length;
                const totalSkills = Object.values(profile.skills).reduce((acc, curr) => acc + curr.length, 0);
                const scoreBase = Math.min(
                  (totalProjects * 20) + (totalExp * 30) + (totalSkills * 3),
                  100
                );
                return (
                  <>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-muted-foreground">Mock Interview Readiness</span>
                      <span className="text-foreground font-black">{scoreBase}%</span>
                    </div>
                    <div className="w-full bg-accent/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full rounded-full transition-all duration-500" style={{ width: `${scoreBase}%` }} />
                    </div>
                  </>
                );
              })()}
            </div>


          </Card>

          {/* ACTIVE PRIMARY RESUME DETAILS SUMMARY */}
          {primaryResume && (
            <Card className="border border-border/40 bg-card/60 backdrop-blur-sm p-5 space-y-3">
              <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                Active Practice Resume
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-foreground truncate max-w-[200px]">{primaryResume.fileName}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 text-[8px] uppercase font-black shrink-0">Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-1">
                  <div>
                    <span className="block text-[8px] uppercase text-muted-foreground/60">ATS Rating</span>
                    <span className="text-foreground font-black">{primaryAtsScore}/100</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-muted-foreground/60">AI Quality Score</span>
                    <span className="text-foreground font-black">{primaryOverallScore}/100</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

        </div>

      </div>

      <div className="h-px bg-border/20 my-4 w-full" />

      {/* SECTION 21: SMART AI SUGGESTIONS SECTION (BOTTOM) */}
      <Card className="border border-indigo-500/10 bg-indigo-500/5 backdrop-blur-md rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-bounce" />
          <div>
            <h3 className="text-sm font-black text-foreground">Smart AI Profile Optimizer</h3>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Dynamically generated suggestions based on profile gaps and target roles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {aiSuggestions.map((sug, idx) => (
            <div key={idx} className="border border-border/40 p-3 rounded-xl bg-background/40 flex items-start gap-2.5">
              <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 text-xs shrink-0 font-bold">
                {sug.severity === "high" ? "🔥" : sug.severity === "medium" ? "🚀" : "💡"}
              </span>
              <p className="text-xs font-semibold text-muted-foreground leading-snug">{sug.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
