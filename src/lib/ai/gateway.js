// src/lib/ai/gateway.js

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AI_CONFIG } from "./config";
import { GeminiAIProvider } from "./providers/gemini";
import { OpenAIProvider } from "./providers/openai";
import { GrokProvider } from "./providers/grok";
import { AIServiceError } from "./providers/base";

class RequestQueue {
  constructor(minDelayMs) {
    this.minDelayMs = minDelayMs;
    this.lastCallTime = 0;
    this.queue = [];
    this.running = false;
  }

  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.run();
    });
  }

  async run() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift();
      const now = Date.now();
      const timeSinceLast = now - this.lastCallTime;
      const delay = Math.max(0, this.minDelayMs - timeSinceLast);

      if (delay > 0) {
        await new Promise((r) => setTimeout(r, delay));
      }

      this.lastCallTime = Date.now();
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.running = false;
  }
}

class AIGateway {
  constructor() {
    this.config = AI_CONFIG;
    
    // Instantiate all available providers
    this.providers = {};
    this.providerNames = [];
    
    // Always include configured primary provider first
    const primaryProvider = AI_CONFIG.activeProvider;
    this.providerNames.push(primaryProvider);
    
    // Add fallback providers (excluding primary to avoid duplicates)
    if (AI_CONFIG.providerFallbacks) {
      for (const provider of AI_CONFIG.providerFallbacks) {
        if (!this.providerNames.includes(provider)) {
          this.providerNames.push(provider);
        }
      }
    }
    
    // Initialize providers
    for (const providerName of this.providerNames) {
      const providerConfig = AI_CONFIG.providers[providerName];
      if (providerName === "gemini") {
        this.providers[providerName] = new GeminiAIProvider(providerConfig);
      } else if (providerName === "openai") {
        this.providers[providerName] = new OpenAIProvider(providerConfig);
      } else if (providerName === "grok") {
        this.providers[providerName] = new GrokProvider(providerConfig);
      }
    }

    // Setup file paths for persistence
    this.cacheFilePath = path.join(process.cwd(), AI_CONFIG.cache.persistFile);
    this.usageFilePath = path.join(process.cwd(), AI_CONFIG.logging.persistFile);

    // Initialize State
    this.cache = new Map();
    this.activeRequests = new Map(); // For Deduplication
    this.queue = new RequestQueue(AI_CONFIG.rateLimiting.minDelayMs);
    
    this.stats = {
      requests: 0,
      successes: 0,
      failures: 0,
      fallbacks: 0,
      totalDurationMs: 0,
      cacheHits: 0,
      quotaErrors: 0,
    };

    // Load persisted cache & stats if available
    this._loadCache();
    this._loadStats();
  }

