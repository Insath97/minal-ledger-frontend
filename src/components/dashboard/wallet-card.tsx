import { MoreVertical } from "lucide-react";
import { CURRENCY_FLAGS } from "@/lib/constants";
import type { Wallet } from "@/types";

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const flag = CURRENCY_FLAGS[wallet.currency] || "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <span className="text-sm font-semibold text-slate-700">{wallet.currency}</span>
        </div>
        <button className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xl font-bold text-slate-900">
        {wallet.currency === "BDT" ? "৳" : wallet.currency === "EUR" ? "€" : wallet.currency === "GBP" ? "£" : "$"}
        {wallet.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className={`mt-1.5 text-xs font-medium ${wallet.isActive ? "text-emerald-600" : "text-slate-400"}`}>
        {wallet.isActive ? "Active" : "Inactive"}
      </p>
    </div>
  );
}
