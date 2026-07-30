"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getDuesAging, type DuesAgingData, type DuesAgingSale } from "@/lib/api/finance";

const BUCKET_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "0-30 days": { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
  "31-60 days": { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
  "61-90 days": { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20" },
  "90+ days": { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20" },
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
        <h1 className="text-2xl font-bold text-foreground">Customer Dues Aging</h1>
        <p className="mt-1 text-sm text-muted-foreground">Outstanding balances by aging buckets.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {buckets.map((b) => {
              const style = BUCKET_STYLES[b.key] || BUCKET_STYLES["0-30 days"];
              return (
                <div key={b.key} className={`rounded-2xl border ${style.border} ${style.bg} p-3 sm:p-5 shadow-sm`}>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">{b.label}</p>
                  <p className={`text-base sm:text-lg font-bold ${style.text}`}>{formatCurrency(b.value)}</p>
                </div>
              );
            })}
            <div className="rounded-2xl border border-border bg-card p-3 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Total Due</p>
              <p className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(data.summary.total_due)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Detailed Aging</h3>
            </div>

            <div className="hidden md:block overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Reference</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sale Date</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Days</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Due Amount</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bucket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.sales.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-16 text-center"><Clock className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" /><p className="text-sm font-semibold text-foreground">No outstanding dues</p></td></tr>
                  ) : (
                    data.sales.map((s) => {
                      const style = BUCKET_STYLES[s.aging_bucket] || BUCKET_STYLES["0-30 days"];
                      return (
                        <tr key={s.sale_id} className="hover:bg-accent/50 transition-colors">
                          <td className="px-5 py-3">
                            <button onClick={() => router.push(`/sales/${s.sale_id}`)} className="text-sm font-mono font-semibold text-emerald-600 hover:text-emerald-600 hover:underline">{s.reference_number}</button>
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-sm font-medium text-foreground">{s.customer?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{s.customer?.code || ""}</p>
                          </td>
                          <td className="px-5 py-3 text-sm text-foreground">{new Date(s.sale_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                          <td className="px-5 py-3 text-right text-sm font-semibold text-foreground">{Math.floor(s.days_outstanding)}</td>
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

            <div className="md:hidden divide-y divide-border">
              {data.sales.length === 0 ? (
                <div className="px-4 py-16 text-center"><Clock className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" /><p className="text-sm font-semibold text-foreground">No outstanding dues</p></div>
              ) : (
                data.sales.map((s) => {
                  const style = BUCKET_STYLES[s.aging_bucket] || BUCKET_STYLES["0-30 days"];
                  return (
                    <div key={s.sale_id} className="px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <button onClick={() => router.push(`/sales/${s.sale_id}`)} className="text-sm font-mono font-semibold text-emerald-600 hover:text-emerald-600 hover:underline">{s.reference_number}</button>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.border} ${style.bg} ${style.text}`}>{s.aging_bucket}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.customer?.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{s.customer?.code || ""}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">{formatCurrency(s.due_amount)}</p>
                          <p className="text-xs text-muted-foreground">{Math.floor(s.days_outstanding)} days</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(s.sale_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
