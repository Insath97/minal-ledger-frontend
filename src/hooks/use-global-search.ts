"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { globalSearch, type SearchResult, type SearchEntityType } from "@/lib/api/search";

interface GroupedResults {
  entities: SearchResult[];
  navigation: SearchResult[];
}

const GROUP_ORDER: SearchEntityType[] = [
  "customer",
  "sale",
  "payment",
  "cheque",
  "expense",
  "user",
  "bank",
  "role",
];

const GROUP_LABELS: Record<SearchEntityType, string> = {
  customer: "Customers",
  sale: "Sales",
  payment: "Payments",
  cheque: "Cheques",
  expense: "Expenses",
  user: "Users",
  bank: "Banks",
  role: "Roles",
  navigation: "Navigation",
};

export function useGlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await globalSearch(searchQuery);
      setResults(response.data.results);
      setSelectedIndex(0);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Request was cancelled, ignore
      }
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      search(query);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, search]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const groupedResults: GroupedResults = {
    entities: results.filter((r) => r.type !== "navigation"),
    navigation: results.filter((r) => r.type === "navigation"),
  };

  // Get flat list of selectable items (for keyboard navigation)
  const selectableItems = results;

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
            return selectableItems[selectedIndex];
          }
          break;
      }
      return null;
    },
    [selectableItems, selectedIndex]
  );

  const reset = useCallback(() => {
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    groupedResults,
    isLoading,
    error,
    selectedIndex,
    setSelectedIndex,
    selectableItems,
    handleKeyDown,
    reset,
    GROUP_LABELS,
  };
}
