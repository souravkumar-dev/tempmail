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
    <section className="relative py-5 sm:py-6 border-y border-border overflow-hidden">
      {/* Row 1: scrolls right to left (above text) */}
      <div className="relative mb-3">
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 md:w-56 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 md:w-56 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <Marquee speed={25} className="opacity-40">
          {brandsRow1.map((brand) => (
            <div
              key={brand}
              className="flex-shrink-0 mx-8 text-xl font-bold text-text-muted/60 tracking-tight whitespace-nowrap select-none"
            >
              {brand}
            </div>
          ))}
        </Marquee>
      </div>

      {/* Centered text */}
      <div ref={ref} className="text-center px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-widest text-text-muted font-medium"
        >
          Trusted by privacy-conscious teams worldwide
        </motion.p>
      </div>

      {/* Row 2: scrolls left to right (below text) */}
      <div className="relative mt-3">
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 md:w-56 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 md:w-56 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <Marquee speed={25} reverse className="opacity-40">
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
