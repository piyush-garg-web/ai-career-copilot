import { Zap } from "lucide-react";

export function PremiumBadge({ className, size = "sm" }) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg ${sizeClasses[size]} ${className || ""}`}
    >
      <Zap className="w-3 h-3 fill-current" />
      Premium
    </span>
  );
}
