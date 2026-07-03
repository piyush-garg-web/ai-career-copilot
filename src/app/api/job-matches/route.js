import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { matchJobDescriptionWithAI } from "@/lib/ai/services/job-matcher";

/**
 * POST /api/job-matches
 * Compares an uploaded resume against a target job description and stores the result.
 */
export async function POST(req) {
  try {
    // Authenticate user session
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized - Session not found." }, { status: 401 });
    }

    // Fetch corresponding DB User
    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized - User record not found." }, { status: 401 });
    }

    // Parse parameters
    const { resumeId, content } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resume identifier." }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Missing job description content." }, { status: 400 });
    }

    // Fetch resume and verify ownership
    const resume = await db.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume document not found." }, { status: 404 });
    }

    if (resume.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden - Access denied." }, { status: 403 });
    }

    // Verify raw text is present
    if (!resume.rawText || !resume.rawText.trim()) {
      return NextResponse.json(
        { error: "Resume text has not been extracted yet. Please parse the document first." },
        { status: 400 }
      );
    }

    console.log(`[JOB MATCH]: Dispatching scan for Resume ID: ${resumeId}`);

    const matchResult = await matchJobDescriptionWithAI(
      resume.rawText,
      resume.parsedData || {},
      content.trim(),
      resume.id,
      {
        ...(dbUser.aiPreferences || {}),
        preferredLanguage: dbUser.preferredLanguage || "en"
      }
    );

    // Save JobDescription first (saves parsed title & company)
    const jobDescription = await db.jobDescription.create({
      data: {
        userId: dbUser.id,
        title: matchResult.jobTitle || "Target Job Role",
        company: matchResult.companyName || "Unknown",
        content: content.trim(),
      },
    });

    // Save JobMatch record
    const jobMatch = await db.jobMatch.create({
      data: {
        userId: dbUser.id,
        resumeId: resume.id,
        jobDescriptionId: jobDescription.id,
        matchScore: matchResult.matchScore,
        matchedSkills: matchResult.matchingSkills,
        missingSkills: matchResult.missingSkills,
        matchedKeywords: matchResult.matchingKeywords,
        missingKeywords: matchResult.missingKeywords,
        suggestions: matchResult.suggestions,
        analysis: {
          strengths: matchResult.strengths,
          weaknesses: matchResult.weaknesses,
        },
        summary: matchResult.summary,
      },
    });

    console.log(`[JOB MATCH SUCCESS]: Saved Job Match ID: ${jobMatch.id}`);

    return NextResponse.json({
      success: true,
      message: "Resume compared and matched successfully.",
      matchId: jobMatch.id,
    });
  } catch (error) {
    console.error("[JOB MATCH ROUTE EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze and match job description." },
      { status: 500 }
    );
  }
}
