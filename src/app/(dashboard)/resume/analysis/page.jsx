"use client";

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ResumeAnalysisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Analysis"
        description="Optimize your resume content and structure using artificial intelligence."
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-colors duration-200">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-500">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5 justify-center">
              AI Analysis Engine
              <Sparkles className="w-4 h-4 text-indigo-500 inline" />
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1.5 font-medium">
              This module will perform detailed layout reviews, formatting checks, and provide actionable bullet-point improvements.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
