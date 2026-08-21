/**
 * Guerrilla Mail API Client
 * Works on Vercel serverless — uses native fetch, no child_process
 */

const GUERRILLA_API = "https://api.guerrillamail.com/ajax.php";

// ── Types ──────────────────────────────────────────────────────────────
export interface GuerrillaSession {
  sid_token: string;
  email_addr: string;
}

export interface GuerrillaEmail {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_time: string;
  mail_read: string;
  mail_size: string;
}

export interface GuerrillaEmailFull {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_body: string;
  mail_text?: string;
  mail_time: string;
}

// ── Helpers ────────────────────────────────────────────────────────────
async function apiGet(action: string, params: Record<string, string> = {}) {
  const url = new URL(GUERRILLA_API);
  url.searchParams.set("f", action);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "MailGhost/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Guerrilla API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Create a new Guerrilla Mail session and return a disposable email.
 * This is the function called by POST /api/accounts
 */
export async function generateEmail(): Promise<{
  email: string;
  sessionId: string;
  token: string;
  address: string;
}> {
  const data = await apiGet("get_email_address");
  const email = data.email_addr as string;
  return {
    email,
    sessionId: data.sid_token,
    token: data.sid_token,
    address: email,
  };
}

/**
 * Fetch inbox messages for a session.
 * This is the function called by GET /api/messages
 */
export async function getMessages(
  sidToken: string
): Promise<GuerrillaEmail[]> {
  const data = await apiGet("check_email", {
    seq: "0",
    sid_token: sidToken,
  });
  return (data.list || []) as GuerrillaEmail[];
}

/**
 * Fetch a single message by ID.
 * This is the function called by GET /api/messages/[id]
 */
export async function getMessage(
  sidToken: string,
  emailId: string
): Promise<GuerrillaEmailFull> {
  const data = await apiGet("fetch_email", {
    email_id: emailId,
    sid_token: sidToken,
  });
  return {
    mail_id: emailId,
    mail_from: data.mail_from || "",
    mail_subject: data.mail_subject || "",
    mail_body: data.mail_body || "",
    mail_text: data.mail_text || data.mail_body || "",
    mail_time: data.mail_time || "",
  };
}

/**
 * Get available Guerrilla Mail domains.
 * This is the function called by GET /api/domains
 */
export async function getDomains(): Promise<string[]> {
  return [
    "guerrillamail.com",
    "guerrillamailblock.com",
    "grr.la",
    "guerrillamail.info",
    "guerrillamail.de",
  ];
}

/**
 * Set a custom username on an existing session.
 */
export async function setEmail(
  sidToken: string,
  emailUser: string
): Promise<string> {
  const data = await apiGet("set_email_user", {
    email_user: emailUser,
    sid_token: sidToken,
  });
  return data.email_addr || "";
}
