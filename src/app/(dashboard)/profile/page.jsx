"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    linkedinUrl: "",
    targetRole: "",
    targetIndustry: "",
    experienceLevel: "ENTRY",
    careerGoals: "",
  });
  const [skills, setSkills] = useState([]);
  const [skillsInput, setSkillsInput] = useState("");

  // Fetch current profile from database
  useEffect(() => {
    async function fetchProfileAndResumes() {
      try {
        const userRes = await fetch("/api/user");
        if (!userRes.ok) throw new Error("Failed to load user profile");
        const userData = await userRes.json();
        
        setFormData({
          bio: userData.bio || "",
          location: userData.location || "",
          linkedinUrl: userData.linkedinUrl || "",
          targetRole: userData.targetRole || "",
          targetIndustry: userData.targetIndustry || "",
          experienceLevel: userData.experienceLevel || "ENTRY",
          careerGoals: userData.careerGoals || "",
        });

        // Load skills from local storage (target skills)
        const cachedSkills = localStorage.getItem("target_skills_portfolio");
        if (cachedSkills) {
          setSkills(JSON.parse(cachedSkills));
        } else {
          // Fallback to fetch from primary resume parsed data if available
          const resumesRes = await fetch("/api/resumes");
          if (resumesRes.ok) {
            const resumes = await resumesRes.json();
            const primaryResume = resumes.find(r => r.isPrimary) || resumes[0];
            if (primaryResume?.parsedData?.skills) {
              setSkills(primaryResume.parsedData.skills.slice(0, 12));
            }
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not retrieve profile information.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfileAndResumes();
  }, []);

  // Form value change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Select option value change handler
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit profile updates to database
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verify linkedin link formatting
    if (formData.linkedinUrl && !formData.linkedinUrl.startsWith("http://") && !formData.linkedinUrl.startsWith("https://")) {
      toast.error("Invalid URL formatting. Please ensure LinkedIn Link includes http:// or https://");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      // Cache target skills tags
      localStorage.setItem("target_skills_portfolio", JSON.stringify(skills));

      toast.success("Profile saved successfully!", {
        description: "Your background parameters are synchronized with the AI scan.",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Add target skill badge
  const handleAddSkill = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const cleanInput = skillsInput.trim();
      if (cleanInput && !skills.includes(cleanInput)) {
        const updated = [...skills, cleanInput];
        setSkills(updated);
        setSkillsInput("");
        localStorage.setItem("target_skills_portfolio", JSON.stringify(updated));
      }
    }
  };

  // Delete skill badge
  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
    localStorage.setItem("target_skills_portfolio", JSON.stringify(updated));
  };

  // Compute profile completeness quotient
  const calculateCompleteness = () => {
    let score = 0;
    if (formData.bio?.trim()) score += 15;
    if (formData.location?.trim()) score += 15;
    if (formData.linkedinUrl?.trim()) score += 15;
    if (formData.targetRole?.trim()) score += 20;
    if (formData.targetIndustry?.trim()) score += 15;
    if (formData.careerGoals?.trim()) score += 20;
    return score;
  };

  const completionPercent = calculateCompleteness();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold text-muted-foreground animate-pulse">Syncing user data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Update your career target role, experience, industry preference, and social handles to align AI services."
      />

      {/* Completion Dashboard banner */}
      <Card className="border border-indigo-500/10 bg-indigo-500/5 backdrop-blur-md rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-indigo-400" />
            Profile Completeness
          </h3>
          <p className="text-xs text-muted-foreground font-semibold">
            {completionPercent === 100 ? "Your portfolio is fully optimized for AI coaching!" : "Complete details to unlock optimized AI matching and interview generation."}
          </p>
        </div>
        <div className="flex items-center gap-4 min-w-[200px] sm:min-w-[240px]">
          <Progress value={completionPercent} className="h-2 bg-accent flex-1" />
          <span className="text-sm font-black text-indigo-400 shrink-0">{completionPercent}%</span>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Block: Profile Info Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preferences */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border/80 transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Career Preferences
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure details that the AI Coach and Job Matcher will target.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground" htmlFor="targetRole">Target Role</label>
                    <input
                      id="targetRole"
                      name="targetRole"
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={formData.targetRole}
                      onChange={handleChange}
                      className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                    />
                  </div>

                  {/* Target Industry */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground" htmlFor="targetIndustry">Target Industry</label>
                    <input
                      id="targetIndustry"
                      name="targetIndustry"
                      type="text"
                      placeholder="e.g. Fintech, SaaS, Healthtech"
                      value={formData.targetIndustry}
                      onChange={handleChange}
                      className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                    />
                  </div>
                </div>

                {/* Experience Level Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Experience Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {["ENTRY", "MID", "SENIOR", "EXECUTIVE"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleSelectChange("experienceLevel", lvl)}
                        className={`h-10 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer ${
                          formData.experienceLevel === lvl
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                            : "border-border/40 bg-background/50 text-muted-foreground hover:bg-accent/40"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Career Goals */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground" htmlFor="careerGoals">Short-term Career Goals</label>
                  <textarea
                    id="careerGoals"
                    name="careerGoals"
                    rows={4}
                    placeholder="Describe your immediate aspirations, target skills to acquire, or dream companies..."
                    value={formData.careerGoals}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold resize-none text-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personal info */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border/80 transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-400" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-xs">
                  Set contact preferences and a short biography.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground" htmlFor="location">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                      <input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="e.g. San Francisco, CA"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full h-10 pl-9 pr-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                      />
                    </div>
                  </div>

                  {/* LinkedIn Link */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground" htmlFor="linkedinUrl">LinkedIn Link</label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                      <input
                        id="linkedinUrl"
                        name="linkedinUrl"
                        type="url"
                        placeholder="e.g. https://linkedin.com/in/username"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        className={`w-full h-10 pl-9 pr-3 py-2 text-xs rounded-xl border bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground ${
                          formData.linkedinUrl && !formData.linkedinUrl.startsWith("http") ? "border-rose-500/50" : "border-border/40"
                        }`}
                      />
                    </div>
                    {formData.linkedinUrl && !formData.linkedinUrl.startsWith("http") && (
                      <p className="text-[10px] text-rose-500 font-bold">Link must begin with http:// or https://</p>
                    )}
                  </div>
                </div>

                {/* Biography */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground" htmlFor="bio">Biography / Summary</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    placeholder="Write a brief professional summary describing who you are..."
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold resize-none text-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Badges cloud for portfolio core skills */}
            <Card className="border border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  Portfolio Key Skills tags
                </CardTitle>
                <CardDescription className="text-xs">
                  Display tags of your technical and professional skills for optimization matching context.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a skill (e.g. React) and press Enter"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="flex-1 h-10 px-3 py-2 text-xs rounded-xl border border-border/40 bg-background/50 focus:border-indigo-500 focus:outline-none placeholder-muted-foreground/60 font-semibold text-foreground"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 cursor-pointer"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skills.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-semibold italic">No skills tags added yet. Enter tags above.</p>
                  ) : (
                    skills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold border-indigo-500/10 bg-indigo-500/5 text-indigo-500 gap-1 flex items-center"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-500 font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Block: Guide / Action Panel */}
          <div className="space-y-6">
            <Card className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden relative group">
              <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  AI Optimization Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="py-5 space-y-4 text-xs font-semibold leading-relaxed text-muted-foreground">
                <p>
                  Completing your profile details creates a customized context boundary. 
                </p>
                <div className="space-y-2.5">
                  <div className="flex gap-2 items-start">
                    <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">🎯</span>
                    <span><strong>Job Match Context</strong>: Compares missing skills against target industries and preferred roles first.</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="p-1 rounded-lg bg-teal-500/10 text-teal-500 shrink-0">🎤</span>
                    <span><strong>Interview Tailoring</strong>: Focuses mock questions on your specified experience level and goals.</span>
                  </div>
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
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
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
