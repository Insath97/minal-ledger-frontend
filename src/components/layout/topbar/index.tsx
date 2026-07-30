"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, Sun, Moon, Maximize, Minimize } from "lucide-react";
import { SearchCommand } from "./search-command";
import { Notifications } from "./notifications";
import { ProfileMenu } from "./profile-menu";
import { useSidebarStore } from "@/stores/sidebar-store";

export function Topbar() {
  const { setMobileOpen } = useSidebarStore();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 max-w-xl ml-4 hidden sm:block">
        <SearchCommand />
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleFullscreen}
          className="hidden sm:block rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
        <Notifications />
        <div className="ml-1 border-l border-slate-200 pl-3">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
