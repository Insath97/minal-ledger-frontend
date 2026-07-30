import type { LucideIcon } from "lucide-react";

interface SecurityCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function SecurityCard({ title, description, icon: Icon }: SecurityCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-background border border-emerald-500/20 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Icon className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
