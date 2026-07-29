"use client";

import { LifeBuoy, ExternalLink } from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar-store";

interface HelpCardProps {
  isCollapsed: boolean;
}

export function HelpCard({ isCollapsed }: HelpCardProps) {
  const { isMobileOpen } = useSidebarStore();

  if (isCollapsed && !isMobileOpen) return null;

  return (
    <div className="mx-3 mb-1 rounded-lg bg-emerald-600 p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <LifeBuoy className="h-3.5 w-3.5 text-emerald-100" />
        <span className="text-xs font-semibold text-white">Need Help?</span>
      </div>
      <p className="text-[11px] leading-relaxed text-emerald-100 mb-2">
        Check docs or contact support.
      </p>
      <button className="flex items-center gap-1 text-[11px] font-semibold text-white hover:text-emerald-100 transition-colors">
        View Docs
        <ExternalLink className="h-3 w-3" />
      </button>
    </div>
  );
}
