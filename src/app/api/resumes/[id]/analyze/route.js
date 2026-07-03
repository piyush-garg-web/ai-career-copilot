import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { analyzeResumeWithAI } from "@/lib/ai/services/resume-analyzer";

/**
 * POST /api/resumes/[id]/analyze
 * Executes AI analysis on a parsed resume and upserts the structured result.
 */
export async function POST(req, { params }) {
  try {
    // Resolve dynamic params asynchronously as required by Next.js 15
    const resolvedParams = await params;
    const resumeId = resolvedParams.id;

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resume identifier." }, { status: 400 });
    }

    // Authenticate user via Clerk
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

    // Fetch the target resume and verify ownership
    const resume = await db.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume document not found." }, { status: 404 });
    }

    if (resume.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden - Access denied." }, { status: 403 });
    }

    // Ensure raw text has been extracted first
    if (!resume.rawText || !resume.rawText.trim()) {
      return NextResponse.json(
        { error: "Resume text has not been extracted yet. Please parse the document first." },
        { status: 400 }
      );
    }

    // Transition status to ANALYZING in database
    await db.resume.update({
      where: { id: resume.id },
      data: { status: "ANALYZING" },
    });

    console.log(`[RESUME ANALYSIS]: Commencing Gemini AI analysis for Resume ID: ${resumeId}`);

    // Call the AI analysis service
    const analysisResult = await analyzeResumeWithAI(
      resume.rawText,
      resume.parsedData || {},
      {
        ...(dbUser.aiPreferences || {}),
        preferredLanguage: dbUser.preferredLanguage || "en"
      }
    );

    // Save or update the analysis record in the database
    // We use upsert to avoid duplicate records for the same resume
    const resumeAnalysis = await db.resumeAnalysis.upsert({
      where: { resumeId: resume.id },
      update: {
        overallScore: analysisResult.overallScore,
        atsScore: analysisResult.atsScore,
        skillsScore: analysisResult.skillsScore,
        experienceScore: analysisResult.experienceScore,
        educationScore: analysisResult.educationScore,
        projectsScore: analysisResult.projectsScore,
        grammarScore: analysisResult.grammarScore,
        scoreBreakdown: {
          strengths: analysisResult.strengths,
          weaknesses: analysisResult.weaknesses,
        },
        suggestions: analysisResult.suggestions,
        keywords: {
          missingKeywords: analysisResult.missingKeywords,
        },
        summary: analysisResult.summary,
      },
      create: {
        resumeId: resume.id,
        overallScore: analysisResult.overallScore,
        atsScore: analysisResult.atsScore,
        skillsScore: analysisResult.skillsScore,
        experienceScore: analysisResult.experienceScore,
        educationScore: analysisResult.educationScore,
        projectsScore: analysisResult.projectsScore,
        grammarScore: analysisResult.grammarScore,
        scoreBreakdown: {
          strengths: analysisResult.strengths,
          weaknesses: analysisResult.weaknesses,
        },
        suggestions: analysisResult.suggestions,
        keywords: {
          missingKeywords: analysisResult.missingKeywords,
        },
        summary: analysisResult.summary,
      },
    });

    // Transition status to ANALYZED in database
    await db.resume.update({
      where: { id: resume.id },
      data: { status: "ANALYZED" },
    });

    console.log(`[RESUME ANALYSIS SUCCESS]: Saved Analysis ID: ${resumeAnalysis.id} for Resume ID: ${resumeId}`);

    return NextResponse.json({
      success: true,
      message: "Resume analyzed successfully and metrics recorded.",
      analysisId: resumeAnalysis.id,
      resumeId: resume.id,
    });
  } catch (error) {
    console.error("[RESUME ANALYSIS EXCEPTION]:", error);

    // Save failure state in the database and reset status to ERROR
    try {
      const resolvedParams = await params;
      const resumeId = resolvedParams.id;
      if (resumeId) {
        await db.resume.update({
          where: { id: resumeId },
          data: { status: "ERROR" },
        });
      }
    } catch (dbError) {
      console.error("Failed to write analysis failure status to database:", dbError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to analyze resume document." },
      { status: 500 }
    );
  }
}
