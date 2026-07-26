"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowDownRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getIncomeBreakdown, type IncomeBreakdown } from "@/lib/api/finance";

const METHOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  cash: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  credit_card: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  bank_transfer: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  cheque: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

export default function IncomeBreakdownPage() {
  const { toast } = useToast();
  const [data, setData] = useState<IncomeBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getIncomeBreakdown({ date_from: dateFrom, date_to: dateTo });
      if (res.status === "success") setData(res.data);
    } catch { toast("Failed to load income breakdown", "error"); } finally { setLoading(false); }
  }, [dateFrom, dateTo, toast]);

  useEffect(() => { fetch(); }, [fetch]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;
  const formatMethod = (method: string) => method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Income Breakdown</h1>
          <p className="mt-1 text-sm text-slate-500">Income by payment method.</p>
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
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-emerald-200"><ArrowDownRight className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <p className="text-xs text-emerald-600">Grand Total Income</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(data.grand_total)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.by_method.map((m) => {
              const style = METHOD_STYLES[m.payment_method] || METHOD_STYLES.cash;
              return (
                <div key={m.payment_method} className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-sm`}>
                  <p className="text-xs text-slate-500">{formatMethod(m.payment_method)}</p>
                  <p className={`text-lg font-bold ${style.text}`}>{formatCurrency(m.total_amount)}</p>
                  <p className="text-xs text-slate-400 mt-1">{m.total_count} payment(s)</p>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
