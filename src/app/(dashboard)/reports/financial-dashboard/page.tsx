"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, TrendingDown, ArrowDownRight, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getFinanceDashboard, type FinancialDashboard } from "@/lib/api/finance";

export default function FinancialDashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState<FinancialDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const res = await getFinanceDashboard({ date_from: dateFrom, date_to: dateTo });
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load dashboard", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [dateFrom, dateTo, toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Net profit and receivable overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 w-[150px] text-sm" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 w-[150px] text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
                <div>
                  <p className="text-xs text-slate-500">Total Income</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.total_income)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50"><TrendingDown className="h-5 w-5 text-red-600" /></div>
                <div>
                  <p className="text-xs text-slate-500">Total Expenses</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(data.total_expenses)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${data.net_profit >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                  {data.net_profit >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net Profit</p>
                  <p className={`text-lg font-bold ${data.net_profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(data.net_profit)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><ArrowDownRight className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-xs text-slate-500">Total Receivable</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(data.total_receivable)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-amber-200"><Clock className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-xs text-amber-600">Pending Cheques Exposure</p>
                <p className="text-lg font-bold text-amber-700">{formatCurrency(data.pending_cheques.total_amount)} <span className="text-sm font-normal text-amber-500">({data.pending_cheques.count} cheques)</span></p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
