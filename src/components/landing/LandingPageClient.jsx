"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
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

export default function LandingPageClient({
  initialReviews = [],
  initialTotal = 0,
  initialAverage = 0,
  initialHasMore = false,
  isAuthenticated = false,
  currentUserReview = null,
}) {
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleWriteReviewUnauthenticated = () => {
    setToastMessage("Please sign in to share your experience.");
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased flex flex-col">
      {/* Navigation bar */}
      <Navbar />

      {/* Main landing sections */}
      <main className="flex-grow">
        <Hero />
        <Stats />
        <Features onFeatureClick={(msg) => setToastMessage(msg)} />
        <HowItWorks />
        <ProductPreview />
        <ComparisonTable />
        <Testimonials
          initialReviews={initialReviews}
          initialTotal={initialTotal}
          initialAverage={initialAverage}
          initialHasMore={initialHasMore}
          isAuthenticated={isAuthenticated}
          currentUserReview={currentUserReview}
          onUnauthAction={handleWriteReviewUnauthenticated}
        />
        <Faq />
      </main>

      {/* Sitemap and final CTA footer */}
      <Footer />

      {/* Custom Premium Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border border-rose-500/20 bg-background/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl text-sm font-semibold text-rose-500 dark:text-rose-400 max-w-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="flex-grow leading-relaxed">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
