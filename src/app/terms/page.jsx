import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Terms of Service - AI Career Copilot",
  description: "Terms and conditions governing the use of the AI Career Copilot platform.",
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">
            Terms of Service
          </h1>
          <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              Welcome to AI Career Copilot. By accessing or using our website, services, and applications (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read them carefully.
            </p>
            
            <h2 className="text-xl font-bold text-foreground mt-8">1. Acceptance of Terms</h2>
            <p>
              By creating an account or accessing the Service, you represent that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
            </p>
            
            <h2 className="text-xl font-bold text-foreground mt-8">2. Description of Service</h2>
            <p>
              AI Career Copilot provides users with generative AI-powered tools to parse resumes, analyze ATS compliance scores, evaluate skill gaps, and practice behavior-based mock interviews. We reserve the right to modify, suspend, or discontinue the Service at any time without notice.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">3. User Accounts</h2>
            <p>
              You must register for an account using secure authentication providers (like Google, GitHub, or standard email via Clerk). You are responsible for maintaining the confidentiality of your credentials and all activities that occur under your account. You agree to notify us immediately of any unauthorized use.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">4. Use Policies & Acceptable Use</h2>
            <p>
              You agree not to upload any resume documents or job descriptions that contain fraudulent information, malicious software, or infringe on the intellectual property of any third party. You agree not to attempt to reverse-engineer our AI parsing pipeline or database systems.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">5. Intellectual Property</h2>
            <p>
              All core technologies, UI designs, codebases, logos, branding assets, and AI workflows are the intellectual property of AI Career Copilot and protected under MIT licensing. You retain ownership of any resume files or data you upload to the Service.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">6. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied. We do not guarantee that the AI Career Copilot will secure you job offers, pass specific human resource filters, or meet all expectations.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, AI Career Copilot and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8">8. Changes to Terms</h2>
            <p>
              We reserve the right to revise these Terms at any time. Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
            </p>

            <p className="pt-8 text-xs text-muted-foreground/60">
              Last updated: July 2, 2026. For inquiries, reach support at support@aicareercopilot.app.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
