import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * GET /api/resumes
 * Lists all resumes of the authenticated user.
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User record not found" }, { status: 404 });
    }

    const resumes = await db.resume.findMany({
      where: { userId: dbUser.id },
      include: { analysis: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("[GET_RESUMES_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
