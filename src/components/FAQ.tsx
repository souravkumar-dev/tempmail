"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "What is a temporary email for OTP verification?",
    answer:
      "A temporary email is a disposable email address that you can use to receive one-time passwords (OTPs) and verification codes without exposing your real email. It auto-expires after a set time and leaves no trace.",
  },
  {
    question: "Is MailGhost really free to use?",
    answer:
      "Yes! The Free plan gives you 5 temporary emails per day with 600-second expiry, auto-refreshing inbox, and one email domain — completely free, forever. No credit card needed.",
  },
  {
    question: "How fast do OTP codes arrive?",
    answer:
      "Most OTPs arrive within 1-3 seconds. Our system polls for new emails every few seconds, and the inbox auto-refreshes to show incoming messages in real-time. Pro users get priority delivery.",
  },
  {
    question: "Are my emails stored or tracked?",
    answer:
      "No. MailGhost is privacy-first — we don't store, log, or track your emails. Once your session expires, all data is permanently deleted. We have zero knowledge of what you use the service for.",
  },
  {
    question: "Can I use this for any website or service?",
    answer:
      "MailGhost works with most websites and services that accept email verification. We provide multiple domains to help bypass services that block common disposable email providers.",
  },
  {
    question: "What happens when my email expires?",
    answer:
      "When the timer hits zero, the email address and all received messages are permanently deleted. You can regenerate a new one instantly. Pro and Team users can customize the expiry time.",
  },
];

function FAQItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="border-b border-border last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-6 text-left group"
      >
        <span className="text-base sm:text-lg font-medium group-hover:text-accent transition-colors">
          {faq.question}
        </span>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-light border border-border flex items-center justify-center group-hover:border-accent/30 transition-colors">
          {open ? (
            <Minus className="w-4 h-4 text-accent" />
          ) : (
            <Plus className="w-4 h-4 text-text-muted" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-text-muted text-sm sm:text-base leading-relaxed pr-12">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div ref={sectionRef} className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-semibold tracking-widest uppercase text-accent mb-4"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          >
            Frequently Asked <span className="gradient-text">Questions</span>
          </motion.h2>
        </div>

        {/* Accordion */}
        <div>
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
