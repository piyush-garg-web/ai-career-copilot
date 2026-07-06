// src/components/voice-interview/voice-interview-flow.jsx

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVoiceSession } from "@/hooks/voice/useVoiceSession";
import { AnimatedWaveform } from "./animated-waveform";
import { videoAnalyzer } from "@/services/video/video-analyzer";
import { PermissionDialog } from "./permission-dialog";
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
  
  // Permission dialog state
  const [showPermissionDialog, setShowPermissionDialog] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
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

  // Start interview session when component mounts AND permissions are granted
  useEffect(() => {
    if (firstQuestion && permissionGranted) {
      startSession(firstQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstQuestion, permissionGranted]);

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
    if (videoEnabled && permissionGranted) {
      initWebcam();
    }
    return () => {
      stopWebcam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoEnabled, permissionGranted]);

  // Handle browser refresh/close - cleanup media resources
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Cleanup media resources before page unload
      stopWebcam();
      cleanupVoice();
      // Don't show warning - just cleanup silently
      e.preventDefault();
      e.returnValue = "";
    };

    const handleVisibilityChange = () => {
      if (document.hidden && status === "listening") {
        console.log("[VISIBILITY]: Page hidden, pausing interview...");
        pauseSession();
      }
    };

    const handleOnline = () => {
      console.log("[NETWORK]: Connection restored");
      toast.success("Internet connection restored");
    };

    const handleOffline = () => {
      console.log("[NETWORK]: Connection lost");
      toast.error("Internet connection lost. Please check your connection.");
      if (status === "listening" || status === "processing") {
        pauseSession();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [status, pauseSession, cleanupVoice]);

  const initWebcam = async () => {
    setLoadingVideoModels(true);
    setVideoError("");
    try {
      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices API not supported in this browser.");
      }
      
      // 1. Request camera stream with proper constraints based on settings
      const resolutionMap = {
        "480p": { width: { ideal: 640 }, height: { ideal: 480 } },
        "720p": { width: { ideal: 1280 }, height: { ideal: 720 } },
        "1080p": { width: { ideal: 1920 }, height: { ideal: 1080 } },
      };
      
      const selectedResolution = resolutionMap[settings.videoResolution] || resolutionMap["720p"];
      
      const constraints = {
        video: {
          ...selectedResolution,
          frameRate: { ideal: 30, max: 30 },
          facingMode: "user",
        },
        audio: false, // audio is handled separately by MediaRecorder in useVoiceSession
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      // 2. Set up video element with proper loading
      if (videoRef.current) {
        // Clear any existing srcObject first
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject;
          oldStream.getTracks().forEach(track => track.stop());
        }
        
        videoRef.current.srcObject = null;
        videoRef.current.load(); // Reset the video element
        
        // Assign new stream
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        
        // Set explicit dimensions
        videoRef.current.width = 640;
        videoRef.current.height = 480;
        
        videoRef.current.onloadedmetadata = () => {
          console.log("[VIDEO]: Video metadata loaded, dimensions:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
          videoRef.current.play().then(() => {
            console.log("[VIDEO]: Playing successfully");
          }).catch((e) => {
            console.error("[VIDEO]: Error playing video:", e);
            setVideoError("Video playback error. Please refresh and try again.");
          });
        };
        videoRef.current.oncanplay = () => {
          console.log("[VIDEO]: Video can play");
        };
        videoRef.current.onplaying = () => {
          console.log("[VIDEO]: Video is now playing");
        };
        videoRef.current.onerror = (e) => {
          console.error("[VIDEO]: Video element error:", e);
          setVideoError("Video playback error. Please refresh and try again.");
        };
        
        // Force play after a short delay
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            videoRef.current.play().catch((e) => console.error("[VIDEO]: Delayed play error:", e));
          }
        }, 500);
        
        // Another fallback play attempt
        setTimeout(() => {
          if (videoRef.current && videoRef.current.paused) {
            console.log("[VIDEO]: Attempting fallback play");
            videoRef.current.play().catch((e) => console.error("[VIDEO]: Fallback play error:", e));
          }
        }, 1000);
      }

      // 3. Load vision tracking libraries lazily (optional - continue even if fails)
      let initialized = false;
      try {
        initialized = await videoAnalyzer.initModels();
      } catch (e) {
        console.warn("[VISION MODELS WARNING]: Failed to initialize, continuing without tracking.", e);
      }

      if (initialized) {
        videoAnalyzer.resetMetrics();
        // 4. Start processing frames
        startVideoAnalysisLoop();
      } else {
        console.log("[VIDEO MODE]: Running without vision tracking analytics.");
        setRealtimeCoachingFeedback("Video feed active (tracking disabled)");
        setRealtimeTips([]);
      }
    } catch (e) {
      console.error("[WEBCAM INITIALIZATION ERROR]:", e);
      
      let errorMessage = "Camera access denied. Continuing with Voice-only mode.";
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (e.name === "NotFoundError") {
        errorMessage = "No camera found on your device. Please connect a camera and try again.";
      } else if (e.name === "NotReadableError") {
        errorMessage = "Camera is already in use by another application. Please close other apps using the camera.";
      } else if (e.name === "OverconstrainedError") {
        errorMessage = "Camera does not support the requested resolution. Try a lower quality setting.";
      } else if (e.message?.includes("Media devices API")) {
        errorMessage = "Your browser does not support camera access. Please use a modern browser like Chrome or Firefox.";
      }
      
      setVideoError(errorMessage);
      toast.warning(errorMessage);
    } finally {
      setLoadingVideoModels(false);
    }
  };

  const stopWebcam = () => {
    // Stop video analysis loop
    if (videoAnalysisLoopRef.current) {
      cancelAnimationFrame(videoAnalysisLoopRef.current);
      videoAnalysisLoopRef.current = null;
    }
    
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("[VIDEO]: Stopped track:", track.kind);
      });
      localStreamRef.current = null;
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onerror = null;
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    
    console.log("[VIDEO]: Webcam stopped and cleaned up");
  };

  const startVideoAnalysisLoop = () => {
    const loop = async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        try {
          const result = await videoAnalyzer.analyzeFrame(videoRef.current, canvasRef.current);
          if (result && result.faceDetected) {
            setRealtimeCoachingFeedback(result.feedback);
            setRealtimeTips(result.coachingTips || []);
          } else if (result && !result.faceDetected) {
            setRealtimeCoachingFeedback("Face not detected");
            setRealtimeTips(["Keep face centered", "Check camera visibility"]);
          }
        } catch (e) {
          console.warn("[VIDEO ANALYSIS]: Frame analysis error:", e);
        }
      }
      videoAnalysisLoopRef.current = requestAnimationFrame(loop);
    };
    videoAnalysisLoopRef.current = requestAnimationFrame(loop);
  };

  const handleFinalize = async (finalSpeechMetrics = {}) => {
    toast.loading("Compiling overall scorecard reports...");
    
    // Stop all media resources immediately
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
      // Stop all media resources immediately
      stopWebcam();
      cleanupVoice();
      
      try {
        await fetch(`/api/voice-interview/${sessionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ABANDONED" }),
        });
      } catch (e) {
        console.error("[EXIT ERROR]: Failed to update session status:", e);
        // Continue with exit even if API call fails
      }
      
      if (onExit) onExit();
    }
  };

  // Handle camera disconnection during interview
  useEffect(() => {
    if (!videoEnabled || !localStreamRef.current) return;

    const handleTrackEnded = (e) => {
      console.error("[VIDEO]: Camera track ended:", e);
      setVideoError("Camera disconnected. Please reconnect your camera and refresh.");
      toast.error("Camera disconnected. Continuing with voice-only mode.");
      stopWebcam();
    };

    const tracks = localStreamRef.current.getVideoTracks();
    tracks.forEach((track) => {
      track.addEventListener("ended", handleTrackEnded);
    });

    return () => {
      tracks.forEach((track) => {
        track.removeEventListener("ended", handleTrackEnded);
      });
    };
  }, [videoEnabled, localStreamRef.current]);

  const handlePermissionAllow = () => {
    setPermissionGranted(true);
    setShowPermissionDialog(false);
  };

  const handlePermissionDeny = () => {
    setShowPermissionDialog(false);
    toast.error(
      videoEnabled
        ? "Camera and microphone permissions are required for Video Interview."
        : "Microphone access is required to start a Voice Interview."
    );
    // Exit the interview flow
    setTimeout(() => {
      if (onExit) onExit();
    }, 500);
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
    <>
      {/* Permission Dialog - shown before interview starts */}
      <PermissionDialog
        open={showPermissionDialog}
        onAllow={handlePermissionAllow}
        onDeny={handlePermissionDeny}
        mode={videoEnabled ? "video" : "voice"}
      />

      {/* Main Interview Flow - only shown after permissions granted */}
      {permissionGranted && (
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
                {status === "listening" && "Microphone active. Will auto-submit after 5 seconds of silence."}
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
                className="rounded-xl"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit Mock
              </Button>

              {status === "paused" ? (
                <Button
                  onClick={resumeSession}
                  className="rounded-xl"
                >
                  <Play className="w-3.5 h-3.5" />
                  Resume
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={pauseSession}
                  disabled={status === "completed" || status === "processing"}
                  className="rounded-xl"
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
                className="rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Repeat Question
              </Button>

              <Button
                variant="secondary"
                onClick={skipQuestion}
                disabled={status === "completed" || status === "processing"}
                className="rounded-xl"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Skip Turn
              </Button>

              <Button
                onClick={stopAndEvaluate}
                disabled={status !== "listening"}
                className="rounded-xl"
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
                    className="w-full h-full object-contain"
                    style={{
                      transform: settings.mirrorCamera ? "scaleX(-1)" : "scaleX(1)",
                      width: '100%',
                      height: '100%',
                    }}
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
      )}
    </>
  );
}
export default VoiceInterviewFlow;
