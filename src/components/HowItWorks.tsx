"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MousePointerClick, Inbox, Copy, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MousePointerClick,
    title: "Click Generate",      description:
      "Hit generate and we'll create a real disposable email address — ready to receive actual verification emails.",
  },
  {
    number: "02",
    icon: Copy,
    title: "Copy & Paste",      description:
      "Copy the temporary email to your clipboard and paste it into any sign-up or verification form.",
  },
  {
    number: "03",
    icon: Inbox,
    title: "Receive OTP",      description:
      "Real emails arrive in real-time. The inbox polls automatically and detects OTP codes for you.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Verify & Done",      description:
      "Copy the detected OTP code, complete your verification, and move on. Delete the email when done.",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative flex items-start gap-6 group"
    >
      {/* Step number + icon */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="relative w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center group-hover:border-accent/40 group-hover:glow-sm transition-all duration-300">
          <step.icon className="w-6 h-6 text-accent" />
          <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
            {step.number}
          </span>
        </div>
        {/* Connector line */}
        {index < steps.length - 1 && (
          <div className="w-px h-16 bg-gradient-to-b from-border to-transparent mt-3" />
        )}
      </div>

      {/* Content */}
      <div className="pt-1 pb-8">
        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
        <p className="text-text-muted text-sm leading-relaxed max-w-md">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Header */}
          <div ref={sectionRef} className="lg:sticky lg:top-32">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block text-xs font-semibold tracking-widest uppercase text-accent mb-4"
            >
              How It Works
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            >
              4 Steps to
              <br />
              <span className="gradient-text">Instant Privacy</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-muted text-lg leading-relaxed"
            >
              No sign-ups, no complexity. Get a disposable email and receive
              your OTP in seconds — it really is that simple.
            </motion.p>
          </div>

          {/* Right: Steps */}
          <div className="lg:pl-8">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
