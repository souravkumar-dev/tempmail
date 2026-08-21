// Client-side API wrapper — calls our Next.js API routes which proxy to Guerrilla Mail.

export interface Session {
  email: string;
  sidToken: string;
  expireAt: number;
}

export interface MailMessage {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_date: string;
  mail_read: number;
  mail_size: number;
}

export interface MailMessageFull {
  mail_id: string;
  mail_from: string;
  mail_to: string;
  mail_subject: string;
  mail_body: string;
  mail_text: string;
  mail_date: string;
  mail_headers: string;
}

// ─── Storage ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "mg_session";

function persistSession(session: Session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

function getStoredSession(): Session | null {
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
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredEmail(): string | null {
  const s = getStoredSession();
  return s?.email || null;
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Generate a new temp email.
 */
export async function createAccount(): Promise<Session> {
  const res = await fetch("/api/accounts", { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Failed to create email");
  }
  const session: Session = await res.json();
  persistSession(session);
  return session;
}

/**
 * Restore previous session from localStorage.
 */
export function restoreSession(): Session | null {
  return getStoredSession();
}

/**
 * Fetch inbox messages.
 */
export async function getMessages(sidToken: string): Promise<MailMessage[]> {
  const res = await fetch("/api/messages", {
    headers: { "x-sid-token": sidToken },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Failed to fetch messages");
  }
  const data = await res.json();
  return data.messages || [];
}

/**
 * Fetch full message content by ID.
 */
export async function getMessage(
  sidToken: string,
  messageId: string
): Promise<MailMessageFull> {
  const res = await fetch(`/api/messages/${messageId}`, {
    headers: { "x-sid-token": sidToken },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Failed to fetch message");
  }
  return res.json();
}

// ─── OTP Extraction ─────────────────────────────────────────────────────────

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
