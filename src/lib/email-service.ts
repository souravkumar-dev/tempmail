// Email Service — Auto-detects self-hosted SMTP server or falls back to Guerrilla Mail.

const SMTP_API = process.env.NEXT_PUBLIC_SMTP_API_URL || "";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StoredEmail {
  id: number;
  from_address: string;
  to_address: string;
  subject: string;
  text_body: string;
  html_body: string;
  otp_codes: string;
  received_at: string;
  is_read: number;
}

export interface ParsedEmail {
  id: number | string;
  mail_from: string;
  mail_to: string;
  mail_subject: string;
  mail_text: string;
  mail_body: string;
  otpCodes: string[];
  mail_date: string;
  mail_read: number;
  mail_excerpt: string;
}

export interface EmailSession {
  address: string;
  mode: "self-hosted" | "guerrilla";
  sidToken?: string;       // For Guerrilla Mail
  expireAt?: number;       // For Guerrilla Mail (60min)
  createdAt: number;       // For self-hosted (no expiry)
}

// ─── Mode Detection ─────────────────────────────────────────────────────────

let _smtpAvailable: boolean | null = null;

/**
 * Check if the self-hosted SMTP server is reachable.
 * Uses a tiny image probe instead of fetch to avoid Service Worker interception.
 * Only called on user action (Generate click), never on mount.
 */
export async function isSmtpAvailable(): Promise<boolean> {
  if (_smtpAvailable !== null) return _smtpAvailable;

  // No URL configured — guerrilla mode
  if (!SMTP_API || !SMTP_API.startsWith("http")) {
    _smtpAvailable = false;
    return false;
  }

  // If the URL points to localhost, the SMTP server likely isn't running locally.
  // Skip the probe entirely to avoid Service Worker fetch errors.
  try {
    const host = new URL(SMTP_API).hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      _smtpAvailable = false;
      return false;
    }
  } catch {
    _smtpAvailable = false;
    return false;
  }

  // Only probe real (non-localhost) deployed SMTP servers.
  // If deploying with Docker on a real server, the URL will be
  // e.g. https://mail.yourdomain.com — we can safely probe it.
  try {
    const res = await fetch(`${SMTP_API}/api/mail/stats?address=_probe@x.com`, {
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });
    _smtpAvailable = res.ok;
    return _smtpAvailable;
  } catch {
    _smtpAvailable = false;
    return false;
  }
}

// ─── Self-Hosted Mode ───────────────────────────────────────────────────────

export function generateSelfHostedEmail(customPrefix?: string): EmailSession {
  const prefix = customPrefix || generateRandomPrefix();
  let domain = "tempver.com";
  if (SMTP_API && !SMTP_API.includes("localhost")) {
    try {
      domain = new URL(SMTP_API).hostname.replace("mail.", "");
    } catch {}
  }
  return {
    address: `${prefix}@${domain}`,
    mode: "self-hosted",
    createdAt: Date.now(),
  };
}

function generateRandomPrefix(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function fetchSelfHostedMessages(address: string): Promise<ParsedEmail[]> {
  try {
    const res = await fetch(`${SMTP_API}/api/mail/messages?address=${encodeURIComponent(address)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.messages || []).map((msg: StoredEmail) => ({
      id: msg.id,
      mail_from: msg.from_address,
      mail_to: msg.to_address,
      mail_subject: msg.subject,
      mail_text: msg.text_body,
      mail_body: msg.html_body,
      otpCodes: JSON.parse(msg.otp_codes || "[]"),
      mail_date: msg.received_at,
      mail_read: msg.is_read,
      mail_excerpt: (msg.text_body || "").substring(0, 200),
    }));
  } catch (err: any) {
    console.error("[self-hosted] fetchMessages error:", err.message);
    return [];
  }
}

export async function fetchSelfHostedMessage(id: number): Promise<ParsedEmail | null> {
  try {
    const res = await fetch(`${SMTP_API}/api/mail/message/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const msg: StoredEmail = await res.json();
    return {
      id: msg.id,
      mail_from: msg.from_address,
      mail_to: msg.to_address,
      mail_subject: msg.subject,
      mail_text: msg.text_body,
      mail_body: msg.html_body,
      otpCodes: JSON.parse(msg.otp_codes || "[]"),
      mail_date: msg.received_at,
      mail_read: 1,
      mail_excerpt: (msg.text_body || "").substring(0, 200),
    };
  } catch {
    return null;
  }
}

// ─── Guerrilla Mail Mode (Fallback) ─────────────────────────────────────────

import {
  createAccount as gmCreateAccount,
  restoreSession as gmRestoreSession,
  getMessages as gmGetMessages,
  getMessage as gmGetMessage,
  clearSession as gmClearSession,
  extractOtps as gmExtractOtps,
  type Session as GMSession,
  type MailMessage,
} from "./mailtm-api";

export async function createGuerrillaSession(): Promise<EmailSession> {
  const session = await gmCreateAccount();
  return {
    address: session.email,
    mode: "guerrilla",
    sidToken: session.sidToken,
    expireAt: session.expireAt,
    createdAt: Date.now(),
  };
}

export function restoreGuerrillaSession(): EmailSession | null {
  const s = gmRestoreSession();
  if (!s) return null;
  return {
    address: s.email,
    mode: "guerrilla",
    sidToken: s.sidToken,
    expireAt: s.expireAt,
    createdAt: Date.now(),
  };
}

export async function fetchGuerrillaMessages(sidToken: string): Promise<ParsedEmail[]> {
  const msgs = await gmGetMessages(sidToken);
  return msgs.map((m: MailMessage) => ({
    id: m.mail_id,
    mail_from: m.mail_from,
    mail_to: "",
    mail_subject: m.mail_subject,
    mail_text: "",
    mail_body: "",
    otpCodes: gmExtractOtps(m.mail_excerpt),
    mail_date: m.mail_date,
    mail_read: m.mail_read,
    mail_excerpt: m.mail_excerpt,
  }));
}

export async function fetchGuerrillaMessage(sidToken: string, messageId: string): Promise<ParsedEmail | null> {
  const full = await gmGetMessage(sidToken, messageId);
  return {
    id: full.mail_id,
    mail_from: full.mail_from,
    mail_to: full.mail_to,
    mail_subject: full.mail_subject,
    mail_text: full.mail_text || full.mail_body,
    mail_body: full.mail_body,
    otpCodes: gmExtractOtps(full.mail_text || full.mail_body),
    mail_date: full.mail_date,
    mail_read: 1,
    mail_excerpt: (full.mail_text || full.mail_body || "").substring(0, 200),
  };
}

export function clearGuerrillaSession() {
  gmClearSession();
}

// ─── Unified API ────────────────────────────────────────────────────────────

// Session persistence (localStorage)
const SESSION_KEY = "mg_email_session";

export function persistSession(session: EmailSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
}

export function getStoredSession(): EmailSession | null {
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!data) return null;
    // Check expiry for Guerrilla mode
    if (data.mode === "guerrilla" && data.expireAt && data.expireAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
  clearGuerrillaSession();
}
