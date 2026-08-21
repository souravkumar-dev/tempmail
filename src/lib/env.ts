// Environment Validation — validates all env vars at startup, fails fast on misconfiguration.

import { z } from "zod";

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  // SMTP Server (self-hosted mode)
  SMTP_PORT: z.coerce.number().default(25),
  SMTP_API_PORT: z.coerce.number().default(3001),
  SMTP_DATA_DIR: z.string().default("./data"),
  ALLOWED_DOMAINS: z.string().default("tempver.com"),

  // SMTP Server auth (optional — set to enable SMTP AUTH)
  SMTP_AUTH_USER: z.string().optional(),
  SMTP_AUTH_PASS: z.string().optional(),

  // External API
  GUERRILLA_MAIL_API: z.string().default("https://api.guerrillamail.com/ajax.php"),

  // Client-side
  NEXT_PUBLIC_SMTP_API_URL: z.string().default(""),
  NEXT_PUBLIC_SITE_URL: z.string().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Environment validation failed:");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  _env = result.data;
  return _env;
}

// Validate on import in production
if (process.env.NODE_ENV === "production") {
  getEnv();
}
