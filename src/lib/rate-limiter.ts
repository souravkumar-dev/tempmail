// Rate Limiter — sliding window counter per IP address.
// Production note: replace with Redis-backed limiter for multi-instance deployments.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  max: 30,               // 30 requests per minute
};

// Preset configs for different endpoints
export const RATE_LIMITS = {
  /** Standard API — 30 req/min */
  api: DEFAULT_CONFIG,
  /** Email generation — 5 req/min (expensive operation) */
  generate: { windowMs: 60 * 1000, max: 5 },
  /** Inbox polling — 60 req/min (frequent, lightweight) */
  poll: { windowMs: 60 * 1000, max: 60 },
} as const;

/**
 * Check and increment rate limit for a given key (usually IP address).
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Window expired or new key — reset
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.max - 1, resetAt };
  }

  // Within window — increment
  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract client IP from request headers (supports proxied requests).
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
