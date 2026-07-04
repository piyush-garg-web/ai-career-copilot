// src/components/voice-interview/voice-interview-flow.jsx

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVoiceSession } from "@/hooks/voice/useVoiceSession";
import { AnimatedWaveform } from "./animated-waveform";
import { videoAnalyzer } from "@/services/video/video-analyzer";
import {
  Mic,
  Video,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  LogOut,
  Clock,
  Sparkles,
  Camera,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export function VoiceInterviewFlow({
  sessionId,
  firstQuestion,
  settings = {},
  totalQuestions = 5,
  videoEnabled = false,
  onSessionFinished,
  onExit,
}) {
  const [sessionTimer, setSessionTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [videoError, setVideoError] = useState("");
  const [loadingVideoModels, setLoadingVideoModels] = useState(false);
  const [realtimeCoachingFeedback, setRealtimeCoachingFeedback] = useState("");
  const [realtimeTips, setRealtimeTips] = useState([]);
  
  // Video streams refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const localStreamRef = useRef(null);
  const videoAnalysisLoopRef = useRef(null);

  // Initialize voice session hook
  const {
    status,
    currentQuestion,
    currentQuestionNumber,
    transcripts,
    liveTranscript,
    micActive,
    volumeLevel,
    speechStats,
    replayQuestion,
    skipQuestion,
    pauseSession,
    resumeSession,
    stopAndEvaluate,
    startSession,
    cleanup: cleanupVoice,
  } = useVoiceSession({
    sessionId,
    settings,
    totalQuestions,
    onCompleted: (finalSpeechMetrics) => {
      handleFinalize(finalSpeechMetrics);
    },
  });

  // Start interview session when component mounts
  useEffect(() => {
    if (firstQuestion) {
      startSession(firstQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstQuestion]);

  // Session timer incrementer
  useEffect(() => {
    let interval = null;
    if (status !== "paused" && status !== "completed" && status !== "idle") {
      interval = setInterval(() => {
        setSessionTimer((t) => t + 1);
        if (status === "listening") {
          setQuestionTimer((t) => t + 1);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // Reset question timer whenever status changes
  useEffect(() => {
    if (status === "listening") {
      setQuestionTimer(0);
    }
  }, [status]);

  // Initialize optional video mode
  useEffect(() => {
    if (videoEnabled) {
      initWebcam();
    }
    return () => {
      stopWebcam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoEnabled]);

  const initWebcam = async () => {
    setLoadingVideoModels(true);
    setVideoError("");
    try {
      // 1. Request camera stream
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false, // audio is handled separately by MediaRecorder in useVoiceSession
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 2. Load vision tracking libraries lazily
      const initialized = await videoAnalyzer.initModels();
      if (!initialized) {
        throw new Error("Failed to initialize local vision models.");
      }

      videoAnalyzer.resetMetrics();
      
      // 3. Start processing frames
      startVideoAnalysisLoop();
    } catch (e) {
      console.error("[WEBCAM INITIALIZATION ERROR]:", e);
      setVideoError("Camera access denied or vision models failed to load. Continuing with Voice-only mode.");
      toast.warning("Camera disabled. Running in voice-only mode.");
    } finally {
      setLoadingVideoModels(false);
    }
  };

  const stopWebcam = () => {
    if (videoAnalysisLoopRef.current) {
      cancelAnimationFrame(videoAnalysisLoopRef.current);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const startVideoAnalysisLoop = () => {
    const loop = async () => {
      if (videoRef.current && canvasRef.current) {
        const result = await videoAnalyzer.analyzeFrame(videoRef.current, canvasRef.current);
        if (result && result.faceDetected) {
          setRealtimeCoachingFeedback(result.feedback);
          setRealtimeTips(result.coachingTips || []);
        } else if (result && !result.faceDetected) {
          setRealtimeCoachingFeedback("Face not detected");
          setRealtimeTips(["Keep face centered", "Check camera visibility"]);
        }
      }
      videoAnalysisLoopRef.current = requestAnimationFrame(loop);
    };
    videoAnalysisLoopRef.current = requestAnimationFrame(loop);
  };

  const handleFinalize = async (finalSpeechMetrics = {}) => {
    toast.loading("Compiling overall scorecard reports...");
    stopWebcam();
    cleanupVoice();

    try {
      // Resolve video analytics summaries if camera was active
      let finalVideoMetrics = null;
      if (videoEnabled && !videoError) {
        finalVideoMetrics = videoAnalyzer.getAverages(sessionTimer);
      }

      const res = await fetch(`/api/voice-interview/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          finalSpeechStats: finalSpeechMetrics || speechStats,
          finalVideoStats: finalVideoMetrics,
        }),
      });

      if (res.ok) {
        toast.dismiss();
        toast.success("Scorecard generated successfully!");
        if (onSessionFinished) {
          onSessionFinished();
        }
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Compilation failed");
      }
    } catch (e) {
      toast.dismiss();
      console.error(e);
      toast.error("Failed to compile mock interview scores. Redirecting anyway.");
      if (onSessionFinished) {
        onSessionFinished();
      }
    }
  };

  const handleExit = async () => {
    if (confirm("Are you sure you want to exit the mock interview? Progress on the current question will be lost.")) {
      stopWebcam();
      cleanupVoice();
      try {
        await fetch(`/api/voice-interview/${sessionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ABANDONED" }),
        });
      } catch (e) {}
      if (onExit) onExit();
    }
  };

  // Helper formatting for seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const transcriptEndRef = useRef(null);
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcripts]);

  return (
    <div className="grid gap-6 lg:grid-cols-12 max-w-5xl mx-auto p-1">
      {/* Visual Workspace: Waves, Camera, Coaching */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <Card className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden relative shadow-lg">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 text-xs font-bold text-muted-foreground bg-accent/20">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Duration: {formatTime(sessionTimer)}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
              Question {currentQuestionNumber} of {totalQuestions}
            </span>
          </div>

          <CardContent className="flex flex-col items-center justify-center p-8 min-h-[320px] relative">
            {/* Status indicators */}
            <div className="mb-6 text-center space-y-1">
              <h3 className="text-lg font-black tracking-wide uppercase text-foreground">
                {status === "speaking" && "AI Speaking..."}
                {status === "listening" && "Listening to response..."}
                {status === "processing" && "AI Evaluating..."}
                {status === "paused" && "Interview Paused"}
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                {status === "speaking" && "Listen to the mock question."}
                {status === "listening" && `Automatic submission in ${Math.max(0, 30 - questionTimer)}s of silence.`}
                {status === "processing" && "Grading response and creating next turn."}
              </p>
            </div>

            {/* Central glowing wave controller */}
            <div className="relative w-44 h-44 rounded-full bg-accent/20 flex items-center justify-center mb-8 shadow-inner group">
              <div
                className={`absolute inset-0 rounded-full blur-xl opacity-30 transition-all duration-500 ${
                  status === "listening"
                    ? "bg-emerald-500 scale-110"
                    : status === "speaking"
                    ? "bg-blue-500 scale-105"
                    : "bg-slate-400"
                }`}
              />
              
              {/* Outer pulsing circle */}
              <div
                className={`w-36 h-36 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  status === "listening"
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : status === "speaking"
                    ? "border-blue-500/40 bg-blue-500/5"
                    : "border-slate-500/30"
                }`}
              >
                <div
                  className={`w-28 h-28 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                    status === "listening"
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : status === "speaking"
                      ? "bg-blue-500 text-white shadow-blue-500/20"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Mic className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* Waveform component */}
            <AnimatedWaveform volumeLevel={volumeLevel} status={status} className="w-full max-w-sm mb-6" />

            {/* Live streaming text preview */}
            {status === "listening" && liveTranscript && (
              <div className="w-full text-center px-4 py-3 rounded-xl bg-accent/30 border border-border/20 text-xs font-medium italic text-foreground max-w-md animate-pulse">
                &ldquo;{liveTranscript}&rdquo;
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buttons Panel */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExit}
                className="rounded-xl font-bold cursor-pointer text-xs flex items-center gap-1.5 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit Mock
              </Button>

              {status === "paused" ? (
                <Button
                  onClick={resumeSession}
                  className="rounded-xl font-bold cursor-pointer text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Play className="w-3.5 h-3.5" />
                  Resume
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={pauseSession}
                  disabled={status === "completed" || status === "processing"}
                  className="rounded-xl font-bold cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5" />
                  Pause
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={replayQuestion}
                disabled={status === "completed" || status === "processing"}
                className="rounded-xl font-bold cursor-pointer text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Repeat Question
              </Button>

              <Button
                variant="secondary"
                onClick={skipQuestion}
                disabled={status === "completed" || status === "processing"}
                className="rounded-xl font-bold cursor-pointer text-xs flex items-center gap-1.5"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Skip Turn
              </Button>

              <Button
                onClick={stopAndEvaluate}
                disabled={status !== "listening"}
                className="rounded-xl font-bold cursor-pointer text-xs flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-white"
              >
                Next Answer
                <SkipForward className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Webcam Overlay & Dialog log */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Optional Webcam module */}
        {videoEnabled && (
          <Card className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden shadow-lg relative">
            <CardHeader className="py-2.5 px-4 border-b border-border/20 bg-accent/10">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-500" />
                Live Video Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 relative flex flex-col items-center justify-center">
              {videoError ? (
                <div className="text-xs p-4 border border-dashed border-red-500/20 bg-red-500/5 text-red-400 font-semibold rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{videoError}</span>
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-xl bg-slate-950 overflow-hidden group shadow-md">
                  {/* Local video tag */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${settings.mirrorCamera ? "-scale-x-100" : ""}`}
                  />
                  {/* Hidden Canvas used for image frames extraction */}
                  <canvas ref={canvasRef} width="320" height="240" className="hidden" />

                  {/* Loading Spinner */}
                  {loadingVideoModels && (
                    <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 z-10 text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                      <span className="text-[10px] font-bold tracking-wide uppercase">Initializing Vision models...</span>
                    </div>
                  )}

                  {/* Real-time Toast coaching alert */}
                  {!loadingVideoModels && realtimeCoachingFeedback && (
                    <div className="absolute top-2 left-2 right-2 p-2 rounded-lg text-[10px] font-bold shadow-md bg-black/60 text-white backdrop-blur-sm flex items-center gap-1.5 border border-white/10 select-none">
                      <Info className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>Coaching Tip: {realtimeCoachingFeedback}</span>
                    </div>
                  )}

                  {/* Tips checklist list */}
                  {!loadingVideoModels && realtimeTips.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                      {realtimeTips.map((tip, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[8px] font-bold rounded bg-red-500/80 text-white select-none">
                          ⚠ {tip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transcript Dialog logger */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md flex-1 flex flex-col overflow-hidden max-h-[460px] shadow-lg">
          <CardHeader className="py-3 px-4 border-b border-border/20 bg-accent/10">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Live Interview Transcripts
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {transcripts.map((entry, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  entry.speaker === "AI"
                    ? "self-start bg-indigo-500/10 text-foreground border border-indigo-500/10 rounded-tl-none mr-auto"
                    : "self-end bg-blue-600 text-white rounded-tr-none ml-auto"
                }`}
              >
                <span className="text-[9px] font-black uppercase opacity-60 mb-1">
                  {entry.speaker === "AI" ? "Interviewer" : "You"}
                </span>
                <p className="font-medium">&ldquo;{entry.text}&rdquo;</p>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default VoiceInterviewFlow;
