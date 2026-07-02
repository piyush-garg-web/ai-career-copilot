"use client";

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function InterviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Coach"
        description="Practice behavioral & technical mock interviews with personalized AI feedback."
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border transition-colors duration-200">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-500">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5 justify-center">
              AI Interview Coach
              <Sparkles className="w-4 h-4 text-purple-500 inline" />
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1.5 font-medium">
              This module will run interactive mock interview sessions, record transcript answers, and offer detailed feedback metrics on answers.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
