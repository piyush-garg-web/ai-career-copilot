import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * DELETE /api/interviews/[id]
 * Deletes an interview session, ensuring ownership.
 */
export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session identifier." }, { status: 400 });
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

    const session = await db.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    if (session.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.interviewSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({
      success: true,
      message: "Interview session deleted successfully.",
    });
  } catch (error) {
    console.error("[INTERVIEW_SESSION_DELETE_ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete interview session." },
      { status: 500 }
    );
  }
}
