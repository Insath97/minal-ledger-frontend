"use client";

import { Search, Loader2, ArrowRight, CornerDownLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGlobalSearch } from "@/hooks/use-global-search";
import type { SearchResult } from "@/lib/api/search";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  ArrowDownRight,
  Receipt,
  UserCheck,
  Users,
  Building2,
  Shield,
  FileText,
  TrendingUp,
  Clock,
  Settings,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  ArrowDownRight,
  Receipt,
  UserCheck,
  Users,
  Building2,
  Shield,
  FileText,
  TrendingUp,
  Clock,
  Settings,
};

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    groupedResults,
    isLoading,
    error,
    selectedIndex,
    setSelectedIndex,
    selectableItems,
    reset,
    GROUP_LABELS,
  } = useGlobalSearch();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      reset();
    }
  }, [open, reset]);

  const navigateToResult = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      reset();
      router.push(result.href);
    },
    [router, reset]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectableItems.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < selectableItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : selectableItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectableItems[selectedIndex]) {
            navigateToResult(selectableItems[selectedIndex]);
          }
          break;
      }
    },
    [selectableItems, selectedIndex, setSelectedIndex, navigateToResult]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const selectedEl = resultsRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : <Search className="h-4 w-4" />;
  };

  const hasResults =
    groupedResults.entities.length > 0 || groupedResults.navigation.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm text-muted-foreground transition-colors hover:border-border" />
        }
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0">
        <div className="flex items-center border-b border-border px-4">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            className="flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search customers, sales, payments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <div
          ref={resultsRef}
          className="max-h-[400px] overflow-y-auto p-2"
        >
          {error && (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {!error && query.length < 2 && (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Type at least 2 characters to search...
              </p>
            </div>
          )}

          {!error && query.length >= 2 && !isLoading && !hasResults && (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </p>
            </div>
          )}

          {hasResults && (
            <>
              {/* Entity Results */}
              {groupedResults.entities.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Results
                  </p>
                  {groupedResults.entities.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      data-index={index}
                      onClick={() => navigateToResult(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        selectedIndex === index
                          ? "bg-accent text-foreground"
                          : "text-foreground hover:bg-accent/50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          selectedIndex === index
                            ? "bg-accent"
                            : "bg-muted"
                        }`}
                      >
                        {renderIcon(result.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                          {result.type}
                        </span>
                        <CornerDownLeft className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation Results */}
              {groupedResults.navigation.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Navigation
                  </p>
                  {groupedResults.navigation.map((result, index) => {
                    const globalIndex =
                      groupedResults.entities.length + index;
                    return (
                      <button
                        key={`nav-${result.href}`}
                        data-index={globalIndex}
                        onClick={() => navigateToResult(result)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          selectedIndex === globalIndex
                            ? "bg-accent text-foreground"
                            : "text-foreground hover:bg-accent/50"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            selectedIndex === globalIndex
                              ? "bg-accent"
                              : "bg-muted"
                          }`}
                        >
                          {renderIcon(result.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">↑</kbd>
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">esc</kbd>
              close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
