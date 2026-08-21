"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Clock,
  Inbox,
  Shield,
  Mail,
  Loader2,
  AlertCircle,
  Server,
  Wifi,
} from "lucide-react";
import {
  isSmtpAvailable,
  generateSelfHostedEmail,
  fetchSelfHostedMessages,
  fetchSelfHostedMessage,
  createGuerrillaSession,
  restoreGuerrillaSession,
  fetchGuerrillaMessages,
  fetchGuerrillaMessage,
  persistSession,
  getStoredSession,
  clearStoredSession,
  type EmailSession,
  type ParsedEmail,
} from "@/lib/email-service";

export default function EmailGenerator() {
  // ── State ─────────────────────────────────────────────────────────────
  const [session, setSession] = useState<EmailSession | null>(null);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<ParsedEmail[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ParsedEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [remaining, setRemaining] = useState("");
  const [serverMode, setServerMode] = useState<"checking" | "self-hosted" | "guerrilla">("guerrilla");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const customPrefixRef = useRef<HTMLInputElement>(null);

  // ── Restore previous session on mount (no SMTP probe) ────────────────
  useEffect(() => {
    const saved = getStoredSession();
    if (saved) {
      setSession(saved);
      setEmail(saved.address);
      setHasGenerated(true);
      setServerMode(saved.mode === "self-hosted" ? "self-hosted" : "guerrilla");
    }
  }, []);

  // ── Countdown timer (Guerrilla mode only) ──────────────────────────
  useEffect(() => {
    if (!session?.expireAt) {
      setRemaining("");
      return;
    }
    const tick = () => {
      const ms = session.expireAt! - Date.now();
      if (ms <= 0) {
        setRemaining("Expired");
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      setRemaining(`${mins}m ${secs}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [session]);

  // ── Polling: fetch new messages every 4s ──────────────────────────────
  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    const fetchInbox = async () => {
      try {
        let msgs: ParsedEmail[];
        if (session.mode === "self-hosted") {
          msgs = await fetchSelfHostedMessages(session.address);
        } else {
          if (!session.sidToken) return;
          msgs = await fetchGuerrillaMessages(session.sidToken);
        }
        if (isMounted) setMessages(msgs);
      } catch (err: any) {
        if (isMounted) console.error("Inbox poll error:", err);
      }
    };

    fetchInbox();
    pollRef.current = setInterval(fetchInbox, 4000);

    return () => {
      isMounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [session]);

  // ── Generate new email ────────────────────────────────────────────────
  const generateNewEmail = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessages([]);
    setSelectedMessage(null);
    setHasGenerated(true);

    try {
      let newSession: EmailSession;

      // Detect SMTP server on first Generate click (not on mount)
      let mode = serverMode;
      if (mode === "guerrilla") {
        const available = await isSmtpAvailable();
        if (available) {
          mode = "self-hosted";
          setServerMode("self-hosted");
        }
      }

      if (mode === "self-hosted") {
        const prefix = customPrefixRef.current?.value?.trim() || undefined;
        newSession = await generateSelfHostedEmail(prefix);
      } else {
        newSession = await createGuerrillaSession();
      }

      setSession(newSession);
      setEmail(newSession.address);
      persistSession(newSession);
    } catch (err: any) {
      setError(err.message || "Failed to create email. Try again.");
    } finally {
      setLoading(false);
    }
  }, [serverMode]);

  // ── Copy email to clipboard ───────────────────────────────────────────
  const copyEmail = useCallback(async () => {
    if (!email) return;
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [email]);

  // ── Delete current session ──────────────────────────────────────────
  const deleteEmail = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    clearStoredSession();
    setSession(null);
    setEmail("");
    setMessages([]);
    setSelectedMessage(null);
    setHasGenerated(false);
    setRemaining("");
  }, []);

  // ── Open message and extract OTPs ─────────────────────────────────────
  const openMessage = useCallback(
    async (msg: ParsedEmail) => {
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(null);
        return;
      }

      setLoadingMessage(true);
      try {
        let full: ParsedEmail | null;
        if (session!.mode === "self-hosted") {
          full = await fetchSelfHostedMessage(msg.id as number);
        } else {
          full = await fetchGuerrillaMessage(session!.sidToken!, msg.id as string);
        }
        if (full) setSelectedMessage(full);
      } catch (err) {
        console.error("Failed to load message:", err);
      } finally {
        setLoadingMessage(false);
      }
    },
    [session, selectedMessage]
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <section id="generator" className="relative py-24 sm:py-32">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent mb-4">
            Generator
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Your <span className="gradient-text">Temp Email</span> is Ready
          </h2>
          <p className="text-text-muted max-w-lg mx-auto">
            One click to generate a real disposable email. Receive actual OTP codes from any website.
          </p>

          {/* Mode Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {serverMode === "self-hosted" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <Server className="w-3 h-3" />
                Self-Hosted Mode — Custom Domain Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                <Wifi className="w-3 h-3" />
                Fallback Mode — Guerrilla Mail (limited sites)
              </span>
            )}
          </div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-300">{error}</p>
              </div>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 text-sm">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generator Card */}
        <motion.div
          layout
          className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl overflow-hidden glow"
        >
          {/* Email Display Row */}
          <div className="p-6 sm:p-8 border-b border-border">
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              {/* Domain Badge */}
              <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-surface-light border border-border text-sm text-text-muted">
                <Shield className="w-4 h-4 text-accent-secondary" />
                <span className="truncate max-w-[140px]">
                  {email ? email.split("@")[1] : (serverMode === "self-hosted" ? "yourdomain.com" : "guerrillamail.com")}
                </span>
              </div>

              {/* Email Address Display */}
              <div className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-background border border-border min-w-0">
                <Mail className="w-4 h-4 text-text-muted flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-text-muted">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Creating email...</span>
                    </motion.div>
                  ) : email ? (
                    <motion.span key={email} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} className="text-sm sm:text-base font-mono truncate select-all">
                      {email}
                    </motion.span>
                  ) : (
                    <motion.span key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-sm text-text-muted">
                      Click generate to get your temp email
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {email && (
                  <>
                    <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      onClick={copyEmail} title="Copy email"
                      className="flex items-center justify-center px-4 py-3.5 rounded-xl bg-surface-light border border-border hover:border-accent/30 transition-all text-sm">
                      {copied ? <Check className="w-4 h-4 text-accent-secondary" /> : <Copy className="w-4 h-4" />}
                    </motion.button>
                    <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      onClick={deleteEmail} title="Delete this email"
                      className="flex items-center justify-center px-4 py-3.5 rounded-xl bg-surface-light border border-border hover:border-red-500/30 hover:text-red-400 transition-all text-sm">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
                <button onClick={generateNewEmail} disabled={loading}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-secondary text-white text-sm font-medium hover:shadow-[0_0_30px_rgba(108,92,231,0.4)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 whitespace-nowrap">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  {email ? "New" : "Generate"}
                </button>
              </div>
            </div>

            {/* Custom prefix input (self-hosted mode only) */}
            {serverMode === "self-hosted" && !email && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="mt-4">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-light border border-border">
                  <span className="text-sm text-text-muted">Custom prefix:</span>
                  <input
                    ref={customPrefixRef}
                    type="text"
                    placeholder="e.g. alice, john123..."
                    maxLength={30}
                    className="flex-1 bg-transparent text-sm font-mono outline-none placeholder:text-text-muted/40"
                  />
                  <span className="text-xs text-text-muted/50">@yourdomain.com</span>
                </div>
                <p className="text-xs text-text-muted/40 mt-1 ml-1">
                  Leave empty for a random address. Use letters, numbers, dots, and hyphens.
                </p>
              </motion.div>
            )}

            {/* Status Bar */}
            {session && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 flex items-center gap-3 flex-wrap">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent-secondary opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 h-2 rounded-full bg-accent-secondary" />
                </span>
                <span className="text-xs text-text-muted">Live — polling every 4s</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-xs text-text-muted">
                  {messages.length} message{messages.length !== 1 ? "s" : ""}
                </span>
                {remaining && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {remaining}
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* Inbox Section */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Inbox className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold">Inbox</h3>
                {messages.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                    {messages.length}
                  </span>
                )}
              </div>
              {session && messages.length > 0 && (
                <button onClick={() => { setMessages([]); setSelectedMessage(null); }}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Empty States */}
            {!hasGenerated ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-light border border-border flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-border" />
                </div>
                <p className="text-text-muted text-sm mb-1">Generate a temp email to start</p>
                <p className="text-text-muted/50 text-xs">Real emails, real OTPs, real privacy</p>
              </div>
            ) : loading ? (
              <div className="text-center py-16">
                <Loader2 className="w-10 h-10 mx-auto text-accent animate-spin mb-4" />
                <p className="text-text-muted text-sm">Creating your temp email...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <Loader2 className="w-12 h-12 text-border animate-spin" />
                </div>
                <p className="text-text-muted text-sm mb-1">Waiting for incoming emails...</p>
                <p className="text-text-muted/50 text-xs">
                  Use <span className="font-mono text-accent/70">{email}</span> on any website
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg) => (
                    <motion.div key={msg.id} layout
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => openMessage(msg)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        selectedMessage?.id === msg.id
                          ? "border-accent/40 bg-accent/5"
                          : "border-border bg-surface-light/50 hover:border-accent/20"
                      }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-accent-secondary flex-shrink-0" />
                            <span className="text-xs text-text-muted font-medium truncate">
                              {msg.mail_from || "Unknown"}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">{msg.mail_subject || "(no subject)"}</p>
                          <p className="text-xs text-text-muted/60 mt-1 truncate">{msg.mail_excerpt || ""}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-xs text-text-muted whitespace-nowrap">{msg.mail_date}</span>
                          {!msg.mail_read && <span className="w-2 h-2 rounded-full bg-accent" />}
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {selectedMessage?.id === msg.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="mt-4 pt-4 border-t border-border">
                              {selectedMessage.otpCodes.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs text-accent-secondary font-medium mb-2 uppercase tracking-wider">
                                    Detected Codes
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedMessage.otpCodes.map((code, i) => (
                                      <button key={i} onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(code);
                                      }}
                                        className="group/code flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 hover:border-accent/40 transition-all">
                                        <span className="text-xl font-mono font-bold tracking-[0.2em] gradient-text">
                                          {code}
                                        </span>
                                        <Copy className="w-3.5 h-3.5 text-accent opacity-50 group-hover/code:opacity-100 transition-opacity" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="text-sm text-text-muted leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                                {selectedMessage.mail_text || selectedMessage.mail_excerpt || "(empty)"}
                              </div>
                              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(selectedMessage.mail_text || selectedMessage.mail_excerpt || "");
                                }}
                                  className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1">
                                  <Copy className="w-3 h-3" /> Copy full text
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* Help text */}
        {session && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
            {session.mode === "self-hosted" ? (
              <p className="text-xs text-text-muted/60">
                Running in self-hosted mode. This email is on your custom domain.
                Use it to register on any website — including Google, Groww, and banking apps.
              </p>
            ) : (
              <p className="text-xs text-text-muted/60">
                Running in Guerrilla Mail fallback mode. Works for most sites but may be
                blocked by Google, Groww, and strict platforms.
                Deploy with Docker + custom domain for full compatibility.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
