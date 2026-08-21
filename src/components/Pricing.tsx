"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Zap, Crown, Building2 } from "lucide-react";

const plans = [
  {
    name: "Free",
    icon: Zap,
    price: "$0",
    period: "forever",
    description: "Perfect for occasional OTP verifications",
    features: [
      "5 temp emails per day",
      "600s expiry timer",
      "Auto-refresh inbox",
      "Single domain",
      "Standard speed",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    icon: Crown,
    price: "$9",
    period: "/month",
    description: "For power users who need unlimited access",
    features: [
      "Unlimited temp emails",
      "Custom expiry timers",
      "All email domains",
      "Priority delivery",
      "API access",
      "No ads",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Team",
    icon: Building2,
    price: "$29",
    period: "/month",
    description: "For teams and businesses with custom needs",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Custom domains",
      "Advanced API",
      "Priority support",
      "Usage analytics",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

function PlanCard({
  plan,
  index,
}: {
  plan: (typeof plans)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`relative rounded-3xl p-8 flex flex-col ${
        plan.highlighted
          ? "border-2 border-accent bg-gradient-to-b from-accent/10 to-surface/70 glow"
          : "border border-border bg-surface/50"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-accent to-accent-secondary text-white text-xs font-semibold">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <plan.icon
            className={`w-5 h-5 ${plan.highlighted ? "text-accent" : "text-text-muted"}`}
          />
          <span className="font-semibold">{plan.name}</span>
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-text-muted text-sm">{plan.period}</span>
        </div>
        <p className="text-sm text-text-muted">{plan.description}</p>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm">
            <Check
              className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? "text-accent-secondary" : "text-accent-secondary/60"}`}
            />
            <span className="text-text-muted">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          plan.highlighted
            ? "bg-gradient-to-r from-accent to-accent-secondary text-white hover:shadow-[0_0_30px_rgba(108,92,231,0.4)] hover:scale-[1.02]"
            : "bg-surface-light border border-border text-foreground hover:border-accent/30"
        }`}
      >
        {plan.cta}
      </button>
    </motion.div>
  );
}

export default function Pricing() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={sectionRef} className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-semibold tracking-widest uppercase text-accent mb-4"
          >
            Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          >
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-muted max-w-lg mx-auto"
          >
            Start free. Upgrade when you need more power.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
