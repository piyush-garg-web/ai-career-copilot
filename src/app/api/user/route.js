import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * GET /api/user
 * Fetches the authenticated user's profile and settings.
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[GET_USER_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/user
 * Updates the authenticated user's profile and settings details.
 */
export async function POST(req) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      bio,
      location,
      linkedinUrl,
      targetRole,
      targetIndustry,
      experienceLevel,
      careerGoals,
      theme,
    } = body;

    // Validate experience level if provided
    const validExpLevels = ["ENTRY", "MID", "SENIOR", "EXECUTIVE"];
    if (experienceLevel && !validExpLevels.includes(experienceLevel)) {
      return NextResponse.json({ error: "Invalid experience level" }, { status: 400 });
    }

    // Validate theme if provided
    const validThemes = ["LIGHT", "DARK", "SYSTEM"];
    if (theme && !validThemes.includes(theme)) {
      return NextResponse.json({ error: "Invalid theme type" }, { status: 400 });
    }

    // Update DB record
    const updatedUser = await db.user.update({
      where: { clerkId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(targetRole !== undefined && { targetRole }),
        ...(targetIndustry !== undefined && { targetIndustry }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(careerGoals !== undefined && { careerGoals }),
        ...(theme !== undefined && { theme }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[POST_USER_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
