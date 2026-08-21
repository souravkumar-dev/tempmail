// Next.js Middleware — runs on every request.
// Adds security headers, rate limiting, and CORS for API routes.

import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store (per-instance, resets on restart)
// For multi-instance deployments, use Redis.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
      if (entry.resetAt < now) rateLimitStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

function getRateLimit(ip: string, path: string): { allowed: boolean; remaining: number; resetAt: number } {
  // Different limits per endpoint type
  let max = 60;    // Default: 60 req/min
  let windowMs = 60_000;

  if (path.startsWith("/api/accounts") || path.startsWith("/api/mail")) {
    max = 10;  // Generation: 10 req/min
  } else if (path.startsWith("/api/messages")) {
    max = 30;  // Polling: 30 req/min
  }

  const now = Date.now();
  const key = `${ip}:${path.split("?")[0]}`;
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    // Prevent clickjacking
    "X-Frame-Options": "DENY",
    // XSS protection
    "X-XSS-Protection": "1; mode=block",
    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Permissions policy — disable camera, mic, geolocation
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    // HSTS (only in production over HTTPS)
    ...(process.env.NODE_ENV === "production"
      ? { "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload" }
      : {}),
    // Content Security Policy
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vitals.vercel-insights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.guerrillamail.com http://localhost:3001",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "127.0.0.1";

  const response = NextResponse.next();

  // ── Security Headers (all routes) ──────────────────────────────
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  // ── CORS for API routes ────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-sid-token, x-email-address");
    response.headers.set("Access-Control-Max-Age", "86400");

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    // ── Rate Limiting for API routes ──────────────────────────────
    const rl = getRateLimit(ip, pathname);
    response.headers.set("X-RateLimit-Remaining", String(rl.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(rl.resetAt / 1000)));

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            ...Object.fromEntries(response.headers),
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
