import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Privacy Policy - AI Career Copilot",
  description: "Privacy policy describing how AI Career Copilot collects, handles, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">
            Privacy Policy
          </h1>
          <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              At AI Career Copilot, we value your trust and are committed to safeguarding the privacy and security of your personal data. This Privacy Policy describes how we collect, use, and share information when you use our website and services.
            </p>
            
            <h2 className="text-xl font-bold text-foreground mt-8">1. Information We Collect</h2>
            <p>
              We collect information that you directly provide to us when using the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Profile & Authentication Info:</strong> Full name, email address, and avatar image managed securely via our Clerk identity provider.
              </li>
              <li>
                <strong>Career Documents:</strong> Resume files (.pdf or .docx) you upload via UploadThing for parsing, ATS analysis, and interview simulations.
              </li>
              <li>
                <strong>Interaction Logs:</strong> Transcripts and responses submitted during technical or behavioral mock interviews.
              </li>
            </ul>
            
            <h2 className="text-xl font-bold text-foreground mt-8">2. How We Use Your Information</h2>
            <p>
              We process your data to deliver the core features of AI Career Copilot:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Parsing resume content and generating ATS optimization grades.
              </li>
              <li>
                Matching your resume against pasted job descriptions to detect skill gaps.
              </li>
              <li>
                Providing simulated interview coaching and history transcripts.
              </li>
              <li>
                Maintaining database structures hosted on Neon DB using Prisma ORM.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8">3. Data Sharing & Third Parties</h2>
            <p>
              We do not sell, rent, or trade your personal resume files or transcripts to third-party databases. We share data only with service providers required to operate the platform:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Clerk:</strong> To secure account sign-in/sign-up and webhook user syncs.
              </li>
              <li>
                <strong>UploadThing:</strong> To host uploaded PDF and Word documents securely.
              </li>
              <li>
                <strong>Google Gemini API:</strong> To analyze resumes and formulate mock interview questions. Content sent to Gemini is stateless and not used for model training purposes.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8">4. Data Security & Storage</h2>
            <p>
              Your profile details are stored in a secure PostgreSQL server managed by Neon. All network connections are encrypted via SSL/TLS. We implement industry-standard practices to protect your data from unauthorized access or disclosure.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">5. Your Choices & Access</h2>
            <p>
              You have the right to access, update, or delete your account records at any time. You can replace or remove uploaded resumes directly from your Dashboard. Account closures can be managed in the profile settings panel.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">6. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;last updated&quot; date below.
            </p>

            <p className="pt-8 text-xs text-muted-foreground/60">
              Last updated: July 2, 2026. For questions or concerns, contact support@aicareercopilot.app.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
