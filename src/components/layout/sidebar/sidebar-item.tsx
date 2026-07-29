"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { NavItem } from "@/types";
import {
  LayoutDashboard,
  BarChart3,
  ArrowLeftRight,
  FileText,
  Repeat,
  CreditCard,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  Users,
  Building2,
  Activity,
  UserCheck,
  ShoppingCart,
  ArrowDownRight,
  Receipt,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Clock,
  KeyRound,
} from "lucide-react";
import { LogoutDialog } from "./logout-dialog";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart3,
  ArrowLeftRight,
  FileText,
  Repeat,
  CreditCard,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  Users,
  Building2,
  Activity,
  UserCheck,
  ShoppingCart,
  ArrowDownRight,
  Receipt,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Clock,
  KeyRound,
};

interface SidebarItemProps {
  item: NavItem;
  isCollapsed: boolean;
}

export function SidebarItem({ item, isCollapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const { setMobileOpen, isMobileOpen } = useSidebarStore();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [showLogout, setShowLogout] = useState(false);
  const [isOpen, setIsOpen] = useState(() => {
    if (item.children) {
      return item.children.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));
    }
    return false;
  });
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const isChildActive = item.children?.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/")
  );
  const Icon = iconMap[item.icon];

  if (item.label === "Log out") {
    return (
      <>
        <button
          onClick={() => setShowLogout(true)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700",
            isCollapsed && !isMobileOpen && "justify-center px-2"
          )}
          title={isCollapsed && !isMobileOpen ? item.label : undefined}
        >
          {Icon && <Icon className="h-5 w-5 shrink-0" />}
          {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
        </button>
        <LogoutDialog open={showLogout} onOpenChange={setShowLogout} />
      </>
    );
  }

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            isCollapsed && !isMobileOpen && "justify-center px-2",
            isChildActive
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
          title={isCollapsed && !isMobileOpen ? item.label : undefined}
        >
          {Icon && (
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                isChildActive ? "text-emerald-600" : "text-slate-400"
              )}
            />
          )}
          {(!isCollapsed || isMobileOpen) && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  isChildActive ? "text-emerald-600" : "text-slate-400",
                  isOpen && "rotate-180"
                )}
              />
            </>
          )}
        </button>
        {(!isCollapsed || isMobileOpen) && isOpen && (
          <div className="mt-1 ml-4 space-y-0.5">
            {item.children.map((child) => {
              const ChildIcon = iconMap[child.icon];
              const isChildItemActive = pathname === child.href || pathname.startsWith(child.href + "/");
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => { if (isMobile) setMobileOpen(false); }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                    isChildItemActive
                      ? "text-emerald-700"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {ChildIcon && (
                    <ChildIcon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isChildItemActive ? "text-emerald-600" : "text-slate-400"
                      )}
                    />
                  )}
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={() => { if (isMobile) setMobileOpen(false); }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        isCollapsed && !isMobileOpen && "justify-center px-2",
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
      title={isCollapsed && !isMobileOpen ? item.label : undefined}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            isActive ? "text-emerald-600" : "text-slate-400"
          )}
        />
      )}
      {(!isCollapsed || isMobileOpen) && (
        <span className="flex-1">{item.label}</span>
      )}
      {(!isCollapsed || isMobileOpen) && item.badge !== undefined && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
