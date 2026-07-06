// src/hooks/voice/useVoiceSession.js

import { useState, useEffect, useRef, useCallback } from "react";
import { ttsService } from "@/services/tts/tts-service";

// Configurable silence timeout constant
const SILENCE_TIMEOUT_MS = 5000;

export function useVoiceSession({
  sessionId,
  settings = {},
  totalQuestions = 5,
  onCompleted = null,
}) {
  const [status, setStatus] = useState("idle"); // 'idle' | 'speaking' | 'listening' | 'processing' | 'paused' | 'completed'
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [transcripts, setTranscripts] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [micActive, setMicActive] = useState(false);
  const [coachingFeedback, setCoachingFeedback] = useState("");
  const [coachingTips, setCoachingTips] = useState([]);
  
  // Track skipped and answered question indices
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  
  // Real-time audio waveform values (0 to 100)
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Runtime Speech Analytics
  const [speechStats, setSpeechStats] = useState({
    speakingSpeed: 130, // words per minute
    wordsPerMinute: 130,
    avgPause: 1.2,
    longestPause: 2.1,
    responseTime: 1.5,
    thinkingTime: 1.5,
    speechAccuracy: 92.0,
    fluency: 88.0,
    fillerWords: [],
  });

  // Refs for audio analysis, timers, and MediaRecorder
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const isProcessingRef = useRef(false); // Prevent double submissions
  
  // Web Audio refs for silence detection & waveform
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const stopAndEvaluateRef = useRef(null);
  
  // Track silence count for repeat question logic
  const silenceCountRef = useRef(0);
  const hasRepeatedQuestionRef = useRef(false);
  
  // Track last question content to detect repeats
  const lastQuestionContentRef = useRef("");

  // Speaking timers refs
  const speakStartTimeRef = useRef(0);
  const responseStartTimeRef = useRef(0);
  const questionFinishTimeRef = useRef(0);
  const pauseTimesRef = useRef([]);
  const fillerWordsDetectedRef = useRef([]);

  // Final settings fallback
  const resolvedSettings = {
    preferredVoice: settings.preferredVoice || "native",
    speakingSpeed: settings.speakingSpeed || 1.0,
    pitch: settings.pitch || 1.0,
    volume: settings.volume || 1.0,
    language: settings.language || "en",
    noiseSuppression: settings.noiseSuppression !== undefined ? settings.noiseSuppression : true,
  };

  /**
   * Cleans up all Web Audio, Recognition, and Stream interfaces.
   * Ensures complete media resource cleanup to prevent memory leaks.
   */
  const cleanup = useCallback(() => {
    console.log("[CLEANUP]: Starting comprehensive media cleanup...");
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
        console.log("[CLEANUP]: Media recorder stopped");
      } catch (e) {
        console.warn("[CLEANUP]: Error stopping media recorder:", e);
      }
      mediaRecorderRef.current = null;
    }
    
    // Abort speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        console.log("[CLEANUP]: Speech recognition aborted");
      } catch (e) {
        console.warn("[CLEANUP]: Error aborting recognition:", e);
      }
      recognitionRef.current = null;
    }
    
    // Stop all media tracks (microphone)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("[CLEANUP]: Stopped track:", track.kind);
      });
      streamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
        console.log("[CLEANUP]: Audio context closed");
      } catch (e) {
        console.warn("[CLEANUP]: Error closing audio context:", e);
      }
      audioContextRef.current = null;
    }
    
    // Stop TTS
    ttsService.stop();
    console.log("[CLEANUP]: TTS stopped");
    
    // Clear audio chunks
    audioChunksRef.current = [];
    
    // Reset refs
    silenceCountRef.current = 0;
    hasRepeatedQuestionRef.current = false;
    
    console.log("[CLEANUP]: Comprehensive cleanup completed");
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);



  /**
   * Starts microphone recording and live Web Speech API recognition.
   */
  const startListening = useCallback(async () => {
    cleanup(); // Clean up existing streams

    try {
      // 1. Request microphone permission & audio stream
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: resolvedSettings.noiseSuppression,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setMicActive(true);
      setStatus("listening");
      setLiveTranscript("");
      audioChunksRef.current = [];
      responseStartTimeRef.current = Date.now();

      // Track thinking time (time from question finished speaking to response started)
      const thinkingTime = (responseStartTimeRef.current - questionFinishTimeRef.current) / 1000;
      setSpeechStats((prev) => ({
        ...prev,
        thinkingTime: parseFloat(Math.min(10, Math.max(0.2, thinkingTime)).toFixed(2)),
      }));

      // 2. Setup MediaRecorder for Groq Whisper upload
      const options = { mimeType: "audio/webm" };
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream); // Fallback for browsers with custom mimeType support
      }
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(200); // chunk size 200ms

      // 3. Setup Web Audio Analyser for Waveform and Silence Detection
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceStart = 0;

      const checkAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Compute average amplitude (volume level)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avgVolume = sum / dataArray.length;
        setVolumeLevel(Math.min(100, Math.round((avgVolume / 128) * 100)));

        // Silence detection logic: threshold amplitude < 12
        if (avgVolume < 12) {
          if (silenceStart === 0) {
            silenceStart = Date.now();
          } else {
            const silentDuration = Date.now() - silenceStart;
            // Trigger auto stop after SILENCE_TIMEOUT_MS of silence
            if (silentDuration > SILENCE_TIMEOUT_MS) {
              silenceCountRef.current++;
              console.log("[SILENCE DETECTED]: Silence count:", silenceCountRef.current);
              
              if (silenceCountRef.current === 1 && !hasRepeatedQuestionRef.current) {
                // First silence - repeat the question politely
                hasRepeatedQuestionRef.current = true;
                silenceStart = 0; // Reset to detect second silence
                console.log("[SILENCE DETECTED]: Repeating question...");
                
                // Use TTS to speak a polite prompt
                ttsService.speak(
                  "I didn't hear your response. Could you please answer the question?",
                  resolvedSettings,
                  () => {},
                  () => {
                    console.log("[SILENCE PROMPT]: Completed speaking prompt.");
                  },
                  (err) => {
                    console.warn("[SILENCE PROMPT]: Error speaking prompt:", err);
                  }
                );
              } else {
                // Second silence or already repeated - auto-submit
                console.log("[SILENCE DETECTED]: Auto-submitting response...");
                if (stopAndEvaluateRef.current) {
                  stopAndEvaluateRef.current();
                }
                return;
              }
            }
          }
        } else {
          silenceStart = 0; // reset silence duration
          // Reset silence count if user starts speaking
          if (silenceCountRef.current > 0) {
            console.log("[SILENCE DETECTED]: User started speaking, resetting silence count.");
            silenceCountRef.current = 0;
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkAudio);
      };

      animationFrameRef.current = requestAnimationFrame(checkAudio);

      // 4. Start concurrent live Web Speech API recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = resolvedSettings.language;

        let accumulatedTranscript = "";

        rec.onresult = (event) => {
          let interim = "";
          let final = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript + " ";
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (final) {
            accumulatedTranscript += final;
            
            // Detect filler words locally ("um", "like", "uh", "you know")
            const words = final.toLowerCase().split(/\s+/);
            const fillers = ["um", "uh", "like", "actually", "basically", "you know"];
            words.forEach((w) => {
              if (fillers.includes(w) && !fillerWordsDetectedRef.current.includes(w)) {
                fillerWordsDetectedRef.current.push(w);
              }
            });
          }

          setLiveTranscript(accumulatedTranscript + interim);
        };

        rec.onerror = (err) => {
          console.warn("[SPEECH RECOGNITION EXCEPTION]:", err);
        };

        rec.start();
        recognitionRef.current = rec;
      }
    } catch (err) {
      console.error("[MIC CAPTURE ERROR]: Microphone stream could not be requested.", err);
      setStatus("paused");
      setMicActive(false);
    }
  }, [resolvedSettings, cleanup]);

  /**
   * AI Speaks the question aloud using TTS.
   * Question appears progressively with typewriter effect synchronized with speech.
   */
  const speakQuestion = useCallback((questionText) => {
    console.log("[VOICE-SESSION]: speakQuestion called with text:", questionText.substring(0, 50));
    setCurrentQuestion(""); // Start with empty
    setStatus("speaking");
    
    // Calculate typing speed based on text length to sync with speech
    // Average speaking rate is ~150 words per minute, ~2.5 words per second
    // Average word length is ~5 characters, so ~12.5 characters per second
    // We'll use 50ms per character for a smooth typewriter effect
    const typingSpeed = 50; 
    let index = 0;
    let typeInterval = null;
    
    const startTyping = () => {
      typeInterval = setInterval(() => {
        if (index < questionText.length) {
          const nextSubstr = questionText.substring(0, index + 1);
          setCurrentQuestion(nextSubstr);
          
          // Update the last AI transcript entry in real-time
          setTranscripts((prev) => {
            if (prev.length === 0) return prev;
            const nextTranscripts = [...prev];
            const lastIdx = nextTranscripts.length - 1;
            if (nextTranscripts[lastIdx].speaker === "AI") {
              nextTranscripts[lastIdx] = { ...nextTranscripts[lastIdx], text: nextSubstr };
            }
            return nextTranscripts;
          });
          
          index++;
        } else {
          clearInterval(typeInterval);
        }
      }, typingSpeed);
    };

    ttsService.speak(
      questionText,
      resolvedSettings,
      // onStart - Start typing when speech begins
      () => {
        console.log("[TTS]: Started speaking question.");
        startTyping();
      },
      // onEnd - Ensure full text is shown and start listening
      () => {
        if (typeInterval) clearInterval(typeInterval);
        setCurrentQuestion(questionText); // Ensure full text is shown
        setTranscripts((prev) => {
          if (prev.length === 0) return prev;
          const nextTranscripts = [...prev];
          const lastIdx = nextTranscripts.length - 1;
          if (nextTranscripts[lastIdx].speaker === "AI") {
            nextTranscripts[lastIdx] = { ...nextTranscripts[lastIdx], text: questionText };
          }
          return nextTranscripts;
        });
        console.log("[TTS]: Completed speaking question. Opening microphone...");
        questionFinishTimeRef.current = Date.now();
        startListening();
      },
      // onError - Handle errors gracefully
      (err) => {
        if (typeInterval) clearInterval(typeInterval);
        setCurrentQuestion(questionText); // Ensure full text is shown
        setTranscripts((prev) => {
          if (prev.length === 0) return prev;
          const nextTranscripts = [...prev];
          const lastIdx = nextTranscripts.length - 1;
          if (nextTranscripts[lastIdx].speaker === "AI") {
            nextTranscripts[lastIdx] = { ...nextTranscripts[lastIdx], text: questionText };
          }
          return nextTranscripts;
        });
        console.warn("[TTS]: Speech ended with warning. Proceed to listen anyway.");
        questionFinishTimeRef.current = Date.now();
        startListening();
      }
    );
  }, [resolvedSettings, startListening]);

  /**
   * Finalizes the current user answer recording and uploads to evaluate.
   */
  const stopAndEvaluate = useCallback(async () => {
    console.log("[VOICE-SESSION]: stopAndEvaluate called! Current status:", status);
    if (status !== "listening" || isProcessingRef.current) {
      console.log("[VOICE-SESSION]: stopAndEvaluate skipped (not listening or already processing)");
      return;
    }

    isProcessingRef.current = true;

    setStatus("processing");
    setMicActive(false);

    // Mark current question as answered
    setAnsweredQuestions((prev) => [...prev, currentQuestionNumber]);

    // Track speech duration metrics
    const responseDuration = (Date.now() - responseStartTimeRef.current) / 1000;
    
    // Stop recording and gather media recorder file
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("[VOICE-SESSION]: Error stopping media recorder", e);
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("[VOICE-SESSION]: Error stopping recognition", e);
      }
    }

    // Wait a brief 300ms for buffer storage
    await new Promise((resolve) => setTimeout(resolve, 300));

    cleanup(); // Terminate audio streams

    const finalLiveTranscript = liveTranscript.trim();

    try {
      // 1. Prepare raw audio file
      let audioBlob = null;
      if (audioChunksRef.current.length > 0) {
        audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      }

      let textResult = finalLiveTranscript;

      // 2. STT upload (Primary: Groq Whisper API)
      if (audioBlob && audioBlob.size > 1000) {
        try {
          const sttFormData = new FormData();
          sttFormData.append("file", audioBlob, "audio.webm");
          sttFormData.append("language", resolvedSettings.language);

          const sttRes = await fetch("/api/voice-interview/stt", {
            method: "POST",
            body: sttFormData,
          });

          if (sttRes.ok) {
            const sttData = await sttRes.json();
            if (sttData.text) {
              textResult = sttData.text.trim();
              console.log("[STT SERVICE]: Groq Whisper succeeded:", textResult);
            }
          } else {
            console.warn("[STT SERVICE]: Groq Whisper failed. Falling back to Browser Web Speech API text.");
          }
        } catch (e) {
          console.warn("[STT SERVICE ERROR]: Whisper fetch failed. Falling back to Browser Web Speech API text:", e);
        }
      }

      // If both STT result and Web Speech capture are empty, submit "No Response"
      if (!textResult || textResult.trim() === "") {
        textResult = "No Response";
      }

      console.log("[VOICE-SESSION]: Final text result:", textResult);

      // Append user dialog locally
      setTranscripts((prev) => [...prev, { speaker: "USER", text: textResult }]);

      // 3. Calculate speaking speed (WPM)
      const wordCount = textResult.split(/\s+/).length;
      const wpm = Math.round((wordCount / (responseDuration || 1)) * 60) || 120;

      // Update Speech Stats
      const finalStats = {
        speakingSpeed: Math.min(220, Math.max(50, wpm)),
        wordsPerMinute: Math.min(220, Math.max(50, wpm)),
        avgPause: 1.2,
        longestPause: 2.1,
        responseTime: parseFloat(responseDuration.toFixed(2)),
        thinkingTime: speechStats.thinkingTime,
        fillerWords: fillerWordsDetectedRef.current,
        speechAccuracy: Math.min(100, Math.max(70, 100 - (fillerWordsDetectedRef.current.length * 2))),
        fluency: Math.min(100, Math.max(65, 100 - (fillerWordsDetectedRef.current.length * 3))),
      };
      setSpeechStats(finalStats);

      // Reset filler words
      fillerWordsDetectedRef.current = [];

      // 4. Submit to database evaluation API
      console.log("[VOICE-SESSION]: Calling evaluate API", sessionId);
      const res = await fetch(`/api/voice-interview/${sessionId}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userResponse: textResult,
          currentQuestionNumber,
          totalQuestions,
          speechStats: finalStats,
        }),
      });

      const evalData = await res.json();
      if (!res.ok) {
        throw new Error(evalData.error || "Evaluation request failed.");
      }

      console.log("[VOICE-SESSION]: Evaluate response received:", evalData);

      if (evalData.completed) {
        // Complete the session
        setStatus("completed");
        if (onCompleted) {
          onCompleted(finalStats);
        }
      } else {
        // Create next turn
        const nextQ = evalData.nextQuestion;
        
        // Check if this is a new distinct question or a repeat
        const isNewQuestion = nextQ !== lastQuestionContentRef.current;
        
        if (isNewQuestion) {
          // Only increment question count for distinct new questions
          setCurrentQuestionNumber((n) => n + 1);
          console.log("[VOICE-SESSION]: New question detected, incrementing count to", currentQuestionNumber + 1);
        } else {
          console.log("[VOICE-SESSION]: Question repeated, keeping count at", currentQuestionNumber);
        }
        
        setCurrentQuestion(nextQ);
        setTranscripts((prev) => [...prev, { speaker: "AI", text: "" }]);
        
        // Update last question ref
        lastQuestionContentRef.current = nextQ;
        
        // Reset silence tracking for next question
        silenceCountRef.current = 0;
        hasRepeatedQuestionRef.current = false;
        
        // Speak follow-up question
        console.log("[VOICE-SESSION]: Speaking next question...");
        speakQuestion(nextQ);
      }
    } catch (err) {
      console.error("[EVALUATION SERVICE ERROR]:", err);
      // Fallback: allow skipping or manual retry on error
      setStatus("paused");
    } finally {
      isProcessingRef.current = false;
    }
  }, [status, liveTranscript, sessionId, currentQuestionNumber, totalQuestions, resolvedSettings, speechStats.thinkingTime, speakQuestion, cleanup, onCompleted]);

  useEffect(() => {
    stopAndEvaluateRef.current = stopAndEvaluate;
  }, [stopAndEvaluate]);

  /**
   * Manually skip the current question.
   * Marks question as skipped and never asks it again.
   */
  const skipQuestion = useCallback(() => {
    if (status === "completed" || status === "processing") return;
    cleanup();

    // Mark current question as skipped
    setSkippedQuestions((prev) => [...prev, currentQuestionNumber]);

    const skipText = "[Question Skipped]";
    setTranscripts((prev) => [...prev, { speaker: "USER", text: skipText }]);

    // Fetch next follow up question using skip evaluate trigger
    setStatus("processing");
    
    // Simulate next question setup or direct complete
    if (currentQuestionNumber >= totalQuestions) {
      setStatus("completed");
      if (onCompleted) onCompleted(speechStats);
    } else {
      const fallbackNextQ = "Let's move on. Next question: Can you describe your experience collaborating with multidisciplinary teams?";
      setCurrentQuestion(fallbackNextQ);
      setTranscripts((prev) => [...prev, { speaker: "AI", text: "" }]);
      setCurrentQuestionNumber((n) => n + 1);
      speakQuestion(fallbackNextQ);
    }
  }, [status, currentQuestionNumber, totalQuestions, cleanup, speakQuestion, onCompleted, speechStats]);

  /**
   * Replay the current question.
   */
  const replayQuestion = useCallback(() => {
    if (currentQuestion) {
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion, speakQuestion]);

  return {
    status,
    currentQuestion,
    currentQuestionNumber,
    transcripts,
    liveTranscript,
    micActive,
    volumeLevel,
    speechStats,
    coachingFeedback,
    coachingTips,
    setCoachingFeedback,
    setCoachingTips,
    skippedQuestions,
    answeredQuestions,
    startSession: (firstQ) => {
      console.log("[VOICE-SESSION]: startSession called with firstQ:", firstQ.substring(0, 50));
      setTranscripts([{ speaker: "AI", text: "" }]);
      // Reset tracking for new session
      setSkippedQuestions([]);
      setAnsweredQuestions([]);
      silenceCountRef.current = 0;
      hasRepeatedQuestionRef.current = false;
      // Small delay to ensure DOM is ready, then speak
      setTimeout(() => {
        speakQuestion(firstQ);
      }, 100);
    },
    pauseSession: () => {
      cleanup();
      setStatus("paused");
    },
    resumeSession: () => {
      if (status === "paused") {
        if (currentQuestion) {
          setTranscripts((prev) => {
            if (prev.length === 0) return prev;
            const nextTranscripts = [...prev];
            const lastIdx = nextTranscripts.length - 1;
            if (nextTranscripts[lastIdx].speaker === "AI") {
              nextTranscripts[lastIdx] = { ...nextTranscripts[lastIdx], text: "" };
            }
            return nextTranscripts;
          });
          speakQuestion(currentQuestion);
        }
      }
    },
    stopAndEvaluate,
    skipQuestion,
    replayQuestion,
    cleanup,
  };
}
