"use client";

import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/constants";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { SidebarSection } from "./sidebar-section";
import { SidebarItem } from "./sidebar-item";
import { HelpCard } from "./upgrade-card";
import { useEffect, useMemo } from "react";
import type { NavSection, NavItem } from "@/types";

export function Sidebar() {
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen, setCollapsed } = useSidebarStore();
  const { hasAnyPermission, user } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 1023px)");

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile, setCollapsed]);

  const filteredSections = useMemo(() => {
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items
        .filter((item) => !item.permission || hasAnyPermission(item.permission))
        .map((item) => ({
          ...item,
          children: item.children?.filter(
            (child) => !child.permission || hasAnyPermission(child.permission)
          ),
        })),
    })).filter((section) => section.items.length > 0);
  }, [hasAnyPermission, user]);

  return (
    <>
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300",
          isMobile
            ? isMobileOpen
              ? "translate-x-0 w-[260px]"
              : "-translate-x-full"
            : isCollapsed
              ? "w-[72px]"
              : "w-[260px]"
        )}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <span className="text-lg font-bold text-sidebar-foreground">Minal Ledger</span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {filteredSections.map((section) => (
            <SidebarSection
              key={section.title}
              title={section.title}
              items={section.items}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        <div className="px-3 py-2 border-t border-border">
          <SidebarItem
            item={{ label: "Log out", href: "#", icon: "LogOut" }}
            isCollapsed={isCollapsed}
          />
        </div>

        <div className="border-t border-border p-3 pt-2">
          <HelpCard isCollapsed={isCollapsed} />
        </div>

        {!isMobile && (
          <button
            onClick={toggle}
            className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:bg-accent"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>
        )}
      </aside>
    </>
  );
}
