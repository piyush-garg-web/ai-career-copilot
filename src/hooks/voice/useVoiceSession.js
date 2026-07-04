// src/hooks/voice/useVoiceSession.js

import { useState, useEffect, useRef, useCallback } from "react";
import { ttsService } from "@/services/tts/tts-service";

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
   */
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    ttsService.stop();
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  /**
   * AI Speaks the question aloud using TTS.
   */
  const speakQuestion = useCallback((questionText) => {
    console.log("[VOICE-SESSION]: speakQuestion called with text:", questionText.substring(0, 50));
    setCurrentQuestion(""); // Start with empty
    setStatus("speaking");
    
    // Simulate dynamic text display with typing effect
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < questionText.length) {
        setCurrentQuestion(questionText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30); // Adjust speed here (30ms per character)

    ttsService.speak(
      questionText,
      resolvedSettings,
      // onStart
      () => {
        console.log("[TTS]: Started speaking question.");
      },
      // onEnd
      () => {
        clearInterval(typeInterval);
        setCurrentQuestion(questionText); // Ensure full text is shown
        console.log("[TTS]: Completed speaking question. Opening microphone...");
        questionFinishTimeRef.current = Date.now();
        startListening();
      },
      // onError
      (err) => {
        clearInterval(typeInterval);
        setCurrentQuestion(questionText); // Ensure full text is shown
        console.warn("[TTS]: Speech ended with warning. Proceed to listen anyway.");
        questionFinishTimeRef.current = Date.now();
        startListening();
      }
    );
  }, [resolvedSettings]);

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
            // Trigger auto stop after 5 seconds of silence
            if (silentDuration > 5000) {
              console.log("[SILENCE DETECTED]: Auto-submitting response...");
              stopAndEvaluate();
              return;
            }
          }
        } else {
          silenceStart = 0; // reset silence duration
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

      // If both STT result and Web Speech capture are empty, submit a fallback response text
      if (!textResult) {
        textResult = "Could not record clear audio answer.";
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
        setCurrentQuestion(nextQ);
        setTranscripts((prev) => [...prev, { speaker: "AI", text: nextQ }]);
        setCurrentQuestionNumber((n) => n + 1);
        
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

  /**
   * Manually skip the current question.
   */
  const skipQuestion = useCallback(() => {
    if (status === "completed" || status === "processing") return;
    cleanup();

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
      setTranscripts((prev) => [...prev, { speaker: "AI", text: fallbackNextQ }]);
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
    startSession: (firstQ) => {
      console.log("[VOICE-SESSION]: startSession called with firstQ:", firstQ.substring(0, 50));
      setTranscripts([{ speaker: "AI", text: firstQ }]);
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
