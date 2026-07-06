// src/components/voice-interview/permission-dialog.jsx

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Video, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PermissionDialog({ open, onAllow, onDeny, mode = "voice" }) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const streamRef = useRef(null);

  const isVideo = mode === "video";

  const handleAllow = async () => {
    setChecking(true);
    setError("");

    try {
      const constraints = isVideo
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Stop the test stream immediately after permission granted
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      setChecking(false);
      onAllow();
    } catch (err) {
      console.error("[PERMISSION ERROR]:", err);
      setChecking(false);
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError(
          isVideo
            ? "Camera and microphone permissions are required for Video Interview. Please allow access in your browser settings and try again."
            : "Microphone access is required to start a Voice Interview. Please allow access in your browser settings and try again."
        );
      } else if (err.name === "NotFoundError") {
        setError(
          isVideo
            ? "No camera or microphone found on your device. Please connect a camera/microphone and try again."
            : "No microphone found on your device. Please connect a microphone and try again."
        );
      } else {
        setError(
          isVideo
            ? "Failed to access camera and microphone. Please check your device settings and try again."
            : "Failed to access microphone. Please check your device settings and try again."
        );
      }
    }
  };

  const handleDeny = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    onDeny();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleDeny}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {isVideo ? (
              <Video className="w-6 h-6 text-blue-500" />
            ) : (
              <Mic className="w-6 h-6 text-blue-500" />
            )}
            <DialogTitle className="text-lg">
              {isVideo ? "Camera & Microphone Permission Required" : "Microphone Permission Required"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            CareerCopilot needs access to your {isVideo ? "camera and microphone" : "microphone"} for the AI{" "}
            {isVideo ? "Video" : "Voice"} Interview.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleDeny} disabled={checking} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleAllow} disabled={checking} className="rounded-xl">
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  {isVideo ? "Allow Camera & Microphone" : "Allow Microphone"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
