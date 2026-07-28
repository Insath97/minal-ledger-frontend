"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, TrendingDown, ArrowDownRight, AlertTriangle } from "lucide-react";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { getDashboardStats, type DashboardStats } from "@/lib/api/dashboard";
import { useToast } from "@/components/ui/toast";

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ChangeBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
      {isPositive ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        if (res.status === "success") {
          setStats(res.data);
        }
      } catch {
        toast("Failed to load dashboard stats", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  const cards = stats
    ? [
      {
        title: "Total Sales",
        value: stats.total_sales,
        change: stats.sales_change,
        icon: ShoppingCart,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        title: "Total Expenses",
        value: stats.total_expenses,
        change: stats.expenses_change,
        icon: TrendingDown,
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
      },
      {
        title: "Total Received",
        value: stats.total_received,
        change: stats.received_change,
        icon: ArrowDownRight,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        title: "Outstanding Dues",
        value: stats.total_outstanding,
        change: stats.outstanding_change,
        icon: AlertTriangle,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
      },
    ]
    : [];

  return (
    <div className="space-y-6">
      <WelcomeHeader />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
              <div className="h-8 w-32 animate-pulse rounded bg-slate-100" />
              <div className="mt-3 h-4 w-20 animate-pulse rounded bg-slate-100" />
            </div>
          ))
        ) : (
          cards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">{card.title}</h3>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(card.value)}
              </p>
              <div className="mt-2">
                <ChangeBadge value={card.change} />
                <span className="ml-1.5 text-xs text-slate-400">from last month</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <OverviewChart />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
