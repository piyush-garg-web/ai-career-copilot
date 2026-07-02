"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  HardDrive,
  FileText,
  Code,
  Sparkles,
  Trash2,
  Download,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// Inline Custom SVG for LinkedIn
const Linkedin = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Inline Custom SVG for GitHub
const Github = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);


import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Helper: Format file size to human readable MB/KB
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = 1;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Helper: Format Dates
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper: Get status badge styles
const getStatusBadge = (status) => {
  switch (status) {
    case "UPLOADED":
      return { label: "Uploaded", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    case "PARSING":
      return { label: "Parsing", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    case "PARSED":
      return { label: "Parsed", className: "bg-teal-500/10 text-teal-400 border-teal-500/20" };
    case "ANALYZING":
      return { label: "Analyzing", className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
    case "ANALYZED":
      return { label: "Analyzed", className: "bg-green-500/10 text-green-400 border-green-500/20" };
    case "ERROR":
      return { label: "Error", className: "bg-destructive/10 text-destructive border-destructive/20" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border-border/40" };
  }
};

export function ResumeDetailsView({ resume }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const statusInfo = getStatusBadge(resume.status);
  const parsedData = resume.parsedData || {};
  const personalInfo = parsedData.personalInfo || {};

  // Handle Delete Action
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete the resume.");
      }

      toast.success("Resume deleted successfully.");
      setDialogOpen(false);
      router.push("/resume");
      router.refresh();
    } catch (error) {
      console.error("Delete resume error:", error);
      toast.error(error.message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/resume"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Resumes
          </Link>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground truncate max-w-xl">
            {resume.fileName}
          </h1>
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Uploaded {formatDate(resume.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* External Download Link */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-border/40 font-semibold text-xs h-9 cursor-pointer"
          >
            <a href={resume.fileUrl} download={resume.fileName} target="_blank" rel="noopener noreferrer">
              <Download className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              Download File
            </a>
          </Button>

          {/* Delete Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl font-semibold text-xs h-9 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete Resume
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-border/40 max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Delete Resume
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium leading-relaxed mt-2">
                  Are you absolutely sure you want to delete &quot;{resume.fileName}&quot;? This action will permanently remove it from your database and cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 mt-4 sm:justify-end">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    className="rounded-xl border-border/40 text-xs h-9 cursor-pointer"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl text-xs h-9 cursor-pointer font-bold gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Confirm Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Columns (Content Tabs) */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-muted/50 border border-border/40 rounded-xl p-1 w-full sm:w-auto overflow-x-auto flex sm:inline-flex h-10">
              <TabsTrigger
                value="details"
                className="rounded-lg text-xs font-semibold px-4 py-1.5 cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                Structured Info
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="rounded-lg text-xs font-semibold px-4 py-1.5 cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                Raw Text
              </TabsTrigger>
              <TabsTrigger
                value="json"
                className="rounded-lg text-xs font-semibold px-4 py-1.5 cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Code className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
                JSON Tree
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: Structured Details */}
            <TabsContent value="details" className="mt-4 space-y-6 outline-none">
              {/* Contact Info Header Grid */}
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">
                        {personalInfo.name || "Unknown Candidate"}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {personalInfo.location || "No location listed"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                    {personalInfo.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{personalInfo.email}</span>
                      </div>
                    )}
                    {personalInfo.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{personalInfo.phone}</span>
                      </div>
                    )}
                    {personalInfo.linkedin && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-blue-500 shrink-0" />
                        <a
                          href={personalInfo.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          LinkedIn Profile
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {personalInfo.github && (
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-foreground shrink-0" />
                        <a
                          href={personalInfo.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          GitHub Profile
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Block */}
              {parsedData.summary && (
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Professional Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground font-semibold leading-relaxed">
                    {parsedData.summary}
                  </CardContent>
                </Card>
              )}

              {/* Skills tags block */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Code className="w-4 h-4 text-teal-400" />
                      Core Competencies & Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {parsedData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold border border-border/40 bg-muted/60"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Experience Timeline */}
              {parsedData.experience && parsedData.experience.length > 0 && (
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      Professional Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {parsedData.experience.map((exp, index) => (
                      <div key={index} className="flex gap-4 items-start text-xs font-medium">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        <div className="space-y-1">
                          <p className="text-foreground leading-relaxed font-semibold">
                            {exp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Education section */}
              {parsedData.education && parsedData.education.length > 0 && (
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {parsedData.education.map((edu, index) => (
                      <div key={index} className="flex gap-4 items-start text-xs font-medium">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        <p className="text-foreground leading-relaxed font-semibold">
                          {edu}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Projects section */}
              {parsedData.projects && parsedData.projects.length > 0 && (
                <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Code className="w-4 h-4 text-teal-400" />
                      Key Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {parsedData.projects.map((proj, index) => (
                      <div key={index} className="flex gap-4 items-start text-xs font-medium">
                        <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                        <p className="text-foreground leading-relaxed font-semibold">
                          {proj}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Certifications and Languages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Certifications */}
                {parsedData.certifications && parsedData.certifications.length > 0 && (
                  <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-400" />
                        Certifications & Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {parsedData.certifications.map((cert, index) => (
                        <div key={index} className="text-xs text-muted-foreground font-semibold flex items-start gap-2">
                          <span className="text-indigo-500">•</span>
                          <span>{cert}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Languages */}
                {parsedData.languages && parsedData.languages.length > 0 && (
                  <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Languages className="w-4 h-4 text-teal-400" />
                        Languages
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {parsedData.languages.map((lang, index) => (
                        <div key={index} className="text-xs text-muted-foreground font-semibold flex items-start gap-2">
                          <span className="text-teal-500">•</span>
                          <span>{lang}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* TAB CONTENT: Raw text */}
            <TabsContent value="text" className="mt-4 outline-none">
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm">
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-y-auto p-6 bg-muted/20 font-mono text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap select-text">
                    {resume.rawText || "No raw text extracted for this resume."}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT: Parsed JSON */}
            <TabsContent value="json" className="mt-4 outline-none">
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm">
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-y-auto p-6 bg-muted/20 font-mono text-xs text-teal-400/90 whitespace-pre scrollbar-thin">
                    <pre className="select-text">
                      {JSON.stringify(parsedData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column (Metadata Sidebar Card) */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                Document Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="py-5 space-y-4 text-xs font-semibold">
              {/* Status */}
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-muted-foreground">Parsing Status</span>
                <Badge className={statusInfo.className}>
                  {statusInfo.label}
                </Badge>
              </div>

              {/* File Type */}
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-muted-foreground">Document Format</span>
                <span className="text-foreground uppercase font-bold">{resume.fileType}</span>
              </div>

              {/* File Size */}
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-muted-foreground">File Size</span>
                <span className="text-foreground">{formatFileSize(resume.fileSize)}</span>
              </div>

              {/* Storage Host */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Storage Provider</span>
                <span className="text-foreground font-medium">UploadThing</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
