"use client";

import { MoreHorizontal, TrendingUp, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { savingsGoals } from "@/lib/mock-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  Shield,
};

export function SavingsPlan() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">My Savings Plan</h2>
        <button className="rounded p-1 text-slate-400 hover:bg-slate-50">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5">
        {savingsGoals.map((goal) => {
          const progress = Math.round((goal.current / goal.target) * 100);
          const Icon = goal.icon ? (iconMap[goal.icon] || TrendingUp) : TrendingUp;

          return (
            <div key={goal.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">{goal.name}</h3>
                  <p className="text-xs text-slate-500">
                    ${goal.current.toLocaleString()}/${goal.target.toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-900">{progress}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
