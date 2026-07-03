// src/app/api/ai/health/route.js

import { NextResponse } from "next/server";
import { aiGateway } from "@/lib/ai/gateway";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/health
 * Returns aggregated metrics, cache effectiveness, fallback occurrences, and active model state.
 */
export async function GET() {
  try {
    const healthStatus = aiGateway.getHealthStatus();
    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error("[AI HEALTH API GET EXCEPTION]:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve AI Gateway status.",
        details: error.message || "Unknown error.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/health
 * Clears AI Gateway in-memory cache, unlinks cache files, and resets performance metrics back to zero.
 */
export async function DELETE() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    aiGateway.clearCache();
    const healthStatus = aiGateway.getHealthStatus();
    return NextResponse.json({
      success: true,
      message: "AI Gateway cache cleared and performance metrics reset.",
      stats: healthStatus,
    });
  } catch (error) {
    console.error("[AI HEALTH API DELETE EXCEPTION]:", error);
    return NextResponse.json(
      {
        error: "Failed to clear AI Gateway cache.",
        details: error.message || "Unknown error.",
      },
      { status: 500 }
    );
  }
}
