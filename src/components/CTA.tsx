"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Zap } from "lucide-react";

export default function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent-secondary/10 to-pink-500/10" />
          <div className="absolute inset-0 grid-bg" />

          <div className="relative z-10 text-center py-16 sm:py-20 px-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/10 mb-8"
            >
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-accent">
                No sign-up required
              </span>
            </motion.div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
              Ready to Protect
              <br />
              <span className="gradient-text">Your Privacy?</span>
            </h2>

            <p className="text-text-muted max-w-lg mx-auto mb-10 text-lg">
              Generate your first disposable email in seconds. It&apos;s free,
              instant, and requires zero registration.
            </p>

            <a
              href="#generator"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-background font-semibold text-base hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Generate Temp Email
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
