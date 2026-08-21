"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Lock, Zap, Mail } from "lucide-react";
import gsap from "gsap";

const FLOATING_ICONS = [
  { Icon: Shield, delay: 0, x: 15, y: 20, size: 28 },
  { Icon: Lock, delay: 1, x: 80, y: 15, size: 22 },
  { Icon: Zap, delay: 2, x: 90, y: 65, size: 26 },
  { Icon: Mail, delay: 0.5, x: 10, y: 70, size: 24 },
];

const HERO_LINES = [
  [{ text: "Get ", highlight: false }, { text: "Temporary", highlight: true }],
  [{ text: "Emails for ", highlight: false }, { text: "OTP", highlight: false }],
  [{ text: "Verification", highlight: false }],
];

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;
    const words = titleRef.current.querySelectorAll(".hero-word");
    gsap.set(words, { opacity: 0, y: 40, rotateX: -40 });
    gsap.to(words, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.3,
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg pt-20 pb-12">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-secondary/8 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-pink-500/5 blur-[80px] pointer-events-none" />

      {/* Floating icons — hidden on small screens to avoid clutter */}
      {FLOATING_ICONS.map(({ Icon, delay, x, y, size }, i) => (
        <motion.div
          key={i}
          className="absolute text-accent/20 pointer-events-none hidden sm:block"
          style={{ left: `${x}%`, top: `${y}%` }}
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 3 + delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay * 0.3,
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/50 backdrop-blur-sm mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent-secondary opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-secondary" />
          </span>
          <span className="text-xs text-text-muted font-medium">
            Instant · Disposable · Secure
          </span>
        </motion.div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight mb-8"
          style={{ perspective: "600px" }}
        >
          {HERO_LINES.map((line, li) => (
            <span key={li} className="block">
              {line.map((segment, si) => (
                <span
                  key={si}
                  className={`hero-word inline-block ${segment.highlight ? "gradient-text" : ""}`}
                  style={{ whiteSpace: "pre" }}
                >
                  {segment.text}
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-base sm:text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Generate real disposable email addresses. Receive actual OTP codes from
          any website. Protect your privacy without compromising on verification.
        </motion.p>

        {/* CTAs — centered with consistent sizing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <a
            href="#generator"
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-accent to-accent-secondary text-white font-semibold text-base hover:shadow-[0_0_40px_rgba(108,92,231,0.5)] transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            <Zap className="w-5 h-5 flex-shrink-0" />
            Generate Temp Email
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-border text-text-muted hover:text-foreground hover:border-accent/50 transition-all duration-300 text-base w-full sm:w-auto"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Trust indicators — responsive spacing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10 sm:mt-12 text-xs text-text-muted"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent-secondary" />
            No Registration
          </span>
          <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-accent-secondary" />
            Encrypted
          </span>
          <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent-secondary" />
            100% Free
          </span>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
