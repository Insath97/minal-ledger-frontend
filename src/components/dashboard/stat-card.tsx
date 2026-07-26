"use client";

import { Wallet, TrendingDown, PiggyBank, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PercentageChange } from "@/components/shared/percentage-change";
import type { StatCardData } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet,
  TrendingDown,
  PiggyBank,
};

interface StatCardProps {
  data: StatCardData;
}

export function StatCard({ data }: StatCardProps) {
  const Icon = iconMap[data.icon] || Wallet;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <Icon className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">{data.title}</h3>
          </div>
          <button className="rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <p className="text-3xl font-bold text-slate-900">
          {data.prefix || ""}
          {data.value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <div className="mt-3">
          <PercentageChange value={data.change} label={data.changeLabel} />
        </div>
      </CardContent>
    </Card>
  );
}
