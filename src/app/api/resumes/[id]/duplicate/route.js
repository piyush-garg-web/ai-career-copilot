import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * POST /api/resumes/[id]/duplicate
 * Duplicates a resume and its analysis details.
 */
export async function POST(req, { params }) {
  try {
    const resolvedParams = await params;
    const resumeId = resolvedParams.id;

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User record not found" }, { status: 401 });
    }

    const resume = await db.resume.findUnique({
      where: { id: resumeId },
      include: { analysis: true },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (resume.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine duplicated filename
    let dupName = `Copy of ${resume.fileName}`;
    if (dupName.length > 255) {
      dupName = dupName.substring(0, 255);
    }

    // Create duplicated resume record
    const duplicatedResume = await db.resume.create({
      data: {
        userId: dbUser.id,
        fileName: dupName,
        fileUrl: resume.fileUrl,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
        content: resume.content,
        status: resume.status,
        isPrimary: false,
      },
    });

    // Duplicate analysis if present
    if (resume.analysis) {
      await db.resumeAnalysis.create({
        data: {
          resumeId: duplicatedResume.id,
          overallScore: resume.analysis.overallScore,
          atsScore: resume.analysis.atsScore,
          analysisData: resume.analysis.analysisData,
          suggestions: resume.analysis.suggestions,
        },
      });
      
      // Update duplicated status to match original
      await db.resume.update({
        where: { id: duplicatedResume.id },
        data: { status: "ANALYZED" },
      });
    }

    return NextResponse.json({ success: true, resume: duplicatedResume });
  } catch (error) {
    console.error("[RESUME DUPLICATE EXCEPTION]:", error);
    return NextResponse.json({ error: error.message || "Failed to duplicate resume" }, { status: 500 });
  }
}
