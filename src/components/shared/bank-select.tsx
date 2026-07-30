"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { getBankList, type BankList } from "@/lib/api/banks";

interface BankSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function BankSelect({
  value,
  onChange,
  placeholder = "Select bank...",
  error,
  disabled = false,
  className = "",
}: BankSelectProps) {
  const [banks, setBanks] = useState<BankList[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const res = await getBankList();
        if (res.status === "success") setBanks(res.data);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    fetchBanks();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBanks = banks.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedBank = banks.find((b) => b.name === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
        disabled={disabled}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 text-sm transition-all hover:border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedBank ? "text-foreground font-medium" : "text-muted-foreground"}>
          {loading ? "Loading banks..." : selectedBank ? `${selectedBank.name} (${selectedBank.code})` : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>
      {dropdownOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="p-1.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search banks..."
                className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2.5 text-xs outline-none focus:border-emerald-500"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto border-t border-border scrollbar-thin">
            <button
              type="button"
              onClick={() => { onChange(""); setDropdownOpen(false); setSearch(""); }}
              className="flex w-full items-center px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
            >
              No bank selected
            </button>
            {filteredBanks.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">No banks found</div>
            ) : (
              filteredBanks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => { onChange(b.name); setDropdownOpen(false); setSearch(""); }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-accent ${value === b.name ? "bg-emerald-500/10 text-emerald-600 font-medium" : "text-foreground"}`}
                >
                  <span className="font-medium">{b.name}</span>
                  <span className="text-muted-foreground font-mono">{b.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
