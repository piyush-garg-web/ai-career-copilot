"use client";

import { SignIn } from "@clerk/nextjs";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function SignInPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10 gap-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold text-foreground">{t("auth.signIn.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.signIn.subtitle")}</p>
      </div>
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
