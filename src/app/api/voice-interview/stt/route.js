// src/app/api/voice-interview/stt/route.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { transcribeAudio } from "@/services/speech/whisper";

export async function POST(req) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const language = formData.get("language") || "en";

    if (!file) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }

    console.log(`[STT API]: Received audio file: ${file.name}, Size: ${file.size} bytes, Language: ${language}`);

    // Convert file to ArrayBuffer and then Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Groq Whisper service
    const text = await transcribeAudio(buffer, file.name, language);

    console.log(`[STT API SUCCESS]: Transcription: "${text}"`);
    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("[STT API EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to transcribe audio." },
      { status: 500 }
    );
  }
}
