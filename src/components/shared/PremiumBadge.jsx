import { Zap } from "lucide-react";

export function PremiumBadge({ className, size = "sm" }) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[8px]",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black shadow-sm select-none ${sizeClasses[size]} ${className || ""}`}
    >
      <Zap className={`${iconSizes[size]} fill-current shrink-0`} />
      Premium
    </span>
  );
}
