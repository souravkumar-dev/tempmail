"use client";

import { Star } from "lucide-react";
import Marquee from "./Marquee";

const testimonials = [
  {
    quote:
      "MailGhost saved me so much time during sign-ups. Instant OTP, no spam, no hassle. Absolutely love it!",
    name: "Sarah K.",
    role: "Freelance Designer",
    stars: 5,
  },
  {
    quote:
      "I use this daily for testing. The API is clean, delivery is fast, and the UI is beautiful. Best temp email service.",
    name: "Marcus T.",
    role: "Backend Developer",
    stars: 5,
  },
  {
    quote:
      "Finally a temp email that actually works on every platform. The multiple domains feature is a game-changer.",
    name: "Priya R.",
    role: "QA Engineer",
    stars: 5,
  },
  {
    quote:
      "Clean interface, fast delivery, and the auto-refresh means I never miss an OTP. 10/10 would recommend.",
    name: "James L.",
    role: "Product Manager",
    stars: 5,
  },
  {
    quote:
      "Switched from other services and never looked back. MailGhost is faster and way more reliable.",
    name: "Alex M.",
    role: "Startup Founder",
    stars: 5,
  },
  {
    quote:
      "The privacy-first approach sold me. No sign-ups, no tracking, just a disposable email that works perfectly.",
    name: "Nina C.",
    role: "Security Researcher",
    stars: 5,
  },
];

function TestimonialCard({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="flex-shrink-0 w-[360px] mx-3 p-6 rounded-2xl border border-border bg-surface/50 backdrop-blur-sm hover:border-accent/20 transition-all duration-300">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: t.stars }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm leading-relaxed text-text-muted mb-6">
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-sm">
          {t.name[0]}
        </div>
        <div>
          <p className="text-sm font-medium">{t.name}</p>
          <p className="text-xs text-text-muted">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-12 px-6">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent mb-4">
          Testimonials
        </span>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Trusted by <span className="gradient-text">Thousands</span>
        </h2>
        <p className="text-text-muted max-w-lg mx-auto">
          See what developers, testers, and privacy-conscious users are saying.
        </p>
      </div>

      {/* Marquee Row 1 */}
      <Marquee speed={25} className="mb-4">
        {testimonials.map((t) => (
          <TestimonialCard key={t.name + "1"} t={t} />
        ))}
      </Marquee>

      {/* Marquee Row 2 (reversed) */}
      <Marquee speed={20} reverse className="opacity-60">
        {[...testimonials].reverse().map((t) => (
          <TestimonialCard key={t.name + "2"} t={t} />
        ))}
      </Marquee>
    </section>
  );
}
