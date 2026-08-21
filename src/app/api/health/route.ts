export const runtime = "nodejs";

import { NextResponse } from "next/server";

/**
 * GET /api/health — Health check endpoint.
 * Returns 200 if the server is running and healthy.
 * Used by Docker health checks, load balancers, and monitoring tools.
 */
export async function GET() {
  const checks: Record<string, string> = {};

  // Check Node.js process
  checks.process = "ok";
  checks.memory = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`;
  checks.uptime = `${Math.round(process.uptime())}s`;
  checks.node = process.version;
  checks.env = process.env.NODE_ENV || "development";

  // Check SMTP API connectivity (if configured)
  const smtpUrl = process.env.NEXT_PUBLIC_SMTP_API_URL;
  if (smtpUrl && !smtpUrl.includes("localhost")) {
    try {
      const res = await fetch(`${smtpUrl}/api/mail/stats?address=_health@x.com`, {
        signal: AbortSignal.timeout(3000),
      });
      checks.smtp_server = res.ok ? "ok" : `error:${res.status}`;
    } catch {
      checks.smtp_server = "unreachable";
    }
  } else {
    checks.smtp_server = "not_configured";
  }

  const allHealthy = Object.values(checks).every(
    (v) => v === "ok" || v === "not_configured" || !v.startsWith("error")
  );

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
