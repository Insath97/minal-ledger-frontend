"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { useToast } from "@/components/ui/toast";
import { getMonthlySummary, type MonthlySummaryData } from "@/lib/api/reports";

export default function MonthlySummaryPage() {
  const { toast } = useToast();
  const [data, setData] = useState<MonthlySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const res = await getMonthlySummary({ year });
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load monthly summary", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [year, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;
  const formatShort = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monthly Summary</h1>
          <p className="mt-1 text-sm text-slate-500">Year overview with income vs expense vs profit.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white border border-emerald-200"><TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" /></div>
                <div>
                  <p className="text-[11px] sm:text-xs text-emerald-600">Total Income</p>
                  <p className="text-sm sm:text-lg font-bold text-emerald-700">{formatCurrency(data.total_income)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white border border-red-200"><TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" /></div>
                <div>
                  <p className="text-[11px] sm:text-xs text-red-600">Total Expenses</p>
                  <p className="text-sm sm:text-lg font-bold text-red-700">{formatCurrency(data.total_expense)}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-2xl border ${data.total_profit >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"} p-3 sm:p-5 shadow-sm col-span-2 sm:col-span-1`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white border ${data.total_profit >= 0 ? "border-emerald-200" : "border-red-200"}`}>
                  {data.total_profit >= 0 ? <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" /> : <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />}
                </div>
                <div>
                  <p className={`text-[11px] sm:text-xs ${data.total_profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>Net Profit</p>
                  <p className={`text-sm sm:text-lg font-bold ${data.total_profit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(data.total_profit)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Trend</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={formatShort} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: "#6366f1" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Monthly Breakdown</h3>
            </div>
            <div className="hidden md:block overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Month</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Income</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Expense</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.monthly.map((m) => (
                    <tr key={m.month} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-slate-700">{m.month}</td>
                      <td className="px-5 py-3 text-right text-sm text-emerald-600">{formatCurrency(m.income)}</td>
                      <td className="px-5 py-3 text-right text-sm text-red-600">{formatCurrency(m.expense)}</td>
                      <td className={`px-5 py-3 text-right text-sm font-semibold ${m.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(m.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-50">
              {data.monthly.map((m) => (
                <div key={m.month} className="px-4 py-3 space-y-1">
                  <p className="text-sm font-medium text-slate-700">{m.month}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">{formatCurrency(m.income)}</span>
                    <span className="text-red-600">{formatCurrency(m.expense)}</span>
                  </div>
                  <p className={`text-sm font-semibold ${m.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>Profit: {formatCurrency(m.profit)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
