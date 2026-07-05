import { Crown } from "lucide-react";

/**
 * Unified Premium badge — single design used across the entire application.
 */
export function PremiumBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 min-h-[22px] px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white text-[11px] font-bold leading-none tracking-wide shadow-sm shadow-amber-500/30 select-none whitespace-nowrap ${className}`}
      aria-label="Premium"
    >
      <Crown className="w-3 h-3 shrink-0 fill-white/90 stroke-white" strokeWidth={2} />
      Premium
    </span>
  );
}
