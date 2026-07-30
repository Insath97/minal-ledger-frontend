"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, Sun, Moon, Maximize, Minimize } from "lucide-react";
import { SearchCommand } from "./search-command";
import { Notifications } from "./notifications";
import { ProfileMenu } from "./profile-menu";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useTheme } from "@/hooks/use-theme";

export function Topbar() {
  const { setMobileOpen } = useSidebarStore();
  const { theme, toggleTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 max-w-xl ml-4 hidden sm:block">
        <SearchCommand />
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleFullscreen}
          className="hidden sm:block rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
        <Notifications />
        <div className="ml-1 border-l border-border pl-3">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
