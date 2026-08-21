/**
 * Email Service — Unified client
 * Handles both self-hosted SMTP and Guerrilla Mail fallback.
 * Works on Vercel serverless — no child_process, no native modules.
 */

import {
  generateEmail,
  getMessages,
  getMessage,
  type GuerrillaEmail,
  type GuerrillaEmailFull,
} from "@/lib/guerrilla-api";

const SMTP_API_URL = process.env.NEXT_PUBLIC_SMTP_API_URL || "";

// ── Types ──────────────────────────────────────────────────────────────

export interface EmailSession {
  mode: "self-hosted" | "guerrilla";
  address: string;
  sidToken?: string;
  token?: string;
  sessionId?: string;
  expireAt?: number;
}

export interface ParsedEmail {
  id: string | number;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_text?: string;
  mail_body?: string;
  mail_date: string;
  mail_read: boolean;
  otpCodes: string[];
}

// ── OTP Extraction ─────────────────────────────────────────────────────

function extractOtpCodes(text: string): string[] {
  if (!text) return [];
  const patterns = [
    /(?:verification|otp|code|pin|token|verify)[^\d]*(\d{4,8})/gi,
    /(\d{4,8})\s*(?:is your|is the|is your verification)/gi,
    /(?:your (?:code|otp|pin|token|verification) (?:is|code))[:\s]*(\d{4,8})/gi,
    /(\d{6})/g,
    /(\d{4})/g,
  ];
  const codes = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      codes.add(match[1]);
    }
  }
  return Array.from(codes);
}

// ── Session Persistence (localStorage) ─────────────────────────────────

const SESSION_KEY = "mailghost_session";

export function persistSession(session: EmailSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
}

export function getStoredSession(): EmailSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: EmailSession = JSON.parse(raw);
    // Check if expired (Guerrilla sessions expire after ~60 min)
    if (session.expireAt && Date.now() > session.expireAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

// ── Guerrilla Mail (Client-side) ───────────────────────────────────────

/**
 * Create a new Guerrilla Mail session via our API route.
 */
export async function createGuerrillaSession(): Promise<EmailSession> {
  const res = await fetch("/api/accounts", { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create email");
  }

  const data = await res.json();
  const session: EmailSession = {
    mode: "guerrilla",
    address: data.email || data.address,
    sidToken: data.token || data.sessionId,
    expireAt: Date.now() + 60 * 60 * 1000, // 60 minutes
  };

  persistSession(session);
  return session;
}

/**
 * Restore a Guerrilla Mail session (from localStorage).
 */
export function restoreGuerrillaSession(session: EmailSession): EmailSession {
  return { ...session, mode: "guerrilla" };
}

/**
 * Fetch messages from Guerrilla Mail via our API route.
 */
export async function fetchGuerrillaMessages(
  sidToken: string
): Promise<ParsedEmail[]> {
  const res = await fetch("/api/messages", {
    headers: { "x-sid-token": sidToken },
  });
  if (!res.ok) throw new Error("Failed to fetch messages");

  const data = await res.json();
  const messages: GuerrillaEmail[] = data.messages || [];

  return messages.map((m) => ({
    id: m.mail_id,
    mail_from: m.mail_from || "Unknown",
    mail_subject: m.mail_subject || "(no subject)",
    mail_excerpt: m.mail_excerpt || "",
    mail_date: m.mail_time || "",
    mail_read: m.mail_read === "1",
    otpCodes: extractOtpCodes(`${m.mail_subject} ${m.mail_excerpt}`),
  }));
}

/**
 * Fetch a full message from Guerrilla Mail via our API route.
 */
export async function fetchGuerrillaMessage(
  sidToken: string,
  messageId: string
): Promise<ParsedEmail | null> {
  const res = await fetch(`/api/messages/${messageId}`, {
    headers: { "x-sid-token": sidToken },
  });
  if (!res.ok) return null;

  const data: GuerrillaEmailFull = await res.json();
  const body = data.mail_body || data.mail_text || "";

  return {
    id: data.mail_id,
    mail_from: data.mail_from || "Unknown",
    mail_subject: data.mail_subject || "(no subject)",
    mail_excerpt: body.substring(0, 200),
    mail_text: body,
    mail_body: body,
    mail_date: data.mail_time || "",
    mail_read: true,
    otpCodes: extractOtpCodes(body),
  };
}

// ── Self-Hosted SMTP (Client-side) ────────────────────────────────────

export async function isSmtpAvailable(): Promise<boolean> {
  if (!SMTP_API_URL) return false;
  if (SMTP_API_URL.includes("localhost") || SMTP_API_URL.includes("127.0.0.1")) {
    return false;
  }
  try {
    const res = await fetch(`${SMTP_API_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function generateSelfHostedEmail(
  prefix?: string
): Promise<EmailSession> {
  const res = await fetch(`${SMTP_API_URL}/api/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: prefix }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create email");
  }
  const data = await res.json();
  const session: EmailSession = {
    mode: "self-hosted",
    address: data.address || data.email,
    token: data.token,
    sessionId: data.sessionId,
  };
  persistSession(session);
  return session;
}

export async function fetchSelfHostedMessages(
  _address: string
): Promise<ParsedEmail[]> {
  // Messages are fetched via session, not address — placeholder
  return [];
}

export async function fetchSelfHostedMessage(
  _messageId: number
): Promise<ParsedEmail | null> {
  return null;
}
