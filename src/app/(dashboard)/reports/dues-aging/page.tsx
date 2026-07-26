"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getDuesAging, type DuesAgingData, type DuesAgingSale } from "@/lib/api/finance";

const BUCKET_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "0-30 days": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "31-60 days": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "61-90 days": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "90+ days": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

export default function DuesAgingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<DuesAgingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const res = await getDuesAging();
        if (res.status === "success") setData(res.data);
      } catch { toast("Failed to load dues aging", "error"); } finally { setLoading(false); }
    }
    fetch();
  }, [toast]);

  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;

  const buckets = data ? [
    { label: "0-30 Days", value: data.summary.current_0_30, key: "0-30 days" },
    { label: "31-60 Days", value: data.summary.aging_31_60, key: "31-60 days" },
    { label: "61-90 Days", value: data.summary.aging_61_90, key: "61-90 days" },
    { label: "90+ Days", value: data.summary.over_90, key: "90+ days" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Dues Aging</h1>
        <p className="mt-1 text-sm text-slate-500">Outstanding balances by aging buckets.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {buckets.map((b) => {
              const style = BUCKET_STYLES[b.key] || BUCKET_STYLES["0-30 days"];
              return (
                <div key={b.key} className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-sm`}>
                  <p className="text-xs text-slate-500">{b.label}</p>
                  <p className={`text-lg font-bold ${style.text}`}>{formatCurrency(b.value)}</p>
                </div>
              );
            })}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">Total Due</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(data.summary.total_due)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Detailed Aging</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Reference</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Sale Date</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Days</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Due Amount</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Bucket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.sales.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-16 text-center"><Clock className="mx-auto h-10 w-10 text-slate-300 mb-3" /><p className="text-sm font-semibold text-slate-600">No outstanding dues</p></td></tr>
                  ) : (
                    data.sales.map((s) => {
                      const style = BUCKET_STYLES[s.aging_bucket] || BUCKET_STYLES["0-30 days"];
                      return (
                        <tr key={s.sale_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <button onClick={() => router.push(`/sales/${s.sale_id}`)} className="text-sm font-mono font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">{s.reference_number}</button>
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-sm font-medium text-slate-700">{s.customer?.name || "—"}</p>
                            <p className="text-xs text-slate-400">{s.customer?.code || ""}</p>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-600">{new Date(s.sale_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                          <td className="px-5 py-3 text-right text-sm font-semibold text-slate-700">{s.days_outstanding}</td>
                          <td className="px-5 py-3 text-right text-sm font-bold text-red-600">{formatCurrency(s.due_amount)}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.border} ${style.bg} ${style.text}`}>{s.aging_bucket}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
