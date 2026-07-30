"use client";

import type { NavItem } from "@/types";
import { SidebarItem } from "./sidebar-item";
import { useSidebarStore } from "@/stores/sidebar-store";

interface SidebarSectionProps {
  title: string;
  items: NavItem[];
  isCollapsed: boolean;
}

export function SidebarSection({ title, items, isCollapsed }: SidebarSectionProps) {
  const { isMobileOpen } = useSidebarStore();

  return (
    <div className="mb-6">
      {(!isCollapsed || isMobileOpen) && (
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem key={item.href} item={item} isCollapsed={isCollapsed} />
        ))}
      </div>
    </div>
  );
}
