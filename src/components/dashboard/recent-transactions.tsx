"use client";

import { MoreHorizontal, Filter, Smartphone, Layers, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { recentTransactions } from "@/lib/mock-data";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Smartphone,
  Layers,
  ShoppingCart,
};

export function RecentTransactions() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recent Transaction</h2>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                Activity
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                Date
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                Price
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx) => {
              const Icon = iconMap[tx.icon || ""] || Smartphone;
              return (
                <tr key={tx.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${tx.iconColor}15` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: tx.iconColor }} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{tx.activity}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-sm text-slate-500">{tx.date}</td>
                  <td className="py-3.5 text-sm font-semibold text-slate-900">
                    ${tx.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5">
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700 capitalize"
                    >
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="py-3.5">
                    <button className="rounded p-1 text-slate-400 hover:bg-slate-50">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
