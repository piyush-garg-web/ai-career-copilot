// src/lib/ai/config.js

export const AI_CONFIG = {
  // Active provider: "gemini" | "openai" (easily switchable)
  activeProvider: process.env.AI_PROVIDER || "gemini",

  // Providers configurations
  providers: {
    gemini: {
      // Configuration fallback list order
      models: [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash",
      ],
      apiKey: process.env.GEMINI_API_KEY || "",
      retries: 2,
      retryDelayMs: 1500,
      timeoutMs: 25000,
    },
    openai: {
      models: [
        "gpt-4o-mini",
        "gpt-4o",
      ],
      apiKey: process.env.OPENAI_API_KEY || "",
      retries: 2,
      retryDelayMs: 1500,
      timeoutMs: 25000,
    },
  },

  // Intelligent caching configuration
  cache: {
    enabled: true,
    ttlMs: 24 * 60 * 60 * 1000, // 24 hours
    persistFile: ".ai-gateway-cache.json",
  },

  // Internal request scheduling & rate-limiting to avoid free tier burst 429 errors
  rateLimiting: {
    minDelayMs: 300, // 300ms minimum gap between consecutive model queries
    maxQueueSize: 100,
  },

  // Usage & monitoring logs
  logging: {
    persistFile: ".ai-gateway-usage.json",
    consoleVerbose: true,
  },
};
