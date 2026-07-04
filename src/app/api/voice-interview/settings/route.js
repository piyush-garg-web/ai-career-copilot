// src/app/api/voice-interview/settings/route.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/voice-interview/settings
export async function GET(req) {
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

    let settings = await db.voiceInterviewSettings.findUnique({
      where: { userId: dbUser.id },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await db.voiceInterviewSettings.create({
        data: {
          userId: dbUser.id,
          preferredVoice: "native",
          speakingSpeed: 1.0,
          pitch: 1.0,
          volume: 1.0,
          difficulty: "MEDIUM",
          duration: 15,
          language: dbUser.preferredLanguage || "en",
          autoSave: true,
          autoDownloadReport: false,
          noiseSuppression: true,
          enableCamera: false,
          mirrorCamera: true,
          videoResolution: "720p",
          frameRate: 30,
          showLivePreview: true,
          enableLiveCoaching: true,
          enableVideoAnalytics: true,
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("[SETTINGS GET API EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings." },
      { status: 500 }
    );
  }
}

// POST /api/voice-interview/settings
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

    const updates = await req.json();

    const settings = await db.voiceInterviewSettings.upsert({
      where: { userId: dbUser.id },
      update: {
        preferredVoice: updates.preferredVoice,
        speakingSpeed: parseFloat(updates.speakingSpeed) || undefined,
        pitch: parseFloat(updates.pitch) || undefined,
        volume: parseFloat(updates.volume) || undefined,
        difficulty: updates.difficulty,
        duration: parseInt(updates.duration, 10) || undefined,
        language: updates.language,
        autoSave: updates.autoSave !== undefined ? !!updates.autoSave : undefined,
        autoDownloadReport: updates.autoDownloadReport !== undefined ? !!updates.autoDownloadReport : undefined,
        microphoneDevice: updates.microphoneDevice,
        noiseSuppression: updates.noiseSuppression !== undefined ? !!updates.noiseSuppression : undefined,
        enableCamera: updates.enableCamera !== undefined ? !!updates.enableCamera : undefined,
        defaultCameraDevice: updates.defaultCameraDevice,
        mirrorCamera: updates.mirrorCamera !== undefined ? !!updates.mirrorCamera : undefined,
        videoResolution: updates.videoResolution,
        frameRate: parseInt(updates.frameRate, 10) || undefined,
        showLivePreview: updates.showLivePreview !== undefined ? !!updates.showLivePreview : undefined,
        enableLiveCoaching: updates.enableLiveCoaching !== undefined ? !!updates.enableLiveCoaching : undefined,
        enableVideoAnalytics: updates.enableVideoAnalytics !== undefined ? !!updates.enableVideoAnalytics : undefined,
      },
      create: {
        userId: dbUser.id,
        preferredVoice: updates.preferredVoice || "native",
        speakingSpeed: parseFloat(updates.speakingSpeed) || 1.0,
        pitch: parseFloat(updates.pitch) || 1.0,
        volume: parseFloat(updates.volume) || 1.0,
        difficulty: updates.difficulty || "MEDIUM",
        duration: parseInt(updates.duration, 10) || 15,
        language: updates.language || "en",
        autoSave: updates.autoSave !== undefined ? !!updates.autoSave : true,
        autoDownloadReport: updates.autoDownloadReport !== undefined ? !!updates.autoDownloadReport : false,
        microphoneDevice: updates.microphoneDevice || null,
        noiseSuppression: updates.noiseSuppression !== undefined ? !!updates.noiseSuppression : true,
        enableCamera: updates.enableCamera !== undefined ? !!updates.enableCamera : false,
        defaultCameraDevice: updates.defaultCameraDevice || null,
        mirrorCamera: updates.mirrorCamera !== undefined ? !!updates.mirrorCamera : true,
        videoResolution: updates.videoResolution || "720p",
        frameRate: parseInt(updates.frameRate, 10) || 30,
        showLivePreview: updates.showLivePreview !== undefined ? !!updates.showLivePreview : true,
        enableLiveCoaching: updates.enableLiveCoaching !== undefined ? !!updates.enableLiveCoaching : true,
        enableVideoAnalytics: updates.enableVideoAnalytics !== undefined ? !!updates.enableVideoAnalytics : true,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("[SETTINGS POST API EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save settings." },
      { status: 500 }
    );
  }
}
