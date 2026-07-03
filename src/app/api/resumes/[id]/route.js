import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * DELETE /api/resumes/[id]
 * Deletes a resume record by its database ID, ensuring ownership.
 */
export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const resumeId = resolvedParams.id;

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resume identifier." }, { status: 400 });
    }

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
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume document not found." }, { status: 404 });
    }

    if (resume.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.resume.delete({
      where: { id: resumeId },
    });

    return NextResponse.json({
      success: true,
      message: "Resume document deleted successfully.",
    });
  } catch (error) {
    console.error("[RESUME DELETE EXCEPTION]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resume document." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/resumes/[id]
 * Updates resume properties (rename or set primary).
 */
export async function PATCH(req, { params }) {
  try {
    const resolvedParams = await params;
    const resumeId = resolvedParams.id;
    const body = await req.json();

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
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (resume.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData = {};

    // 1. Handle Rename
    if (typeof body.fileName === "string" && body.fileName.trim().length > 0) {
      updateData.fileName = body.fileName.trim();
    }

    // 2. Handle Set Primary
    if (body.isPrimary === true) {
      // Set all other user resumes to isPrimary: false
      await db.resume.updateMany({
        where: { userId: dbUser.id },
        data: { isPrimary: false },
      });
      updateData.isPrimary = true;

      let resumePreferences = dbUser.resumePreferences || {};
      if (typeof resumePreferences !== "object" || Array.isArray(resumePreferences)) {
        resumePreferences = {};
      }
      resumePreferences.defaultResumeId = resumeId;
      await db.user.update({
        where: { id: dbUser.id },
        data: { resumePreferences },
      });
    } else if (body.isPrimary === false) {
      updateData.isPrimary = false;

      let resumePreferences = dbUser.resumePreferences || {};
      if (typeof resumePreferences !== "object" || Array.isArray(resumePreferences)) {
        resumePreferences = {};
      }
      if (resumePreferences.defaultResumeId === resumeId) {
        resumePreferences.defaultResumeId = "";
        await db.user.update({
          where: { id: dbUser.id },
          data: { resumePreferences },
        });
      }
    }

    const updated = await db.resume.update({
      where: { id: resumeId },
      data: updateData,
    });

    return NextResponse.json({ success: true, resume: updated });
  } catch (error) {
    console.error("[RESUME PATCH EXCEPTION]:", error);
    return NextResponse.json({ error: error.message || "Failed to update resume" }, { status: 500 });
  }
}
