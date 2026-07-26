import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PercentageChangeProps {
  value: number;
  label: string;
}

export function PercentageChange({ value, label }: PercentageChangeProps) {
  const isPositive = value >= 0;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
          isPositive
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-600"
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {isPositive ? "+" : ""}
        {value}%
      </span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
