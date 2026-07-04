// src/app/api/voice-interview/route.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateVoiceQuestion } from "@/lib/ai/services/voice-interview";

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
      return NextResponse.json({ error: "Unauthorized - User record not found" }, { status: 401 });
    }

    const body = await req.json();
    const {
      resumeId,
      jobDescriptionId,
      interviewType = "Mixed",
      difficulty = "MEDIUM",
      duration = 15,
      language = "en",
      voice = "native",
      videoEnabled = false,
    } = body;

    // 1. Fetch resume text if provided
    let resumeText = "";
    let roleTitle = "Professional";
    if (resumeId) {
      const resume = await db.resume.findUnique({
        where: { id: resumeId },
      });
      if (resume && resume.userId === dbUser.id) {
        resumeText = resume.rawText || "";
        roleTitle = resume.parsedData?.personalInfo?.title || roleTitle;
      }
    }

    // 2. Fetch job description content if provided
    let jobDescriptionText = "";
    let companyName = "";
    if (jobDescriptionId) {
      const jd = await db.jobDescription.findUnique({
        where: { id: jobDescriptionId },
      });
      if (jd && jd.userId === dbUser.id) {
        jobDescriptionText = jd.content || "";
        companyName = jd.company || "";
        if (jd.title) {
          roleTitle = jd.title;
        }
      }
    }

    console.log(`[VOICE INTERVIEW API]: Initializing session for User: ${dbUser.id}. Type: ${interviewType}, Diff: ${difficulty}`);

    // 3. Generate first conversational question
    const aiOutput = await generateVoiceQuestion({
      role: roleTitle,
      difficulty,
      type: interviewType,
      resumeText,
      jobDescription: jobDescriptionText,
      language,
    });

    const firstQuestionContent = aiOutput.question;
    if (!firstQuestionContent) {
      throw new Error("AI failed to output a starting mock question.");
    }

    // 4. Determine Difficulty Enum
    let difficultyEnum = "MEDIUM";
    if (difficulty === "EASY" || difficulty === "easy") difficultyEnum = "EASY";
    if (difficulty === "HARD" || difficulty === "hard") difficultyEnum = "HARD";

    const sessionTitle = `${difficultyEnum.charAt(0) + difficultyEnum.slice(1).toLowerCase()} ${interviewType} Voice Interview for ${roleTitle}`;

    // 5. Create VoiceInterviewSession in Transaction
    const session = await db.$transaction(async (tx) => {
      const sess = await tx.voiceInterviewSession.create({
        data: {
          userId: dbUser.id,
          title: sessionTitle,
          role: roleTitle,
          difficulty: difficultyEnum,
          interviewType,
          duration: parseInt(duration, 10) || 15,
          language,
          voice,
          videoEnabled,
          status: "ACTIVE",
        },
      });

      const question = await tx.voiceInterviewQuestion.create({
        data: {
          sessionId: sess.id,
          content: firstQuestionContent,
          order: 1,
        },
      });

      // Add starting transcript item
      await tx.voiceTranscript.create({
        data: {
          sessionId: sess.id,
          speaker: "AI",
          text: firstQuestionContent,
        },
      });

      return sess;
    });

    console.log(`[VOICE INTERVIEW SUCCESS]: Created session ${session.id} with first question.`);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      firstQuestion: firstQuestionContent,
    });
  } catch (error) {
    console.error("[VOICE INTERVIEW POST API EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize voice mock interview session." },
      { status: 500 }
    );
  }
}
