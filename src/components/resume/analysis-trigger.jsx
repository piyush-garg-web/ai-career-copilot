"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AnalysisTrigger({ resumeId }) {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const runAnalysis = async () => {
      try {
        const response = await fetch(`/api/resumes/${resumeId}/analyze`, {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to analyze document.");
        }

        if (active) {
          toast.success("AI Resume Analysis completed successfully!");
          router.refresh();
        }
      } catch (err) {
        if (active) {
          console.error("AI Auto-trigger analysis error:", err);
          setError(err.message || "An unexpected error occurred during AI analysis.");
          toast.error("AI Analysis failed");
        }
      }
    };

    runAnalysis();

    return () => {
      active = false;
    };
  }, [resumeId, router]);

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-md max-w-lg mx-auto shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        {error ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Analysis Engine Error</h3>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed max-w-xs">
              {error}
            </p>
            <Button
              onClick={() => {
                setError("");
                router.refresh();
              }}
              variant="outline"
              className="rounded-xl border-border/40 text-xs font-semibold px-4 h-9 cursor-pointer"
            >
              Try Again
            </Button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 animate-pulse mb-2">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              Initializing AI Analysis...
            </h3>
            <p className="text-xs text-muted-foreground font-semibold max-w-xs leading-relaxed">
              Gemini is assessing your experience descriptions, indexing technical keywords, and drafting suggestions.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
