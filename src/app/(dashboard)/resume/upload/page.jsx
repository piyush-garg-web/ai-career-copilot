"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { UploadZone } from "@/components/resume/upload-zone";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GoBackButton } from "@/components/shared/GoBackButton";

export default function ResumeUploadPage() {
  const router = useRouter();

  const handleUploadComplete = async (res) => {
    const resumeId = res?.serverData?.resumeId;
    if (resumeId) {
      try {
        const userRes = await fetch("/api/user");
        if (userRes.ok) {
          const userData = await userRes.json();
          const autoAnalyze = userData.resumePreferences?.autoAnalyze;
          if (autoAnalyze) {
            // Trigger auto analysis in background
            fetch(`/api/resumes/${resumeId}/analyze`, { method: "POST" });
          }
        }
      } catch (err) {
        console.warn("Failed to check auto-analyze preference:", err);
      }
    }
    // Redirect back to the resume lists on success
    router.push("/resume");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Resume"
        description="Select or drop your PDF or DOCX file to save your resume to your profile."
        actions={
          <GoBackButton href="/resume" />
        }
      />

      <div className="py-6">
        <UploadZone onUploadComplete={handleUploadComplete} />
      </div>
    </div>
  );
}
