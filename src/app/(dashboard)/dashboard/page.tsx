"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, TrendingDown, ArrowDownRight, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  getDashboardStats,
  getDashboardAnalytics,
  getDashboardActivity,
  type DashboardStats,
} from "@/lib/api/dashboard";
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

  const handleExport = useCallback(async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const [statsRes, analyticsRes, activityRes] = await Promise.all([
        getDashboardStats(),
        getDashboardAnalytics(year, month),
        getDashboardActivity(),
      ]);

      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary Stats
      if (statsRes.status === "success") {
        const s = statsRes.data;
        const summaryData = [
          ["Dashboard Summary"],
          [""],
          ["Metric", "Value", "Change (%)"],
          ["Total Sales", s.total_sales, `${s.sales_change}%`],
          ["Total Expenses", s.total_expenses, `${s.expenses_change}%`],
          ["Total Received", s.total_received, `${s.received_change}%`],
          ["Outstanding Dues", s.total_outstanding, `${s.outstanding_change}%`],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        summarySheet["!cols"] = [{ wch: 20 }, { wch: 18 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
      }

      // Sheet 2: Analytics (Income vs Expense)
      if (analyticsRes.status === "success") {
        const analyticsData = [
          ["Analytics - Income vs Expense"],
          [""],
          ["Month", "Income", "Expense"],
          ...analyticsRes.data.labels.map((item) => [
            item.label,
            item.income,
            item.expense,
          ]),
        ];
        const analyticsSheet = XLSX.utils.aoa_to_sheet(analyticsData);
        analyticsSheet["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, analyticsSheet, "Analytics");
      }

      // Sheet 3: Recent Sales
      if (activityRes.status === "success" && activityRes.data.recent_sales.length > 0) {
        const salesData = [
          ["Recent Sales"],
          [""],
          ["Reference", "Customer", "Total", "Due", "Status", "Date"],
          ...activityRes.data.recent_sales.map((sale) => [
            sale.reference_number,
            sale.customer_name,
            sale.total_amount,
            sale.due_amount,
            sale.payment_status,
            sale.sale_date,
          ]),
        ];
        const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
        salesSheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, salesSheet, "Recent Sales");
      }

      // Sheet 4: Pending Cheques
      if (activityRes.status === "success" && activityRes.data.pending_cheques.length > 0) {
        const chequesData = [
          ["Pending Cheques"],
          [""],
          ["Cheque #", "Customer", "Bank", "Amount", "Date"],
          ...activityRes.data.pending_cheques.map((ch) => [
            ch.cheque_number,
            ch.customer_name,
            ch.bank_name,
            ch.amount,
            ch.cheque_date,
          ]),
        ];
        const chequesSheet = XLSX.utils.aoa_to_sheet(chequesData);
        chequesSheet["!cols"] = [{ wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, chequesSheet, "Pending Cheques");
      }

      // Sheet 5: Top Customers
      if (activityRes.status === "success" && activityRes.data.top_customers.length > 0) {
        const customersData = [
          ["Top Customers by Outstanding Balance"],
          [""],
          ["Name", "Code", "Outstanding", "Phone"],
          ...activityRes.data.top_customers.map((c) => [
            c.name,
            c.code,
            c.outstanding_balance,
            c.phone,
          ]),
        ];
        const customersSheet = XLSX.utils.aoa_to_sheet(customersData);
        customersSheet["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, customersSheet, "Top Customers");
      }

      const dateStr = today.toISOString().split("T")[0];
      XLSX.writeFile(wb, `dashboard-report-${dateStr}.xlsx`);
      toast("Dashboard exported successfully", "success");
    } catch {
      toast("Failed to export dashboard", "error");
    }
  }, [toast]);

  const cards = stats
    ? [
      {
        title: "Total Sales",
        value: stats.total_sales,
        change: stats.sales_change,
        icon: ShoppingCart,
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-600",
      },
      {
        title: "Total Expenses",
        value: stats.total_expenses,
        change: stats.expenses_change,
        icon: TrendingDown,
        iconBg: "bg-red-500/10",
        iconColor: "text-red-600",
      },
      {
        title: "Total Received",
        value: stats.total_received,
        change: stats.received_change,
        icon: ArrowDownRight,
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-600",
      },
      {
        title: "Outstanding Dues",
        value: stats.total_outstanding,
        change: stats.outstanding_change,
        icon: AlertTriangle,
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-600",
      },
    ]
    : [];

  return (
    <div className="space-y-6">
      <WelcomeHeader onExport={handleExport} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))
        ) : (
          cards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(card.value)}
              </p>
              <div className="mt-2">
                <ChangeBadge value={card.change} />
                <span className="ml-1.5 text-xs text-muted-foreground">from last month</span>
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
