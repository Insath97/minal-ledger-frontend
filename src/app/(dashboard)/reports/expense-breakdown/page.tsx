"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getExpenseBreakdown, type ExpenseBreakdown } from "@/lib/api/finance";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  rent: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  electricity: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  salaries: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  transport: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  maintenance: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  other: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
};

export default function ExpenseBreakdownPage() {
  const { toast } = useToast();
  const [data, setData] = useState<ExpenseBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getExpenseBreakdown({ date_from: dateFrom, date_to: dateTo });
      if (res.status === "success") setData(res.data);
    } catch { toast("Failed to load expense breakdown", "error"); } finally { setLoading(false); }
  }, [dateFrom, dateTo, toast]);

  useEffect(() => { fetch(); }, [fetch]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expense Breakdown</h1>
          <p className="mt-1 text-sm text-slate-500">Expenses by category.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 w-[150px] text-sm" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 w-[150px] text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-red-200"><TrendingDown className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-xs text-red-600">Grand Total Expenses</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(data.grand_total)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.by_category.map((c) => {
              const style = CATEGORY_STYLES[c.category] || CATEGORY_STYLES.other;
              return (
                <div key={c.category} className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-sm`}>
                  <p className="text-xs text-slate-500 capitalize">{c.category}</p>
                  <p className={`text-lg font-bold ${style.text}`}>{formatCurrency(c.total_amount)}</p>
                  <p className="text-xs text-slate-400 mt-1">{c.total_count} expense(s)</p>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
