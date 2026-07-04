// src/services/tts/tts-service.js

class TTSService {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.activeUtterance = null;
  }

  /**
   * Speaks a block of text aloud.
   * @param {string} text - Text to read.
   * @param {object} settings - Speech preferences (preferredVoice, speakingSpeed, pitch, volume, language).
   * @param {function} [onStart] - Callback when speech starts.
   * @param {function} [onEnd] - Callback when speech completes normally.
   * @param {function} [onError] - Callback on warning/error.
   */
  speak(text, settings = {}, onStart = null, onEnd = null, onError = null) {
    if (!this.synth) {
      console.warn("[TTS SERVICE]: SpeechSynthesis is not supported on this device/browser.");
      if (onError) onError("Browser SpeechSynthesis unsupported");
      return;
    }

    // Cancel any active speak queues
    this.stop();

    const {
      preferredVoice = "native",
      speakingSpeed = 1.0,
      pitch = 1.0,
      volume = 1.0,
      language = "en",
    } = settings;

    // SpeechSynthesisUtterance initialization
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(speakingSpeed) || 1.0;
    utterance.pitch = parseFloat(pitch) || 1.0;
    utterance.volume = parseFloat(volume) || 1.0;
    utterance.lang = language;

    // Resolve voice selection if custom voice is desired
    if (preferredVoice && preferredVoice !== "native") {
      const voices = this.synth.getVoices();
      const resolvedVoice = voices.find((v) => v.name === preferredVoice || v.lang === preferredVoice);
      if (resolvedVoice) {
        utterance.voice = resolvedVoice;
      }
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = (err) => {
      console.warn("[TTS SERVICE UTTERANCE EXCEPTION]:", err);
      if (onError) onError(err);
    };

    this.activeUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Instantly stops any spoken audio streams.
   */
  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.activeUtterance = null;
  }

  /**
   * Returns a list of supported voices registered inside the browser.
   */
  getVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }
}

export const ttsService = new TTSService();
export default ttsService;
