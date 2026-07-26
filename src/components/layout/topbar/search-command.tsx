"use client";

import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

export function SearchCommand() {
  const [open, setOpen] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-400 transition-colors hover:border-slate-300" />}>
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-block">
          ⌘K
        </kbd>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0">
        <div className="flex items-center border-b border-slate-200 px-4">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
            placeholder="Search anything..."
            autoFocus
          />
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-400">No results found.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
