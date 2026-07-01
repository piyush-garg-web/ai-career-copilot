"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn
        appearance={{
          elements: {
            rootBox: "shadow-lg border border-border rounded-lg",
            card: "bg-card text-card-foreground",
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-background border border-input text-foreground focus-visible:ring-ring",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            footerText: "text-muted-foreground",
            footerActionLink: "text-primary hover:text-primary/90",
          },
        }}
      />
    </div>
  );
}
