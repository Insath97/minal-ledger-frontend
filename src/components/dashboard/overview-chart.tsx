"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getDashboardAnalytics, type AnalyticsDataPoint } from "@/lib/api/dashboard";
import { useToast } from "@/components/ui/toast";

const MONTHS = [
  { value: 0, label: "Full Year" },
  { value: 1, label: "Jan" }, { value: 2, label: "Feb" }, { value: 3, label: "Mar" },
  { value: 4, label: "Apr" }, { value: 5, label: "May" }, { value: 6, label: "Jun" },
  { value: 7, label: "Jul" }, { value: 8, label: "Aug" }, { value: 9, label: "Sep" },
  { value: 10, label: "Oct" }, { value: 11, label: "Nov" }, { value: 12, label: "Dec" },
];

function formatFull(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatShort(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function OverviewChart() {
  const { toast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(0);
  const [data, setData] = useState<AnalyticsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardAnalytics(year, month || undefined);
      if (res.status === "success") {
        setData(res.data.labels);
      }
    } catch {
      toast("Failed to load analytics", "error");
    } finally {
      setLoading(false);
    }
  }, [year, month, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Analytics Overview</h2>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-emerald-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-emerald-500"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-3">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Income</p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatFull(totalIncome)}</p>
        </div>
        <div className="rounded-lg bg-red-500/10 p-3">
          <p className="text-xs text-red-600 dark:text-red-400">Total Expense</p>
          <p className="text-lg font-bold text-red-700 dark:text-red-300">{formatFull(totalExpense)}</p>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex h-[280px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(v) => formatShort(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  color: "var(--foreground)",
                }}
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ fill: "var(--accent)", opacity: 0.5 }}
                formatter={(value, name) => [
                  `Rs. ${Number(value).toLocaleString("en-US")}`,
                  name === "income" ? "Income" : "Expense",
                ]}
              />
              <Legend
                formatter={(value) => value === "income" ? "Income" : "Expense"}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
