"use client";

import Marquee from "./Marquee";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const brandsRow1 = [
  "TechCorp",
  "VaultGuard",
  "SecureNet",
  "CloudShield",
  "DataSafe",
  "CyberOps",
  "AuthPro",
  "TrustLayer",
];

const brandsRow2 = [
  "QuantumShield",
  "CyberVault",
  "SafePass",
  "NetGuard",
  "DataLock",
  "PrivacyNet",
  "AuthShield",
  "TrustCore",
];

export default function Brands() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-10 sm:py-16 border-y border-border overflow-hidden">
      <div ref={ref} className="text-center mb-8 px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-widest text-text-muted font-medium"
        >
          Trusted by privacy-conscious teams worldwide
        </motion.p>
      </div>
      {/* Two marquee rows scrolling in opposite directions */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 md:w-56 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 md:w-56 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        {/* Row 1: scrolls left to right */}
        <Marquee speed={25} reverse className="opacity-40">
          {brandsRow1.map((brand) => (
            <div
              key={brand}
              className="flex-shrink-0 mx-8 text-xl font-bold text-text-muted/60 tracking-tight whitespace-nowrap select-none"
            >
              {brand}
            </div>
          ))}
        </Marquee>
        {/* Row 2: scrolls right to left */}
        <Marquee speed={25} className="opacity-40">
          {brandsRow2.map((brand) => (
            <div
              key={brand}
              className="flex-shrink-0 mx-8 text-xl font-bold text-text-muted/60 tracking-tight whitespace-nowrap select-none"
            >
              {brand}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
