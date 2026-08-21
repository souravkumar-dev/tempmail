"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  Zap,
  Clock,
  Eye,
  Globe,
  RefreshCw,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Generation",      description:
      "Get a real disposable email address in seconds. No sign-up, no waiting — just click and start receiving emails.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your real email stays hidden. No data tracking, no logs, no trace back to you.",
    gradient: "from-accent/20 to-purple-500/20",
    iconColor: "text-accent",
  },
  {
    icon: Clock,
    title: "Real-Time OTP",      description:
      "Real OTP codes appear instantly with auto-polling. Never miss a verification code again.",
    gradient: "from-accent-secondary/20 to-cyan-500/20",
    iconColor: "text-accent-secondary",
  },
  {
    icon: Eye,
    title: "No Data Stored",      description:
      "Emails are disposable and can be deleted anytime. No data stored on our end — powered by Guerrilla Mail.",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
  },
  {
    icon: Globe,
    title: "Multiple Domains",
    description:
      "Choose from multiple email domains to bypass restrictions on specific platforms and services.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: RefreshCw,
    title: "Auto-Refresh Inbox",      description:
      "The inbox polls every 4 seconds and auto-detects OTP codes — zero manual refreshing needed.",
    gradient: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="relative p-8 rounded-2xl border border-border bg-surface/50 backdrop-blur-sm hover:border-accent/30 transition-all duration-500 h-full hover:-translate-y-1">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
        >
          <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
        <p className="text-text-muted leading-relaxed text-sm">
          {feature.description}
        </p>

        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-accent/5 to-transparent" />
      </div>
    </motion.div>
  );
}

export default function Features() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={sectionRef} className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-semibold tracking-widest uppercase text-accent mb-4"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          >
            Why Choose <span className="gradient-text">MailGhost</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-muted max-w-xl mx-auto"
          >
            Everything you need for secure, instant OTP verification without
            compromising your privacy.
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
