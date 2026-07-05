"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Consistent "Go Back" navigation used across nested/detail pages.
 * Pass `href` for a specific route, `onClick` for custom handlers, or omit both to use browser history.
 */
export function GoBackButton({ href, onClick, className = "" }) {
  const router = useRouter();

  const sharedClasses = `inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border/60 bg-transparent hover:bg-accent/40 text-sm font-semibold text-foreground transition-all duration-200 ${className}`;

  if (href) {
    return (
      <Link href={href} className={sharedClasses}>
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
        Go Back
      </Link>
    );
  }

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }
    router.back();
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={`rounded-xl border-border/60 font-semibold h-9 px-4 gap-2 hover:bg-accent/40 ${className}`}
    >
      <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
      Go Back
    </Button>
  );
}
