"use client";

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AtsScorePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="ATS Score Analysis"
        description="Check your resume's readiness for Applicant Tracking Systems and find missing keywords."
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-colors duration-200">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 text-green-500">
              <Gauge className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5 justify-center">
              ATS Keyword Optimization
              <Sparkles className="w-4 h-4 text-green-500 inline" />
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1.5 font-medium">
              This module will scan your resume for important job keywords, scan overused words, and evaluate structure readability.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
