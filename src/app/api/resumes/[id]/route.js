import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * DELETE /api/resumes/[id]
 * Deletes a resume record by its database ID, ensuring ownership.
 */
export async function DELETE(req, { params }) {
  try {
    // Resolve dynamic params asynchronously in Next.js 15
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

    // Delete the resume record from the database
    await db.resume.delete({
      where: { id: resumeId },
    });

    console.log(`[RESUME DELETE]: Successfully deleted resume ID: ${resumeId} for User ID: ${dbUser.id}`);

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
