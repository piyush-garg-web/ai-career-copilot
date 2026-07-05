import { Zap } from "lucide-react";

export function PremiumBadge({ className, size = "sm" }) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[8px]",
    md: "px-2 py-0.5 text-[9px]",
    lg: "px-2.5 py-1 text-[10px]",
  };

  const iconSizes = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black shadow-md shadow-yellow-500/20 select-none ${sizeClasses[size]} ${className || ""}`}
    >
      <Zap className={`${iconSizes[size]} fill-current shrink-0`} />
      Premium
    </span>
  );
}
