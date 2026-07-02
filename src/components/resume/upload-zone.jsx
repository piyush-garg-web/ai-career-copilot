"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function UploadZone({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("IDLE"); // IDLE, VALIDATING, UPLOADING, SUCCESS, ERROR
  const [fileDetails, setFileDetails] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  
  const fileInputRef = useRef(null);

  const { startUpload } = useUploadThing("resumeUploader", {
    onClientUploadComplete: (res) => {
      setUploadStatus("SUCCESS");
      setUploadProgress(100);
      toast.success("Resume uploaded successfully!");
      if (onUploadComplete && res?.[0]) {
        // Pass file info to parent callback after 1 second delay for visual confirmation
        setTimeout(() => {
          onUploadComplete(res[0]);
        }, 1000);
      }
    },
    onUploadError: (err) => {
      setUploadStatus("ERROR");
      setErrorMessage(err.message || "An unexpected error occurred during upload.");
      toast.error("Upload failed");
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  // Helper: Format file size to human readable MB/KB
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Helper: Client-side file validation
  const validateFile = (file) => {
    if (!file) return "No file selected.";

    // Allowed extensions
    const allowedExtensions = ["pdf", "docx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return "Unsupported file type. Only PDF and DOCX files are allowed.";
    }

    // Limit size to 10MB
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      return "File is too large. The maximum allowed size is 10MB.";
    }

    return null;
  };

  const handleFile = async (file) => {
    setUploadStatus("VALIDATING");
    
    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus("ERROR");
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }

    setFileDetails({
      name: file.name,
      size: file.size,
      type: file.name.split(".").pop().toUpperCase(),
    });
    setUploadStatus("UPLOADING");
    setUploadProgress(0);

    try {
      await startUpload([file]);
    } catch (err) {
      setUploadStatus("ERROR");
      setErrorMessage("Failed to establish server upload connection.");
    }
  };

  // Drag and Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (uploadStatus === "UPLOADING") return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      // Limit to one file
      if (files.length > 1) {
        setUploadStatus("ERROR");
        setErrorMessage("Only one file can be uploaded at a time.");
        toast.error("Please drop a single file.");
        return;
      }
      await handleFile(files[0]);
    }
  };

  // Click Trigger Handler
  const handleZoneClick = () => {
    if (uploadStatus === "UPLOADING" || uploadStatus === "SUCCESS") return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  // Reset Component State
  const resetUpload = () => {
    setUploadStatus("IDLE");
    setFileDetails(null);
    setUploadProgress(0);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {/* State: IDLE / DRAGGING */}
        {(uploadStatus === "IDLE" || uploadStatus === "VALIDATING") && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onClick={handleZoneClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[260px] relative overflow-hidden group",
              isDragging
                ? "border-blue-500 bg-blue-500/5 shadow-inner"
                : "border-border/60 bg-card/40 backdrop-blur-sm hover:border-blue-500/50 hover:bg-accent/20"
            )}
          >
            {/* Top glowing ambient effect on drag */}
            <div
              className={cn(
                "absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 opacity-0 transition-opacity duration-300",
                isDragging && "opacity-100"
              )}
            />

            <div
              className={cn(
                "p-4 rounded-2xl bg-muted dark:bg-accent/40 mb-4 transition-transform duration-300 group-hover:scale-105",
                isDragging && "scale-110 bg-blue-500/10 text-blue-500"
              )}
            >
              <UploadCloud
                className={cn(
                  "w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors duration-300",
                  isDragging && "text-blue-500"
                )}
              />
            </div>

            <div className="text-center space-y-1.5 max-w-sm">
              <p className="text-sm font-semibold text-foreground">
                {isDragging ? "Drop your file here" : "Drag & drop your resume here"}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                or <span className="text-blue-500 font-semibold group-hover:underline">browse files</span> from your computer
              </p>
              <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider pt-3">
                Supported formats: PDF, DOCX (Max 10MB)
              </p>
            </div>

            {uploadStatus === "VALIDATING" && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex items-center gap-2.5 px-4 py-2 bg-card rounded-xl border border-border shadow-md">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-xs font-semibold text-foreground">Validating file...</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* State: UPLOADING */}
        {uploadStatus === "UPLOADING" && fileDetails && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-border/40 rounded-2xl p-6 bg-card/60 backdrop-blur-sm shadow-sm space-y-5"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {fileDetails.name}
                </p>
                <p className="text-xs text-muted-foreground font-semibold">
                  {fileDetails.type} File • {formatFileSize(fileDetails.size)}
                </p>
              </div>
              <div className="flex items-center justify-center shrink-0">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Uploading file...</span>
                <span className="text-blue-500 font-bold">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-accent" />
            </div>
          </motion.div>
        )}

        {/* State: SUCCESS */}
        {uploadStatus === "SUCCESS" && fileDetails && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="border border-green-500/20 bg-green-500/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-md shadow-green-500/5"
          >
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-500 mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-1">
              Upload Successful!
              <Sparkles className="w-4 h-4 text-green-500 inline" />
            </h3>
            <p className="text-xs text-muted-foreground font-medium max-w-xs mt-1.5">
              &quot;{fileDetails.name}&quot; has been safely saved to your profile. Redirecting you shortly...
            </p>
          </motion.div>
        )}

        {/* State: ERROR */}
        {uploadStatus === "ERROR" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-destructive/20 bg-destructive/5 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-bold text-foreground">Upload Blocked</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetUpload}
                className="rounded-xl border-border/40 gap-1.5 text-xs h-8 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
