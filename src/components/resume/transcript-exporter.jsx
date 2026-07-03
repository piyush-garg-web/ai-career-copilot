"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export function TranscriptExporter({ sessionId }) {
  const downloadJSON = async () => {
    try {
      const res = await fetch(`/api/interviews/${sessionId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${sessionId}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Transcript downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download transcript');
    }
  };

  const printTranscript = async () => {
    // navigate to print-friendly view: simply open current page print dialog
    try {
      window.print();
    } catch (err) {
      toast.error('Unable to print transcript');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={downloadJSON} variant="outline" size="sm" className="rounded-xl">
        <Download className="w-4 h-4 mr-2" />
        Export JSON
      </Button>
      <Button onClick={printTranscript} variant="outline" size="sm" className="rounded-xl">
        <FileText className="w-4 h-4 mr-2" />
        Print
      </Button>
    </div>
  );
}