  /**
   * Internal helper to load cache from file system.
   */
  _loadCache() {
    if (!AI_CONFIG.cache.enabled) return;
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, "utf8");
        const parsed = JSON.parse(raw);
        this.cache = new Map(parsed);
        console.log(`[AI GATEWAY]: Loaded ${this.cache.size} cached items from disk.`);
      }
    } catch (e) {
      console.warn("[AI GATEWAY]: Could not load persisted cache (likely read-only FS or malformed JSON):", e.message);
    }
  }

  /**
   * Internal helper to parse and load statistics from persisted logs.
   */
  _loadStats() {
    try {
      if (fs.existsSync(this.usageFilePath)) {
        const raw = fs.readFileSync(this.usageFilePath, "utf8");
        const logs = JSON.parse(raw);
        if (Array.isArray(logs) && logs.length > 0) {
          let requests = logs.length;
          let successes = 0;
          let failures = 0;
          let fallbacks = 0;
          let totalDurationMs = 0;
          let cacheHits = 0;
          let quotaErrors = 0;

          logs.forEach((log) => {
            if (log.success) successes++;
            else failures++;
            
            if (log.cacheHit) cacheHits++;
            if (log.fallbackUsed) fallbacks++;
            if (log.durationMs) totalDurationMs += log.durationMs;
            if (log.errorType === "QUOTA_EXHAUSTED") quotaErrors++;
          });

          this.stats = {
            requests,
            successes,
            failures,
            fallbacks,
            totalDurationMs,
            cacheHits,
            quotaErrors,
          };
          console.log(`[AI GATEWAY]: Initialized stats from persisted usage logs. Requests: ${requests}`);
        }
      }
    } catch (e) {
      console.warn("[AI GATEWAY]: Could not load persisted stats:", e.message);
    }
  }

  /**
   * Internal helper to save cache to file system.
   */
  async _saveCache() {
    if (!AI_CONFIG.cache.enabled) return;
    try {
      const data = JSON.stringify(Array.from(this.cache.entries()), null, 2);
      await fs.promises.writeFile(this.cacheFilePath, data, "utf8");
    } catch (e) {
      // Silent catch for serverless read-only filesystems (e.g. Vercel)
    }
  }

  /**
   * Internal helper to record and persist usage logs.
   */
  async _logUsage(entry) {
    if (this.config.logging.consoleVerbose) {
      console.log(
        `[AI GATEWAY LOG]: Feature: ${entry.feature}, Model: ${entry.model}, ` +
        `Duration: ${entry.durationMs}ms, Success: ${entry.success}, ` +
        `CacheHit: ${entry.cacheHit}, FallbackUsed: ${entry.fallbackUsed || "None"}, ` +
        `ErrorType: ${entry.errorType || "None"}`
      );
    }

    try {
      let logs = [];
      if (fs.existsSync(this.usageFilePath)) {
        const raw = await fs.promises.readFile(this.usageFilePath, "utf8");
        logs = JSON.parse(raw);
      }
      logs.push({
        timestamp: new Date().toISOString(),
        ...entry,
      });
      // Cap log size at 1000 items in development to prevent bloating files
      if (logs.length > 1000) {
        logs.shift();
      }
      await fs.promises.writeFile(this.usageFilePath, JSON.stringify(logs, null, 2), "utf8");
    } catch (e) {
      // Silent catch
    }
  }

  /**
   * SHA-256 Hash helper.
   */
  _hash(text) {
    return crypto.createHash("sha256").update(text).digest("hex");
  }

  /**
   * Evaluates cache keys based on custom feature strategies.
   */
  _getCacheKey(cacheContext) {
    if (!cacheContext || !cacheContext.feature) return null;

    const { feature } = cacheContext;

    switch (feature) {
      case "resume-analysis":
        if (!cacheContext.resumeText) return null;
        return `resume-analysis_${this._hash(cacheContext.resumeText)}`;

      case "job-match":
        if (!cacheContext.resumeId || !cacheContext.jobDescription) return null;
        return `job-match_${cacheContext.resumeId}_${this._hash(cacheContext.jobDescription)}`;

      case "interview-questions":
        const { role, difficulty, count, type } = cacheContext;
        if (!role || !difficulty || !count || !type) return null;
        const questionsString = `${role.toLowerCase()}_${difficulty.toLowerCase()}_${count}_${type.toLowerCase()}`;
        return `interview-questions_${this._hash(questionsString)}`;

      case "interview-evaluation":
        const { questionContent, userAnswer } = cacheContext;
        if (!questionContent || !userAnswer) return null;
        return `interview-eval_${this._hash(questionContent + "_" + userAnswer)}`;

      case "interview-scorecard":
        const { roleName, scorecardDifficulty, questionData } = cacheContext;
        if (!roleName || !scorecardDifficulty || !questionData) return null;
        return `interview-scorecard_${this._hash(roleName + "_" + scorecardDifficulty + "_" + JSON.stringify(questionData))}`;

      default:
        return null;
    }
  }

  /**
   * Generates a request hash for deduplication.
   */
  _getRequestHash({ prompt, systemInstruction, temperature, model }) {
    const raw = `${prompt || ""}_${systemInstruction || ""}_${temperature || 0.1}_${model || ""}`;
    return this._hash(raw);
  }

  /**
   * Primary entry point for structured JSON model calls.
   */
  async generateJSON(params) {
    return this._executeCall("json", params);
  }

  /**
   * Entry point for raw text generation.
   */
  async generateText(params) {
    return this._executeCall("text", params);
  }

  /**
   * Core orchestrator method. Handles caching, deduplication, queueing, fallback, retries and tracking.
   */
  async _executeCall(type, params) {
    const startTime = Date.now();
    this.stats.requests++;

    const { prompt, systemInstruction, temperature, maxTokens, cacheContext } = params;

    // 1. Caching Layer
    const cacheKey = this._getCacheKey(cacheContext);
    if (cacheKey && AI_CONFIG.cache.enabled) {
      const cachedEntry = this.cache.get(cacheKey);
      if (cachedEntry && (Date.now() - cachedEntry.timestamp < AI_CONFIG.cache.ttlMs)) {
        this.stats.cacheHits++;
        const duration = Date.now() - startTime;
        
        await this._logUsage({
          feature: cacheContext.feature,
          model: cachedEntry.model,
          durationMs: duration,
          success: true,
          cacheHit: true,
          fallbackUsed: null,
          errorType: null,
        });

        this.stats.successes++;
        return cachedEntry.data;
      }
    }

    // 2. Deduplication Layer
    const firstProviderName = this.providerNames[0];
    const firstProviderConfig = AI_CONFIG.providers[firstProviderName];
    const reqHash = this._getRequestHash({
      prompt,
      systemInstruction,
      temperature,
      model: firstProviderConfig.models[0],
    });

    if (this.activeRequests.has(reqHash)) {
      console.log(`[AI GATEWAY]: Deduplicating identical request. Waiting on running promise...`);
      return this.activeRequests.get(reqHash);
    }

    // Wrap execution logic to place in activeRequests & run in Queue
    const executionPromise = (async () => {
      let lastError = null;
      let fallbackUsed = null;

      // Provider Fallback Loop
      for (let providerIndex = 0; providerIndex < this.providerNames.length; providerIndex++) {
        const providerName = this.providerNames[providerIndex];
        const provider = this.providers[providerName];
        const providerConfig = AI_CONFIG.providers[providerName];
        
        // Skip if provider doesn't have API key configured
        if (!providerConfig.apiKey) {
          console.warn(`[AI GATEWAY]: Skipping provider ${providerName} (no API key configured)`);
          continue;
        }
        
        console.log(`[AI GATEWAY]: Trying provider: ${providerName}`);
        
        // Model Fallback Loop within this provider
        let modelIndex = 0;
        while (modelIndex < providerConfig.models.length) {
          const model = providerConfig.models[modelIndex];
          let attempt = 0;
          const maxRetries = providerConfig.retries;

          // Retry Loop for current model
          while (attempt <= maxRetries) {
            try {
              // Run standard provider model call inside the rate limiting Queue
              const result = await this.queue.enqueue(async () => {
                if (type === "json") {
                  return await provider.generateJSON({
                    prompt,
                    systemInstruction,
                    temperature,
                    maxTokens,
                    model,
                  });
                } else {
                  return await provider.generateText({
                    prompt,
                    systemInstruction,
                    temperature,
                    maxTokens,
                    model,
                  });
                }
              });

              // Success: update metrics & cache
              const duration = Date.now() - startTime;
              this.stats.successes++;
              this.stats.totalDurationMs += duration;

              if (cacheKey && AI_CONFIG.cache.enabled) {
                this.cache.set(cacheKey, {
                  timestamp: Date.now(),
                  model,
                  data: result,
                });
                await this._saveCache();
              }

              await this._logUsage({
                feature: cacheContext?.feature || "generic",
                model,
                durationMs: duration,
                success: true,
                cacheHit: false,
                fallbackUsed,
                errorType: null,
              });

              return result;

            } catch (error) {
              lastError = error;
              console.warn(
                `[AI GATEWAY WARN]: Attempt ${attempt + 1}/${maxRetries + 1} failed on provider ${providerName}, model ${model}. ` +
                `Code: ${error.code || "unknown"}, Message: ${error.message}`
              );

              // Handle Quota limit metrics
              if (error.code === "QUOTA_EXHAUSTED") {
                this.stats.quotaErrors++;
              }

              // Decide whether to retry this model or immediately fail/fallback
              if (error.retryable && attempt < maxRetries) {
                attempt++;
                const delay = providerConfig.retryDelayMs * attempt;
                await new Promise((r) => setTimeout(r, delay));
              } else {
                // Non-retryable error, or retries exhausted: break retry loop and try next model
                break;
              }
            }
          }

          // Current model failed. Walk to the next fallback model.
          modelIndex++;
          if (modelIndex < providerConfig.models.length) {
            this.stats.fallbacks++;
            fallbackUsed = providerConfig.models[modelIndex];
            console.warn(`[AI GATEWAY FALLBACK]: Switch to fallback model: ${fallbackUsed}`);
          }
        }
        
        // All models failed for this provider, try next provider
        if (providerIndex < this.providerNames.length - 1) {
          const nextProviderName = this.providerNames[providerIndex + 1];
          this.stats.fallbacks++;
          fallbackUsed = `provider:${nextProviderName}`;
          console.warn(`[AI GATEWAY PROVIDER FALLBACK]: Switching to provider: ${nextProviderName}`);
        }
      }

      // All providers and models exhausted
      this.stats.failures++;
      const duration = Date.now() - startTime;

      await this._logUsage({
        feature: cacheContext?.feature || "generic",
        model: firstProviderConfig.models[0],
        durationMs: duration,
        success: false,
        cacheHit: false,
        fallbackUsed: null,
        errorType: lastError?.code || "API_ERROR",
      });

      throw lastError || new Error("AI Gateway failed to execute request.");
    })();

    // Set map for deduplication
    this.activeRequests.set(reqHash, executionPromise);

    try {
      return await executionPromise;
    } finally {
      this.activeRequests.delete(reqHash);
    }
  }

  /**
   * Health & monitoring metrics summary.
   */
  getHealthStatus() {
    const fallbackRate = this.stats.requests > 0 ? this.stats.fallbacks / this.stats.requests : 0;
    const cacheHitRate = this.stats.requests > 0 ? this.stats.cacheHits / this.stats.requests : 0;
    const avgResponseTimeMs = this.stats.successes > 0 ? this.stats.totalDurationMs / this.stats.successes : 0;

    return {
      requests: this.stats.requests,
      successes: this.stats.successes,
      failures: this.stats.failures,
      fallbackRate: parseFloat(fallbackRate.toFixed(3)),
      avgResponseTimeMs: parseFloat(avgResponseTimeMs.toFixed(0)),
      cacheHitRate: parseFloat(cacheHitRate.toFixed(3)),
      quotaErrors: this.stats.quotaErrors,
      activeProviders: this.providerNames,
      providerHealth: this.stats.failures > 3 && this.stats.successes === 0 ? "DEGRADED" : "OK",
    };
  }

  clearCache() {
    this.cache.clear();
    try {
      if (fs.existsSync(this.cacheFilePath)) fs.unlinkSync(this.cacheFilePath);
      if (fs.existsSync(this.usageFilePath)) fs.unlinkSync(this.usageFilePath);
    } catch (e) {
      console.warn("[AI GATEWAY]: Error clearing disk caches:", e.message);
    }
    this.stats = {
      requests: 0,
      successes: 0,
      failures: 0,
      fallbacks: 0,
      totalDurationMs: 0,
      cacheHits: 0,
      quotaErrors: 0,
    };
    console.log("[AI GATEWAY]: Cache and usage logs cleared, stats reset.");
  }
}

// Preserve singleton across hot reloads in Next.js development mode
const globalForAIGateway = globalThis;

export const aiGateway = globalForAIGateway.aiGateway || new AIGateway();

if (process.env.NODE_ENV !== "production") {
  globalForAIGateway.aiGateway = aiGateway;
}

export { AIServiceError };
