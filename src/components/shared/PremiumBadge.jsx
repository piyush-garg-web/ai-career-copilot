import { Zap } from "lucide-react";

export function PremiumBadge({ className, size = "sm" }) {
  const sizeClasses = {
    sm: "px-2 py-1 text-[9px]",
    md: "px-2.5 py-1.5 text-[10px]",
    lg: "px-3 py-2 text-xs",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black shadow-sm select-none ${sizeClasses[size]} ${className || ""}`}
    >
      <Zap className={`${iconSizes[size]} fill-current shrink-0`} />
      Premium
    </span>
  );
}
