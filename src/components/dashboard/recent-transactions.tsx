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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Transaction</h2>
        <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Activity
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Price
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx) => {
              const Icon = iconMap[tx.icon || ""] || Smartphone;
              return (
                <tr key={tx.id} className="border-b border-border last:border-0">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${tx.iconColor}15` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: tx.iconColor }} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{tx.activity}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-sm text-muted-foreground">{tx.date}</td>
                  <td className="py-3.5 text-sm font-semibold text-foreground">
                    ${tx.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5">
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-500/10 text-emerald-600 capitalize"
                    >
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="py-3.5">
                    <button className="rounded p-1 text-muted-foreground hover:bg-accent">
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
