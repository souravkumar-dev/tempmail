"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import EmailGenerator from "@/components/EmailGenerator";
import Stats from "@/components/Stats";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="relative noise">
        <Navbar />
        <Hero />
        <Brands />
        <Features />
        <HowItWorks />
        <EmailGenerator />
        <Stats />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </main>
    </ErrorBoundary>
  );
}
