// src/app/api/ai/run-tests/route.js

import { NextResponse } from "next/server";
import { aiGateway, AIServiceError } from "@/lib/ai/gateway";
import { generateJSONContent } from "@/lib/ai/service";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/run-tests
 * Offline-first, deterministic test suite for verifying the AI Gateway orchestrator.
 * Dynamically stubs the active provider to test all 10 production scenarios:
 * 1. Primary Model Success
 * 2. Cache Miss
 * 3. Cache Hit
 * 4. Concurrent Request Deduplication
 * 5. Multi-Model Fallback Chain
 * 6. Rate Limiting Queue spacing
 * 7. Temporary Failure Retries
 * 8. Quota Exceeded Error translation
 * 9. Invalid API Key Error translation
 * 10. Timeout Error translation
 */
export async function GET() {
  const results = [];
  
  // Save original gateway state to restore later
  const originalProvider = aiGateway.provider;
  const originalModels = [...aiGateway.providerConfig.models];
  
  try {
    console.log("[AI GATEWAY TEST]: Initiating deterministic offline-first test suite.");

    // ----------------------------------------------------
    // Scenario 1 & 2: Success / Cache Miss & Hit
    // ----------------------------------------------------
    let successCallCount = 0;
    aiGateway.providerConfig.models = ["gemini-test-primary"];
    aiGateway.provider = {
      generateJSON: async ({ model }) => {
        successCallCount++;
        return { status: "success", model };
      },
    };
    
    // Clear cache
    aiGateway.clearCache();

    const testText = `test_resume_${Date.now()}`;
    const cacheContext = {
      feature: "resume-analysis",
      resumeText: testText,
    };

    // Run 1: Cache Miss
    const start1 = Date.now();
    const res1 = await generateJSONContent({
      prompt: "Execute test",
      cacheContext,
    });
    const duration1 = Date.now() - start1;

    results.push({
      test: "Primary Model Success / Cache Miss",
      success: res1 && res1.status === "success" && successCallCount === 1,
      duration: `${duration1}ms`,
    });

    // Run 2: Cache Hit (Immediate, should not call provider)
    const start2 = Date.now();
    const res2 = await generateJSONContent({
      prompt: "Execute test",
      cacheContext,
    });
    const duration2 = Date.now() - start2;

    results.push({
      test: "Intelligent Caching (Cache Hit)",
      success: res2 && res2.status === "success" && successCallCount === 1 && duration2 < 20,
      duration: `${duration2}ms`,
    });

    // ----------------------------------------------------
    // Scenario 3: Request Deduplication
    // ----------------------------------------------------
    let dedupCalls = 0;
    aiGateway.provider = {
      generateJSON: async () => {
        dedupCalls++;
        // Simulate minor API latency (50ms) to allow concurrency overlap
        await new Promise((r) => setTimeout(r, 50));
        return { dedup: true };
      },
    };

    const dedupText = `dedup_resume_${Date.now()}`;
    const dedupContext = {
      feature: "resume-analysis",
      resumeText: dedupText,
    };

    const startDedup = Date.now();
    // Dispatch 3 concurrent requests
    const [p1, p2, p3] = await Promise.all([
      generateJSONContent({ prompt: "Deduplication test", cacheContext: dedupContext }),
      generateJSONContent({ prompt: "Deduplication test", cacheContext: dedupContext }),
      generateJSONContent({ prompt: "Deduplication test", cacheContext: dedupContext }),
    ]);
    const durationDedup = Date.now() - startDedup;

    results.push({
      test: "Concurrent Request Deduplication",
      success: p1 && p2 && p3 && p1.dedup === true && dedupCalls === 1,
      duration: `${durationDedup}ms`,
      callsExecuted: dedupCalls,
    });

    // ----------------------------------------------------
    // Scenario 4: Multi-Model Fallback
    // ----------------------------------------------------
    let model0Calls = 0;
    let model1Calls = 0;
    aiGateway.providerConfig.models = ["gemini-model-primary", "gemini-model-fallback"];
    
    aiGateway.provider = {
      generateJSON: async ({ model }) => {
        if (model === "gemini-model-primary") {
          model0Calls++;
          throw new AIServiceError("Simulated Quota limit", "QUOTA_EXHAUSTED", { retryable: false });
        }
        if (model === "gemini-model-fallback") {
          model1Calls++;
          return { status: "fallback_ok", model };
        }
      },
    };

    const fallbackRes = await generateJSONContent({
      prompt: "Fallback query",
      cacheContext: { feature: "resume-analysis", resumeText: `fallback_${Date.now()}` },
    });

    results.push({
      test: "Automatic Model Fallback (Primary -> Fallback)",
      success: fallbackRes && fallbackRes.status === "fallback_ok" && model0Calls === 1 && model1Calls === 1,
      modelUsed: fallbackRes?.model,
    });

    // ----------------------------------------------------
    // Scenario 5: Retry Logic
    // ----------------------------------------------------
    let retryCalls = 0;
    aiGateway.providerConfig.models = ["gemini-model-retry"];
    aiGateway.provider = {
      generateJSON: async () => {
        retryCalls++;
        if (retryCalls < 3) {
          // Fail the first two times with a retryable transient failure
          throw new AIServiceError("Temporary network error", "TEMPORARY_FAILURE", { retryable: true });
        }
        return { status: "retry_ok" };
      },
    };

    // Temporarily reduce retry delay for fast test execution
    const originalDelay = aiGateway.providerConfig.retryDelayMs;
    aiGateway.providerConfig.retryDelayMs = 10; 

    const retryRes = await generateJSONContent({
      prompt: "Retry query",
      cacheContext: { feature: "resume-analysis", resumeText: `retry_${Date.now()}` },
    });

    // Restore delay
    aiGateway.providerConfig.retryDelayMs = originalDelay;

    results.push({
      test: "Transient Failure Retries (Succeeds after retries)",
      success: retryRes && retryRes.status === "retry_ok" && retryCalls === 3,
      attempts: retryCalls,
    });

    // ----------------------------------------------------
    // Scenario 6: Rate Limiting / Queue Spacing
    // ----------------------------------------------------
    aiGateway.provider = {
      generateJSON: async () => ({ rate: "ok" }),
    };
    aiGateway.providerConfig.models = ["gemini-fast-stub"];

    const startRate = Date.now();
    // Fire 2 rapid requests sequentially (not parallel, so we verify queuing separation)
    const pA = generateJSONContent({
      prompt: "Rate test A",
      cacheContext: { feature: "resume-analysis", resumeText: `rateA_${Date.now()}` },
    });
    const pB = generateJSONContent({
      prompt: "Rate test B",
      cacheContext: { feature: "resume-analysis", resumeText: `rateB_${Date.now()}` },
    });
    
    await Promise.all([pA, pB]);
    const rateDuration = Date.now() - startRate;

    // Must be spaced by the queue delay (minDelayMs = 300ms)
    results.push({
      test: "Rate Limiting & Queue Execution Timing",
      success: rateDuration >= 270, // 30ms tolerance
      duration: `${rateDuration}ms`,
    });

    // ----------------------------------------------------
    // Scenario 7: Quota Exceeded Normalization
    // ----------------------------------------------------
    aiGateway.provider = {
      generateJSON: async () => {
        throw new AIServiceError("RESOURCE_EXHAUSTED", "QUOTA_EXHAUSTED", { retryable: false });
      },
    };

    try {
      await generateJSONContent({
        prompt: "Trigger quota error",
        cacheContext: { feature: "resume-analysis", resumeText: `quota_${Date.now()}` },
      });
      results.push({ test: "Error Normalization (Quota Exceeded)", success: false });
    } catch (e) {
      results.push({
        test: "Error Normalization (Quota Exceeded)",
        success: e.message === "The AI service has temporarily reached its usage limit. Please try again later.",
        details: e.message,
      });
    }

    // ----------------------------------------------------
    // Scenario 8: Invalid Key Normalization
    // ----------------------------------------------------
    aiGateway.provider = {
      generateJSON: async () => {
        throw new AIServiceError("Invalid key", "INVALID_API_KEY", { retryable: false });
      },
    };

    try {
      await generateJSONContent({
        prompt: "Trigger invalid key",
        cacheContext: { feature: "resume-analysis", resumeText: `badkey_${Date.now()}` },
      });
      results.push({ test: "Error Normalization (Invalid Key)", success: false });
    } catch (e) {
      results.push({
        test: "Error Normalization (Invalid Key)",
        success: e.message === "AI configuration error.",
        details: e.message,
      });
    }

    // ----------------------------------------------------
    // Scenario 9: Timeout Normalization
    // ----------------------------------------------------
    aiGateway.provider = {
      generateJSON: async () => {
        throw new AIServiceError("Deadline exceeded", "TIMEOUT", { retryable: true });
      },
    };

    try {
      await generateJSONContent({
        prompt: "Trigger timeout",
        cacheContext: { feature: "resume-analysis", resumeText: `timeout_${Date.now()}` },
      });
      results.push({ test: "Error Normalization (Timeout)", success: false });
    } catch (e) {
      results.push({
        test: "Error Normalization (Timeout)",
        success: e.message === "AI service is taking longer than expected.",
        details: e.message,
      });
    }

  } catch (error) {
    console.error("[AI GATEWAY TESTS GLOBAL FAILURE]:", error);
    results.push({
      test: "Global Test Execution Suitability",
      success: false,
      details: error.message || error,
    });
  } finally {
    // Restore original gateway status
    aiGateway.provider = originalProvider;
    aiGateway.providerConfig.models = originalModels;
    aiGateway.clearCache();
    console.log("[AI GATEWAY TEST]: Cleaned up and restored original provider state.");
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    overallPassed: results.every((r) => r.success),
    resultsCount: results.length,
    results,
  });
}
