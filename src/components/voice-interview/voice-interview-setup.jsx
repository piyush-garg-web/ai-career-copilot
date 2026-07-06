// src/components/voice-interview/voice-interview-setup.jsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import {
  Mic,
  Video,
  Settings,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Globe,
  Sliders,
  Volume2,
  FileText,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { usePremium } from "@/hooks/use-premium";
import { PremiumRequiredModal } from "@/components/shared/PremiumRequiredModal";

export function VoiceInterviewSetup({ onStartSession, initialResumes = [], initialJds = [] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Settings states
  const [resumes, setResumes] = useState(initialResumes);
  const [jds, setJds] = useState(initialJds);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJdId, setSelectedJdId] = useState("");
  const [interviewType, setInterviewType] = useState("HR");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [duration, setDuration] = useState("5"); // Number of questions
  const [language, setLanguage] = useState("en");
  const [voiceName, setVoiceName] = useState("native");
  const [voices, setVoices] = useState([]);

  // Video settings
  const [mode, setMode] = useState("voice"); // 'voice' | 'video'
  const [mirrorCamera, setMirrorCamera] = useState(true);
  const [videoResolution, setVideoResolution] = useState("720p");
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  
  // Loading states
  const [sessionLoading, setSessionLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Load standard speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const list = window.speechSynthesis.getVoices();
        // Filter unique voices by language support
        setVoices(list);
      }
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Fetch saved settings on load
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/voice-interview/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            const s = data.settings;
            setVoiceName(s.preferredVoice || "native");
            setDifficulty(s.difficulty || "MEDIUM");
            setLanguage(s.language || "en");
            setNoiseSuppression(s.noiseSuppression !== undefined ? s.noiseSuppression : true);
            setMirrorCamera(s.mirrorCamera !== undefined ? s.mirrorCamera : true);
            setVideoResolution(s.videoResolution || "720p");
            if (s.enableCamera) {
              setMode("video");
            }
          }
        }
      } catch (e) {
        console.warn("Could not fetch saved settings, using defaults.", e);
      }
    }
    fetchSettings();
  }, []);

  // Automatically select primary/first resume if not selected
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const primary = resumes.find(r => r.isPrimary) || resumes[0];
      setSelectedResumeId(primary.id);
    }
  }, [resumes, selectedResumeId]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/voice-interview/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredVoice: voiceName,
          difficulty,
          duration: parseInt(duration, 10),
          language,
          noiseSuppression,
          enableCamera: mode === "video",
          mirrorCamera,
          videoResolution,
        }),
      });
      if (res.ok) {
        toast.success("Preferences saved successfully!");
      } else {
        toast.error("Failed to save preferences.");
      }
    } catch (e) {
      toast.error("Error saving preferences.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      toast.error("Please upload or select a resume first.");
      return;
    }

    if (!isPremium && !premiumLoading) {
      setShowPremiumModal(true);
      return;
    }

    setSessionLoading(true);
    try {
      // First save configuration preferences to database
      await fetch("/api/voice-interview/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredVoice: voiceName,
          difficulty,
          duration: parseInt(duration, 10),
          language,
          noiseSuppression,
          enableCamera: mode === "video",
          mirrorCamera,
          videoResolution,
        }),
      });

      // Call API to initialize session
      const res = await fetch("/api/voice-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescriptionId: selectedJdId || null,
          interviewType,
          difficulty,
          duration: parseInt(duration, 10),
          language,
          voice: voiceName,
          videoEnabled: mode === "video",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize interview.");
      }

      toast.success("Voice Interview Session created successfully!");
      
      if (onStartSession) {
        onStartSession({
          sessionId: data.sessionId,
          firstQuestion: data.firstQuestion,
          mode,
          settings: {
            preferredVoice: voiceName,
            language,
            mirrorCamera,
            videoResolution,
            noiseSuppression,
          },
          totalQuestions: parseInt(duration, 10),
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create mock interview session.");
    } finally {
      setSessionLoading(false);
    }
  };

  const interviewTypes = [
    { code: "HR", name: "HR Interview" },
    { code: "Behavioral", name: "Behavioral" },
    { code: "Technical", name: "General Technical" },
    { code: "Frontend", name: "Frontend Engineer" },
    { code: "Backend", name: "Backend Engineer" },
    { code: "Full Stack", name: "Full Stack" },
    { code: "React", name: "React Developer" },
    { code: "Node.js", name: "Node.js Developer" },
    { code: "Java", name: "Java Developer" },
    { code: "Python", name: "Python Developer" },
    { code: "JavaScript", name: "JavaScript Core" },
    { code: "System Design", name: "System Design" },
    { code: "Cloud", name: "Cloud Architect" },
    { code: "AI / ML", name: "AI / ML Engineer" },
    { code: "Data Structures", name: "Algorithms & DSA" },
    { code: "Custom", name: "Custom Job Description" },
  ];

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-12 max-w-5xl mx-auto p-2">
      {/* Overview Block */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Premium AI voice
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent leading-tight">
            conversational voice mock interview practice
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Accelerate your mock prep using our natural voice client. Respond using spoken audio, and receive immediate coaching feedback regarding fluency, pauses, pacing, grammar, and video posture.
          </p>
        </div>

        <div className="space-y-3.5 text-xs font-bold text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 font-extrabold">1</span>
            <span>Configure target language, difficulty, and selected resume.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 font-extrabold">2</span>
            <span>Answer the AI spoke questions naturally from your mic.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 font-extrabold">3</span>
            <span>Access deep analytical scorecards and customized roadmaps.</span>
          </div>
        </div>

        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Quick Transition</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Button
              variant="outline"
              onClick={() => router.push("/interview")}
              className="w-full rounded-xl"
            >
              Need text-based practice instead?
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Setup Form Block */}
      <form onSubmit={handleStart} className="lg:col-span-7">
        <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-all duration-300 shadow-xl shadow-accent/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-500" />
              Configure Voice Mock Session
            </CardTitle>
            <CardDescription className="text-xs">
              Personalize your real-time mock options to start.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Mode Select */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-accent/40 rounded-xl">
              <button
                type="button"
                onClick={() => setMode("voice")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "voice"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mic className="w-4 h-4" />
                Voice Interview
              </button>
              <button
                type="button"
                onClick={() => setMode("video")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "video"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Video className="w-4 h-4" />
                Voice + Video
              </button>
            </div>

            {/* Resume Selection */}
            <div className="grid gap-2">
              <label htmlFor="resume-select" className="text-xs font-extrabold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Select Practice Resume
              </label>
              {resumes.length === 0 ? (
                <div className="text-xs border border-dashed border-red-500/30 bg-red-500/5 rounded-xl p-3 text-red-500 font-semibold">
                  No analyzed resume found. Please upload one in the Resume section first.
                </div>
              ) : (
                <select
                  id="resume-select"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring cursor-pointer"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fileName} {r.isPrimary ? "(Primary)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Job Description Selection */}
            <div className="grid gap-2">
              <label htmlFor="jd-select" className="text-xs font-extrabold">Target Job Description (Optional)</label>
              <select
                id="jd-select"
                value={selectedJdId}
                onChange={(e) => setSelectedJdId(e.target.value)}
                className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring cursor-pointer"
              >
                <option value="">General (No custom Job Description)</option>
                {jds.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title || "Job Target"} - {j.company || "Target Company"}
                  </option>
                ))}
              </select>
            </div>

            {/* Row: Focus & Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="type-select" className="text-xs font-extrabold">Interview Focus</label>
                <select
                  id="type-select"
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {interviewTypes.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="diff-select" className="text-xs font-extrabold">Difficulty Level</label>
                <select
                  id="diff-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            {/* Row: Duration & Language */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="dur-select" className="text-xs font-extrabold">Target Questions</label>
                <select
                  id="dur-select"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-xs focus:outline-none"
                >
                  <option value="3">3 Questions (Short)</option>
                  <option value="5">5 Questions (Standard)</option>
                  <option value="8">8 Questions (Long)</option>
                  <option value="12">12 Questions (Complete)</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="lang-select" className="text-xs font-extrabold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  Language
                </label>
                <select
                  id="lang-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-xs focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="it">Italian (Italiano)</option>
                  <option value="ja">Japanese (日本語)</option>
                  <option value="ko">Korean (한국어)</option>
                  <option value="zh">Chinese (简体中文)</option>
                  <option value="ar">Arabic (العربية)</option>
                  <option value="ru">Russian (Русский)</option>
                </select>
              </div>
            </div>

            {/* Config Expandable Settings Panel */}
            <div className="border-t border-border/20 pt-3">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs font-extrabold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer focus:outline-none"
              >
                <Settings className="w-3.5 h-3.5" />
                {showConfig ? "Hide Voice & Video Preferences" : "Show Voice & Video Preferences"}
              </button>

              {showConfig && (
                <div className="mt-3 p-4 rounded-xl border border-border/40 bg-background/50 space-y-4 text-xs font-semibold">
                  {/* Select TTS Voice */}
                  <div className="grid gap-2">
                    <label htmlFor="voice-select" className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      Preferred TTS Voice
                    </label>
                    <select
                      id="voice-select"
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-border/50 bg-background text-[11px]"
                    >
                      <option value="native">Default Browser Native Voice</option>
                      {voices
                        .filter((v) => v.lang.startsWith(language))
                        .map((v, i) => (
                          <option key={i} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Noise Suppression */}
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <div className="flex flex-col gap-0.5">
                      <span>Mic Noise Suppression</span>
                      <span className="text-[10px] text-muted-foreground">Reduces background hums & murmurs.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={noiseSuppression}
                      onChange={(e) => setNoiseSuppression(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Camera Settings if mode = video */}
                  {mode === "video" && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-border/20 pb-2">
                        <div className="flex flex-col gap-0.5">
                          <span>Mirror Video Feed</span>
                          <span className="text-[10px] text-muted-foreground">Flips camera horizontally.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={mirrorCamera}
                          onChange={(e) => setMirrorCamera(e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Video Stream Quality</span>
                        <select
                          value={videoResolution}
                          onChange={(e) => setVideoResolution(e.target.value)}
                          className="p-1 rounded bg-background border border-border/40 text-[11px]"
                        >
                          <option value="480p">480p (Low load)</option>
                          <option value="720p">720p (Recommended)</option>
                          <option value="1080p">1080p (FHD)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="secondary"
                    disabled={savingSettings}
                    onClick={handleSaveSettings}
                    className="w-full rounded-lg"
                  >
                    {savingSettings ? "Saving Settings..." : "Save Preferences as Default"}
                  </Button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <Button
              type="submit"
              disabled={sessionLoading || resumes.length === 0}
              className="w-full h-12 rounded-xl"
            >
              {sessionLoading ? "Generating initial voice prompt..." : (mode === "video" ? "Start Video Interview" : "Start Voice Interview")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
    <PremiumRequiredModal
      isOpen={showPremiumModal}
      onClose={() => setShowPremiumModal(false)}
      featureName="Voice & Video Mock Interviews"
    />
    </>
  );
}
export default VoiceInterviewSetup;
