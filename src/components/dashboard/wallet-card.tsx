import { MoreVertical } from "lucide-react";
import { CURRENCY_FLAGS } from "@/lib/constants";
import type { Wallet } from "@/types";

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const flag = CURRENCY_FLAGS[wallet.currency] || "🇱🇰";

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <span className="text-sm font-semibold text-foreground">{wallet.currency}</span>
        </div>
        <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xl font-bold text-foreground">
        Rs. {wallet.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className={`mt-1.5 text-xs font-medium ${wallet.isActive ? "text-emerald-600" : "text-muted-foreground"}`}>
        {wallet.isActive ? "Active" : "Inactive"}
      </p>
    </div>
  );
}
