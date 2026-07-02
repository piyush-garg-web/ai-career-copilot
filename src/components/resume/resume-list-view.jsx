"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  HardDrive,
  Sparkles,
  Star,
  Edit2,
  Copy,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = 1;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const getStatusBadge = (status) => {
  switch (status) {
    case "UPLOADED":
      return { label: "Uploaded", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20" };
    case "PARSING":
      return { label: "Parsing", className: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20" };
    case "PARSED":
      return { label: "Parsed", className: "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 border-teal-500/20" };
    case "ANALYZING":
      return { label: "Analyzing", className: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20" };
    case "ANALYZED":
      return { label: "Analyzed", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" };
    case "ERROR":
      return { label: "Error", className: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border-border/40" };
  }
};

export function ResumeListView({ initialResumes }) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);

  // Interaction UI states
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [loadingMap, setLoadingMap] = useState({});

  const setBusy = (id, busy) => {
    setLoadingMap((prev) => ({ ...prev, [id]: busy }));
  };

  // 1. Set Primary Resume
  const handleSetPrimary = async (id) => {
    setBusy(id, true);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (res.ok) {
        setResumes((prev) =>
          prev.map((r) => ({
            ...r,
            isPrimary: r.id === id,
          }))
        );
        toast.success("Primary resume updated successfully.");
        router.refresh();
      } else {
        toast.error("Failed to update primary status.");
      }
    } catch (e) {
      toast.error("Error setting primary resume.");
    } finally {
      setBusy(id, false);
    }
  };

  // 2. Rename Resume
  const handleRenameSubmit = async (id) => {
    if (!newName.trim()) {
      setEditingId(null);
      return;
    }
    setBusy(id, true);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: newName }),
      });
      if (res.ok) {
        const data = await res.json();
        setResumes((prev) =>
          prev.map((r) => (r.id === id ? { ...r, fileName: data.resume.fileName } : r))
        );
        toast.success("Resume renamed successfully.");
        setEditingId(null);
      } else {
        toast.error("Failed to rename resume.");
      }
    } catch (e) {
      toast.error("Error renaming resume.");
    } finally {
      setBusy(id, false);
    }
  };

  // 3. Duplicate Resume
  const handleDuplicate = async (id) => {
    setBusy(id, true);
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setResumes((prev) => [data.resume, ...prev]);
        toast.success("Resume duplicated successfully.", {
          description: `Created copy: ${data.resume.fileName}`,
        });
        router.refresh();
      } else {
        toast.error("Failed to duplicate resume.");
      }
    } catch (e) {
      toast.error("Error duplicating resume.");
    } finally {
      setBusy(id, false);
    }
  };

  // 4. Delete Resume
  const handleDelete = async (id) => {
    setBusy(id, true);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
        toast.success("Resume document deleted successfully.");
        setDeletingId(null);
        router.refresh();
      } else {
        toast.error("Failed to delete resume.");
      }
    } catch (e) {
      toast.error("Error deleting resume.");
    } finally {
      setBusy(id, false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Resumes"
        description="View and manage your uploaded resumes or upload a new version."
        actions={
          resumes.length > 0 && (
            <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5 shadow-sm shadow-blue-500/10 cursor-pointer h-9 text-xs">
              <Link href="/resume/upload">
                <Plus className="w-4 h-4" />
                Upload Resume
              </Link>
            </Button>
          )
        }
      />

      {resumes.length === 0 ? (
        /* Enhanced Empty State */
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm py-20">
          <CardContent className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 animate-bounce">
              <FileText className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">No resumes uploaded yet</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
                Your portfolio looks fresh! Upload your resume in PDF or Word formats to scan ATS scores and start simulated interview coaching.
              </p>
            </div>
            <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer h-10 px-5">
              <Link href="/resume/upload">
                <Plus className="w-4.5 h-4.5" />
                Upload your first resume
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Resume List Grid */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => {
            const badge = getStatusBadge(resume.status);
            const isEditing = editingId === resume.id;
            const isDeleting = deletingId === resume.id;
            const isLoading = loadingMap[resume.id];

            return (
              <Card
                key={resume.id}
                className={`border-border/40 bg-card/60 backdrop-blur-sm hover:border-border transition-all duration-300 hover:shadow-md hover:shadow-accent/5 overflow-hidden flex flex-col group relative ${
                  resume.isPrimary ? "ring-1 ring-blue-500/50" : ""
                }`}
              >
                {/* Primary Tag Indicator */}
                {resume.isPrimary && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg shadow-sm shadow-blue-600/10 flex items-center gap-1 z-10">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    Primary
                  </div>
                )}

                <CardHeader className="flex flex-row items-start justify-between pb-3 space-y-0 relative">
                  <div className="flex items-center gap-3 min-w-0 pr-12">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform duration-200 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1 mt-1">
                          <Input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="h-7 text-xs font-semibold px-2 rounded-lg"
                            autoFocus
                            placeholder="Enter resume name..."
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRenameSubmit(resume.id)}
                            className="w-7 h-7 hover:bg-green-500/15 hover:text-green-500 rounded-lg"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="w-7 h-7 hover:bg-destructive/15 hover:text-destructive rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <CardTitle className="text-sm font-bold text-foreground truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" title={resume.fileName}>
                            <Link href={`/resume/${resume.id}`} className="hover:underline">
                              {resume.fileName}
                            </Link>
                          </CardTitle>
                          <button
                            onClick={() => {
                              setEditingId(resume.id);
                              setNewName(resume.fileName);
                            }}
                            className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                            title="Rename document"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <span className="text-[10px] font-semibold text-muted-foreground/80 tracking-wide uppercase mt-0.5 block">
                        {resume.fileType} Document
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-2 flex-1 space-y-3.5">
                  {/* File Metadata Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{new Date(resume.createdAt).toLocaleDateString("en-US")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{formatFileSize(resume.fileSize)}</span>
                    </div>
                  </div>

                  {/* Deletion Overlay confirmation if activated */}
                  {isDeleting && (
                    <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-[11px] font-semibold flex flex-col gap-2">
                      <div className="flex gap-1.5 items-center">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Delete this resume document permanently?</span>
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(resume.id)}
                          className="h-6 rounded-lg text-[10px] px-2.5 font-bold cursor-pointer"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeletingId(null)}
                          className="h-6 rounded-lg text-[10px] px-2.5 font-bold cursor-pointer bg-transparent border-destructive/20 hover:bg-destructive/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-between gap-2.5 bg-muted/20 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>

                    {/* View Analysis shortcut if analyzed */}
                    {resume.status === "ANALYZED" && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 rounded-lg border border-border/30 hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-500/25"
                        title="View AI analysis report"
                      >
                        <Link href="/resume/analysis">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Primary Button */}
                    {!resume.isPrimary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSetPrimary(resume.id)}
                        className="w-7 h-7 rounded-lg hover:bg-blue-500/10 hover:text-blue-500 border border-transparent hover:border-blue-500/25 cursor-pointer"
                        title="Set as primary resume"
                      >
                        <Star className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-blue-500" />
                      </Button>
                    )}

                    {/* Duplicate button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(resume.id)}
                      className="w-7 h-7 rounded-lg hover:bg-teal-500/10 hover:text-teal-500 border border-transparent hover:border-teal-500/25 cursor-pointer"
                      title="Duplicate resume"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground/60" />
                      )}
                    </Button>

                    {/* Download */}
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-lg border border-transparent hover:bg-accent cursor-pointer"
                      title="Download document"
                      aria-label="Download resume document"
                    >
                      <a href={resume.fileUrl} download={resume.fileName} target="_blank" rel="noreferrer">
                        <Download className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </a>
                    </Button>

                    {/* View Details */}
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-lg border border-transparent hover:bg-accent cursor-pointer"
                      title="View details"
                      aria-label="View resume details and parsed text"
                    >
                      <Link href={`/resume/${resume.id}`}>
                        <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </Link>
                    </Button>

                    {/* Delete */}
                    {!isDeleting && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(resume.id)}
                        className="w-7 h-7 rounded-lg hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/25 cursor-pointer"
                        title="Delete resume"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
