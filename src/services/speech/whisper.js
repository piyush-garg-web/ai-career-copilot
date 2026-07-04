// src/services/speech/whisper.js

/**
 * Transcribes audio buffer using Groq Whisper Large v3 API.
 * @param {Buffer|ArrayBuffer} audioBuffer - The binary audio buffer.
 * @param {string} filename - Filename with correct extension (e.g., 'audio.webm').
 * @param {string} language - ISO 639-1 language code (e.g., 'en', 'es', 'hi').
 * @returns {Promise<string>} - The transcribed text.
 */
export async function transcribeAudio(audioBuffer, filename = "audio.webm", language = "en") {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in the environment variables.");
  }

  const formData = new FormData();
  
  // Wrap audio bytes into a Blob/File compatible format
  const audioBlob = new Blob([audioBuffer], { type: "audio/webm" });
  formData.append("file", audioBlob, filename);
  formData.append("model", "whisper-large-v3");
  
  // Only append language parameter if supported by Whisper and explicitly specified
  if (language && language !== "auto") {
    formData.append("language", language);
  }

  console.log(`[GROQ WHISPER SERVICE]: Forwarding transcription request. Model: whisper-large-v3, Language: ${language || "auto"}`);

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[GROQ WHISPER ERROR]: HTTP ${response.status} - ${response.statusText}`, errorText);
    throw new Error(`Groq Whisper transcription API failed. Status: ${response.status} (${response.statusText})`);
  }

  const data = await response.json();
  if (!data || !data.text) {
    throw new Error("Groq Whisper API returned an empty transcription response.");
  }

  return data.text.trim();
}
