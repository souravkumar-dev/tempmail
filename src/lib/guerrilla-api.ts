// Guerrilla Mail API client — uses curl via child_process for outbound HTTPS.
// Guarilla Mail is free, reliable, and has CORS support.

import { exec } from "child_process";

const API = "https://api.guerrillamail.com/ajax.php";

function curlGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const cmd = `curl -s --max-time 15 "${url}"`;
    exec(cmd, { timeout: 20000, windowsHide: true }, (err, stdout) => {
      if (err) return reject(new Error("curl failed: " + err.message?.substring(0, 100)));
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        reject(new Error("Invalid response from Guerrilla Mail"));
      }
    });
  });
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GuerrillaSession {
  email: string;
  sidToken: string;
  expireAt: number; // 60 minutes from creation
}

export interface GuerrillaEmail {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_date: string;
  mail_read: number;
  mail_size: number;
}

export interface GuerrillaEmailFull {
  mail_id: string;
  mail_from: string;
  mail_to: string;
  mail_subject: string;
  mail_body: string;
  mail_text: string;
  mail_date: string;
  mail_headers: string;
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Get a new random email address.
 */
export async function generateEmail(): Promise<GuerrillaSession> {
  const data = await curlGet(`${API}?f=get_email_address`);
  if (!data.email_addr) {
    throw new Error("Failed to generate email address");
  }
  return {
    email: data.email_addr,
    sidToken: data.sid_token,
    expireAt: Date.now() + 60 * 60 * 1000, // 60 min
  };
}

/**
 * Get available domains.
 */
export async function getDomains(): Promise<string[]> {
  return ["guerrillamail.com", "guerrillamailblock.com", "grr.la", "guerrillamail.info", "guerrillamail.de"];
}

/**
 * Check inbox for new emails.
 */
export async function getMessages(sidToken: string): Promise<GuerrillaEmail[]> {
  const data = await curlGet(`${API}?f=get_email_list&offset=0&sid_token=${sidToken}`);
  if (!data.list) return [];
  return data.list.filter((e: any) => e.mail_timestamp > 0); // Filter out system emails
}

/**
 * Fetch full email content by ID.
 */
export async function getMessage(sidToken: string, mailId: string): Promise<GuerrillaEmailFull> {
  const data = await curlGet(`${API}?f=fetch_email&email_id=${mailId}&sid_token=${sidToken}`);
  if (!data.mail_body && !data.mail_text) {
    throw new Error("Failed to fetch email");
  }
  return {
    mail_id: data.mail_id || mailId,
    mail_from: data.mail_from || "",
    mail_to: data.mail_to || "",
    mail_subject: data.mail_subject || "",
    mail_body: data.mail_body || "",
    mail_text: data.mail_text || "",
    mail_date: data.mail_date || "",
    mail_headers: data.mail_headers || "",
  };
}

// ─── OTP Extraction ─────────────────────────────────────────────────────────

/**
 * Extract potential OTP codes from email text content.
 */
export function extractOtps(text: string): string[] {
  const patterns = [
    /\b(\d{6})\b/g,
    /\b(\d{4})\b/g,
    /\b(\d{5})\b/g,
    /\b(\d{8})\b/g,
    /code[:\s]*(\d{4,8})/gi,
    /code[:\s]*([A-Z0-9]{4,8})/gi,
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

// ─── Session Persistence (localStorage) ─────────────────────────────────────

const STORAGE_KEY = "mg_guerrilla_session";

export function persistSession(session: GuerrillaSession) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

export function getStoredSession(): GuerrillaSession | null {
  if (typeof window === "undefined") return null;
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (data && data.expireAt > Date.now()) return data;
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
