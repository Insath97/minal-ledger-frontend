import { Plus } from "lucide-react";
import { wallets } from "@/lib/mock-data";
import { WalletCard } from "./wallet-card";

export function WalletGrid() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">My Wallet</h2>
        <button className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.id} wallet={wallet} />
        ))}
      </div>
    </div>
  );
}
