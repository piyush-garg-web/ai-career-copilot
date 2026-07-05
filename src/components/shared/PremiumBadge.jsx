import { Crown } from "lucide-react";

/**
 * Unified Premium badge — single design used across the entire application.
 */
export function PremiumBadge({ className = "", size }) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 h-[22px] px-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-[10px] font-bold leading-none tracking-wide shadow-sm shadow-amber-500/20 select-none whitespace-nowrap w-fit self-start shrink-0 ${className}`}
      aria-label="Premium"
    >
      <Crown className="w-3 h-3 shrink-0 fill-white/90 stroke-none" />
      Premium
    </span>
  );
}
