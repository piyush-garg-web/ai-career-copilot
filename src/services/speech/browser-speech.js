// src/services/speech/browser-speech.js

/**
 * Browser Web Speech API fallback for speech-to-text.
 * Used when Groq Whisper API is unavailable or quota exhausted.
 */

class BrowserSpeechRecognition {
  constructor() {
    this.recognition = null;
    this.isSupported = false;
    this.isListening = false;
    
    // Check browser support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        this.isSupported = true;
      }
    }
  }

  /**
   * Transcribe audio using browser Web Speech API
   * @param {string} language - ISO 639-1 language code (e.g., 'en', 'es', 'hi')
   * @returns {Promise<string>} - The transcribed text
   */
  async transcribe(language = 'en') {
    if (!this.isSupported) {
      throw new Error('Browser Speech Recognition is not supported in this browser.');
    }

    if (this.isListening) {
      throw new Error('Speech recognition is already in progress.');
    }

    return new Promise((resolve, reject) => {
      this.isListening = true;
      
      // Set language
      this.recognition.lang = language;
      
      // Handle result
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        console.log(`[BROWSER SPEECH]: Transcribed with confidence ${confidence.toFixed(2)}: "${transcript}"`);
        resolve(transcript.trim());
      };

      // Handle errors
      this.recognition.onerror = (event) => {
        this.isListening = false;
        console.error('[BROWSER SPEECH ERROR]:', event.error);
        
        const errorMessages = {
          'no-speech': 'No speech detected. Please try again.',
          'audio-capture': 'Microphone not available or permission denied.',
          'not-allowed': 'Microphone permission denied.',
          'network': 'Network error occurred during speech recognition.',
          'aborted': 'Speech recognition was aborted.',
        };
        
        reject(new Error(errorMessages[event.error] || `Speech recognition error: ${event.error}`));
      };

      // Handle end
      this.recognition.onend = () => {
        this.isListening = false;
      };

      // Start recognition
      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  /**
   * Abort current recognition
   */
  abort() {
    if (this.isListening && this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Check if browser supports speech recognition
   */
  static isSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

// Export singleton instance
export const browserSpeech = new BrowserSpeechRecognition();

// Export class for testing
export { BrowserSpeechRecognition };
