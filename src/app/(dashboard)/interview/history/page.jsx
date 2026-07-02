"use client";

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function InterviewHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview History"
        description="Browse feedback, question lists, and grading parameters of your completed interview sessions."
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-colors duration-200">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-500">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5 justify-center">
              Historical Evaluations
              <Sparkles className="w-4 h-4 text-amber-500 inline" />
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1.5 font-medium">
              This module will retrieve past transcripts, radar categories, and overall coaching tips from previous mock sessions.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
