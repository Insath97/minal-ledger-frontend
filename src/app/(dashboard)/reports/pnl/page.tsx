"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getPnL, type PnLMonthly } from "@/lib/api/finance";

export default function PnLPage() {
  const { toast } = useToast();
  const [data, setData] = useState<PnLMonthly[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchPnL = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPnL({ year });
      if (res.status === "success") setData(res.data.monthly);
    } catch { toast("Failed to load P&L", "error"); } finally { setLoading(false); }
  }, [year, toast]);

  useEffect(() => { fetchPnL(); }, [fetchPnL]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  const totalIncome = data.reduce((s, m) => s + m.income, 0);
  const totalExpense = data.reduce((s, m) => s + m.expense, 0);
  const totalProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profit & Loss Report</h1>
          <p className="mt-1 text-sm text-slate-500">Monthly income vs expense breakdown.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Year</label>
          <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-10 w-[100px] text-sm" min="2020" max="2099" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Month</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Income</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Expense</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((m) => (
                  <tr key={m.month_number} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{m.month_name}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-emerald-600 font-medium">{m.income > 0 ? formatCurrency(m.income) : "—"}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-red-600 font-medium">{m.expense > 0 ? formatCurrency(m.expense) : "—"}</td>
                    <td className={`px-5 py-3.5 text-right text-sm font-bold ${m.net_profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {m.net_profit !== 0 ? formatCurrency(m.net_profit) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="px-5 py-3.5 text-sm font-bold text-slate-900">Total</td>
                  <td className="px-5 py-3.5 text-right text-sm font-bold text-emerald-600">{formatCurrency(totalIncome)}</td>
                  <td className="px-5 py-3.5 text-right text-sm font-bold text-red-600">{formatCurrency(totalExpense)}</td>
                  <td className={`px-5 py-3.5 text-right text-sm font-bold ${totalProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(totalProfit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
