"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useToast } from "@/components/ui/toast";
import { getExpenseSummary, type ExpenseSummaryData } from "@/lib/api/reports";

const CATEGORY_COLORS: Record<string, string> = {
  rent: "#6366f1",
  salary: "#10b981",
  utilities: "#f59e0b",
  marketing: "#ec4899",
  supplies: "#3b82f6",
  transportation: "#8b5cf6",
  maintenance: "#ef4444",
  other: "#64748b",
};

export default function ExpenseSummaryPage() {
  const { toast } = useToast();
  const [data, setData] = useState<ExpenseSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const res = await getExpenseSummary({ year });
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load expense summary", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [year, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expense Summary</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monthly expense trend and category breakdown.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-11 rounded-lg border border-border bg-card px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-xs text-muted-foreground">Total Expenses ({data.year})</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(data.grand_total)}</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Bar dataKey="total_amount" name="Expenses" radius={[6, 6, 0, 0]}>
                    {data.monthly.map((_, i) => <Cell key={i} fill="#ef4444" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {data.by_category.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">By Category</h3>
              <div className="space-y-3">
                {data.by_category.map((cat) => {
                  const pct = data.grand_total > 0 ? (cat.total_amount / data.grand_total) * 100 : 0;
                  return (
                    <div key={cat.category} className="flex items-center gap-4">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.category] || "#64748b" }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground capitalize">{cat.category}</span>
                          <span className="text-sm font-semibold text-foreground">{formatCurrency(cat.total_amount)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat.category] || "#64748b" }} />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
