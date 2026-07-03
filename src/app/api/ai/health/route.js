// src/app/api/ai/health/route.js

import { NextResponse } from "next/server";
import { aiGateway } from "@/lib/ai/gateway";

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
    console.error("[AI HEALTH API EXCEPTION]:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve AI Gateway status.",
        details: error.message || "Unknown error.",
      },
      { status: 500 }
    );
  }
}
