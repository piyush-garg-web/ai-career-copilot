import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AccentColorProvider from "@/components/shared/AccentColorProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export const metadata = {
  title: "AI Career Copilot",
  description: "Your AI-powered career assistant",
  icons: {
    icon: "/icon.jpg",
    shortcut: "/icon.jpg",
    apple: "/icon.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <LanguageProvider>
        <html lang="en" suppressHydrationWarning>
          <body>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <AccentColorProvider>
                <TooltipProvider>{children}</TooltipProvider>
                <Toaster />
              </AccentColorProvider>
            </ThemeProvider>
          </body>
        </html>
      </LanguageProvider>
    </ClerkProvider>
  );
}
