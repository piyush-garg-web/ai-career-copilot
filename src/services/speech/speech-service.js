// src/services/speech/speech-service.js

/**
 * Unified Speech-to-Text service with automatic fallback.
 * Primary: Groq Whisper Large v3
 * Fallback: Browser Web Speech API
 */

import { transcribeAudio as transcribeWithGroq } from './whisper';
import { browserSpeech } from './browser-speech';

/**
 * Transcribe audio with automatic fallback
 * @param {Buffer|ArrayBuffer} audioBuffer - The binary audio buffer
 * @param {string} filename - Filename with correct extension
 * @param {string} language - ISO 639-1 language code
 * @param {Object} options - Additional options
 * @param {boolean} options.forceBrowser - Force use of browser API
 * @returns {Promise<string>} - The transcribed text
 */
export async function transcribeAudio(audioBuffer, filename = 'audio.webm', language = 'en', options = {}) {
  const { forceBrowser = false } = options;

  // If forced to use browser, skip Groq
  if (forceBrowser) {
    console.log('[SPEECH SERVICE]: Using browser Speech API (forced)');
    return transcribeWithBrowser(language);
  }

  // Try Groq Whisper first
  try {
    console.log('[SPEECH SERVICE]: Attempting Groq Whisper transcription...');
    const text = await transcribeWithGroq(audioBuffer, filename, language);
    console.log('[SPEECH SERVICE]: Groq Whisper transcription successful');
    return text;
  } catch (groqError) {
    console.warn('[SPEECH SERVICE]: Groq Whisper failed, falling back to browser Speech API:', groqError.message);
    
    // Check if browser supports speech recognition
    if (!browserSpeech.isSupported()) {
      throw new Error('Both Groq Whisper and browser Speech API are unavailable. Please check your browser support or API keys.');
    }

    // Fallback to browser
    try {
      return await transcribeWithBrowser(language);
    } catch (browserError) {
      console.error('[SPEECH SERVICE]: Browser Speech API also failed:', browserError.message);
      throw new Error(`Speech transcription failed. Groq: ${groqError.message}, Browser: ${browserError.message}`);
    }
  }
}

/**
 * Transcribe using browser Web Speech API
 * @param {string} language - ISO 639-1 language code
 * @returns {Promise<string>} - The transcribed text
 */
async function transcribeWithBrowser(language) {
  console.log('[SPEECH SERVICE]: Using browser Web Speech API for transcription');
  return browserSpeech.transcribe(language);
}

/**
 * Check speech recognition availability
 * @returns {Object} - Availability status
 */
export function getSpeechRecognitionStatus() {
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const browserSupported = browserSpeech.isSupported();

  return {
    groqAvailable: hasGroqKey,
    browserAvailable: browserSupported,
    primaryMethod: hasGroqKey ? 'groq' : 'browser',
    fallbackAvailable: hasGroqKey ? browserSupported : false,
  };
}
