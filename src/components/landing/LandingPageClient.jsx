"use client";

import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Stats from "./Stats";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import ProductPreview from "./ProductPreview";
import ComparisonTable from "./ComparisonTable";
import Testimonials from "./Testimonials";
import Faq from "./Faq";
import Footer from "./Footer";

export default function LandingPageClient() {
  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased flex flex-col">
      {/* Navigation bar */}
      <Navbar />

      {/* Main landing sections */}
      <main className="flex-grow">
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <ProductPreview />
        <ComparisonTable />
        <Testimonials />
        <Faq />
      </main>

      {/* Sitemap and final CTA footer */}
      <Footer />
    </div>
  );
}
